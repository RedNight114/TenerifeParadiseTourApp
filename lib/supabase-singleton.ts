// Cliente Supabase Singleton - Evita múltiples instancias
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Verificar variables de entorno
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables de entorno de Supabase requeridas')
}

// Cliente singleton - solo se crea una vez
let supabaseClient: SupabaseClient | null = null

// Función para obtener el cliente Supabase (Singleton pattern)
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    // Crear cliente solo si no existe
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': 'tenerife-paradise-tour-singleton'
        }
      }
    })
  }
  
  return supabaseClient
}

// Función para limpiar el cliente (útil para testing)
export function cleanupSupabaseClient() {
  if (supabaseClient) {
    // Cerrar conexiones si es necesario
    supabaseClient = null
  }
}

// Función para verificar si existe una instancia
export function hasSupabaseClient(): boolean {
  return supabaseClient !== null
}

// Exportar el cliente directamente para compatibilidad
export const supabase = getSupabaseClient()
