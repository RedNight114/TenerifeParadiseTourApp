/**
 * Sistema de persistencia avanzado para el caché unificado
 * Soporta IndexedDB con fallback a localStorage
 */

export interface PersistenceConfig {
  enableIndexedDB: boolean
  enableLocalStorage: boolean
  dbName: string
  dbVersion: number
  storeName: string
  maxStorageSize: number // en MB
}

export interface PersistenceStats {
  totalSize: number
  entryCount: number
  lastSync: number
  storageType: 'indexeddb' | 'localstorage' | 'none'
  compressionRatio: number
}

export class CachePersistence {
  private config: PersistenceConfig
  private db: IDBDatabase | null = null
  private isInitialized = false
  private stats: PersistenceStats

  constructor(config: PersistenceConfig) {
    this.config = config
    this.stats = {
      totalSize: 0,
      entryCount: 0,
      lastSync: 0,
      storageType: 'none',
      compressionRatio: 0
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Intentar IndexedDB primero
      if (this.config.enableIndexedDB && typeof window !== 'undefined' && 'indexedDB' in window) {
        await this.initIndexedDB()
        this.stats.storageType = 'indexeddb'
      } else if (this.config.enableLocalStorage && typeof window !== 'undefined') {
        // Fallback a localStorage
        this.stats.storageType = 'localstorage'
      } else {
        this.stats.storageType = 'none'
      }

      this.isInitialized = true
    } catch (error) {
      console.error('Error inicializando persistencia:', error)
      this.stats.storageType = 'none'
      this.isInitialized = true
    }
  }

  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('IndexedDB no disponible en servidor'))
        return
      }

      const request = indexedDB.open(this.config.dbName, this.config.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.config.storeName)) {
          db.createObjectStore(this.config.storeName, { keyPath: 'key' })
        }
      }
    })
  }

  async save(key: string, data: any): Promise<void> {
    if (!this.isInitialized) await this.initialize()
    
    // Validar que la clave sea válida
    if (!key || typeof key !== 'string' || key.trim() === '') {
      console.warn('Clave de caché inválida:', key)
      return
    }

    try {
      const serialized = JSON.stringify({
        key,
        data,
        timestamp: Date.now()
      })

      if (this.stats.storageType === 'indexeddb' && this.db) {
        await this.saveToIndexedDB(key, serialized)
      } else if (this.stats.storageType === 'localstorage') {
        this.saveToLocalStorage(key, serialized)
      }

      this.updateStats()
    } catch (error) {
      console.error('Error guardando en caché:', error)
    }
  }

  private async saveToIndexedDB(key: string, data: string): Promise<void> {
    if (!this.db) throw new Error('IndexedDB no inicializado')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readwrite')
      const store = transaction.objectStore(this.config.storeName)
      const request = store.put({ key, data })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private saveToLocalStorage(key: string, data: string): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(`cache_${key}`, data)
    } catch (error) {
      // Si localStorage está lleno, limpiar entradas antiguas
      this.cleanupLocalStorage()
      localStorage.setItem(`cache_${key}`, data)
    }
  }

  async load(key: string): Promise<any> {
    if (!this.isInitialized) await this.initialize()
    
    // Validar que la clave sea válida
    if (!key || typeof key !== 'string' || key.trim() === '') {
      console.warn('Clave de caché inválida:', key)
      return null
    }

    try {
      let serialized: string | null = null

      if (this.stats.storageType === 'indexeddb' && this.db) {
        serialized = await this.loadFromIndexedDB(key)
      } else if (this.stats.storageType === 'localstorage') {
        serialized = this.loadFromLocalStorage(key)
      }

      if (serialized) {
        const parsed = JSON.parse(serialized)
        return parsed.data
      }

      return null
    } catch (error) {
      console.error('Error cargando del caché:', error)
      return null
    }
  }

  private async loadFromIndexedDB(key: string): Promise<string | null> {
    if (!this.db || !key) return null

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([this.config.storeName], 'readonly')
        const store = transaction.objectStore(this.config.storeName)
        const request = store.get(key)

        request.onsuccess = () => {
          resolve(request.result?.data || null)
        }
        request.onerror = () => {
          console.warn('Error cargando de IndexedDB:', request.error)
          resolve(null)
        }
      } catch (error) {
        console.warn('Error en transacción IndexedDB:', error)
        resolve(null)
      }
    })
  }

  private loadFromLocalStorage(key: string): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(`cache_${key}`)
  }

  async delete(key: string): Promise<void> {
    if (!this.isInitialized) await this.initialize()

    try {
      if (this.stats.storageType === 'indexeddb' && this.db) {
        await this.deleteFromIndexedDB(key)
      } else if (this.stats.storageType === 'localstorage') {
        this.deleteFromLocalStorage(key)
      }

      this.updateStats()
    } catch (error) {
      console.error('Error eliminando del caché:', error)
    }
  }

  private async deleteFromIndexedDB(key: string): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readwrite')
      const store = transaction.objectStore(this.config.storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private deleteFromLocalStorage(key: string): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(`cache_${key}`)
  }

  async clear(): Promise<void> {
    if (!this.isInitialized) await this.initialize()

    try {
      if (this.stats.storageType === 'indexeddb' && this.db) {
        await this.clearIndexedDB()
      } else if (this.stats.storageType === 'localstorage') {
        this.clearLocalStorage()
      }

      this.updateStats()
    } catch (error) {
      console.error('Error limpiando caché:', error)
    }
  }

  private async clearIndexedDB(): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readwrite')
      const store = transaction.objectStore(this.config.storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private clearLocalStorage(): void {
    if (typeof window === 'undefined') return

    const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'))
    keys.forEach(key => localStorage.removeItem(key))
  }

  private cleanupLocalStorage(): void {
    if (typeof window === 'undefined') return

    const cacheKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('cache_'))
      .map(key => ({
        key,
        timestamp: this.getTimestampFromKey(key)
      }))
      .sort((a, b) => a.timestamp - b.timestamp)

    // Eliminar las entradas más antiguas hasta liberar espacio
    const maxEntries = Math.floor(this.config.maxStorageSize * 1024 * 1024 / 10000) // Estimación
    if (cacheKeys.length > maxEntries) {
      const toDelete = cacheKeys.slice(0, cacheKeys.length - maxEntries)
      toDelete.forEach(item => localStorage.removeItem(item.key))
    }
  }

  private getTimestampFromKey(key: string): number {
    try {
      const data = localStorage.getItem(key)
      if (data) {
        const parsed = JSON.parse(data)
        return parsed.timestamp || 0
      }
    } catch {
      // Ignorar errores de parsing
    }
    return 0
  }

  private updateStats(): void {
    if (this.stats.storageType === 'localstorage' && typeof window !== 'undefined') {
      const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('cache_'))
      this.stats.entryCount = cacheKeys.length
      this.stats.lastSync = Date.now()
      
      // Calcular tamaño aproximado
      this.stats.totalSize = cacheKeys.reduce((total, key) => {
        const value = localStorage.getItem(key)
        return total + (value ? value.length * 2 : 0) // Aproximación UTF-16
      }, 0)
    }
  }

  getStats(): PersistenceStats {
    return { ...this.stats }
  }

  async isAvailable(): Promise<boolean> {
    if (!this.isInitialized) await this.initialize()
    return this.stats.storageType !== 'none'
  }

  // Método para comprimir datos antes de guardar
  private compress(data: any): string {
    // Implementación simple de compresión (en producción usar una librería como pako)
    return JSON.stringify(data)
  }

  // Método para descomprimir datos después de cargar
  private decompress(data: string): any {
    return JSON.parse(data)
  }
}

// Instancia global de persistencia
export const cachePersistence = new CachePersistence({
  enableIndexedDB: true,
  enableLocalStorage: true,
  dbName: 'TenerifeParadiseCache',
  dbVersion: 1,
  storeName: 'cache',
  maxStorageSize: 50 // 50 MB
});
