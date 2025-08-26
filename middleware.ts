import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { log } from '@/lib/advanced-logger'
import { recordMetric } from '@/lib/api-metrics'

export async function middleware(req: NextRequest) {
  const startTime = Date.now()
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Headers de seguridad adicionales
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Permitir que el cliente maneje toda la autenticación
  // El middleware ya no interfiere con la autenticación
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Middleware: Permitir acceso a admin, el cliente manejará la autenticación
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
  
  // Logging y métricas del middleware
  const duration = Date.now() - startTime
  const pathname = req.nextUrl.pathname
  
  // Log de la petición
  log.info('Middleware processed request', {
    endpoint: pathname,
    method: req.method,
    requestId,
    duration,
    userAgent: req.headers.get('user-agent'),
    ip: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
    country: req.headers.get('cf-ipcountry')
  })
  
  // Registrar métrica
  if (pathname.startsWith('/api/')) {
    recordMetric.request(pathname, req.method, 200, duration)
  }
  
  // Agregar request ID al header para tracking
  response.headers.set('X-Request-ID', requestId)
  
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