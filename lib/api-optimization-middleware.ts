import { NextRequest, NextResponse } from 'next/server'
import { unifiedCache } from '@/lib/unified-cache-system'

// Configuración de compresión
const COMPRESSION_THRESHOLD = 1024 // 1KB
const CACHE_TTL_DEFAULT = 5 * 60 * 1000 // 5 minutos

// Interfaz para configuración del middleware
interface OptimizationConfig {
  enableCompression?: boolean
  enableCaching?: boolean
  cacheTTL?: number
  maxCacheSize?: number
  enableRateLimit?: boolean
  rateLimit?: {
    requests: number
    window: number
  }
}

// Middleware de optimización de API
export function withApiOptimization(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: OptimizationConfig = {}
) {
  const {
    enableCompression = true,
    enableCaching = true,
    cacheTTL = CACHE_TTL_DEFAULT,
    maxCacheSize = 100,
    enableRateLimit = false,
    rateLimit = { requests: 100, window: 15 * 60 * 1000 } // 15 minutos
  } = config

  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now()
    
    try {
      // Rate limiting básico
      if (enableRateLimit) {
        const clientId = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        'unknown'
        
        const rateLimitKey = `rate_limit_${clientId}`
        const currentRequests = await unifiedCache.get(rateLimitKey) || 0
        const requestCount = typeof currentRequests === 'number' ? currentRequests : 0
        
        if (requestCount >= rateLimit.requests) {
          return NextResponse.json(
            { error: 'Rate limit exceeded' },
            { 
              status: 429,
              headers: {
                'Retry-After': Math.ceil(rateLimit.window / 1000).toString(),
                'X-RateLimit-Limit': rateLimit.requests.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': new Date(Date.now() + rateLimit.window).toISOString()
              }
            }
          )
        }
        
        // Incrementar contador
        await unifiedCache.set(rateLimitKey, requestCount + 1, { ttl: rateLimit.window })
      }

      // Generar clave de caché para GET requests
      let cacheKey: string | null = null
      if (enableCaching && request.method === 'GET') {
        const url = new URL(request.url)
        cacheKey = `api_cache_${request.method}_${url.pathname}_${url.search}`
        
        // Intentar obtener del caché
        const cached = await unifiedCache.get(cacheKey)
        if (cached && typeof cached === 'object' && 'data' in cached) {
          const response = NextResponse.json((cached as any).data)
          
          // Agregar headers de caché
          response.headers.set('X-Cache', 'HIT')
          response.headers.set('X-Cache-TTL', (cached as any).ttl?.toString() || '0')
          response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`)
          
          return response
        }
      }

      // Ejecutar handler original
      const response = await handler(request)

      // Procesar respuesta
      if (response.status === 200 && enableCaching && cacheKey) {
        try {
          const responseData = await response.clone().json()
          
          // Solo cachear si el payload no es muy grande
          const payloadSize = JSON.stringify(responseData).length
          if (payloadSize <= maxCacheSize * 1024) { // Convertir KB a bytes
            await unifiedCache.set(cacheKey, {
              data: responseData,
              timestamp: Date.now(),
              ttl: cacheTTL
            }, { ttl: cacheTTL })
          }
        } catch (error) {
          // Si no se puede parsear como JSON, no cachear
          }
      }

      // Agregar headers de optimización
      const optimizedResponse = new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      })

      // Headers de rendimiento
      optimizedResponse.headers.set('X-Response-Time', `${Date.now() - startTime}ms`)
      optimizedResponse.headers.set('X-Cache', cacheKey ? 'MISS' : 'DISABLED')
      
      // Compresión para payloads grandes
      if (enableCompression && response.body) {
        const contentLength = response.headers.get('content-length')
        if (contentLength && parseInt(contentLength) > COMPRESSION_THRESHOLD) {
          optimizedResponse.headers.set('Content-Encoding', 'gzip')
          optimizedResponse.headers.set('Vary', 'Accept-Encoding')
        }
      }

      // Headers de caché HTTP
      if (enableCaching && request.method === 'GET') {
        optimizedResponse.headers.set('Cache-Control', `public, max-age=${Math.floor(cacheTTL / 1000)}`)
        optimizedResponse.headers.set('ETag', `"${Date.now()}"`)
      }

      return optimizedResponse

    } catch (error) {
      // En caso de error, ejecutar handler sin optimizaciones
      const response = await handler(request)
      response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`)
      response.headers.set('X-Cache', 'ERROR')
      
      return response
    }
  }
}

// Función para invalidar caché por patrón
export async function invalidateApiCache(pattern: string) {
  try {
    await unifiedCache.invalidateByPattern(new RegExp(pattern))
  } catch (error) {
    }
}

// Función para obtener estadísticas de caché
export async function getCacheStats() {
  try {
    return await unifiedCache.getStats()
  } catch (error) {
    return null
  }
}

// Configuraciones predefinidas para diferentes tipos de endpoints
export const optimizationConfigs = {
  // Para endpoints de lectura (servicios, categorías)
  readOnly: {
    enableCompression: true,
    enableCaching: true,
    cacheTTL: 15 * 60 * 1000, // 15 minutos
    maxCacheSize: 200, // 200KB
    enableRateLimit: true,
    rateLimit: { requests: 1000, window: 15 * 60 * 1000 }
  },
  
  // Para endpoints de escritura (reservas, usuarios)
  writeHeavy: {
    enableCompression: true,
    enableCaching: false, // No cachear escrituras
    enableRateLimit: true,
    rateLimit: { requests: 100, window: 15 * 60 * 1000 }
  },
  
  // Para endpoints de búsqueda
  search: {
    enableCompression: true,
    enableCaching: true,
    cacheTTL: 5 * 60 * 1000, // 5 minutos
    maxCacheSize: 100, // 100KB
    enableRateLimit: true,
    rateLimit: { requests: 200, window: 15 * 60 * 1000 }
  },
  
  // Para endpoints de métricas y estadísticas
  metrics: {
    enableCompression: true,
    enableCaching: true,
    cacheTTL: 1 * 60 * 1000, // 1 minuto
    maxCacheSize: 50, // 50KB
    enableRateLimit: true,
    rateLimit: { requests: 50, window: 15 * 60 * 1000 }
  }
}
