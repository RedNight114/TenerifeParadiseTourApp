import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Headers de seguridad adicionales
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
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