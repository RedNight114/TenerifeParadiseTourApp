// Configuración del sistema de logging
// Controla qué logs se muestran en diferentes entornos

export const LOGGING_CONFIG = {
  // Configuración por entorno
  development: {
    level: 'debug' as const,
    enableConsole: true,
    enableFile: false,
    maxLogSize: 1000,
    // Logs específicos para desarrollo
    showAuthLogs: true,
    showDBLogs: true,
    showAPILogs: true,
    showUILogs: true,
    showPerformanceLogs: true,
  },
  
  production: {
    level: 'error' as const,
    enableConsole: false,
    enableFile: false,
    maxLogSize: 100,
    // Logs específicos para producción
    showAuthLogs: false,
    showDBLogs: false,
    showAPILogs: false,
    showUILogs: false,
    showPerformanceLogs: false,
  },
  
  test: {
    level: 'warn' as const,
    enableConsole: false,
    enableFile: false,
    maxLogSize: 100,
    // Logs específicos para tests
    showAuthLogs: false,
    showDBLogs: false,
    showAPILogs: false,
    showUILogs: false,
    showPerformanceLogs: false,
  }
};

// Configuración específica para diferentes módulos
export const MODULE_LOGGING = {
  auth: {
    development: true,
    production: false,
    test: false,
  },
  database: {
    development: true,
    production: false,
    test: false,
  },
  api: {
    development: true,
    production: false,
    test: false,
  },
  ui: {
    development: true,
    production: false,
    test: false,
  },
  performance: {
    development: true,
    production: false,
    test: false,
  },
  errors: {
    development: true,
    production: true,
    test: true,
  },
  warnings: {
    development: true,
    production: true,
    test: true,
  }
};

// Función para obtener configuración del entorno actual
export function getLoggingConfig() {
  const env = process.env.NODE_ENV || 'development';
  return LOGGING_CONFIG[env as keyof typeof LOGGING_CONFIG] || LOGGING_CONFIG.development;
}

// Función para verificar si un módulo debe mostrar logs
export function shouldLogModule(module: keyof typeof MODULE_LOGGING) {
  const env = process.env.NODE_ENV || 'development';
  return MODULE_LOGGING[module][env as keyof typeof MODULE_LOGGING[typeof module]] || false;
}

// Configuración de niveles de log
export const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
} as const;

export type LogLevel = keyof typeof LOG_LEVELS;

// Función para verificar si un nivel debe ser loggeado
export function shouldLog(level: LogLevel, currentLevel: LogLevel) {
  return LOG_LEVELS[level] <= LOG_LEVELS[currentLevel];
}

// Configuración de colores para consola (solo en desarrollo)
export const CONSOLE_COLORS = {
  error: '#ff0000',
  warn: '#ffa500',
  info: '#0000ff',
  debug: '#808080',
  auth: '#00ff00',
  db: '#ff00ff',
  api: '#00ffff',
  ui: '#ffff00',
  performance: '#ff8000',
} as const;

// Función para obtener color de consola
export function getConsoleColor(level: LogLevel | keyof typeof CONSOLE_COLORS) {
  if (process.env.NODE_ENV === 'development') {
    return CONSOLE_COLORS[level as keyof typeof CONSOLE_COLORS] || CONSOLE_COLORS.debug;
  }
  return undefined;
}
