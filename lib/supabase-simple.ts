// Cliente Supabase simplificado para debugging - Ahora usa el cliente unificado
import { getSupabaseClientSync } from './supabase-unified'

export function getSimpleSupabaseClient() {
  const client = getSupabaseClientSync()
  if (!client) {
    throw new Error('Cliente Supabase no disponible')
  }
  return client
}

export function resetSupabaseClient() {
  // La función reset ya no es necesaria con el cliente unificado
  // pero se mantiene para compatibilidad
  console.log('resetSupabaseClient: Función obsoleta con cliente unificado')
}
