// Tipos de datos para Tenerife Paradise Tour
// Archivo separado para evitar dependencias circulares

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
  price_children?: number
  price_type: "per_person" | "total" | "age_ranges"
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
  precio_ninos?: number | null // Precio especial para niños
  edad_maxima_ninos?: number | null // Edad máxima para aplicar precio de niños
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

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  phone?: string
  role: "user" | "admin"
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  user_id: string
  service_id: string
  date: string
  time: string
  participants: number
  children?: number
  total_price: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  special_requests?: string
  created_at: string
  updated_at: string
  service?: Service
  user?: User
}

export interface Review {
  id: string
  user_id: string
  service_id: string
  rating: number
  comment?: string
  created_at: string
  updated_at: string
  user?: User
  service?: Service
}

export interface ContactForm {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: "new" | "read" | "replied" | "closed"
  created_at: string
  updated_at: string
}

export interface NewsletterSubscription {
  id: string
  email: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  order: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface Page {
  id: string
  title: string
  slug: string
  content: string
  meta_description?: string
  meta_keywords?: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface Setting {
  id: string
  key: string
  value: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  created_at: string
  updated_at: string
  user?: User
}

export interface Log {
  id: string
  level: "debug" | "info" | "warn" | "error"
  message: string
  context?: string
  user_id?: string
  ip_address?: string
  user_agent?: string
  created_at: string
  user?: User
}

export interface Reservation {
  id: string
  user_id: string
  service_id: string
  service?: Service
  date: string
  time: string
  guests: number
  total_price: number
  total_amount?: number
  status: string
  payment_status: string
  notes?: string
  location?: string
  created_at: string
  updated_at: string
}

