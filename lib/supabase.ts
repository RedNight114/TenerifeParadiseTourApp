// ✅ ACTUALIZADO: Usar el nuevo cliente Supabase optimizado
// Este archivo mantiene compatibilidad con el código existente
import { getSupabaseClient, supabaseClient } from './supabase-client'

// Re-exportar el cliente optimizado
export const supabase = supabaseClient

// Re-exportar la función getSupabaseClient
export { getSupabaseClient }

// Función de fallback para compatibilidad
export function getSupabaseClientFallback() {
  try {
    return getSupabaseClient();
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

