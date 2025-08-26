// Solo importar en el servidor
let createClient: unknown = null
if (typeof window === 'undefined') {
  try {
    // Usar import dinámico en lugar de require
    import('@supabase/supabase-js').then(({ createClient: client }) => {
      createClient = client
    }).catch(() => {
})
  } catch (error) {
}
}

// Tipos para el sistema de logs
export interface LogEntry {
  id?: string
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  service: string
  endpoint: string
  method: string
  userId?: string
  sessionId?: string
  requestId: string
  duration?: number
  statusCode?: number
  error?: {
    message: string
    stack?: string
    code?: string
    details?: unknown
  }
  metadata: {
    userAgent?: string
    ip?: string
    country?: string
    requestSize?: number
    responseSize?: number
    databaseQueries?: number
    cacheHits?: number
    cacheMisses?: number
    [key: string]: unknown
  }
  context: {
    function?: string
    line?: number
    file?: string
    [key: string]: unknown
  }
}

export interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  enableConsole: boolean
  enableDatabase: boolean
  enableFile: boolean
  enableMetrics: boolean
  batchSize: number
  flushInterval: number
  maxFileSize: number
  maxFiles: number
  retentionDays: number
}

// Configuración por defecto
const DEFAULT_CONFIG: LoggerConfig = {
  level: (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') ? 'warn' : 'debug',
  enableConsole: true,
  enableDatabase: false,
  enableFile: false,
  enableMetrics: true,
  batchSize: 50,
  flushInterval: 5000, // 5 segundos
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  retentionDays: 30
}

export class AdvancedLogger {
  private config: LoggerConfig
  private logBuffer: LogEntry[] = []
  private flushTimer: NodeJS.Timeout | null = null
  private metrics: Map<string, number> = new Map()
  private supabase: unknown = null

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.initializeLogger()
  }

  private initializeLogger() {
    // Inicializar Supabase si está habilitado
    if (this.config.enableDatabase) {
      this.initializeSupabase()
    }

    // Configurar flush automático
    if (this.config.batchSize > 1) {
      this.startAutoFlush()
    }

    // Configurar limpieza automática
    this.startCleanup()
  }

  private initializeSupabase() {
    try {
      // Solo ejecutar en el servidor
      if (typeof window !== 'undefined') {
        return
      }
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (supabaseUrl && supabaseKey) {
        // Verificar que createClient esté disponible
        if (typeof createClient === 'function') {
          this.supabase = createClient(supabaseUrl, supabaseKey)
          // Logger: Supabase inicializado para logs
        }
      }
    } catch (error) {
      // Logger: No se pudo inicializar Supabase
    }
  }

  private startAutoFlush() {
    this.flushTimer = setInterval(() => {
      this.flush()
    }, this.config.flushInterval)
  }

  private startCleanup() {
    // Limpiar logs antiguos cada hora
    setInterval(() => {
      this.cleanupOldLogs()
    }, 60 * 60 * 1000)
  }

  // Métodos principales de logging
  debug(message: string, context: Partial<LogEntry['context']> = {}) {
    this.log('debug', message, context)
  }

  info(message: string, context: Partial<LogEntry['context']> = {}) {
    this.log('info', message, context)
  }

  warn(message: string, context: Partial<LogEntry['context']> = {}) {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error, context: Partial<LogEntry['context']> = {}) {
    this.log('error', message, context, error)
  }

  fatal(message: string, error?: Error, context: Partial<LogEntry['context']> = {}) {
    this.log('fatal', message, context, error)
  }

  // Método principal de logging
  private log(
    level: LogEntry['level'],
    message: string,
    context: Partial<LogEntry['context'] & {
      endpoint?: string
      method?: string
      userId?: string
      sessionId?: string
      statusCode?: number
      userAgent?: string
      ip?: string
      country?: string
      requestSize?: number
      responseSize?: number
      databaseQueries?: number
      cacheHits?: number
      cacheMisses?: number
    }> = {},
    error?: Error
  ) {
    // Verificar nivel de log
    if (!this.shouldLog(level)) return

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: 'tenerife-paradise-api',
      endpoint: context.endpoint || 'unknown',
      method: context.method || 'unknown',
      userId: context.userId,
      sessionId: context.sessionId,
      requestId: this.generateRequestId(),
      statusCode: context.statusCode,
      error: error ? {
        message: error.message,
        stack: error.stack,
        code: (error as unknown as { code?: string }).code,
        details: (error as unknown as { details?: unknown }).details
      } : undefined,
      metadata: {
        userAgent: context.userAgent,
        ip: context.ip,
        country: context.country,
        requestSize: context.requestSize,
        responseSize: context.responseSize,
        databaseQueries: context.databaseQueries,
        cacheHits: context.cacheHits,
        cacheMisses: context.cacheMisses,
        ...context
      },
      context: {
        function: context.function,
        line: context.line,
        file: context.file,
        ...context
      }
    }

    // Agregar al buffer
    this.logBuffer.push(logEntry)

    // Log a consola si está habilitado
    if (this.config.enableConsole) {
      this.logToConsole(logEntry)
    }

    // Flush si el buffer está lleno
    if (this.logBuffer.length >= this.config.batchSize) {
      this.flush()
    }

    // Actualizar métricas
    if (this.config.enableMetrics) {
      this.updateMetrics(logEntry)
    }
  }

  private shouldLog(level: LogEntry['level']): boolean {
    const levels = ['debug', 'info', 'warn', 'error', 'fatal']
    const configLevel = levels.indexOf(this.config.level)
    const currentLevel = levels.indexOf(level)
    return currentLevel >= configLevel
  }

  private logToConsole(entry: LogEntry) {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString()
    const level = entry.level.toUpperCase().padEnd(5)
    const service = entry.service.padEnd(20)
    const endpoint = entry.endpoint.padEnd(30)
    
    const message = `${timestamp} [${level}] ${service} ${endpoint} ${entry.error?.message || ''}`
    
    switch (entry.level) {
      case 'debug':
break
      case 'info':
break
      case 'warn':
break
      case 'error':
      case 'fatal':
break
    }
  }

  private updateMetrics(entry: LogEntry) {
    // Métricas por nivel
    const levelKey = `logs.${entry.level}`
    this.metrics.set(levelKey, (this.metrics.get(levelKey) || 0) + 1)

    // Métricas por endpoint
    const endpointKey = `endpoints.${entry.endpoint}.${entry.method}`
    this.metrics.set(endpointKey, (this.metrics.get(endpointKey) || 0) + 1)

    // Métricas de duración
    if (entry.duration) {
      const durationKey = `duration.${entry.endpoint}`
      const currentAvg = this.metrics.get(durationKey) || 0
      this.metrics.set(durationKey, (currentAvg + entry.duration) / 2)
    }

    // Métricas de errores
    if (entry.error) {
      const errorKey = `errors.${entry.endpoint}`
      this.metrics.set(errorKey, (this.metrics.get(errorKey) || 0) + 1)
    }
  }

  // Métodos de utilidad
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Métodos de API
  async flush() {
    if (this.logBuffer.length === 0) return

    const logsToFlush = [...this.logBuffer]
    this.logBuffer = []

    try {
      // Flush a base de datos
      if (this.config.enableDatabase && this.supabase) {
        await this.flushToDatabase(logsToFlush)
      }

      // Flush a archivo
      if (this.config.enableFile) {
        await this.flushToFile(logsToFlush)
      }
    } catch (error) {
// Reintentar con logs fallidos
      this.logBuffer.unshift(...logsToFlush)
    }
  }

  private async flushToDatabase(logs: LogEntry[]) {
    if (!this.supabase) return

    try {
      const supabase = this.supabase as any
      const { error } = await supabase
        .from('api_logs')
        .insert(logs)

      if (error) {
        throw error
      }
    } catch (error) {
      throw error
    }
  }

  private async flushToFile(logs: LogEntry[]) {
    // Implementar rotación de archivos
    const logFile = `logs/api-${new Date().toISOString().split('T')[0]}.log`
    
    try {
      // Aquí implementarías la lógica de escritura a archivo
      // Por ahora solo simulamos
} catch (error) {
throw error
    }
  }

  private async cleanupOldLogs() {
    try {
      if (this.supabase) {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays)

        const supabase = this.supabase as any
        const { error } = await supabase
          .from('api_logs')
          .delete()
          .lt('timestamp', cutoffDate.toISOString())

        if (error) {
          console.error('Error al limpiar logs antiguos:', error)
        } else {
          console.log('Logs antiguos limpiados correctamente')
        }
      }
    } catch (error) {
      console.error('Error en cleanup de logs:', error)
    }
  }

  // Métodos públicos para métricas
  getMetrics() {
    return Object.fromEntries(this.metrics)
  }

  getMetricsByEndpoint(endpoint: string) {
    const endpointMetrics: Record<string, number> = {}
    
    for (const [key, value] of this.metrics.entries()) {
      if (key.includes(endpoint)) {
        endpointMetrics[key] = value
      }
    }
    
    return endpointMetrics
  }

  resetMetrics() {
    this.metrics.clear()
  }

  // Método para logging de API específico
  logApiCall(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number,
    userId?: string,
    sessionId?: string,
    metadata: Partial<LogEntry['metadata']> = {}
  ) {
    const level = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'info'
    
    this.log(level, `${method} ${endpoint} - ${statusCode}`, {
      endpoint,
      method,
      duration,
      statusCode,
      userId,
      sessionId,
      ...metadata
    })
  }

  // Método para logging de errores de base de datos
  logDatabaseError(
    operation: string,
    table: string,
    error: Error,
    query?: string,
    params?: any[]
  ) {
    this.error(`Database error in ${operation} on ${table}`, error, {
      function: 'database',
      databaseOperation: operation,
      table,
      query,
      params: params ? JSON.stringify(params) : undefined
    })
  }

  // Método para logging de cache
  logCacheOperation(
    operation: 'hit' | 'miss' | 'set' | 'delete',
    key: string,
    duration?: number
  ) {
    this.debug(`Cache ${operation}: ${key}`, {
      function: 'cache',
      cacheOperation: operation,
      cacheKey: key,
      duration
    })
  }

  // Destructor
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    this.flush()
  }
}

// Instancia singleton del logger
export const logger = new AdvancedLogger()

// Función helper para logging rápido
export const log = {
  debug: (message: string, context?: any) => logger.debug(message, context),
  info: (message: string, context?: any) => logger.info(message, context),
  warn: (message: string, context?: any) => logger.warn(message, context),
  error: (message: string, error?: Error, context?: any) => logger.error(message, error, context),
  fatal: (message: string, error?: Error, context?: any) => logger.fatal(message, error, context),
  
  // Métodos específicos para API
  api: (endpoint: string, method: string, duration: number, statusCode: number, metadata?: any) => 
    logger.logApiCall(endpoint, method, duration, statusCode, undefined, undefined, metadata),
  
  db: (operation: string, table: string, error: Error, query?: string, params?: any[]) =>
    logger.logDatabaseError(operation, table, error, query, params),
  
  cache: (operation: 'hit' | 'miss' | 'set' | 'delete', key: string, duration?: number) =>
    logger.logCacheOperation(operation, key, duration)
}

