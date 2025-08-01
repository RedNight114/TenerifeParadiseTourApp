import { createClient } from '@supabase/supabase-js'

// Configuración optimizada para mejor rendimiento
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente singleton para evitar múltiples instancias
let supabaseClient: ReturnType<typeof createClient> | null = null

// Cliente optimizado con configuración de rendimiento
const createSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Configuración optimizada de autenticación
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'tenerife-paradise-auth',
      flowType: 'implicit',
    },
    db: {
      // Configuración de base de datos
      schema: 'public',
    },
    global: {
      // Headers optimizados
      headers: {
        'X-Client-Info': 'tenerife-paradise-tour',
      },
    },
    realtime: {
      // Configuración de realtime optimizada
      params: {
        eventsPerSecond: 10,
      },
    },
  })
}

// Función principal que siempre devuelve la misma instancia
export const getSupabaseClient = () => {
  if (!supabaseClient) {
    console.log('🔧 Creando nueva instancia de Supabase client')
    supabaseClient = createSupabaseClient()
  }
  return supabaseClient
}

// Función para limpiar el cliente (útil para testing)
export const clearSupabaseClient = () => {
  if (supabaseClient) {
    console.log('🧹 Limpiando instancia de Supabase client')
    supabaseClient = null
  }
}

// Función para verificar si el cliente existe
export const hasSupabaseClient = () => {
  return supabaseClient !== null
} 