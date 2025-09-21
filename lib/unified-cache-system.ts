// Sistema de caché unificado y moderno para Tenerife Paradise Tour
// Reemplaza todos los sistemas de caché existentes con una implementación centralizada

import { getCacheConfig, TTL_CONFIG, CACHE_TAGS, METRICS_CONFIG, CacheConfig } from './cache-config'
import { cachePersistence } from './cache-persistence'
import { cacheMetrics } from './cache-metrics'

// Tipos principales del sistema
export interface CacheEntry<T = unknown> {
  data: T
  timestamp: number
  ttl: number
  hits: number
  size: number
  compressed: boolean
  tags: string[]
  version: string
}

// Re-exportar tipos desde cache-config para mantener compatibilidad
export type { CacheConfig } from './cache-config'

export interface CacheStats {
  // Estadísticas básicas
  totalEntries: number
  memoryUsage: number // en MB
  hitRate: number
  
  // Estadísticas de rendimiento
  totalHits: number
  totalMisses: number
  avgResponseTime: number
  
  // Estadísticas de compresión
  compressionRatio: number
  compressedSize: number
  originalSize: number
  
  // Estadísticas de limpieza
  evictedEntries: number
  expiredEntries: number
  lastCleanup: number
}

// Sistema de caché unificado



export class UnifiedCacheSystem {
  private memoryCache = new Map<string, CacheEntry>()
  private config: CacheConfig
  private stats: CacheStats
  private cleanupTimer?: NodeJS.Timeout
  private compressionWorker?: Worker
  private isInitialized = false

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ...getCacheConfig(),
      ...config
    }

    this.stats = this.initializeStats()
    this.initialize()
  }

  // Inicializar el sistema
  private async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Cargar datos persistentes
      if (this.config.enablePersistence) {
        await this.loadFromPersistence()
      }

      // Iniciar limpieza automática
      this.startCleanupTimer()

      // Configurar worker de compresión si está disponible
      if (this.config.enableCompression && typeof Worker !== 'undefined') {
        this.setupCompressionWorker()
      }

      this.isInitialized = true
    } catch (error) {
      }
  }

  // Configurar worker de compresión
  private setupCompressionWorker(): void {
    // Solo crear worker en el navegador
    if (typeof window === 'undefined' || typeof Worker === 'undefined') {
      return
    }

    try {
      // Crear worker inline para compresión
      const workerCode = `
        self.onmessage = function(e) {
          const { type, data } = e.data
          
          if (type === 'compress') {
            try {
              // Compresión simple usando LZ-string
              const compressed = btoa(encodeURIComponent(JSON.stringify(data)))
              self.postMessage({ success: true, compressed })
            } catch (error) {
              self.postMessage({ success: false, error: error.message })
            }
          } else if (type === 'decompress') {
            try {
              const decompressed = JSON.parse(decodeURIComponent(atob(data)))
              self.postMessage({ success: true, decompressed })
            } catch (error) {
              self.postMessage({ success: false, error: error.message })
            }
          }
        }
      `

      const blob = new Blob([workerCode], { type: 'application/javascript' })
      this.compressionWorker = new Worker(URL.createObjectURL(blob))
    } catch (error) {
      // Fallback a compresión síncrona
      this.compressionWorker = undefined
    }
  }

  // Comprimir datos con LZ-string optimizado
  private async compress(data: unknown): Promise<{ compressed: string; originalSize: number; compressedSize: number }> {
    const jsonString = JSON.stringify(data)
    const originalSize = jsonString.length

    if (!this.config.enableCompression || originalSize < this.config.compressionThreshold) {
      return {
        compressed: jsonString,
        originalSize,
        compressedSize: originalSize
      }
    }

    try {
      // Compresión simple pero efectiva usando btoa con encoding
      const compressed = btoa(encodeURIComponent(jsonString))
      const compressedSize = compressed.length
      
      // Solo usar compresión si realmente reduce el tamaño
      if (compressedSize < originalSize * 0.9) {
        return { compressed, originalSize, compressedSize }
      }
    } catch (error) {
      if (this.config.enableLogging) {
        }
    }

    return {
      compressed: jsonString,
      originalSize,
      compressedSize: originalSize
    }
  }

  // Descomprimir datos
  private async decompress(compressed: string, originalSize: number): Promise<unknown> {
    try {
      // Intentar descomprimir primero
      const decompressed = JSON.parse(decodeURIComponent(atob(compressed)))
      return decompressed
    } catch {
      // Si falla, intentar parsear directamente
      return JSON.parse(compressed)
    }
  }

  // Calcular tamaño de datos
  private calculateSize(data: unknown): number {
    try {
      const jsonString = JSON.stringify(data)
      return new Blob([jsonString]).size
    } catch {
      return 0
    }
  }

  // Optimizar datos grandes para evitar warnings de webpack
  private optimizeLargeData(data: unknown): unknown {
    try {
      const jsonString = JSON.stringify(data)
      const size = new Blob([jsonString]).size
      
      // Si los datos son muy grandes (>50KB), usar compresión simple
      if (size > 50000) {
        return {
          _optimized: true,
          _size: size,
          _data: btoa(encodeURIComponent(jsonString))
        }
      }
      
      return data
    } catch {
      return data
    }
  }

  // Desoptimizar datos grandes
  private deoptimizeLargeData(data: unknown): unknown {
    if (data && typeof data === 'object' && '_optimized' in data) {
      try {
        const optimizedData = data as any
        return JSON.parse(decodeURIComponent(atob(optimizedData._data)))
      } catch {
        return data
      }
    }
    return data
  }

  // Obtener datos del caché
  async get<T = unknown>(key: string): Promise<T | null> {
    const startTime = performance.now()

    try {
      const entry = this.memoryCache.get(key)
      
      if (!entry) {
        this.stats.totalMisses++
        return null
      }

      // Verificar expiración
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.memoryCache.delete(key)
        this.stats.expiredEntries++
        this.stats.totalMisses++
        return null
      }

      // Incrementar hits
      entry.hits++
      this.stats.totalHits++

      // Parsear datos (simplificado temporalmente)
      let data: T
      if (typeof entry.data === 'string') {
        data = JSON.parse(entry.data) as T
      } else {
        data = entry.data as T
      }

      // Desoptimizar datos grandes si es necesario
      data = this.deoptimizeLargeData(data) as T

      // Actualizar estadísticas de tiempo de respuesta
      const responseTime = performance.now() - startTime
      this.stats.avgResponseTime = (this.stats.avgResponseTime + responseTime) / 2

      // Registrar métricas
      if (this.config.enableMetrics) {
        cacheMetrics.recordHit(responseTime, entry.tags[0])
      }

      return data
    } catch (error) {
      this.stats.totalMisses++
      
      // Registrar métricas de miss
      if (this.config.enableMetrics) {
        const responseTime = performance.now() - startTime
        cacheMetrics.recordMiss(responseTime)
      }
      
      return null
    }
  }

  // Establecer datos en caché
  async set<T = unknown>(
    key: string, 
    data: T, 
    options: {
      ttl?: number
      tags?: string[]
      version?: string
    } = {}
  ): Promise<void> {
    try {
      const { ttl = this.config.defaultTTL, tags = [], version = '1.0' } = options

      // Optimizar datos grandes para evitar warnings de webpack
      const optimizedData = this.optimizeLargeData(data)

      // Comprimir datos si es necesario
      const { compressed, originalSize, compressedSize } = await this.compress(optimizedData)

      const entry: CacheEntry<T> = {
        data: compressed as unknown as T,
        timestamp: Date.now(),
        ttl,
        hits: 0,
        size: originalSize,
        compressed: this.config.enableCompression && compressedSize < originalSize,
        tags,
        version
      }

      // Verificar límites antes de agregar
      await this.enforceLimits()

      this.memoryCache.set(key, entry)

      // Actualizar estadísticas
      this.stats.compressedSize += compressedSize
      this.stats.originalSize += originalSize
      this.stats.compressionRatio = this.stats.compressedSize / this.stats.originalSize

      // Registrar métricas de compresión
      if (this.config.enableMetrics) {
        cacheMetrics.updateCompressionMetrics(originalSize, compressedSize)
      }

      // Guardar en persistencia si está habilitada
      if (this.config.enablePersistence) {
        await this.saveToPersistence()
      }
    } catch (error) {
      }
  }

  // Invalidar caché por tags
  invalidateByTags(tags: string[]): number {
    let invalidated = 0

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.tags.some(tag => tags.includes(tag))) {
        this.memoryCache.delete(key)
        invalidated++
      }
    }

    this.stats.evictedEntries += invalidated
    return invalidated
  }

  // Invalidar caché por patrón
  invalidateByPattern(pattern: RegExp): number {
    let invalidated = 0

    for (const key of this.memoryCache.keys()) {
      if (pattern.test(key)) {
        this.memoryCache.delete(key)
        invalidated++
      }
    }

    this.stats.evictedEntries += invalidated
    return invalidated
  }

  // Obtener o establecer datos (patrón getOrSet)
  async getOrSet<T = unknown>(
    key: string,
    fetchFn: () => Promise<T>,
    options: {
      ttl?: number
      tags?: string[]
      version?: string
    } = {}
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await fetchFn()
    await this.set(key, data, options)
    return data
  }

  // Precargar múltiples claves
  async preload<T = unknown>(
    keys: string[],
    fetchFn: (key: string) => Promise<T>,
    options: {
      ttl?: number
      tags?: string[]
      version?: string
    } = {}
  ): Promise<void> {
    const promises = keys.map(async (key) => {
      if (!this.memoryCache.has(key)) {
        try {
          const data = await fetchFn(key)
          await this.set(key, data, options)
        } catch (error) {
          }
      }
    })

    await Promise.allSettled(promises)
  }

  // Aplicar límites de memoria y entradas
  private async enforceLimits(): Promise<void> {
    const currentMemoryUsage = this.getMemoryUsage()
    const maxMemoryBytes = this.config.maxMemorySize * 1024 * 1024

    // Verificar límite de memoria
    if (currentMemoryUsage > maxMemoryBytes) {
      await this.evictEntries()
    }

    // Verificar límite de entradas
    if (this.memoryCache.size > this.config.maxEntries) {
      await this.evictEntries()
    }
  }

  // Evadir entradas según política
  private async evictEntries(): Promise<void> {
    const entries = Array.from(this.memoryCache.entries())
    
    if (entries.length === 0) return
    
    switch (this.config.evictionPolicy) {
      case 'lru':
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
        break
      case 'lfu':
        entries.sort((a, b) => a[1].hits - b[1].hits)
        break
      case 'ttl':
        entries.sort((a, b) => (a[1].timestamp + a[1].ttl) - (b[1].timestamp + b[1].ttl))
        break
    }

    // Eliminar el 20% de las entradas menos útiles, pero al menos 1
    const toEvict = Math.max(1, Math.ceil(entries.length * 0.2))
    for (let i = 0; i < toEvict && i < entries.length; i++) {
      this.memoryCache.delete(entries[i][0])
    }

    this.stats.evictedEntries += toEvict
  }

  // Obtener uso de memoria
  private getMemoryUsage(): number {
    let totalSize = 0
    for (const entry of this.memoryCache.values()) {
      totalSize += entry.size
    }
    return totalSize
  }

  // Limpiar caché expirado
  private cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach(key => this.memoryCache.delete(key))
    this.stats.expiredEntries += expiredKeys.length
    this.stats.lastCleanup = now
  }

  // Limpiar caché expirado manualmente
  public cleanupExpired(): void {
    this.cleanup()
  }

  // Iniciar timer de limpieza
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  // Cargar desde persistencia mejorada
  private async loadFromPersistence(): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      await cachePersistence.initialize()
      
      // Cargar datos específicos del caché unificado
      const cacheData = await cachePersistence.load('unified-cache-data')
      
      if (cacheData && typeof cacheData === 'object') {
        // Cargar datos en memoria
        for (const [key, entry] of Object.entries(cacheData)) {
          if (entry && typeof entry === 'object' && 'data' in entry && 'timestamp' in entry) {
            this.memoryCache.set(key, entry as CacheEntry<unknown>)
          }
        }
      }

      if (this.config.enableLogging) {
        console.log('Datos cargados desde persistencia:', this.memoryCache.size, 'entradas')
      }
    } catch (error) {
      }
  }

  // Guardar en persistencia mejorada
  private async saveToPersistence(): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      // Convertir Map a objeto para guardar
      const cacheObject = Object.fromEntries(this.memoryCache)
      await cachePersistence.save('unified-cache-data', cacheObject)
      
      if (this.config.enableLogging) {
        const stats = cachePersistence.getStats()
        console.log('Datos guardados en persistencia:', this.memoryCache.size, 'entradas')
      }
    } catch (error) {
      console.error('Error guardando en persistencia:', error)
    }
  }

  // Obtener estadísticas
  getStats(): CacheStats {
    const totalRequests = this.stats.totalHits + this.stats.totalMisses
    this.stats.hitRate = totalRequests > 0 ? this.stats.totalHits / totalRequests : 0
    this.stats.totalEntries = this.memoryCache.size
    this.stats.memoryUsage = this.getMemoryUsage() / (1024 * 1024) // Convertir a MB

    return { ...this.stats }
  }

  // Limpiar todo el caché
  async clear(): Promise<void> {
    this.memoryCache.clear()
    this.stats = this.initializeStats()
    
    if (this.config.enablePersistence && typeof window !== 'undefined') {
      await cachePersistence.clear()
    }
  }

  // Inicializar estadísticas
  private initializeStats(): CacheStats {
    return {
      totalEntries: 0,
      memoryUsage: 0,
      hitRate: 0,
      totalHits: 0,
      totalMisses: 0,
      avgResponseTime: 0,
      compressionRatio: 0,
      compressedSize: 0,
      originalSize: 0,
      evictedEntries: 0,
      expiredEntries: 0,
      lastCleanup: Date.now()
    }
  }

  // Destruir el sistema
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    if (this.compressionWorker) {
      this.compressionWorker.terminate()
    }

    this.memoryCache.clear()
    this.isInitialized = false
  }
}

// Instancia global del sistema de caché unificado
export const unifiedCache = new UnifiedCacheSystem()

// Funciones de conveniencia para diferentes tipos de datos con TTL optimizado
export const cacheServices = {
  get: <T>(key: string) => unifiedCache.get<T>(`services:${key}`),
  set: <T>(key: string, data: T, ttl?: number) => 
    unifiedCache.set(`services:${key}`, data, { 
      ttl: ttl || TTL_CONFIG.SERVICES, 
      tags: [CACHE_TAGS.SERVICES] 
    }),
  invalidate: () => unifiedCache.invalidateByTags([CACHE_TAGS.SERVICES]),
  invalidatePattern: (pattern: RegExp) => 
    unifiedCache.invalidateByPattern(new RegExp(`services:${pattern.source}`))
}

export const cacheCategories = {
  get: <T>(key: string) => unifiedCache.get<T>(`categories:${key}`),
  set: <T>(key: string, data: T, ttl?: number) => 
    unifiedCache.set(`categories:${key}`, data, { 
      ttl: ttl || TTL_CONFIG.STATIC, 
      tags: [CACHE_TAGS.CATEGORIES, CACHE_TAGS.STATIC] 
    }),
  invalidate: () => unifiedCache.invalidateByTags([CACHE_TAGS.CATEGORIES]),
  invalidatePattern: (pattern: RegExp) => 
    unifiedCache.invalidateByPattern(new RegExp(`categories:${pattern.source}`))
}

export const cacheUsers = {
  get: <T>(key: string) => unifiedCache.get<T>(`users:${key}`),
  set: <T>(key: string, data: T, ttl?: number) => 
    unifiedCache.set(`users:${key}`, data, { 
      ttl: ttl || TTL_CONFIG.USER_DATA, 
      tags: [CACHE_TAGS.USERS] 
    }),
  invalidate: () => unifiedCache.invalidateByTags([CACHE_TAGS.USERS]),
  invalidatePattern: (pattern: RegExp) => 
    unifiedCache.invalidateByPattern(new RegExp(`users:${pattern.source}`))
}

export const cacheConversations = {
  get: <T>(key: string) => unifiedCache.get<T>(`conversations:${key}`),
  set: <T>(key: string, data: T, ttl?: number) => 
    unifiedCache.set(`conversations:${key}`, data, { 
      ttl: ttl || TTL_CONFIG.CONVERSATIONS, 
      tags: [CACHE_TAGS.CONVERSATIONS, CACHE_TAGS.MESSAGES] 
    }),
  invalidate: () => unifiedCache.invalidateByTags([CACHE_TAGS.CONVERSATIONS]),
  invalidatePattern: (pattern: RegExp) => 
    unifiedCache.invalidateByPattern(new RegExp(`conversations:${pattern.source}`))
}

export const cacheAPI = {
  get: <T>(key: string) => unifiedCache.get<T>(`api:${key}`),
  set: <T>(key: string, data: T, ttl?: number) => 
    unifiedCache.set(`api:${key}`, data, { 
      ttl: ttl || TTL_CONFIG.TEMPORARY, 
      tags: [CACHE_TAGS.API, CACHE_TAGS.TEMPORARY] 
    }),
  invalidate: () => unifiedCache.invalidateByTags([CACHE_TAGS.API]),
  invalidatePattern: (pattern: RegExp) => 
    unifiedCache.invalidateByPattern(new RegExp(`api:${pattern.source}`))
}

// Funciones globales de gestión
export const clearAllCache = () => unifiedCache.clear()
export const getCacheStats = () => unifiedCache.getStats()
export const invalidateCacheByTags = (tags: string[]) => unifiedCache.invalidateByTags(tags)
export const invalidateCacheByPattern = (pattern: RegExp) => unifiedCache.invalidateByPattern(pattern)

// Función para migrar desde sistemas antiguos
export const migrateFromOldCache = async (): Promise<void> => {
  if (typeof window === 'undefined') return

  try {
    // Limpiar cachés antiguos
    const oldKeys = [
      'tpt_cache_',
      'tenerife-cache:',
      'services_cache',
      'categories_cache',
      'user_cache',
      'tpt_unified_cache',
      'tpt_unified_cache_v2'
    ]

    for (const keyPrefix of oldKeys) {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(keyPrefix))
      keys.forEach(key => localStorage.removeItem(key))
    }

    } catch (error) {
    }
}

// Función para inicializar el caché con migración
export const initializeCache = async (): Promise<void> => {
  try {
    await migrateFromOldCache()
    } catch (error) {
    }
}

export default unifiedCache
