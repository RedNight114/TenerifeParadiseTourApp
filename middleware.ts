import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-unified'
import { corsHeaders, applyCors } from '@/app/api/_utils/cors'
import { I18N_ENABLED, I18N_DEFAULT_LOCALE, I18N_SUPPORTED, LANGUAGE_COOKIE, LANGUAGE_COOKIE_MAX_AGE, normalizeLocale } from '@/app/config/i18n'

// Eliminar cliente de servicio: no usar SUPABASE_SERVICE_ROLE_KEY en middleware

export async function middleware(req: NextRequest) {
  const response = NextResponse.next()
  
  // Headers de seguridad para todas las rutas
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // CORS para APIs
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const origin = req.headers.get('origin')
    applyCors(response, origin)

    if (req.method === 'OPTIONS') {
      const preflight = NextResponse.next()
      applyCors(preflight, origin)
      return new NextResponse('ok', { headers: preflight.headers, status: 200 })
    }
  }
  
  // Negociación de idioma (solo si i18n está habilitado)
  if (I18N_ENABLED) {
    const cookieLocale = req.cookies.get(LANGUAGE_COOKIE)?.value
    const acceptLanguage = req.headers.get('accept-language') || ''

    let resolved = cookieLocale ? normalizeLocale(cookieLocale) : ''
    if (!resolved) {
      const candidates = acceptLanguage.split(',').map(part => part.split(';')[0].trim()).filter(Boolean)
      for (const cand of candidates) {
        const short = cand.toLowerCase().split('-')[0]
        if (I18N_SUPPORTED.includes(short)) { resolved = short; break }
      }
      if (!resolved) resolved = I18N_DEFAULT_LOCALE
    }

    if (cookieLocale !== resolved) {
      response.cookies.set(LANGUAGE_COOKIE, resolved, {
        maxAge: LANGUAGE_COOKIE_MAX_AGE,
        sameSite: 'lax',
        path: '/',
      })
    }

    response.headers.set('Content-Language', resolved)
  }

      // Redirigir administradores del dashboard normal al dashboard de admin
      if (req.nextUrl.pathname === '/dashboard') {
        try {
          const supabase = await getSupabaseClient()
          const token = req.cookies.get('sb-access-token')?.value
          
          if (token) {
            const { data: { user }, error } = await supabase.auth.getUser(token)
            
            if (!error && user) {
              return response
            }
          }
        } catch (error) {
          // Si hay error, continuar con la ruta normal
        }
      }


  // Protección de rutas de administración
  if (req.nextUrl.pathname.startsWith('/admin')) {
    try {
      // Verificar sesión desde cookies
      const token = req.cookies.get('sb-access-token')?.value
      
      if (!token) {
        // No hay token, redirigir al login de admin
        if (req.nextUrl.pathname !== '/admin/login') {
          return NextResponse.redirect(new URL('/admin/login', req.url))
        }
        return response
      }
      
      const supabase = await getSupabaseClient()
      const { data: { user }, error } = await supabase.auth.getUser(token)
      
      if (error || !user) {
        // Token inválido, limpiar cookies y redirigir
        response.cookies.delete('sb-access-token')
        response.cookies.delete('sb-refresh-token')
        
        if (req.nextUrl.pathname !== '/admin/login') {
          return NextResponse.redirect(new URL('/admin/login', req.url))
        }
        return response
      }

      // Si está en /admin/login y es admin, redirigir al dashboard
      if (req.nextUrl.pathname === '/admin/login') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      }
      
      // Usuario válido y admin, continuar
      return response
      
    } catch (error) {
      console.error('Error en middleware de admin:', error)
      // En caso de error, redirigir al login
      if (req.nextUrl.pathname !== '/admin/login') {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
      return response
    }
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}