// Cliente Supabase unificado para Tenerife Paradise Tour
// Reemplaza todos los clientes duplicados y proporciona una interfaz consistente

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { logAuth, logError } from './logger'

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

class UnifiedSupabaseClient {
  private static instance: UnifiedSupabaseClient | null = null
  private client: SupabaseClient | null = null
  private config: SupabaseConfig
  private isInitialized = false
  private initializationPromise: Promise<void> | null = null
  private healthCheckInterval: NodeJS.Timeout | null = null

  private constructor(config: SupabaseConfig) {
    this.config = config
    this.initialize()
  }

  // Singleton pattern
  public static getInstance(config?: SupabaseConfig): UnifiedSupabaseClient {
    if (!UnifiedSupabaseClient.instance) {
      if (!config) {
        throw new Error('Configuración requerida para la primera inicialización')
      }
      UnifiedSupabaseClient.instance = new UnifiedSupabaseClient(config)
    }
    return UnifiedSupabaseClient.instance
  }

  // Inicializar cliente
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
      logAuth('Inicializando cliente Supabase unificado...')

      // Verificar variables de entorno
      if (!this.config.url || !this.config.key) {
        throw new Error('SUPABASE_URL y SUPABASE_ANON_KEY son requeridos')
      }

      // Crear cliente principal
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
              'X-Client-Info': 'tenerife-paradise-tour-unified',
              'X-Client-Version': '3.0.0',
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

      // Verificar conexión
      const { error } = await this.client.from('profiles').select('count').limit(1)
      
      if (error) {
        logError('Error en health check de Supabase', error)
      } else {
        logAuth('Cliente Supabase unificado inicializado correctamente')
      }

      this.isInitialized = true

      // Configurar health check periódico
      this.setupHealthCheck()

    } catch (error) {
      logError('Error inicializando cliente Supabase unificado', error)
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
          await this.client.from('profiles').select('count').limit(1)
        }
      } catch (error) {
        logError('Health check falló, reintentando conexión...', error)
        this.reconnect()
      }
    }, 5 * 60 * 1000) // Cada 5 minutos
  }

  // Reconectar en caso de error
  private async reconnect() {
    try {
      logAuth('Reconectando cliente Supabase...')
      this.isInitialized = false
      this.initializationPromise = null
      await this.initialize()
    } catch (error) {
      logError('Error en reconexión', error)
    }
  }

  // Obtener cliente inicializado
  public async getClient(): Promise<SupabaseClient> {
    if (!this.isInitialized) {
      await this.initialize()
    }
    
    if (!this.client) {
      throw new Error('Cliente Supabase no disponible')
    }
    
    return this.client
  }

  // Obtener cliente de forma síncrona (solo si ya está inicializado)
  public getClientSync(): SupabaseClient | null {
    return this.client
  }

  // Verificar si está inicializado
  public isReady(): boolean {
    return this.isInitialized && this.client !== null
  }

  // Limpiar recursos
  public cleanup() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
    
    if (this.client) {
      // Cerrar conexiones realtime si existen
      this.client.removeAllChannels()
    }
    
    this.isInitialized = false
    this.initializationPromise = null
  }

  // Obtener información del cliente
  public getInfo() {
    return {
      isInitialized: this.isInitialized,
      isReady: this.isReady(),
      config: {
        url: this.config.url,
        hasKey: !!this.config.key
      }
    }
  }
}

// Configuración por defecto
const defaultConfig: SupabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
}

// Instancia global
export const supabaseClient = UnifiedSupabaseClient.getInstance(defaultConfig)

// Función helper para obtener cliente
export function getSupabaseClient(): Promise<SupabaseClient> {
  return supabaseClient.getClient()
}

// Función helper para obtener cliente síncrono
export function getSupabaseClientSync(): SupabaseClient | null {
  return supabaseClient.getClientSync()
}

// Función helper para verificar estado
export function isSupabaseReady(): boolean {
  return supabaseClient.isReady()
}

// Función helper para limpiar
export function cleanupSupabase() {
  supabaseClient.cleanup()
}

// Exportar la clase para testing
export { UnifiedSupabaseClient }
