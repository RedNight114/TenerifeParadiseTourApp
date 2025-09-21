/**
 * Configuración centralizada del sistema de caché unificado
 * Único punto de verdad para todas las configuraciones de caché
 */

export interface CacheConfig {
  // Configuración básica
  defaultTTL: number
  maxMemorySize: number // en MB
  maxEntries: number
  
  // Configuración de compresión
  enableCompression: boolean
  compressionThreshold: number // en bytes
  
  // Configuración de persistencia
  enablePersistence: boolean
  persistenceKey: string
  
  // Configuración de limpieza
  cleanupInterval: number
  evictionPolicy: 'lru' | 'lfu' | 'ttl'
  
  // Configuración de invalidación
  enableTagInvalidation: boolean
  enableVersioning: boolean
  
  // Configuración de métricas
  enableMetrics: boolean
  metricsInterval: number
  
  // Configuración de desarrollo
  enableLogging: boolean
  enableDevTools: boolean
}

// TTL específicos por tipo de recurso
export const TTL_CONFIG = {
  // Datos estáticos (categorías, configuraciones)
  STATIC: 60 * 60 * 1000, // 1 hora
  
  // Servicios y contenido dinámico
  SERVICES: 15 * 60 * 1000, // 15 minutos
  
  // Datos de usuario
  USER_DATA: 10 * 60 * 1000, // 10 minutos
  
  // Conversaciones y chat
  CONVERSATIONS: 5 * 60 * 1000, // 5 minutos
  
  // Datos temporales (búsquedas, filtros)
  TEMPORARY: 2 * 60 * 1000, // 2 minutos
  
  // Datos críticos (autenticación)
  CRITICAL: 30 * 60 * 1000, // 30 minutos
} as const

// Tags para invalidación inteligente
export const CACHE_TAGS = {
  SERVICES: 'services',
  CATEGORIES: 'categories',
  USERS: 'users',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  API: 'api',
  STATIC: 'static',
  TEMPORARY: 'temporary',
} as const

// Configuración por entorno
export const getCacheConfig = (): CacheConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'
  
  return {
    // Configuración básica
    defaultTTL: TTL_CONFIG.SERVICES,
    maxMemorySize: isProduction ? 100 : 50, // Más memoria en producción
    maxEntries: isProduction ? 2000 : 1000,
    
    // Configuración de compresión
    enableCompression: true,
    compressionThreshold: 1024, // 1 KB
    
    // Configuración de persistencia
    enablePersistence: true,
    persistenceKey: 'tpt_unified_cache_v4', // Nueva versión
    
    // Configuración de limpieza
    cleanupInterval: isProduction ? 10 * 60 * 1000 : 5 * 60 * 1000, // 10min prod, 5min dev
    evictionPolicy: 'lru',
    
    // Configuración de invalidación
    enableTagInvalidation: true,
    enableVersioning: true,
    
    // Configuración de métricas
    enableMetrics: true,
    metricsInterval: 30 * 1000, // 30 segundos
    
    // Configuración de desarrollo
    enableLogging: isDevelopment,
    enableDevTools: isDevelopment,
  }
}

// Configuración específica para TanStack Query
export const getQueryConfig = () => {
  const config = getCacheConfig()
  
  return {
    defaultOptions: {
      queries: {
        staleTime: TTL_CONFIG.SERVICES,
        gcTime: TTL_CONFIG.SERVICES * 2, // Doble del staleTime
        retry: 3,
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: 'always',
        networkMode: 'online' as const,
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
      },
    },
  }
}

// Configuración de precarga
export const PRELOAD_CONFIG = {
  // Datos críticos que se precargan al inicio
  CRITICAL_DATA: [
    'services:all',
    'categories:all',
    'subcategories:all',
  ],
  
  // Datos que se precargan en background
  BACKGROUND_DATA: [
    'services:featured',
    'categories:popular',
  ],
  
  // Intervalo de precarga en background
  BACKGROUND_INTERVAL: 5 * 60 * 1000, // 5 minutos
}

// Configuración de métricas
export const METRICS_CONFIG = {
  // Umbrales de alerta
  ALERT_THRESHOLDS: {
    LOW_HIT_RATE: 0.6, // 60%
    HIGH_MEMORY_USAGE: 0.8, // 80%
    SLOW_RESPONSE_TIME: 100, // 100ms
  },
  
  // Intervalos de reporte
  REPORTING_INTERVALS: {
    REAL_TIME: 5 * 1000, // 5 segundos
    SUMMARY: 60 * 1000, // 1 minuto
    DETAILED: 5 * 60 * 1000, // 5 minutos
  },
}

export default getCacheConfig
