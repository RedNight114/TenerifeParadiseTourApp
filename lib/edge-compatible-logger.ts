// Logger compatible con Edge Runtime
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
    details?: any
  }
  metadata: {
    message: string
    userAgent?: string
    ip?: string
    country?: string
    requestSize?: number
    responseSize?: number
    databaseQueries?: number
    cacheHits?: number
    cacheMisses?: number
    [key: string]: any
  }
  context: {
    function?: string
    line?: number
    file?: string
    [key: string]: any
  }
}

export interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  enableConsole: boolean
  enableMetrics: boolean
  batchSize: number
  flushInterval: number
}

// Configuración por defecto
const DEFAULT_CONFIG: LoggerConfig = {
  level: 'debug',
  enableConsole: true,
  enableMetrics: true,
  batchSize: 50,
  flushInterval: 5000 // 5 segundos
}

export class EdgeCompatibleLogger {
  private config: LoggerConfig
  private logBuffer: LogEntry[] = []
  private metrics: Map<string, number> = new Map()

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error', 'fatal']
    const configLevel = levels.indexOf(this.config.level)
    const messageLevel = levels.indexOf(level)
    return messageLevel >= configLevel
  }

  private createLogEntry(
    level: 'debug' | 'info' | 'warn' | 'error' | 'fatal',
    message: string,
    context: Partial<LogEntry['context']> = {},
    metadata: Partial<LogEntry['metadata']> = {}
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      service: 'edge-runtime',
      endpoint: 'unknown',
      method: 'GET',
      requestId: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        message,
        ...metadata
      },
      context: {
        function: context.function || 'unknown',
        line: context.line || 0,
        file: context.file || 'unknown',
        ...context
      }
    }
  }

  private logToConsole(entry: LogEntry) {
    if (!this.config.enableConsole) return

    const timestamp = new Date(entry.timestamp).toLocaleTimeString()
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}]`
    
    switch (entry.level) {
      case 'debug':
break
      case 'info':
break
      case 'warn':
break
      case 'error':
break
      case 'fatal':
break
    }
  }

  private addToBuffer(entry: LogEntry) {
    this.logBuffer.push(entry)
    
    // Limpiar buffer si excede el tamaño máximo
    if (this.logBuffer.length > this.config.batchSize) {
      this.logBuffer.shift()
    }
  }

  private incrementMetric(key: string) {
    if (!this.config.enableMetrics) return
    
    const current = this.metrics.get(key) || 0
    this.metrics.set(key, current + 1)
  }

  // Métodos públicos de logging
  debug(message: string, context?: Partial<LogEntry['context']>, metadata?: Partial<LogEntry['metadata']>) {
    if (!this.shouldLog('debug')) return
    
    const entry = this.createLogEntry('debug', message, context, metadata)
    this.logToConsole(entry)
    this.addToBuffer(entry)
    this.incrementMetric('logs.debug')
  }

  info(message: string, context?: Partial<LogEntry['context']>, metadata?: Partial<LogEntry['metadata']>) {
    if (!this.shouldLog('info')) return
    
    const entry = this.createLogEntry('info', message, context, metadata)
    this.logToConsole(entry)
    this.addToBuffer(entry)
    this.incrementMetric('logs.info')
  }

  warn(message: string, context?: Partial<LogEntry['context']>, metadata?: Partial<LogEntry['metadata']>) {
    if (!this.shouldLog('warn')) return
    
    const entry = this.createLogEntry('warn', message, context, metadata)
    this.logToConsole(entry)
    this.addToBuffer(entry)
    this.incrementMetric('logs.warn')
  }

  error(message: string, context?: Partial<LogEntry['context']>, metadata?: Partial<LogEntry['metadata']>) {
    if (!this.shouldLog('error')) return
    
    const entry = this.createLogEntry('error', message, context, metadata)
    this.logToConsole(entry)
    this.addToBuffer(entry)
    this.incrementMetric('logs.error')
  }

  fatal(message: string, context?: Partial<LogEntry['context']>, metadata?: Partial<LogEntry['metadata']>) {
    if (!this.shouldLog('fatal')) return
    
    const entry = this.createLogEntry('fatal', message, context, metadata)
    this.logToConsole(entry)
    this.addToBuffer(entry)
    this.incrementMetric('logs.fatal')
  }

  // Métodos de utilidad
  getLogs(): LogEntry[] {
    return [...this.logBuffer]
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  clearBuffer() {
    this.logBuffer = []
  }

  clearMetrics() {
    this.metrics.clear()
  }
}

// Instancia global del logger
export const edgeLogger = new EdgeCompatibleLogger()

// Funciones de conveniencia
export const log = {
  debug: (message: string, context?: Partial<LogEntry['context']>, metadata?: Partial<LogEntry['metadata']>) => edgeLogger.debug(message, context, metadata),
  info: (message: string, context?: Partial<LogEntry['context']>, metadata?: Partial<LogEntry['metadata']>) => edgeLogger.info(message, context, metadata),
  warn: (message: string, context?: Partial<LogEntry['context']>, metadata?: Partial<LogEntry['metadata']>) => edgeLogger.warn(message, context, metadata),
  error: (message: string, context?: Partial<LogEntry['context']>, metadata?: Partial<LogEntry['metadata']>) => edgeLogger.error(message, context, metadata),
  fatal: (message: string, context?: Partial<LogEntry['context']>, metadata?: Partial<LogEntry['metadata']>) => edgeLogger.fatal(message, context, metadata)
}


