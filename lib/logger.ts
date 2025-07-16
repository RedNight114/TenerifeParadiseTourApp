type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  data?: any
  timestamp: string
  context?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  private formatMessage(level: LogLevel, message: string, data?: any, context?: string): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? `[${context}]` : ''
    const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : ''
    
    return `${timestamp} ${level.toUpperCase()} ${contextStr} ${message}${dataStr}`
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true
    if (this.isProduction && level !== 'debug') return true
    return false
  }

  debug(message: string, data?: any, context?: string) {
    if (this.shouldLog('debug')) {
      const formattedMessage = this.formatMessage('debug', message, data, context)
      console.debug(formattedMessage)
    }
  }

  info(message: string, data?: any, context?: string) {
    if (this.shouldLog('info')) {
      const formattedMessage = this.formatMessage('info', message, data, context)
      console.info(formattedMessage)
    }
  }

  warn(message: string, data?: any, context?: string) {
    if (this.shouldLog('warn')) {
      const formattedMessage = this.formatMessage('warn', message, data, context)
      console.warn(formattedMessage)
    }
  }

  error(message: string, error?: any, context?: string) {
    if (this.shouldLog('error')) {
      const formattedMessage = this.formatMessage('error', message, error, context)
      console.error(formattedMessage)
      
      // En producción, podrías enviar esto a un servicio de logging
      if (this.isProduction) {
        // Aquí podrías integrar con Sentry, LogRocket, etc.
        this.sendToLoggingService('error', message, error, context)
      }
    }
  }

  private sendToLoggingService(level: LogLevel, message: string, data?: any, context?: string) {
    // Implementar envío a servicio de logging en producción
    // Por ejemplo: Sentry, LogRocket, etc.
  }
}

// Exportar una instancia singleton
export const logger = new Logger()

// Exportar funciones de conveniencia
export const log = {
  debug: (message: string, data?: any, context?: string) => logger.debug(message, data, context),
  info: (message: string, data?: any, context?: string) => logger.info(message, data, context),
  warn: (message: string, data?: any, context?: string) => logger.warn(message, data, context),
  error: (message: string, error?: any, context?: string) => logger.error(message, error, context),
} 