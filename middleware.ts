import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-unified'
import { corsHeaders } from '@/app/api/_utils/cors'

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
    const headers = corsHeaders(origin)
    for (const [k, v] of Object.entries(headers)) response.headers.set(k, v)

    if (req.method === 'OPTIONS') {
      return new NextResponse('ok', { headers, status: 200 })
    }
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