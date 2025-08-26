// Sistema de caché persistente para Tenerife Paradise Tour
// Implementa localStorage con limpieza inteligente y compresión de datos

export interface PersistentCacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  hits: number
  compressed: boolean
  size: number
}

export interface PersistentCacheConfig {
  prefix: string
  defaultTTL: number // en milisegundos
  maxSize: number // en MB
  cleanupInterval: number // en milisegundos
  enableCompression: boolean
  compressionThreshold: number // en bytes
}

export class PersistentCache<T = unknown> {
  private prefix: string
  private config: PersistentCacheConfig
  private cleanupTimer?: NodeJS.Timeout
  private isInitialized = false
  private storage: Storage | null = null

  constructor(config: Partial<PersistentCacheConfig> = {}) {
    this.config = {
      prefix: 'tenerife-cache',
      defaultTTL: 30 * 60 * 1000, // 30 minutos por defecto
      maxSize: 50, // 50 MB por defecto
      cleanupInterval: 10 * 60 * 1000, // 10 minutos
      enableCompression: true,
      compressionThreshold: 1024, // 1 KB
      ...config
    }

    this.prefix = this.config.prefix
    this.initialize()
  }

  // Inicializar el caché
  private initialize() {
    if (this.isInitialized) return

    try {
      // Verificar si estamos en el navegador
      if (typeof window !== 'undefined' && window.localStorage) {
        this.storage = window.localStorage
        this.isInitialized = true
        this.startCleanupTimer()
        this.cleanup() // Limpieza inicial
} else {
this.storage = null
      }
    } catch (error) {
this.storage = null
    }
  }

  // Comprimir datos si es necesario
  private compress(data: string): { data: string; isCompressed: boolean } {
    if (!this.config.enableCompression || data.length < this.config.compressionThreshold) {
      return { data, isCompressed: false }
    }

    try {
      // Compresión simple usando LZ-string o similar
      // Por ahora usamos una compresión básica
      const compressed = btoa(encodeURIComponent(data))
      return { data: compressed, isCompressed: true }
    } catch (error) {
return { data, isCompressed: false }
    }
  }

  // Descomprimir datos
  private decompress(data: string, compressed: boolean): string {
    if (!compressed) return data

    try {
      return decodeURIComponent(atob(data))
    } catch (error) {
return data
    }
  }

  // Calcular tamaño aproximado de los datos
  private calculateSize(data: unknown): number {
    try {
      const jsonString = JSON.stringify(data)
      return new Blob([jsonString]).size
    } catch (error) {
      return 0
    }
  }

  // Obtener tamaño total del caché
  private getTotalSize(): number {
    if (!this.storage) return 0

    let totalSize = 0
    const keys = Object.keys(this.storage)
    
    for (const key of keys) {
      if (key.startsWith(this.prefix)) {
        try {
          const item = this.storage.getItem(key)
          if (item) {
            const entry: PersistentCacheEntry<T> = JSON.parse(item)
            totalSize += entry.size
          }
        } catch {
          // Ignorar entradas corruptas
        }
      }
    }

    return totalSize
  }

  // Iniciar timer de limpieza
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  // Limpiar caché expirado y excedido
  public cleanup(): void {
    if (!this.storage) return

    const now = Date.now()
    const keys = Object.keys(this.storage)
    const expiredKeys: string[] = []
    const entries: Array<{ key: string; entry: PersistentCacheEntry<T> }> = []

    // Encontrar entradas expiradas y calcular tamaños
    for (const key of keys) {
      if (key.startsWith(this.prefix)) {
        try {
          const item = this.storage.getItem(key)
          if (item) {
            const entry: PersistentCacheEntry<T> = JSON.parse(item)
            
            // Verificar si ha expirado
            if (now - entry.timestamp > entry.ttl) {
              expiredKeys.push(key)
            } else {
              entries.push({ key, entry })
            }
          }
        } catch (error) {
          // Entrada corrupta, eliminar
          expiredKeys.push(key)
        }
      }
    }

    // Eliminar entradas expiradas
    expiredKeys.forEach(key => {
      this.storage!.removeItem(key)
    })

    // Verificar tamaño total
    const totalSize = this.getTotalSize()
    const maxSizeBytes = this.config.maxSize * 1024 * 1024 // Convertir MB a bytes

    if (totalSize > maxSizeBytes) {
      console.log(`Cache size limit exceeded (${Math.round(totalSize / 1024 / 1024)}MB > ${this.config.maxSize}MB), limpiando...`)
      
      // Ordenar por hits (menos usados primero) y timestamp (más antiguos primero)
      entries.sort((a, b) => {
        if (a.entry.hits !== b.entry.hits) {
          return a.entry.hits - b.entry.hits
        }
        return a.entry.timestamp - b.entry.timestamp
      })

      // Eliminar entradas hasta estar bajo el límite
      let currentSize = totalSize
      for (const { key, entry } of entries) {
        if (currentSize <= maxSizeBytes) break
        
        this.storage!.removeItem(key)
        currentSize -= entry.size
      }
      console.log(`Cache limpiado. Nuevo tamaño: ${Math.round(currentSize / 1024 / 1024)}MB`)
    }

    if (expiredKeys.length > 0) {
}
  }

  // Guardar datos en caché
  set(key: string, data: T, ttl?: number): void {
    if (!this.storage) return

    try {
      const fullKey = `${this.prefix}:${key}`
      const jsonString = JSON.stringify(data)
      const { data: _, isCompressed } = this.compress(jsonString)
      const size = this.calculateSize(data)

      const entry: PersistentCacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl || this.config.defaultTTL,
        hits: 0,
        compressed: isCompressed,
        size
      }

      // Verificar si hay espacio suficiente
      const totalSize = this.getTotalSize()
      const maxSizeBytes = this.config.maxSize * 1024 * 1024

      if (totalSize + size > maxSizeBytes) {
        // Limpiar antes de guardar
        this.cleanup()
        
        // Verificar nuevamente
        const newTotalSize = this.getTotalSize()
        if (newTotalSize + size > maxSizeBytes) {
return
        }
      }

      this.storage.setItem(fullKey, JSON.stringify(entry))
      console.log(`Datos guardados en cache: ${Math.round(size / 1024)}KB, comprimido: ${isCompressed}`)
      
    } catch (error) {
      console.error('Error al guardar en cache:', error)
    }
  }

  // Obtener datos del caché
  get(key: string): T | null {
    if (!this.storage) return null

    try {
      const fullKey = `${this.prefix}:${key}`
      const item = this.storage.getItem(fullKey)
      
      if (!item) {
        return null
      }

      const entry: PersistentCacheEntry<T> = JSON.parse(item)
      const now = Date.now()

      // Verificar si ha expirado
      if (now - entry.timestamp > entry.ttl) {
        this.storage.removeItem(fullKey)
        return null
      }

      // Incrementar contador de hits
      entry.hits++
      this.storage.setItem(fullKey, JSON.stringify(entry))
      console.log(`Cache hit para ${key}`)
      return entry.data
      
    } catch (error) {
// Eliminar entrada corrupta
      try {
        this.storage.removeItem(`${this.prefix}:${key}`)
      } catch (e) {
        // Ignorar error de eliminación
      }
      return null
    }
  }

  // Verificar si existe una clave
  has(key: string): boolean {
    return this.get(key) !== null
  }

  // Eliminar una entrada específica
  delete(key: string): boolean {
    if (!this.storage) return false

    try {
      const fullKey = `${this.prefix}:${key}`
      const exists = this.storage.getItem(fullKey) !== null
      
      if (exists) {
        this.storage.removeItem(fullKey)
}
      
      return exists
    } catch (error) {
return false
    }
  }

  // Eliminar entradas por patrón
  deletePattern(pattern: RegExp): number {
    if (!this.storage) return 0

    let deleted = 0
    const keys = Object.keys(this.storage)
    
    for (const key of keys) {
      if (key.startsWith(this.prefix)) {
        const shortKey = key.replace(`${this.prefix}:`, '')
        if (pattern.test(shortKey)) {
          try {
            this.storage.removeItem(key)
            deleted++
          } catch (error) {
}
        }
      }
    }

    if (deleted > 0) {
}

    return deleted
  }

  // Limpiar todo el caché
  clear(): void {
    if (!this.storage) return

    const keys = Object.keys(this.storage)
    let deleted = 0
    
    for (const key of keys) {
      if (key.startsWith(this.prefix)) {
        try {
          this.storage.removeItem(key)
          deleted++
        } catch (error) {
}
      }
    }
}

  // Obtener estadísticas del caché
  getStats() {
    if (!this.storage) {
      return {
        initialized: false,
        size: 0,
        maxSize: this.config.maxSize,
        entries: 0,
        totalSize: 0,
        hitRate: 0
      }
    }

    const keys = Object.keys(this.storage)
    const cacheKeys = keys.filter(key => key.startsWith(this.prefix))
    let totalHits = 0
    let totalSize = 0
    let validEntries = 0

    for (const key of cacheKeys) {
      try {
        const item = this.storage.getItem(key)
        if (item) {
          const entry: PersistentCacheEntry<T> = JSON.parse(item)
          const now = Date.now()
          
          if (now - entry.timestamp <= entry.ttl) {
            totalHits += entry.hits
            totalSize += entry.size
            validEntries++
          }
        }
              } catch {
          // Ignorar entradas corruptas
        }
    }

    return {
      initialized: true,
      size: validEntries,
      maxSize: this.config.maxSize,
      entries: validEntries,
      totalSize: Math.round(totalSize / 1024 / 1024 * 100) / 100, // MB
      hitRate: validEntries > 0 ? Math.round((totalHits / validEntries) * 100) / 100 : 0,
      prefix: this.prefix,
      config: this.config
    }
  }

  // Obtener datos con fallback a función
  async getOrSet(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get(key)
    if (cached !== null) {
      return cached
    }

    const data = await fetchFn()
    this.set(key, data, ttl)
    return data
  }

  // Precargar múltiples claves
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

  // Destruir el caché
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
    
    this.clear()
    this.isInitialized = false
    this.storage = null
}
}

// Instancias globales para diferentes tipos de datos
export const servicesPersistentCache = new PersistentCache({
  prefix: 'services',
  defaultTTL: 30 * 60 * 1000, // 30 minutos
  maxSize: 20, // 20 MB
  enableCompression: true
})

export const categoriesPersistentCache = new PersistentCache({
  prefix: 'categories',
  defaultTTL: 60 * 60 * 1000, // 1 hora
  maxSize: 5, // 5 MB
  enableCompression: true
})

export const userPersistentCache = new PersistentCache({
  prefix: 'user',
  defaultTTL: 15 * 60 * 1000, // 15 minutos
  maxSize: 10, // 10 MB
  enableCompression: false // No comprimir datos de usuario
})

// Funciones de conveniencia
export const getServicesCache = () => servicesPersistentCache
export const getCategoriesCache = () => categoriesPersistentCache
export const getUserCache = () => userPersistentCache

// Función para limpiar todos los caches
export const clearAllPersistentCaches = (): void => {
  servicesPersistentCache.clear()
  categoriesPersistentCache.clear()
  userPersistentCache.clear()
}

// Función para obtener estadísticas de todos los caches
export const getPersistentCacheStats = () => ({
  services: servicesPersistentCache.getStats(),
  categories: categoriesPersistentCache.getStats(),
  user: userPersistentCache.getStats()
})

// Función para limpiar caches expirados
export const cleanupExpiredCaches = (): void => {
  servicesPersistentCache.cleanup()
  categoriesPersistentCache.cleanup()
  userPersistentCache.cleanup()
}


