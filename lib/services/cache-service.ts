/**
 * Servicio de caché unificado para la aplicación
 * Implementa patrón Singleton con gestión de memoria
 */

export interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

export interface CacheStats {
  size: number
  hits: number
  misses: number
  hitRate: number
}

export class CacheService {
  private static instance: CacheService
  private cache: Map<string, CacheItem<any>> = new Map()
  private stats: { hits: number; misses: number } = { hits: 0, misses: 0 }

  private constructor() {}

  static getInstance(): CacheService {
    if (!this.instance) {
      this.instance = new CacheService()
    }
    return this.instance
  }

  /**
   * Obtener valor del caché
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      this.stats.misses++
      return null
    }

    // Verificar si ha expirado
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    this.stats.hits++
    return item.data
  }

  /**
   * Guardar valor en caché
   */
  set<T>(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
    const item: CacheItem<T> = {
      data: value,
      timestamp: Date.now(),
      ttl
    }
    
    this.cache.set(key, item)
  }

  /**
   * Eliminar valor del caché
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Invalidar patrón de claves
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Limpiar todo el caché
   */
  clear(): void {
    this.cache.clear()
    this.stats = { hits: 0, misses: 0 }
  }

  /**
   * Obtener estadísticas del caché
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses
    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0
    }
  }

  /**
   * Limpiar elementos expirados
   */
  cleanup(): void {
    const now = Date.now()
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

/**
 * Claves de caché predefinidas
 */
export const CACHE_KEYS = {
  MESSAGES: (conversationId: string) => `messages:${conversationId}`,
  CONVERSATIONS: (userId: string) => `conversations:${userId}`,
  CHAT_STATS: 'chat:stats',
  USER_PROFILE: (userId: string) => `profile:${userId}`,
  SERVICE_LIST: 'services:list',
  RESERVATIONS: (userId: string) => `reservations:${userId}`,
  ADMIN_STATS: 'admin:stats'
} as const
