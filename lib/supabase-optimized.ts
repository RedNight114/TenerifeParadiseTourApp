import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Cache para consultas
const queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>()

// Función para obtener datos del cache
export function getCachedQuery<T>(key: string, ttl: number = 300000): T | null {
  const cached = queryCache.get(key)
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data as T
  }
  return null
}

// Función para guardar datos en el cache
export function setCachedQuery<T>(key: string, data: T, ttl: number = 300000): void {
  queryCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  })
}

// Función para limpiar cache expirado
function cleanupCache(): void {
  const now = Date.now()
  const entries = Array.from(queryCache.entries())
  for (const [key, cached] of entries) {
    if (now - cached.timestamp > cached.ttl) {
      queryCache.delete(key)
    }
  }
}

// Limpiar cache cada 5 minutos
if (typeof window !== 'undefined') {
  setInterval(cleanupCache, 300000)
}

// Cliente singleton para el lado del cliente
let clientInstance: SupabaseClient | null = null

// Función para obtener la instancia singleton del cliente
export const getSupabaseClient = (): SupabaseClient => {
  if (typeof window === 'undefined') {
    // Lado del servidor - crear nueva instancia
    return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }

  // Lado del cliente - usar singleton
  if (!clientInstance) {
    console.log('🔧 Creando instancia única de Supabase...')
    clientInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: {
          getItem: (key: string) => {
            if (typeof window !== 'undefined') {
              return localStorage.getItem(key)
            }
            return null
          },
          setItem: (key: string, value: string) => {
            if (typeof window !== 'undefined') {
              localStorage.setItem(key, value)
              // También guardar en cookie para middleware
              document.cookie = `${key}=${value}; path=/; max-age=3600; SameSite=Lax`
            }
          },
          removeItem: (key: string) => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem(key)
              // También remover cookie
              document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
            }
          }
        }
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      },
      global: {
        headers: {
          'X-Client-Info': 'tenerife-paradise-tours'
        }
      }
    })
  }
  
  return clientInstance
}

// Exportar la instancia principal para compatibilidad (DEPRECATED - usar getSupabaseClient)
// ELIMINADO para evitar múltiples instancias de GoTrueClient

// Función para verificar la salud de la conexión
export async function checkSupabaseConnection(): Promise<{ connected: boolean; latency?: number; error?: string }> {
  const startTime = Date.now()
  
  try {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from("profiles")
      .select("id")
      .limit(1)
    
    const latency = Date.now() - startTime
    
    if (error) {
      return { connected: false, error: error.message, latency }
    }
    
    return { connected: true, latency }
  } catch (error) {
    const latency = Date.now() - startTime
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Error desconocido',
      latency 
    }
  }
}

// Función para crear cliente (DEPRECATED - usar getSupabaseClient)
// ELIMINADO para evitar múltiples instancias

// Cliente singleton para el lado del servidor (DEPRECATED - usar getSupabaseClient)
// ELIMINADO para evitar múltiples instancias

// Función de utilidad para manejar errores de Supabase
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)
  
  if (error?.code === 'PGRST116') {
    return 'Error de conexión con la base de datos'
  }
  
  if (error?.code === 'PGRST301') {
    return 'Error de autenticación'
  }
  
  if (error?.message) {
    return error.message
  }
  
  return 'Error desconocido de Supabase'
}

// Función para limpiar la instancia (útil para testing)
export const clearClientInstance = () => {
  if (typeof window !== 'undefined') {
    clientInstance = null
  }
} 