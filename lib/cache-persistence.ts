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
      }

      this.isInitialized = true
    } catch (error) {
      this.stats.storageType = 'none'
    }
  }

  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Crear store si no existe
        if (!db.objectStoreNames.contains(this.config.storeName)) {
          const store = db.createObjectStore(this.config.storeName, { keyPath: 'key' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('tags', 'tags', { unique: false, multiEntry: true })
        }
      }
    })
  }

  async save(data: Map<string, any>): Promise<void> {
    if (!this.isInitialized) await this.initialize()

    try {
      if (this.stats.storageType === 'indexeddb' && this.db) {
        await this.saveToIndexedDB(data)
      } else if (this.stats.storageType === 'localstorage') {
        await this.saveToLocalStorage(data)
      }
      
      this.stats.lastSync = Date.now()
    } catch (error) {
      }
  }

  async load(): Promise<Map<string, any>> {
    if (!this.isInitialized) await this.initialize()

    try {
      if (this.stats.storageType === 'indexeddb' && this.db) {
        return await this.loadFromIndexedDB()
      } else if (this.stats.storageType === 'localstorage') {
        return await this.loadFromLocalStorage()
      }
    } catch (error) {
      }

    return new Map()
  }

  private async saveToIndexedDB(data: Map<string, any>): Promise<void> {
    if (!this.db) throw new Error('IndexedDB no inicializado')

    const transaction = this.db.transaction([this.config.storeName], 'readwrite')
    const store = transaction.objectStore(this.config.storeName)

    // Limpiar datos existentes
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear()
      clearRequest.onsuccess = () => resolve()
      clearRequest.onerror = () => reject(clearRequest.error)
    })

    // Guardar nuevos datos
    const entries = Array.from(data.entries())
    let savedCount = 0
    let totalSize = 0

    for (const [key, value] of entries) {
      const entry = {
        key,
        value,
        timestamp: Date.now(),
        size: this.calculateSize(value)
      }

      await new Promise<void>((resolve, reject) => {
        const putRequest = store.put(entry)
        putRequest.onsuccess = () => {
          savedCount++
          totalSize += entry.size
          resolve()
        }
        putRequest.onerror = () => reject(putRequest.error)
      })
    }

    this.stats.entryCount = savedCount
    this.stats.totalSize = totalSize
  }

  private async loadFromIndexedDB(): Promise<Map<string, any>> {
    if (!this.db) throw new Error('IndexedDB no inicializado')

    const transaction = this.db.transaction([this.config.storeName], 'readonly')
    const store = transaction.objectStore(this.config.storeName)

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      
      request.onsuccess = () => {
        const entries = request.result
        const data = new Map()
        let totalSize = 0

        for (const entry of entries) {
          // Verificar que no esté expirado
          if (entry.value && entry.value.ttl) {
            const age = Date.now() - entry.value.timestamp
            if (age <= entry.value.ttl) {
              data.set(entry.key, entry.value)
              totalSize += entry.size || 0
            }
          }
        }

        this.stats.entryCount = data.size
        this.stats.totalSize = totalSize
        resolve(data)
      }

      request.onerror = () => reject(request.error)
    })
  }

  private async saveToLocalStorage(data: Map<string, any>): Promise<void> {
    const entries = Array.from(data.entries())
    const serialized = JSON.stringify(entries)
    
    // Verificar límite de tamaño
    const sizeInMB = new Blob([serialized]).size / (1024 * 1024)
    if (sizeInMB > this.config.maxStorageSize) {
      }MB`)
      return
    }

    localStorage.setItem('tpt_cache_persistence', serialized)
    this.stats.entryCount = data.size
    this.stats.totalSize = new Blob([serialized]).size
  }

  private async loadFromLocalStorage(): Promise<Map<string, any>> {
    const stored = localStorage.getItem('tpt_cache_persistence')
    if (!stored) return new Map()

    try {
      const entries = JSON.parse(stored)
      const data = new Map(entries)
      
      // Filtrar entradas expiradas
      const now = Date.now()
      const validData = new Map()
      
      for (const [key, value] of data.entries()) {
        if (value && typeof value === 'object' && 'ttl' in value) {
          const age = now - (value as any).timestamp
          if (age <= (value as any).ttl) {
            validData.set(key, value)
          }
        }
      }

      this.stats.entryCount = validData.size
      this.stats.totalSize = new Blob([stored]).size
      return validData
    } catch (error) {
      return new Map()
    }
  }

  private calculateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size
    } catch {
      return 0
    }
  }

  async clear(): Promise<void> {
    if (!this.isInitialized) await this.initialize()

    try {
      if (this.stats.storageType === 'indexeddb' && this.db) {
        const transaction = this.db.transaction([this.config.storeName], 'readwrite')
        const store = transaction.objectStore(this.config.storeName)
        await new Promise<void>((resolve, reject) => {
          const clearRequest = store.clear()
          clearRequest.onsuccess = () => resolve()
          clearRequest.onerror = () => reject(clearRequest.error)
        })
      } else if (this.stats.storageType === 'localstorage') {
        localStorage.removeItem('tpt_cache_persistence')
      }

      this.stats.entryCount = 0
      this.stats.totalSize = 0
    } catch (error) {
      }
  }

  getStats(): PersistenceStats {
    return { ...this.stats }
  }

  async cleanup(): Promise<void> {
    if (!this.isInitialized) return

    try {
      const data = await this.load()
      const now = Date.now()
      const validData = new Map()

      // Filtrar solo datos válidos
      for (const [key, value] of data.entries()) {
        if (value && typeof value === 'object' && 'ttl' in value) {
          const age = now - (value as any).timestamp
          if (age <= (value as any).ttl) {
            validData.set(key, value)
          }
        }
      }

      // Guardar solo datos válidos
      await this.save(validData)
    } catch (error) {
      }
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
