import { NextRequest, NextResponse } from "next/server"
import { auditLogger, getRequestInfo, sanitizeData } from "./audit-logger"

// Interfaz para configurar el middleware de auditoría
export interface AuditMiddlewareConfig {
  enabled: boolean
  logRequests: boolean
  logResponses: boolean
  logErrors: boolean
  sensitivePaths: string[]
  excludePaths: string[]
  maxBodySize: number // en bytes
}

// Configuración por defecto
const defaultConfig: AuditMiddlewareConfig = {
  enabled: true,
  logRequests: true,
  logResponses: false, // Solo en desarrollo
  logErrors: true,
  sensitivePaths: ['/api/auth', '/api/payment', '/api/admin'],
  excludePaths: ['/api/health', '/api/status'],
  maxBodySize: 1024 * 1024 // 1MB
}

// Clase para el middleware de auditoría
export class AuditMiddleware {
  private config: AuditMiddlewareConfig

  constructor(config: Partial<AuditMiddlewareConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  // Middleware principal
  async handle(
    request: NextRequest,
    handler: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    if (!this.config.enabled) {
      return handler()
    }

    const startTime = Date.now()
    const requestInfo = getRequestInfo(request)
    const url = new URL(request.url)
    const path = url.pathname

    // Verificar si debemos excluir este path
    if (this.shouldExcludePath(path)) {
      return handler()
    }

    let response: NextResponse | undefined
    let error: Error | null = null
    let requestBody: any = null
    let responseBody: any = null

    try {
      // Capturar body del request si es necesario
      if (this.config.logRequests && this.shouldLogRequestBody(request)) {
        requestBody = await this.captureRequestBody(request)
      }

      // Ejecutar el handler
      response = await handler()

      // Capturar body de la respuesta si es necesario
      if (this.config.logResponses && this.shouldLogResponseBody(response)) {
        responseBody = await this.captureResponseBody(response)
      }

      return response
    } catch (err) {
      error = err as Error
      throw err
    } finally {
      // Registrar el evento de auditoría
      await this.logApiEvent({
        request,
        response,
        error,
        requestBody,
        responseBody,
        requestInfo,
        startTime,
        path
      })
    }
  }

  // Verificar si debemos excluir un path
  private shouldExcludePath(path: string): boolean {
    return this.config.excludePaths.some(excludePath => 
      path.startsWith(excludePath)
    )
  }

  // Verificar si debemos loggear el body del request
  private shouldLogRequestBody(request: NextRequest): boolean {
    const method = request.method
    const contentType = request.headers.get('content-type') || ''
    
    // Solo loggear POST, PUT, PATCH
    if (!['POST', 'PUT', 'PATCH'].includes(method)) {
      return false
    }

    // Verificar tamaño del body
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > this.config.maxBodySize) {
      return false
    }

    // Solo loggear JSON y form data
    return contentType.includes('application/json') || 
           contentType.includes('application/x-www-form-urlencoded') ||
           contentType.includes('multipart/form-data')
  }

  // Verificar si debemos loggear el body de la respuesta
  private shouldLogResponseBody(response: NextResponse): boolean {
    const contentType = response.headers.get('content-type') || ''
    return contentType.includes('application/json')
  }

  // Capturar body del request
  private async captureRequestBody(request: NextRequest): Promise<any> {
    try {
      const contentType = request.headers.get('content-type') || ''
      
      if (contentType.includes('application/json')) {
        const clone = request.clone()
        const body = await clone.json()
        return sanitizeData(body)
      }
      
      if (contentType.includes('application/x-www-form-urlencoded')) {
        const clone = request.clone()
        const formData = await clone.formData()
        const body: Record<string, any> = {}
        
        for (const [key, value] of formData.entries()) {
          body[key] = value
        }
        
        return sanitizeData(body)
      }

      return null
    } catch (error) {
      return { error: 'Failed to capture request body' }
    }
  }

  // Capturar body de la respuesta
  private async captureResponseBody(response: NextResponse): Promise<any> {
    try {
      const clone = response.clone()
      const body = await clone.json()
      return sanitizeData(body)
    } catch (error) {
      return { error: 'Failed to capture response body' }
    }
  }

  // Registrar evento de API
  private async logApiEvent(data: {
    request: NextRequest
    response?: NextResponse
    error?: Error | null
    requestBody: any
    responseBody: any
    requestInfo: { ip_address?: string; user_agent?: string }
    startTime: number
    path: string
  }): Promise<void> {
    const {
      request,
      response,
      error,
      requestBody,
      responseBody,
      requestInfo,
      startTime,
      path
    } = data

    const duration = Date.now() - startTime
    const method = request.method
    const statusCode = response?.status || 500
    const success = !error && statusCode < 400

    // Determinar categoría basada en el path
    let category: 'api' | 'authentication' | 'payment' | 'admin_action' = 'api'
    if (path.startsWith('/api/auth')) {
      category = 'authentication'
    } else if (path.startsWith('/api/payment')) {
      category = 'payment'
    } else if (path.startsWith('/api/admin')) {
      category = 'admin_action'
    }

    // Determinar nivel basado en el resultado
    let level: 'info' | 'warning' | 'error' | 'critical' = 'info'
    if (error) {
      level = 'error'
    } else if (statusCode >= 400) {
      level = statusCode >= 500 ? 'critical' : 'warning'
    }

    // Extraer información del usuario si está disponible
    const authHeader = request.headers.get('authorization')
    let user_id: string | undefined
    let user_email: string | undefined

    if (authHeader?.startsWith('Bearer ')) {
      // Aquí podrías decodificar el token JWT para obtener user info
      // Por ahora lo dejamos como undefined
    }

    // Crear detalles del evento
    const details: Record<string, any> = {
      method,
      path,
      status_code: statusCode,
      duration_ms: duration,
      query_params: Object.fromEntries(new URL(request.url).searchParams),
      request_headers: this.sanitizeHeaders(request.headers),
      response_headers: response ? this.sanitizeHeaders(response.headers) : undefined
    }

    if (requestBody) {
      details.request_body = requestBody
    }

    if (responseBody) {
      details.response_body = responseBody
    }

    if (error) {
      details.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    }

    // Registrar el evento
    await auditLogger.log({
      action: `${method} ${path}`,
      category: "system",
      level,
      user_id,
      details: {
        method,
        path,
        ip: requestInfo.ip_address,
        user_agent: requestInfo.user_agent,
        user_email,
        status_code: statusCode,
        response_time: Date.now() - startTime,
      },
    })
  }

  // Sanitizar headers (remover información sensible)
  private sanitizeHeaders(headers: Headers): Record<string, string> {
    const sanitized: Record<string, string> = {}
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key']
    
    for (const [key, value] of headers.entries()) {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized
  }
}

// Instancia global del middleware
export const auditMiddleware = new AuditMiddleware()

// Función helper para usar el middleware
export function withAudit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config?: Partial<AuditMiddlewareConfig>
): (request: NextRequest) => Promise<NextResponse> {
  const middleware = new AuditMiddleware(config)
  
  return async (request: NextRequest) => {
    return middleware.handle(request, () => handler(request))
  }
}

// Middleware específico para autenticación
export async function auditAuthEvent(
  action: string,
  user_id: string,
  user_email: string,
  success: boolean,
  request: NextRequest,
  details: Record<string, any> = {},
  error_message?: string
): Promise<void> {
  const requestInfo = await getRequestInfo(request)
  
  await auditLogger.log({
    action,
    category: "authentication",
    level: success ? "info" : "error",
    user_id,
    details: {
      ...details,
      success,
      user_email,
      ip: requestInfo.ip_address,
      user_agent: requestInfo.user_agent,
      error_message,
    },
  })
}

// Middleware específico para pagos
export async function auditPaymentEvent(
  action: string,
  user_id: string,
  user_email: string,
  payment_id: string,
  amount: number,
  success: boolean,
  request: NextRequest,
  details: Record<string, any> = {},
  error_message?: string
): Promise<void> {
  const requestInfo = await getRequestInfo(request)
  
  await auditLogger.log({
    action,
    category: "payment",
    level: success ? "info" : "error",
    user_id,
    details: {
      ...details,
      payment_id,
      amount,
      success,
      user_email,
      ip: requestInfo.ip_address,
      user_agent: requestInfo.user_agent,
      error_message,
    },
  })
}

// Middleware específico para acciones de admin
export async function auditAdminEvent(
  action: string,
  admin_id: string,
  admin_email: string,
  target_type: string,
  target_id: string,
  request: NextRequest,
  details: Record<string, any> = {}
): Promise<void> {
  const requestInfo = await getRequestInfo(request)
  
  await auditLogger.log({
    action,
    category: "admin_action",
    level: "info",
    user_id: admin_id,
    details: {
      ...details,
      admin_email,
      target_type,
      target_id,
      ip: requestInfo.ip_address,
      user_agent: requestInfo.user_agent,
    },
  })
} 