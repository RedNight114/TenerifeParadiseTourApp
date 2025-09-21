// Sistema de logging optimizado para producción
// Configuración centralizada de logs

type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'critical' | 'performance' | 'auth' | 'db' | 'api' | 'ui' | 'images' | 'compression' | 'dashboard' | 'services';

interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  maxLogSize: number;
  throttleInterval: number; // Nuevo: intervalo de throttling
}

class Logger {
  private config: LoggerConfig;
  private isDevelopment: boolean;
  private lastLogs: Map<string, number>; // Nuevo: cache de últimos logs
  private throttleInterval: number;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.lastLogs = new Map();
    this.throttleInterval = 5000; // 5 segundos entre logs similares
    
    // Configuración por defecto
    this.config = {
      level: this.isDevelopment ? 'warn' : 'error', // Cambiado de 'debug' a 'warn'
      enableConsole: this.isDevelopment,
      enableFile: false,
      maxLogSize: 1000,
      throttleInterval: this.throttleInterval
    };

    // Configuración desde variables de entorno
    if (process.env.LOG_LEVEL) {
      this.config.level = process.env.LOG_LEVEL as LogLevel;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      critical: -1,
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      performance: 2,
      auth: 2,
      db: 2,
      api: 2,
      ui: 2,
      images: 3,
      compression: 3,
      dashboard: 2,
      services: 2
    };
    
    return levels[level] <= levels[this.config.level];
  }

  // Nuevo: función para throttling de logs
  private shouldThrottle(message: string): boolean {
    const now = Date.now();
    const lastLog = this.lastLogs.get(message);
    
    if (!lastLog || (now - lastLog) > this.throttleInterval) {
      this.lastLogs.set(message, now);
      return false;
    }
    
    return true;
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`;
    }
    
    return `${prefix} ${message}`;
  }

  error(message: string, data?: unknown): void {
    if (!this.shouldLog('error')) return;
    
    if (this.config.enableConsole) {
      console.error(this.formatMessage('error', message), data);
    }
    
    // En producción, podrías enviar a un servicio de logging
    if (!this.isDevelopment) {
      // Aquí podrías enviar a Sentry, LogRocket, etc.
    }
  }

  warn(message: string, data?: unknown): void {
    if (!this.shouldLog('warn')) return;
    
    if (this.config.enableConsole) {
      console.warn(this.formatMessage('warn', message), data);
    }
  }

  info(message: string, data?: unknown): void {
    if (!this.shouldLog('info')) return;
    
    // Aplicar throttling para logs de info
    if (this.shouldThrottle(message)) {
      return;
    }
    
    if (this.config.enableConsole) {
      console.info(this.formatMessage('info', message), data);
    }
  }

  debug(message: string, data?: unknown): void {
    if (!this.shouldLog('debug')) return;
    
    // Aplicar throttling más agresivo para logs de debug
    if (this.shouldThrottle(`debug:${message}`)) {
      return;
    }
    
    if (this.config.enableConsole) {
      console.debug(this.formatMessage('debug', message, data));
    }
  }

  // Método para logs críticos que siempre deben aparecer
  critical(message: string, data?: unknown): void {
    if (this.config.enableConsole) {
      console.error(this.formatMessage('critical', message), data);
    }
    
    // En producción, siempre enviar logs críticos
    if (!this.isDevelopment) {
      // Aquí podrías enviar a un servicio de alertas
    }
  }

  // Método para logs de rendimiento
  performance(operation: string, duration: number, data?: unknown): void {
    if (!this.shouldLog('info')) return;
    
    // Aplicar throttling para logs de rendimiento
    if (this.shouldThrottle(`perf:${operation}`)) {
      return;
    }
    
    if (this.config.enableConsole) {
      console.info(`[PERF] ${operation}: ${duration}ms`, data);
    }
  }

  // Método para logs de autenticación (solo en desarrollo, con throttling)
  auth(message: string, data?: unknown): void {
    if (!this.isDevelopment) return;
    
    // Aplicar throttling para logs de auth
    if (this.shouldThrottle(`auth:${message}`)) {
      return;
    }
    
    if (this.config.enableConsole) {
      console.log(`[AUTH] ${message}`, data);
    }
  }

  // Método para logs de base de datos (solo en desarrollo, con throttling)
  db(message: string, data?: unknown): void {
    if (!this.isDevelopment) return;
    
    // Aplicar throttling para logs de DB
    if (this.shouldThrottle(`db:${message}`)) {
      return;
    }
    
    if (this.config.enableConsole) {
      console.log(`[DB] ${message}`, data);
    }
  }

  // Método para logs de API (solo en desarrollo, con throttling)
  api(message: string, data?: unknown): void {
    if (!this.isDevelopment) return;
    
    // Aplicar throttling para logs de API
    if (this.shouldThrottle(`api:${message}`)) {
      return;
    }
    
    if (this.config.enableConsole) {
      console.log(`[DB] ${message}`, data);
    }
  }

  // Método para logs de UI (solo en desarrollo, con throttling)
  ui(message: string, data?: unknown): void {
    if (!this.isDevelopment) return;
    
    // Aplicar throttling para logs de UI
    if (this.shouldThrottle(`ui:${message}`)) {
      return;
    }
    
    if (this.config.enableConsole) {
      console.log(`[DB] ${message}`, data);
    }
  }

  // Método para logs de imágenes - DESHABILITADO POR DEFECTO
  images(message: string, data?: unknown): void {
    // Completamente deshabilitado para evitar spam
    return;
  }

  // Método para logs de compresión - DESHABILITADO POR DEFECTO
  compression(message: string, data?: unknown): void {
    // Completamente deshabilitado para evitar spam
    return;
  }

  // Método para logs de dashboard - CON THROTTLING AGRESIVO
  dashboard(message: string, data?: unknown): void {
    if (!this.isDevelopment) return;
    
    // Throttling más agresivo para logs de dashboard (30 segundos)
    if (this.shouldThrottle(`dashboard:${message}`)) {
      return;
    }
    
    if (this.config.enableConsole) {
      console.log(`[DB] ${message}`, data);
    }
  }

  // Método para logs de servicios - CON THROTTLING AGRESIVO
  services(message: string, data?: unknown): void {
    if (!this.isDevelopment) return;
    
    // Throttling más agresivo para logs de servicios (30 segundos)
    if (this.shouldThrottle(`services:${message}`)) {
      return;
    }
    
    if (this.config.enableConsole) {
      console.log(`[DB] ${message}`, data);
    }
  }

  // Configurar el logger
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.throttleInterval) {
      this.throttleInterval = config.throttleInterval;
    }
  }

  // Obtener configuración actual
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  // Limpiar cache de logs (útil para testing)
  clearLogCache(): void {
    this.lastLogs.clear();
  }
}

// Instancia global del logger
export const logger = new Logger();

// Exportar métodos individuales para uso directo
export const logError = (message: string, data?: unknown) => logger.error(message, data);
export const logWarn = (message: string, data?: unknown) => logger.warn(message, data);
export const logInfo = (message: string, data?: unknown) => logger.info(message, data);
export const logDebug = (message: string, data?: unknown) => logger.debug(message, data);
export const logCritical = (message: string, data?: unknown) => logger.critical(message, data);
export const logPerformance = (operation: string, duration: number, data?: unknown) => logger.performance(operation, duration, data);
export const logAuth = (message: string, data?: unknown) => logger.auth(message, data);
export const logDB = (message: string, data?: unknown) => logger.db(message, data);
export const logAPI = (message: string, data?: unknown) => logger.api(message, data);
export const logUI = (message: string, data?: unknown) => logger.ui(message, data);
export const logImages = (message: string, data?: unknown) => logger.images(message, data); // Deshabilitado
export const logCompression = (message: string, data?: unknown) => logger.compression(message, data); // Deshabilitado
export const logDashboard = (message: string, data?: unknown) => logger.dashboard(message, data); // Nuevo: con throttling
export const logServices = (message: string, data?: unknown) => logger.services(message, data); // Nuevo: con throttling

// Configuración automática basada en el entorno
if (process.env.NODE_ENV === 'production') {
  logger.configure({
    level: 'error',
    enableConsole: false
  });
}

export default logger; 

