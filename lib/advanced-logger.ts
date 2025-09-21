// Logger simplificado sin Supabase para evitar problemas de SSR

// Tipos para el sistema de logs
export interface LogEntry {
  id?: string
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  message: string
  context?: Record<string, unknown>
  userId?: string
  sessionId?: string
  requestId?: string
  source?: string
  tags?: string[]
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
  level: 'debug',
  enableConsole: true,
  enableDatabase: false,
  enableFile: false,
  enableMetrics: true,
  batchSize: 50,
  flushInterval: 5000,
  maxFileSize: 10 * 1024 * 1024,
  maxFiles: 5,
  retentionDays: 30
}

export class AdvancedLogger {
  private config: LoggerConfig
  private logBuffer: LogEntry[] = []
  private flushTimer: NodeJS.Timeout | null = null
  private metrics: Map<string, number> = new Map()

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.initializeLogger()
  }

  private initializeLogger() {
    // Configurar flush automático
    if (this.config.batchSize > 1) {
      this.startAutoFlush()
    }
  }

  private startAutoFlush() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }

    this.flushTimer = setInterval(() => {
      this.flush()
    }, this.config.flushInterval)
  }

  private startCleanup() {
    // Limpieza automática cada hora
    setInterval(() => {
      this.cleanup()
    }, 60 * 60 * 1000)
  }

  private cleanup() {
    // Limpiar logs antiguos
    const cutoffTime = Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000)
    this.logBuffer = this.logBuffer.filter(log => 
      new Date(log.timestamp).getTime() > cutoffTime
    )
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error', 'fatal']
    const currentLevelIndex = levels.indexOf(this.config.level)
    const messageLevelIndex = levels.indexOf(level)
    return messageLevelIndex >= currentLevelIndex
  }

  private createLogEntry(
    level: 'debug' | 'info' | 'warn' | 'error' | 'fatal',
    message: string,
    context?: Record<string, unknown>
  ): LogEntry {
    return {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      source: 'server'
    }
  }

  private log(level: 'debug' | 'info' | 'warn' | 'error' | 'fatal', message: string, context?: Record<string, unknown>) {
    if (!this.shouldLog(level)) {
      return
    }

    const logEntry = this.createLogEntry(level, message, context)

    // Console logging
    if (this.config.enableConsole) {
      const prefix = `[${logEntry.timestamp}] [${level.toUpperCase()}]`
      
      if (context) {
        if (level === 'error' || level === 'fatal') {
          } else if (level === 'warn') {
          } else {
          }
      } else {
        if (level === 'error' || level === 'fatal') {
          } else if (level === 'warn') {
          } else {
          }
      }
    }

    // Buffer para batch processing
    this.logBuffer.push(logEntry)

    // Flush inmediato si se alcanza el batch size
    if (this.logBuffer.length >= this.config.batchSize) {
      this.flush()
    }

    // Actualizar métricas
    if (this.config.enableMetrics) {
      this.updateMetrics(level)
    }
  }

  private updateMetrics(level: string) {
    const key = `logs.${level}`
    const current = this.metrics.get(key) || 0
    this.metrics.set(key, current + 1)
  }

  public debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context)
  }

  public info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context)
  }

  public warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context)
  }

  public error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context)
  }

  public fatal(message: string, context?: Record<string, unknown>) {
    this.log('fatal', message, context)
  }

  public flush() {
    if (this.logBuffer.length === 0) {
      return
    }

    // Aquí se implementaría el envío a base de datos o archivo
    // Por ahora, solo limpiamos el buffer
    this.logBuffer = []
  }

  public getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  public destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
    this.flush()
  }
}

// Instancia global del logger
const logger = new AdvancedLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  enableConsole: true,
  enableDatabase: false,
  enableFile: false,
  enableMetrics: true
})

// Funciones de conveniencia
export const log = {
  debug: (message: string, context?: Record<string, unknown>) => logger.debug(message, context),
  info: (message: string, context?: Record<string, unknown>) => logger.info(message, context),
  warn: (message: string, context?: Record<string, unknown>) => logger.warn(message, context),
  error: (message: string, context?: Record<string, unknown>) => logger.error(message, context),
  fatal: (message: string, context?: Record<string, unknown>) => logger.fatal(message, context),
}

// Funciones específicas para autenticación y caché
export const logAuth = (message: string, context?: Record<string, unknown>) => {
  logger.info(`[AUTH] ${message}`, { ...context, source: 'auth' })
}

export const logError = (message: string, error: unknown) => {
  logger.error(`[ERROR] ${message}`, { 
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  })
}

export const logCache = (message: string, context?: Record<string, unknown>) => {
  logger.debug(`[CACHE] ${message}`, { ...context, source: 'cache' })
}

export const logPerformance = (message: string, context?: Record<string, unknown>) => {
  logger.info(`[PERF] ${message}`, { ...context, source: 'performance' })
}

export default logger