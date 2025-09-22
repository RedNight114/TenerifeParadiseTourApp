import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-unified'
import { createClient } from '@supabase/supabase-js'

// Cliente de servicio para el middleware (bypass RLS)
function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function middleware(req: NextRequest) {
  const response = NextResponse.next()
  
  // Headers de seguridad para todas las rutas
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // CORS para APIs
  if (req.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_SITE_URL || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }
  
      // Redirigir administradores del dashboard normal al dashboard de admin
      if (req.nextUrl.pathname === '/dashboard') {
        try {
          const supabase = await getSupabaseClient()
          const serviceClient = getServiceClient()
          const token = req.cookies.get('sb-access-token')?.value
          
          if (token) {
            const { data: { user }, error } = await supabase.auth.getUser(token)
            
            if (!error && user) {
              // Usar cliente de servicio para bypass RLS
              const { data: profile, error: profileError } = await serviceClient
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .maybeSingle()
              
              if (profile && profile.role === 'admin') {
                return NextResponse.redirect(new URL('/admin/dashboard', req.url))
              }
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
      
      // Usar cliente de servicio para verificar usuario y rol
      const serviceClient = getServiceClient()
      
      // Verificar token con Supabase usando cliente de servicio
      const { data: { user }, error } = await serviceClient.auth.getUser(token)
      
      if (error || !user) {
        // Token inválido, limpiar cookies y redirigir
        response.cookies.delete('sb-access-token')
        response.cookies.delete('sb-refresh-token')
        
        if (req.nextUrl.pathname !== '/admin/login') {
          return NextResponse.redirect(new URL('/admin/login', req.url))
        }
        return response
      }
      
      // Verificar rol de admin usando cliente de servicio
      const { data: profile, error: profileError } = await serviceClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
      
      if (!profile || profile.role !== 'admin') {
        // No es admin, redirigir al dashboard normal
        return NextResponse.redirect(new URL('/dashboard', req.url))
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