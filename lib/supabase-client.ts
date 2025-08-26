// Cliente Supabase unificado y optimizado para Tenerife Paradise Tour
// Implementa conexión pooling, caché inteligente y manejo de errores mejorado

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { CacheManager } from './cache-manager'

interface SupabaseConfig {
  url: string
  key: string
  options?: {
    auth?: {
      autoRefreshToken?: boolean
      persistSession?: boolean
      detectSessionInUrl?: boolean
    }
    db?: {
      schema?: 'public'
    }
    global?: {
      headers?: Record<string, string>
    }
    realtime?: {
      params?: Record<string, string>
    }
  }
}

class OptimizedSupabaseClient {
  private client: SupabaseClient | null = null
  private config: SupabaseConfig
  private connectionPool: Map<string, SupabaseClient> = new Map()
  private maxPoolSize = 5
  private retryAttempts = 3
  private retryDelay = 1000
  private isInitialized = false
  private initializationPromise: Promise<void> | null = null
  private cache: CacheManager
  private requestQueue: Array<() => Promise<any>> = []
  private isProcessing = false
  private healthCheckInterval: NodeJS.Timeout | null = null

  constructor(config: SupabaseConfig) {
    this.config = config
    this.cache = new CacheManager({
      defaultTTL: 30 * 60 * 1000, // 30 minutos
      maxSize: 2000,
      cleanupInterval: 10 * 60 * 1000 // 10 minutos
    })
    
    // Inicializar inmediatamente
    this.initialize()
  }

  // Inicializar cliente principal
  private async initialize() {
    if (this.initializationPromise) {
      return this.initializationPromise
    }

    this.initializationPromise = this._initialize()
    return this.initializationPromise
  }

  private async _initialize() {
    if (this.isInitialized) return

    try {
      // Verificar que las variables de entorno estén disponibles
      if (!this.config.url || !this.config.key) {
        throw new Error('SUPABASE_URL y SUPABASE_ANON_KEY son requeridos')
      }

      // Inicializando cliente Supabase optimizado

      this.client = createClient(
        this.config.url,
        this.config.key,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
            ...this.config.options?.auth
          },
          db: {
            schema: 'public' as const,
            ...this.config.options?.db
          },
          global: {
            headers: {
              'X-Client-Info': 'tenerife-paradise-tour-v2',
              'X-Client-Version': '2.0.0',
              ...this.config.options?.global?.headers
            }
          },
          realtime: {
            params: {
              eventsPerSecond: 10,
              ...this.config.options?.realtime?.params
            }
          }
        }
      )

      // Verificar conexión con un health check simple
      const { error } = await this.client.from('services').select('count').limit(1)
      
      if (error) {
        // Health check inicial falló, continuar aunque falle
      } else {
        // Conexión con Supabase establecida correctamente
      }

      // Configurar health check periódico
      this.setupHealthCheck()

      this.isInitialized = true
      // Cliente Supabase optimizado inicializado correctamente

    } catch (error) {
      // Error inicializando cliente Supabase
      throw error
    }
  }

  // Configurar health check periódico
  private setupHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }

    this.healthCheckInterval = setInterval(async () => {
      try {
        if (this.client) {
          const { error } = await this.client.from('services').select('count').limit(1)
          if (error) {
            // Health check falló, reintentando conexión
            await this.reconnect()
          }
        }
      } catch (error) {
        // Error en health check
      }
    }, 5 * 60 * 1000) // Cada 5 minutos
  }

  // Reconectar en caso de error
  private async reconnect() {
    try {
      // Reintentando conexión con Supabase
      this.isInitialized = false
      this.initializationPromise = null
      await this.initialize()
    } catch (error) {
      // Error en reconexión
    }
  }

  // Sistema de cola para evitar peticiones simultáneas
  private async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return
    
    this.isProcessing = true
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()
      if (request) {
        try {
          await request()
        } catch (error) {
}
      }
    }
    
    this.isProcessing = false
  }

  // Obtener cliente principal
  getClient(): SupabaseClient<any, "public", any> {
    if (!this.client) {
      throw new Error('Cliente Supabase no inicializado')
    }
    return this.client
  }

  // Obtener cliente del pool de conexiones
  private getPooledClient(): SupabaseClient<any, "public", any> {
    const poolKey = `pool-${Date.now() % this.maxPoolSize}`
    
    if (!this.connectionPool.has(poolKey)) {
      if (this.connectionPool.size >= this.maxPoolSize) {
        // Usar el cliente principal si el pool está lleno
        return this.getClient()
      }
      
      const pooledClient = createClient(
        this.config.url,
        this.config.key,
        {
          auth: { autoRefreshToken: false, persistSession: false },
          db: { schema: 'public' as const },
          global: {
            headers: {
              'X-Client-Info': 'tenerife-paradise-tour-pooled',
              'X-Pool-Key': poolKey
            }
          }
        }
      )
      
      this.connectionPool.set(poolKey, pooledClient)
    }
    
    return this.connectionPool.get(poolKey)!
  }

  // Query optimizado con caché
  async query(table: string, options: any = {}) {
    const cacheKey = `${table}:${JSON.stringify(options)}`
    
    // Verificar caché primero
    const cached = this.cache.get(cacheKey)
    if (cached) {
return cached
    }
// Agregar a la cola
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          await this.initialize()
          
          const client = this.getPooledClient()
          let query = client.from(table).select(options.select || '*')
          
          // Aplicar ordenamiento simple
          if (options.order && options.order.column) {
            query = query.order(options.order.column, { 
              ascending: options.order.ascending !== false 
            })
          }
          
          // Aplicar límite
          if (options.limit) {
            query = query.limit(options.limit)
          }

          const { data, error } = await query

          if (error) {
throw error
          }

          // Log para debuggear la estructura de datos
          if (data && data.length > 0) {
            console.log('Estructura de datos:', {
              sample: data[0]
            })
          }

          // Guardar en caché con TTL personalizado
          const ttl = options.cacheTTL || 30 * 60 * 1000 // 30 minutos por defecto
          this.cache.set(cacheKey, data, ttl)
          console.log(`Datos guardados en caché por ${Math.round(ttl / 60000)} min`)
          resolve(data)
          
        } catch (error) {
          reject(error)
        }
      })

      this.processQueue()
    })
  }

  // Query con reintentos automáticos
  async queryWithRetry(table: string, options: any = {}, maxRetries: number = this.retryAttempts) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.query(table, options)
      } catch (error) {
        if (attempt === maxRetries) {
          throw error
        }
await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt))
      }
    }
  }

  // Insertar datos
  async insert(table: string, data: any) {
    try {
      await this.initialize()
      const client = this.getClient()
      
      const { data: result, error } = await client
        .from(table)
        .insert(data)
        .select()

      if (error) throw error

      // Invalidar caché relacionado
      this.cache.delete(`${table}:*`)
return result
      
    } catch (error) {
throw error
    }
  }

  // Actualizar datos
  async update(table: string, data: any, conditions: any) {
    try {
      await this.initialize()
      const client = this.getClient()
      
      let query = client.from(table).update(data)
      
      // Aplicar condiciones
      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
      
      const { data: result, error } = await query.select()

      if (error) throw error

      // Invalidar caché relacionado
      this.cache.delete(`${table}:*`)
return result
      
    } catch (error) {
throw error
    }
  }

  // Eliminar datos
  async delete(table: string, conditions: any) {
    try {
      await this.initialize()
      const client = this.getClient()
      
      let query = client.from(table).delete()
      
      // Aplicar condiciones
      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
      
      const { data: result, error } = await query.select()

      if (error) throw error

      // Invalidar caché relacionado
      this.cache.delete(`${table}:*`)
return result
      
    } catch (error) {
throw error
    }
  }

  // Obtener estadísticas del cliente
  getStats() {
    const cacheStats = this.cache && typeof this.cache.getStats === 'function' 
      ? this.cache.getStats() 
      : { totalSize: 0, hitRate: 0 }
    
    return {
      isInitialized: this.isInitialized,
      poolSize: this.connectionPool.size,
      maxPoolSize: this.maxPoolSize,
      queueLength: this.requestQueue.length,
      isProcessing: this.isProcessing,
      cacheStats
    }
  }

  // Limpiar recursos
  cleanup() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
    
    this.connectionPool.forEach(client => {
      try {
        client.removeAllChannels()
      } catch (error) {
}
    })
    
    this.connectionPool.clear()
    this.cache.clear()
  }

  // Forzar refresh del caché
  forceCacheRefresh() {
this.cache.clear()
}

  // Obtener estadísticas detalladas del caché
  getDetailedCacheStats() {
    const cacheStats = this.cache.getStats()
return cacheStats
  }
}

// Instancia global del cliente optimizado
let globalClient: OptimizedSupabaseClient | null = null

// Función para obtener el cliente global
export function getSupabaseClient(): OptimizedSupabaseClient {
  if (!globalClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Variables de entorno de Supabase no configuradas')
    }
    
    globalClient = new OptimizedSupabaseClient({ url, key })
  }
  
  return globalClient
}

// Función para limpiar el cliente global
export function cleanupSupabaseClient() {
  if (globalClient) {
    globalClient.cleanup()
    globalClient = null
  }
}

// Exportar la instancia por defecto
export const supabaseClient = getSupabaseClient()

// Re-exportar tipos para compatibilidad
export type { SupabaseClient }

