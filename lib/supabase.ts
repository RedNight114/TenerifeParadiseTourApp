// ✅ ACTUALIZADO: Usar el nuevo cliente Supabase unificado
// Este archivo mantiene compatibilidad con el código existente
import { getSupabaseClient, getSupabaseClientSync, supabaseClient } from './supabase-unified'

// Re-exportar el cliente unificado
export const supabase = supabaseClient

// Re-exportar las funciones helper
export { getSupabaseClient, getSupabaseClientSync }

// Función de fallback para compatibilidad
export function getSupabaseClientFallback() {
  try {
    return getSupabaseClientSync();
  } catch (error) {
    return null;
  }
}

// Re-exportar tipos desde el archivo separado
export type { 
  Service, 
  Category, 
  Subcategory, 
  Profile, 
  User, 
  Booking, 
  Review, 
  ContactForm, 
  NewsletterSubscription, 
  FAQ, 
  Page, 
  Setting, 
  Notification, 
  Log,
  Reservation
} from './types'

