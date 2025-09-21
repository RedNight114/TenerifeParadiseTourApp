import { NextRequest, NextResponse } from "next/server"
import { LRUCache } from "lru-cache"

// Tipos para rate limiting
export interface RateLimitConfig {
  windowMs: number // Ventana de tiempo en milisegundos
  maxRequests: number // Máximo número de requests en la ventana
  keyGenerator?: (req: NextRequest) => string // Función para generar clave única
  skipSuccessfulRequests?: boolean // Saltar requests exitosos
  skipFailedRequests?: boolean // Saltar requests fallidos
  message?: string // Mensaje de error personalizado
  statusCode?: number // Código de estado HTTP para errores
  headers?: boolean // Incluir headers de rate limit en respuesta
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
  retryAfter: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter: number
  message?: string
}

// Cache para almacenar información de rate limiting
const rateLimitCache = new LRUCache<string, { count: number; resetTime: number }>({
  max: 10000, // Máximo 10,000 entradas en cache
  ttl: 1000 * 60 * 15, // 15 minutos TTL
  updateAgeOnGet: false,
  allowStale: false,
})

// Función para generar clave por defecto (IP + User Agent)
function defaultKeyGenerator(req: NextRequest): string {
  const ip = req.ip || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const userAgent = req.headers.get('user-agent') || 'unknown'
  return `${ip}:${userAgent}`
}

// Función para generar clave por usuario autenticado
function userKeyGenerator(req: NextRequest): string {
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    // Usar hash del token como clave para evitar exponer el token
    return `user:${Buffer.from(token).toString('base64').slice(0, 16)}`
  }
  return defaultKeyGenerator(req)
}

// Función para generar clave por IP
function ipKeyGenerator(req: NextRequest): string {
  const ip = req.ip || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  return `ip:${ip}`
}

// Función para generar clave por endpoint específico
function endpointKeyGenerator(endpoint: string) {
  return (req: NextRequest): string => {
    const baseKey = userKeyGenerator(req)
    return `${baseKey}:${endpoint}`
  }
}

// Función principal de rate limiting
export function checkRateLimit(req: NextRequest, config: RateLimitConfig): RateLimitResult {
  const key = config.keyGenerator ? config.keyGenerator(req) : defaultKeyGenerator(req)
  const now = Date.now()
  
  // Obtener información actual del cache
  const current = rateLimitCache.get(key)
  
  if (!current) {
    // Primera request para esta clave
    const resetTime = now + config.windowMs
    rateLimitCache.set(key, { count: 1, resetTime })
    
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: resetTime,
      retryAfter: Math.ceil(config.windowMs / 1000)
    }
  }
  
  // Verificar si la ventana de tiempo ha expirado
  if (now > current.resetTime) {
    // Resetear contador
    const resetTime = now + config.windowMs
    rateLimitCache.set(key, { count: 1, resetTime })
    
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: resetTime,
      retryAfter: Math.ceil(config.windowMs / 1000)
    }
  }
  
  // Incrementar contador
  const newCount = current.count + 1
  rateLimitCache.set(key, { count: newCount, resetTime: current.resetTime })
  
  // Verificar si se ha excedido el límite
  if (newCount > config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: current.resetTime,
      retryAfter: Math.ceil((current.resetTime - now) / 1000),
      message: config.message || 'Rate limit exceeded'
    }
  }
  
  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - newCount,
    reset: current.resetTime,
    retryAfter: Math.ceil((current.resetTime - now) / 1000)
  }
}

// Middleware de rate limiting
export function withRateLimit(config: RateLimitConfig) {
  return function(handler: (req: NextRequest) => Promise<NextResponse>) {
    return async function(request: NextRequest): Promise<NextResponse> {
      const result = checkRateLimit(request, config)
      
      if (!result.success) {
        // Rate limit exceeded
        
        const response = NextResponse.json({
          error: result.message || 'Rate limit exceeded',
          retryAfter: result.retryAfter
        }, { status: config.statusCode || 429 })
        
        // Agregar headers de rate limit si está habilitado
        if (config.headers) {
          response.headers.set('X-RateLimit-Limit', result.limit.toString())
          response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
          response.headers.set('X-RateLimit-Reset', result.reset.toString())
          response.headers.set('Retry-After', result.retryAfter.toString())
        }
        
        return response
      }
      
      // Agregar headers de rate limit a la respuesta exitosa si está habilitado
      const response = await handler(request)
      
      if (config.headers) {
        response.headers.set('X-RateLimit-Limit', result.limit.toString())
        response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
        response.headers.set('X-RateLimit-Reset', result.reset.toString())
      }
      
      return response
    }
  }
}

// Configuraciones predefinidas de rate limiting
export const rateLimitConfigs = {
  // Rate limiting estricto para autenticación
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5, // 5 intentos por 15 minutos
    keyGenerator: ipKeyGenerator,
    message: 'Demasiados intentos de autenticación. Intente de nuevo en 15 minutos.',
    statusCode: 429,
    headers: true
  },
  
  // Rate limiting para APIs públicas
  public: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 60, // 60 requests por minuto
    keyGenerator: ipKeyGenerator,
    message: 'Demasiadas peticiones. Intente de nuevo en 1 minuto.',
    statusCode: 429,
    headers: true
  },
  
  // Rate limiting para usuarios autenticados
  authenticated: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 100, // 100 requests por minuto
    keyGenerator: userKeyGenerator,
    message: 'Demasiadas peticiones. Intente de nuevo en 1 minuto.',
    statusCode: 429,
    headers: true
  },
  
  // Rate limiting para administradores (más permisivo)
  admin: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 200, // 200 requests por minuto
    keyGenerator: userKeyGenerator,
    message: 'Demasiadas peticiones. Intente de nuevo en 1 minuto.',
    statusCode: 429,
    headers: true
  },
  
  // Rate limiting para uploads
  upload: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 10, // 10 uploads por minuto
    keyGenerator: userKeyGenerator,
    message: 'Demasiados uploads. Intente de nuevo en 1 minuto.',
    statusCode: 429,
    headers: true
  },
  
  // Rate limiting para pagos
  payment: {
    windowMs: 5 * 60 * 1000, // 5 minutos
    maxRequests: 10, // 10 intentos de pago por 5 minutos
    keyGenerator: userKeyGenerator,
    message: 'Demasiados intentos de pago. Intente de nuevo en 5 minutos.',
    statusCode: 429,
    headers: true
  },
  
  // Rate limiting para webhooks
  webhook: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 30, // 30 webhooks por minuto
    keyGenerator: ipKeyGenerator,
    message: 'Demasiados webhooks. Intente de nuevo en 1 minuto.',
    statusCode: 429,
    headers: true
  }
}

// Funciones de conveniencia para rate limiting
export const withAuthRateLimit = withRateLimit(rateLimitConfigs.auth)
export const withPublicRateLimit = withRateLimit(rateLimitConfigs.public)
export const withAuthenticatedRateLimit = withRateLimit(rateLimitConfigs.authenticated)
export const withAdminRateLimit = withRateLimit(rateLimitConfigs.admin)
export const withUploadRateLimit = withRateLimit(rateLimitConfigs.upload)
export const withPaymentRateLimit = withRateLimit(rateLimitConfigs.payment)
export const withWebhookRateLimit = withRateLimit(rateLimitConfigs.webhook)

// Función para crear rate limiting personalizado por endpoint
export function createEndpointRateLimit(endpoint: string, config: Partial<RateLimitConfig> = {}) {
  const defaultConfig: RateLimitConfig = {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 60, // 60 requests por minuto
    keyGenerator: endpointKeyGenerator(endpoint),
    message: `Demasiadas peticiones a ${endpoint}. Intente de nuevo en 1 minuto.`,
    statusCode: 429,
    headers: true
  }
  
  return withRateLimit({ ...defaultConfig, ...config })
}

// Función para limpiar el cache (útil para testing)
export function clearRateLimitCache(): void {
  rateLimitCache.clear()
}

// Función para obtener estadísticas del cache
export function getRateLimitStats() {
  return {
    size: rateLimitCache.size,
    max: rateLimitCache.max,
    ttl: rateLimitCache.ttl
  }
}

// Función para verificar rate limit sin middleware (para uso interno)
export function checkRateLimitOnly(req: NextRequest, config: RateLimitConfig): RateLimitResult {
  return checkRateLimit(req, config)
} 
