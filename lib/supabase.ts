// DEPRECATED: Este archivo crea múltiples instancias de GoTrueClient
// Usar lib/supabase-optimized.ts en su lugar
import { getSupabaseClient } from './supabase-optimized'

// Re-exportar el cliente unificado
export const supabase = getSupabaseClient()

// Tipos de datos
export interface Category {
  id: string
  name: string
  description?: string
  created_at: string
}

export interface Subcategory {
  id: string
  name: string
  description?: string
  category_id: string
  created_at: string
}

export interface Service {
  id: string
  title: string
  description: string
  category_id: string
  subcategory_id?: string
  price: number
  price_type: "per_person" | "total"
  images?: string[]
  available: boolean
  featured: boolean
  duration?: number
  location?: string
  min_group_size?: number
  max_group_size?: number
  difficulty_level?: "facil" | "moderado" | "dificil"
  vehicle_type?: string
  characteristics?: string
  insurance_included?: boolean
  fuel_included?: boolean
  menu?: string
  schedule?: string[]
  capacity?: number
  dietary_options?: string[]
  min_age?: number
  license_required?: boolean
  permit_required?: boolean
  what_to_bring?: string[]
  included_services?: string[]
  not_included_services?: string[]
  meeting_point_details?: string
  transmission?: "manual" | "automatic"
  seats?: number
  doors?: number
  fuel_policy?: string
  pickup_locations?: string[]
  deposit_required?: boolean
  deposit_amount?: number
  experience_type?: string
  chef_name?: string
  drink_options?: string
  ambience?: string
  activity_type?: string
  fitness_level_required?: "bajo" | "medio" | "alto"
  equipment_provided?: string[]
  cancellation_policy?: string
  itinerary?: string
  guide_languages?: string[]
  created_at: string
  updated_at: string
  category?: Category
  subcategory?: Subcategory
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  phone?: string
  role: "user" | "admin"
  created_at: string
  updated_at: string
}

export interface Reservation {
  id: string
  user_id: string
  service_id: string
  date: string
  time: string
  participants: number
  total_price: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  payment_status: "pending" | "paid" | "failed" | "refunded"
  payment_id?: string
  special_requests?: string
  created_at: string
  updated_at: string
  service?: Service
  user?: Profile
}
