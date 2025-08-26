import { NextRequest, NextResponse } from 'next/server'
import { log } from './edge-compatible-logger'

export interface ApiLoggingOptions {
  enabled: boolean
  logRequestBody: boolean
  logResponseBody: boolean
  logHeaders: boolean
  excludePaths: string[]
  includePaths: string[]
  maxBodySize: number
  sensitiveFields: string[]
}

const DEFAULT_OPTIONS: ApiLoggingOptions = {
  enabled: true,
  logRequestBody: false,
  logResponseBody: false,
  logHeaders: false,
  excludePaths: ['/api/health', '/api/metrics'],
  includePaths: [],
  maxBodySize: 1024 * 10, // 10KB
  sensitiveFields: ['password', 'token', 'secret', 'key', 'authorization']
}

export function createApiLoggingMiddleware(options: Partial<ApiLoggingOptions> = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options }

  return async function apiLoggingMiddleware(
    request: NextRequest,
    next: () => Promise<NextResponse>
  ) {
    if (!config.enabled) {
      return next()
    }

    const startTime = Date.now()
    const requestId = generateRequestId()
    const url = new URL(request.url)
    const pathname = url.pathname

    // Verificar si debemos excluir este path
    if (shouldExcludePath(pathname, config)) {
      return next()
    }

    // Verificar si debemos incluir solo ciertos paths
    if (config.includePaths.length > 0 && !shouldIncludePath(pathname, config)) {
      return next()
    }

    try {
      // Log de la petición entrante
      const requestLog = await createRequestLog(request, requestId, config)
      log.info('API Request', requestLog)

      // Ejecutar la siguiente función (handler de la API)
      const response = await next()

      // Calcular duración
      const duration = Date.now() - startTime

      // Log de la respuesta
      const responseLog = await createResponseLog(response, requestId, duration, config)
      
      // Determinar nivel de log basado en el status code
      if (response.status >= 400) {
        log.error('API Response Error', { function: 'api-logging' }, { responseLog })
      } else if (response.status >= 300) {
        log.warn('API Response Warning', { function: 'api-logging' }, { responseLog })
      } else {
        log.info('API Response Success', { function: 'api-logging' }, { responseLog })
      }

      // Log de métricas de rendimiento
      log.info('API Metrics', { function: 'api-logging' }, {
        pathname,
        method: request.method,
        duration,
        status: response.status,
        requestId,
        requestSize: requestLog.metadata.requestSize,
        responseSize: responseLog.metadata.responseSize,
        userAgent: requestLog.metadata.userAgent,
        ip: requestLog.metadata.ip
      })

      return response

    } catch (error) {
      // Log de errores no manejados
      const duration = Date.now() - startTime
      const errorLog = createErrorLog(error, requestId, duration, request, config)
      
      log.fatal('API Unhandled Error', { function: 'api-logging' }, { error: error as Error, errorLog })

      // Re-lanzar el error para que se maneje apropiadamente
      throw error
    }
  }
}

// Función helper para crear log de petición
async function createRequestLog(
  request: NextRequest,
  requestId: string,
  config: ApiLoggingOptions
) {
  const url = new URL(request.url)
  const headers = Object.fromEntries(request.headers.entries())
  
  // Filtrar headers sensibles
  const filteredHeaders = config.logHeaders ? filterSensitiveData(headers, config.sensitiveFields) : {}
  
  // Obtener body si está habilitado y no es muy grande
  let body = null
  if (config.logRequestBody) {
    try {
      const clonedRequest = request.clone()
      const text = await clonedRequest.text()
      if (text.length <= config.maxBodySize) {
        body = filterSensitiveData(JSON.parse(text || '{}'), config.sensitiveFields)
      }
    } catch (error) {
      // Ignorar errores de parsing del body
    }
  }

  return {
    endpoint: url.pathname,
    method: request.method,
    requestId,
    timestamp: new Date().toISOString(),
    metadata: {
      requestSize: parseInt(headers['content-length'] || '0'),
      userAgent: headers['user-agent'],
      ip: getClientIP(request),
      country: headers['cf-ipcountry'] || headers['x-forwarded-for-country'],
      query: Object.fromEntries(url.searchParams.entries()),
      headers: filteredHeaders,
      body
    }
  }
}

// Función helper para crear log de respuesta
async function createResponseLog(
  response: NextResponse,
  requestId: string,
  duration: number,
  config: ApiLoggingOptions
) {
  const headers = Object.fromEntries(response.headers.entries())
  const filteredHeaders = config.logHeaders ? filterSensitiveData(headers, config.sensitiveFields) : {}
  
  // Obtener body de respuesta si está habilitado
  let body = null
  if (config.logResponseBody) {
    try {
      const clonedResponse = response.clone()
      const text = await clonedResponse.text()
      if (text.length <= config.maxBodySize) {
        body = text
      }
    } catch (error) {
      // Ignorar errores de lectura del body
    }
  }

  return {
    endpoint: 'response',
    method: 'RESPONSE',
    requestId,
    timestamp: new Date().toISOString(),
    duration,
    statusCode: response.status,
    metadata: {
      responseSize: parseInt(headers['content-length'] || '0'),
      headers: filteredHeaders,
      body
    }
  }
}

// Función helper para crear log de error
function createErrorLog(
  error: unknown,
  requestId: string,
  duration: number,
  request: NextRequest,
  config: ApiLoggingOptions
) {
  const url = new URL(request.url)
  
  return {
    endpoint: url.pathname,
    method: request.method,
    requestId,
    timestamp: new Date().toISOString(),
    duration,
    statusCode: 500,
    error: {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'UnknownError'
    },
    metadata: {
      userAgent: request.headers.get('user-agent'),
      ip: getClientIP(request)
    }
  }
}

// Función helper para obtener IP del cliente
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    'unknown'
  )
}

// Función helper para filtrar datos sensibles
function filterSensitiveData(data: any, sensitiveFields: string[]): any {
  if (typeof data !== 'object' || data === null) {
    return data
  }

  if (Array.isArray(data)) {
    return data.map(item => filterSensitiveData(item, sensitiveFields))
  }

  const filtered: any = {}
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase()
    const isSensitive = sensitiveFields.some(field => lowerKey.includes(field))
    
    if (isSensitive) {
      filtered[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      filtered[key] = filterSensitiveData(value, sensitiveFields)
    } else {
      filtered[key] = value
    }
  }

  return filtered
}

// Función helper para generar ID de petición
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Función helper para verificar si un path debe ser excluido
function shouldExcludePath(pathname: string, config: ApiLoggingOptions): boolean {
  return config.excludePaths.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'))
      return regex.test(pathname)
    }
    return pathname.startsWith(pattern)
  })
}

// Función helper para verificar si un path debe ser incluido
function shouldIncludePath(pathname: string, config: ApiLoggingOptions): boolean {
  if (config.includePaths.length === 0) return true
  
  return config.includePaths.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'))
      return regex.test(pathname)
    }
    return pathname.startsWith(pattern)
  })
}

// Middleware de logging simplificado para usar en API routes
export function withApiLogging<T extends any[]>(
  handler: (...args: T) => Promise<Response>,
  options: Partial<ApiLoggingOptions> = {}
) {
  return async function loggedHandler(...args: T): Promise<Response> {
    const config = { ...DEFAULT_OPTIONS, ...options }
    if (!config.enabled) {
      return handler(...args)
    }

    const startTime = Date.now()
    const requestId = generateRequestId()
    
    try {
      // Log de inicio
      log.info('API Handler Start', {
        endpoint: 'handler',
        method: 'HANDLER',
        requestId,
        function: handler.name || 'anonymous'
      })

      // Ejecutar handler
      const response = await handler(...args)
      
      // Calcular duración
      const duration = Date.now() - startTime
      
      // Log de éxito
      log.info('API Handler Success', {
        endpoint: 'handler',
        method: 'HANDLER',
        requestId,
        duration,
        statusCode: response.status,
        function: handler.name || 'anonymous'
      })

      return response

    } catch (error) {
      // Calcular duración
      const duration = Date.now() - startTime
      
      // Log de error
      log.error('API Handler Error', error as Error, {
        endpoint: 'handler',
        method: 'HANDLER',
        requestId,
        duration,
        function: handler.name || 'anonymous'
      })

      throw error
    }
  }
}

// Función helper para logging manual en handlers
export function logApiCall(
  endpoint: string,
  method: string,
  metadata: Record<string, any> = {}
) {
  return {
    start: () => {
      const startTime = Date.now()
      const requestId = generateRequestId()
      
      log.info('API Call Start', {
        endpoint,
        method,
        requestId,
        ...metadata
      })

      return {
        end: (statusCode: number, additionalMetadata: Record<string, any> = {}) => {
          const duration = Date.now() - startTime
          
          log.info('API Call End', {
            endpoint,
            method,
            duration,
            statusCode,
            requestId,
            ...metadata,
            ...additionalMetadata
          })
        },
        error: (error: Error, additionalMetadata: Record<string, any> = {}) => {
          const duration = Date.now() - startTime
          
          log.error('API Call Error', error, {
            endpoint,
            method,
            requestId,
            duration,
            ...metadata,
            ...additionalMetadata
          })
        }
      }
    }
  }
}
