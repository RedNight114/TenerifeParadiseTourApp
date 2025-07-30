import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Cache mejorado con prevención de cargas infinitas
interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
  accessCount: number
  lastAccess: number
  isRefreshing: boolean
}

const queryCache = new Map<string, CacheEntry>()
const cacheStats = {
  hits: 0,
  misses: 0,
  totalEntries: 0,
  lastCleanup: Date.now()
}

// Función para limpiar cache expirado con throttling
let cleanupTimeout: NodeJS.Timeout | null = null
function scheduleCleanup(): void {
  if (cleanupTimeout) return // Ya hay una limpieza programada
  
  cleanupTimeout = setTimeout(() => {
    cleanupCache()
    cleanupTimeout = null
  }, 60000) // Esperar 1 minuto antes de la siguiente limpieza
}

function cleanupCache(): void {
  const now = Date.now()
  const entries = Array.from(queryCache.entries())
  let removedCount = 0
  
  for (const [key, cached] of entries) {
    // Limpiar por TTL
    if (now - cached.timestamp > cached.ttl) {
      queryCache.delete(key)
      removedCount++
      continue
    }
    
    // Limpiar entradas muy antiguas sin acceso (más de 1 hora)
    if (now - cached.lastAccess > 60 * 60 * 1000 && cached.accessCount < 3) {
      queryCache.delete(key)
      removedCount++
      continue
    }
    
    // Limpiar si el cache es muy grande (más de 1000 entradas)
    if (queryCache.size > 1000) {
      const oldestEntries = entries
        .sort((a, b) => a[1].lastAccess - b[1].lastAccess)
        .slice(0, 100) // Eliminar las 100 entradas más antiguas
      
      for (const [oldKey] of oldestEntries) {
        queryCache.delete(oldKey)
        removedCount++
      }
      break
    }
  }
  
  cacheStats.totalEntries = queryCache.size
  cacheStats.lastCleanup = now
  
  if (removedCount > 0) {
    console.log(`🧹 Cache cleanup: ${removedCount} entradas eliminadas, ${queryCache.size} restantes`)
  }
}

// Función para obtener datos del cache con prevención de cargas infinitas
export function getCachedQuery<T>(key: string, ttl: number = 300000): T | null {
  const cached = queryCache.get(key)
  
  if (cached) {
    const now = Date.now()
    
    // Verificar si está expirado
    if (now - cached.timestamp < cached.ttl) {
      // Actualizar estadísticas de acceso
      cached.accessCount++
      cached.lastAccess = now
      cacheStats.hits++
      
      return cached.data as T
    } else {
      // Eliminar entrada expirada
      queryCache.delete(key)
      cacheStats.misses++
    }
  } else {
    cacheStats.misses++
  }
  
  return null
}

// Función para guardar datos en el cache con validación
export function setCachedQuery<T>(key: string, data: T, ttl: number = 300000): void {
  // Validar tamaño de datos (máximo 1MB por entrada)
  const dataSize = JSON.stringify(data).length
  if (dataSize > 1024 * 1024) {
    console.warn(`⚠️ Datos demasiado grandes para cachear: ${(dataSize / 1024).toFixed(2)} KB`)
    return
  }
  
  // Programar limpieza si es necesario
  if (queryCache.size > 500) {
    scheduleCleanup()
  }
  
  queryCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
    accessCount: 1,
    lastAccess: Date.now(),
    isRefreshing: false
  })
  
  cacheStats.totalEntries = queryCache.size
}

// Función para invalidar cache específico
export function invalidateCache(key: string): void {
  queryCache.delete(key)
  cacheStats.totalEntries = queryCache.size
}

// Función para limpiar todo el cache
export function clearAllCache(): void {
  const size = queryCache.size
  queryCache.clear()
  cacheStats.totalEntries = 0
  console.log(`🧹 Cache completamente limpiado: ${size} entradas eliminadas`)
}

// Función para obtener estadísticas del cache
export function getCacheStats() {
  return {
    ...cacheStats,
    hitRate: cacheStats.hits + cacheStats.misses > 0 
      ? ((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100).toFixed(2) + '%'
      : '0%'
  }
}

// Limpiar cache cada 5 minutos solo en el cliente
if (typeof window !== 'undefined') {
  setInterval(cleanupCache, 5 * 60 * 1000)
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