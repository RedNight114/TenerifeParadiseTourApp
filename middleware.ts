import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkRateLimitOnly, rateLimitConfigs } from '@/lib/rate-limiting'

// Lista de orígenes permitidos
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  process.env.NEXT_PUBLIC_SITE_URL || 'https://tenerifeparadisetoursexcursions.com',
  'https://tenerifeparadisetoursexcursions.com',
  'https://www.tenerifeparadisetoursexcursions.com'
]

// Configuración de rate limiting por ruta
const RATE_LIMIT_CONFIGS = {
  // Autenticación - muy estricto
  '/api/auth': rateLimitConfigs.auth,
  '/api/login': rateLimitConfigs.auth,
  '/api/register': rateLimitConfigs.auth,
  '/api/forgot-password': rateLimitConfigs.auth,
  '/api/reset-password': rateLimitConfigs.auth,
  
  // Pagos - moderado
  '/api/payment': rateLimitConfigs.payment,
  
  // Uploads - limitado
  '/api/upload': rateLimitConfigs.upload,
  
  // Webhooks - específico
  '/api/payment/webhook': rateLimitConfigs.webhook,
  
  // Admin - permisivo
  '/api/admin': rateLimitConfigs.admin,
  
  // APIs públicas - estándar
  '/api/services': rateLimitConfigs.public,
  '/api/categories': rateLimitConfigs.public,
  '/api/subcategories': rateLimitConfigs.public,
  
  // APIs autenticadas - estándar
  '/api/reservations': rateLimitConfigs.authenticated,
  '/api/profile': rateLimitConfigs.authenticated,
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Solo aplicar a rutas API
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // Aplicar rate limiting basado en la ruta
  let rateLimitConfig = rateLimitConfigs.public // Configuración por defecto
  
  // Buscar configuración específica para la ruta
  for (const [route, config] of Object.entries(RATE_LIMIT_CONFIGS)) {
    if (pathname.startsWith(route)) {
      rateLimitConfig = config
      break
    }
  }
  
  // Verificar rate limit
  const rateLimitResult = checkRateLimitOnly(request, rateLimitConfig)
  
  if (!rateLimitResult.success) {
    console.error('Rate limit exceeded in middleware:', {
      pathname,
      key: rateLimitConfig.keyGenerator ? rateLimitConfig.keyGenerator(request) : 'default',
      limit: rateLimitResult.limit,
      remaining: rateLimitResult.remaining,
      retryAfter: rateLimitResult.retryAfter
    })
    
    const response = NextResponse.json({
      error: rateLimitResult.message || 'Rate limit exceeded',
      retryAfter: rateLimitResult.retryAfter
    }, { status: rateLimitConfig.statusCode || 429 })
    
    // Agregar headers de rate limit
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())
    response.headers.set('Retry-After', rateLimitResult.retryAfter.toString())
    
    // Configurar CORS para respuesta de error
    const origin = request.headers.get('origin')
    const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    } else {
      response.headers.set('Access-Control-Allow-Origin', 'https://tenerifeparadisetoursexcursions.com')
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-client-info, apikey')
    
    return response
  }
  
  // Crear la respuesta
  const response = NextResponse.next()
  
  // Configurar headers CORS
  const origin = request.headers.get('origin')
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
  
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  } else {
    // Para webhooks o peticiones sin origin, usar el dominio principal
    response.headers.set('Access-Control-Allow-Origin', 'https://tenerifeparadisetoursexcursions.com')
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-client-info, apikey')
  response.headers.set('Access-Control-Max-Age', '86400')
  
  // Agregar headers de rate limit a la respuesta exitosa
  response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
  response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())
  
  // Agregar headers de seguridad adicionales
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Manejar preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { 
      status: 200,
      headers: response.headers
    })
  }
  
  return response
}

export const config = {
  matcher: '/api/:path*',
} 