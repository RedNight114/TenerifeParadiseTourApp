// Configuración central de optimizaciones para Tenerife Paradise Tour
// Controla todas las optimizaciones de rendimiento desde un solo lugar

export interface OptimizationConfig {
  // Configuración de caché
  cache: {
    enabled: boolean
    memoryTTL: number // TTL del caché en memoria (ms)
    persistentTTL: number // TTL del caché persistente (ms)
    maxMemorySize: number // Tamaño máximo del caché en memoria
    maxPersistentSize: number // Tamaño máximo del caché persistente (MB)
    compression: boolean
    compressionThreshold: number // Umbral para compresión (bytes)
  }
  
  // Configuración de Supabase
  supabase: {
    connectionPooling: boolean
    maxPoolSize: number
    healthCheckInterval: number // ms
    retryAttempts: number
    retryDelay: number // ms
    requestTimeout: number // ms
  }
  
  // Configuración de datos
  data: {
    backgroundRefresh: boolean
    refreshInterval: number // ms
    maxRetries: number
    retryDelay: number // ms
    enableDeduplication: boolean
    enableQueue: boolean
  }
  
  // Configuración de imágenes
  images: {
    lazyLoading: boolean
    preloading: boolean
    compression: boolean
    webp: boolean
    avif: boolean
    placeholder: boolean
  }
  
  // Configuración de componentes
  components: {
    virtualization: boolean
    memoization: boolean
    debouncing: boolean
    debounceDelay: number // ms
  }
  
  // Configuración de monitoreo
  monitoring: {
    enabled: boolean
    logLevel: 'debug' | 'info' | 'warn' | 'error'
    metrics: boolean
    performance: boolean
    errors: boolean
  }
}

// Configuración por defecto optimizada para producción
export const defaultOptimizationConfig: OptimizationConfig = {
  cache: {
    enabled: true,
    memoryTTL: 30 * 60 * 1000, // 30 minutos
    persistentTTL: 60 * 60 * 1000, // 1 hora
    maxMemorySize: 1000,
    maxPersistentSize: 50, // 50 MB
    compression: true,
    compressionThreshold: 1024 // 1 KB
  },
  
  supabase: {
    connectionPooling: true,
    maxPoolSize: 5,
    healthCheckInterval: 5 * 60 * 1000, // 5 minutos
    retryAttempts: 3,
    retryDelay: 1000, // 1 segundo
    requestTimeout: 15000 // 15 segundos
  },
  
  data: {
    backgroundRefresh: true,
    refreshInterval: 10 * 60 * 1000, // 10 minutos
    maxRetries: 3,
    retryDelay: 1000, // 1 segundo
    enableDeduplication: true,
    enableQueue: true
  },
  
  images: {
    lazyLoading: true,
    preloading: true,
    compression: true,
    webp: true,
    avif: true,
    placeholder: true
  },
  
  components: {
    virtualization: true,
    memoization: true,
    debouncing: true,
    debounceDelay: 300 // 300ms
  },
  
  monitoring: {
    enabled: true,
    logLevel: 'info',
    metrics: true,
    performance: true,
    errors: true
  }
}

// Configuración para desarrollo
export const developmentOptimizationConfig: OptimizationConfig = {
  ...defaultOptimizationConfig,
  monitoring: {
    ...defaultOptimizationConfig.monitoring,
    logLevel: 'debug',
    metrics: true,
    performance: true,
    errors: true
  },
  cache: {
    ...defaultOptimizationConfig.cache,
    memoryTTL: 5 * 60 * 1000, // 5 minutos en desarrollo
    persistentTTL: 15 * 60 * 1000 // 15 minutos en desarrollo
  }
}

// Configuración para testing
export const testingOptimizationConfig: OptimizationConfig = {
  ...defaultOptimizationConfig,
  cache: {
    ...defaultOptimizationConfig.cache,
    enabled: false // Deshabilitar caché en testing
  },
  monitoring: {
    ...defaultOptimizationConfig.monitoring,
    enabled: false
  }
}

// Función para obtener la configuración según el entorno
export function getOptimizationConfig(): OptimizationConfig {
  const env = process.env.NODE_ENV
  
  switch (env) {
    case 'development':
      return developmentOptimizationConfig
    case 'test':
      return testingOptimizationConfig
    case 'production':
    default:
      return defaultOptimizationConfig
  }
}

// Función para obtener configuración específica
export function getCacheConfig() {
  return getOptimizationConfig().cache
}

export function getSupabaseConfig() {
  return getOptimizationConfig().supabase
}

export function getDataConfig() {
  return getOptimizationConfig().data
}

export function getImagesConfig() {
  return getOptimizationConfig().images
}

export function getComponentsConfig() {
  return getOptimizationConfig().components
}

export function getMonitoringConfig() {
  return getOptimizationConfig().monitoring
}

// Función para validar configuración
export function validateOptimizationConfig(config: OptimizationConfig): string[] {
  const errors: string[] = []
  
  if (config.cache.memoryTTL <= 0) {
    errors.push('memoryTTL debe ser mayor que 0')
  }
  
  if (config.cache.persistentTTL <= 0) {
    errors.push('persistentTTL debe ser mayor que 0')
  }
  
  if (config.supabase.maxPoolSize <= 0) {
    errors.push('maxPoolSize debe ser mayor que 0')
  }
  
  if (config.data.refreshInterval <= 0) {
    errors.push('refreshInterval debe ser mayor que 0')
  }
  
  if (config.components.debounceDelay < 0) {
    errors.push('debounceDelay no puede ser negativo')
  }
  
  return errors
}

// Función para aplicar configuración personalizada
export function createCustomOptimizationConfig(
  overrides: Partial<OptimizationConfig>
): OptimizationConfig {
  const baseConfig = getOptimizationConfig()
  const customConfig = { ...baseConfig, ...overrides }
  
  const errors = validateOptimizationConfig(customConfig)
  if (errors.length > 0) {
    return baseConfig
  }
  
  return customConfig
}

// Exportar configuración activa
export const optimizationConfig = getOptimizationConfig()

// Función para actualizar configuración en tiempo de ejecución
export function updateOptimizationConfig(
  updates: Partial<OptimizationConfig>
): void {
  Object.assign(optimizationConfig, updates)
  
  const errors = validateOptimizationConfig(optimizationConfig)
  if (errors.length > 0) {
    // Revertir cambios
    Object.assign(optimizationConfig, getOptimizationConfig())
  }
}
