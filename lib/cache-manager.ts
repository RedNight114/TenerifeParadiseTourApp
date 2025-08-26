// Sistema de cache mejorado para optimizar el rendimiento
export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  hits: number
}

export interface CacheConfig {
  defaultTTL: number // en milisegundos
  maxSize: number
  cleanupInterval: number // en milisegundos
}

export class CacheManager<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>()
  private config: CacheConfig
  private cleanupTimer?: NodeJS.Timeout

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 15 * 60 * 1000, // 15 minutos por defecto
      maxSize: 1000,
      cleanupInterval: 5 * 60 * 1000, // 5 minutos
      ...config
    }

    this.startCleanupTimer()
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  private cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    // Encontrar entradas expiradas
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key)
      }
    }

    // Eliminar entradas expiradas
    expiredKeys.forEach(key => this.cache.delete(key))

    // Si el cache está muy lleno, eliminar las menos usadas
    if (this.cache.size > this.config.maxSize) {
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].hits - b[1].hits)
      
      const toRemove = entries.slice(0, this.cache.size - this.config.maxSize)
      toRemove.forEach(([key]) => this.cache.delete(key))
    }
  }

  set(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      hits: 0
    }

    this.cache.set(key, entry)
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Verificar si ha expirado
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    // Incrementar contador de hits
    entry.hits++
    return entry.data
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Obtener estadísticas del caché
  getStats() {
    const now = Date.now()
    const entries = Array.from(this.cache.values())
    
    const totalSize = entries.length
    const expiredEntries = entries.filter(entry => now - entry.timestamp > entry.ttl)
    const activeEntries = totalSize - expiredEntries.length
    
    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0)
    const avgHits = totalSize > 0 ? totalHits / totalSize : 0
    
    // Calcular hit rate basado en hits vs total de accesos
    const hitRate = totalHits > 0 ? Math.min(1, activeEntries / Math.max(totalHits, 1)) : 0
    
    return {
      totalSize,
      activeEntries,
      expiredEntries: expiredEntries.length,
      totalHits,
      avgHits,
      hitRate: Math.round(hitRate * 100) / 100 // Redondear a 2 decimales
    }
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  stats(): {
    size: number
    maxSize: number
    hitRate: number
    oldestEntry: number
    newestEntry: number
  } {
    const entries = Array.from(this.cache.values())
    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0)
    const timestamps = entries.map(entry => entry.timestamp)

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: totalHits / Math.max(entries.length, 1),
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : 0
    }
  }

  // Método para obtener datos con fallback a función
  async getOrSet(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get(key)
    if (cached !== null) {
      return cached
    }

    const data = await fetchFn()
    this.set(key, data, ttl)
    return data
  }

  // Método para invalidar cache por patrón
  invalidatePattern(pattern: RegExp): number {
    let deleted = 0
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key)
        deleted++
      }
    }
    return deleted
  }

  // Método para precargar datos
  async preload(keys: string[], fetchFn: (key: string) => Promise<T>, ttl?: number): Promise<void> {
    const promises = keys.map(async (key) => {
      if (!this.has(key)) {
        try {
          const data = await fetchFn(key)
          this.set(key, data, ttl)
        } catch (error) {
}
      }
    })

    await Promise.all(promises)
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    this.cache.clear()
  }
}

// Instancias globales para diferentes tipos de datos
export const servicesCache = new CacheManager({
  defaultTTL: 15 * 60 * 1000, // 15 minutos
  maxSize: 500
})

export const userCache = new CacheManager({
  defaultTTL: 5 * 60 * 1000, // 5 minutos
  maxSize: 100
})

export const apiCache = new CacheManager({
  defaultTTL: 2 * 60 * 1000, // 2 minutos
  maxSize: 200
})

// Funciones de conveniencia
export const getCachedServices = () => servicesCache
export const getCachedUsers = () => userCache
export const getCachedApi = () => apiCache

// Función para limpiar todos los caches
export const clearAllCaches = (): void => {
  servicesCache.clear()
  userCache.clear()
  apiCache.clear()
}

// Función para obtener estadísticas de todos los caches
export const getCacheStats = () => ({
  services: servicesCache.stats(),
  users: userCache.stats(),
  api: apiCache.stats()
}) 
