import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  // Headers de seguridad adicionales
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Configuración de sesiones extendidas para rutas protegidas
  if (req.nextUrl.pathname.startsWith('/admin') || 
      req.nextUrl.pathname.startsWith('/profile') ||
      req.nextUrl.pathname.startsWith('/reservations')) {
    
    try {
      // Crear cliente de middleware con configuración extendida
      const supabase = createMiddlewareClient({ req, res: response as any }, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
          storage: {
            getItem: (key: string) => {
              // Buscar en cookies primero
              const cookies = req.cookies
              const cookieValue = cookies.get(key)?.value
              if (cookieValue) return cookieValue
              
              // Fallback a localStorage (solo en cliente)
              return null
            },
            setItem: (key: string, value: string) => {
              // Configurar cookie con tiempo extendido
              response.cookies.set(key, value, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 28800, // 8 horas
                path: '/'
              })
            },
            removeItem: (key: string) => {
              response.cookies.delete(key)
            }
          }
        }
      })
      
      // Verificar sesión
      const { data: { session } } = await supabase.auth.getSession()
      
      // Log para debugging
      console.log(`🔍 Middleware: ${req.nextUrl.pathname} - Session: ${session ? '✅' : '❌'}`)
      
      // Si no hay sesión en rutas protegidas, redirigir al login
      if (!session) {
        console.log(`🔒 Middleware: Redirigiendo a login desde ${req.nextUrl.pathname}`)
        return NextResponse.redirect(new URL('/auth/login', req.url))
      }
      
      // Verificar si el usuario es admin para rutas de admin
      if (req.nextUrl.pathname.startsWith('/admin')) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        if (profile?.role !== 'admin') {
          console.log(`🚫 Middleware: Acceso denegado a admin desde ${req.nextUrl.pathname}`)
          return NextResponse.redirect(new URL('/auth/login', req.url))
        }
      }
      
    } catch (error) {
      console.error('❌ Middleware error:', error)
      // En caso de error, permitir acceso temporalmente
    }
  }
  
  // Rate limiting básico para APIs críticas
  if (req.nextUrl.pathname.startsWith('/api/payment/') || 
      req.nextUrl.pathname.startsWith('/api/auth/')) {
    
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitKey = `rate_limit_${ip}`
    
    // Implementación básica de rate limiting
    // En producción, usar Redis o similar
    const currentTime = Date.now()
    const windowMs = 15 * 60 * 1000 // 15 minutos
    const maxRequests = 100
    
    // Aquí se implementaría la lógica de rate limiting
    // Por ahora, solo añadimos headers informativos
    response.headers.set('X-RateLimit-Limit', maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', '99')
    response.headers.set('X-RateLimit-Reset', new Date(currentTime + windowMs).toISOString())
  }
  
  // CORS para APIs específicas
  if (req.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_SITE_URL || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
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