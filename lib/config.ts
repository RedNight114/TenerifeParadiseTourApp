// Configuración centralizada para Tenerife Paradise Tour
export const APP_CONFIG = {
  // Timeouts de carga
  TIMEOUTS: {
    DASHBOARD_LOAD: 25000,        // 25 segundos para dashboard
    SERVICES_LOAD: 20000,         // 20 segundos para servicios
    GENERAL_LOAD: 15000,          // 15 segundos para operaciones generales
    CACHE_TTL: 5 * 60 * 1000,    // 5 minutos para caché
    RETRY_DELAY: 2000,            // 2 segundos entre reintentos
    MAX_RETRIES: 3,               // Máximo 3 reintentos
  },

  // Configuración de Supabase
  SUPABASE: {
    MAX_POOL_SIZE: 3,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    HEALTH_CHECK_INTERVAL: 30000, // 30 segundos
  },

  // Configuración de caché
  CACHE: {
    SERVICES_TTL: 5 * 60 * 1000,     // 5 minutos
    CATEGORIES_TTL: 10 * 60 * 1000,  // 10 minutos
    USER_DATA_TTL: 2 * 60 * 1000,    // 2 minutos
    DASHBOARD_TTL: 1 * 60 * 1000,    // 1 minuto
  },

  // Configuración de paginación
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    LOAD_MORE_THRESHOLD: 0.8, // Cargar más cuando esté al 80% del scroll
  },

  // Configuración de imágenes
  IMAGES: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
    COMPRESSION_QUALITY: 0.8,
    THUMBNAIL_SIZE: 300,
  },

  // Configuración de logging
  LOGGING: {
    ENABLE_PERFORMANCE_LOGS: process.env.NODE_ENV === 'development',
    ENABLE_DEBUG_LOGS: process.env.NODE_ENV === 'development',
    LOG_LEVEL: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  },

  // Configuración de auditoría
  AUDIT: {
    ENABLE_LOGGING: true,
    LOG_USER_ACTIONS: true,
    LOG_ERRORS: true,
    LOG_PERFORMANCE: true,
    RETENTION_DAYS: 90,
  },

  // Configuración de chat
  CHAT: {
    MAX_MESSAGE_LENGTH: 1000,
    TYPING_INDICATOR_DELAY: 500,
    MESSAGE_DEBOUNCE: 300,
    AUTO_REFRESH_INTERVAL: 5000,
  },

  // Configuración de notificaciones
  NOTIFICATIONS: {
    TOAST_DURATION: 5000,
    MAX_TOASTS: 3,
    ENABLE_SOUND: false,
  },

  // Configuración de rendimiento
  PERFORMANCE: {
    ENABLE_VIRTUALIZATION: true,
    ENABLE_LAZY_LOADING: true,
    ENABLE_IMAGE_OPTIMIZATION: true,
    DEBOUNCE_DELAY: 300,
    THROTTLE_DELAY: 100,
  }
}

// Función para obtener timeout basado en el tipo de operación
export function getTimeout(type: keyof typeof APP_CONFIG.TIMEOUTS): number {
  return APP_CONFIG.TIMEOUTS[type]
}

// Función para obtener configuración de caché
export function getCacheTTL(type: keyof typeof APP_CONFIG.CACHE): number {
  return APP_CONFIG.CACHE[type]
}

// Función para verificar si estamos en desarrollo
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

// Función para verificar si estamos en producción
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

// Función para obtener el nivel de logging apropiado
export function getLogLevel(): string {
  return APP_CONFIG.LOGGING.LOG_LEVEL
}

// Función para verificar si los logs de rendimiento están habilitados
export function shouldLogPerformance(): boolean {
  return APP_CONFIG.LOGGING.ENABLE_PERFORMANCE_LOGS
}

// Función para verificar si los logs de debug están habilitados
export function shouldLogDebug(): boolean {
  return APP_CONFIG.LOGGING.ENABLE_DEBUG_LOGS
}



















