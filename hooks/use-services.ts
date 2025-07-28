"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { getSupabaseClient } from "@/lib/supabase-optimized"
import type { Service } from "@/lib/supabase"

interface UseServicesReturn {
  services: Service[]
  loading: boolean
  error: string | null
  createService: (serviceData: Partial<Service>) => Promise<void>
  updateService: (id: string, serviceData: Partial<Service>) => Promise<void>
  deleteService: (id: string) => Promise<void>
  fetchServices: () => Promise<void>
  refreshServices: () => Promise<void>
  getFreshService: (id: string) => Promise<any>
  featuredServices: Service[]
  servicesByCategory: Record<string, Service[]>
}

export function useServices(): UseServicesReturn {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<number>(0)

  // Cache duration: 10 minutes (aumentado para mejor rendimiento)
  const CACHE_DURATION = 10 * 60 * 1000

  const fetchServices = useCallback(async (forceRefresh = false) => {
    try {
      const now = Date.now()
      
      // Check if we should use cached data
      if (!forceRefresh && services.length > 0 && (now - lastFetch) < CACHE_DURATION) {
        console.log('📦 Using cached services data')
        return
      }

      setLoading(true)
      setError(null)

      console.log('🔄 Fetching services from database...')

      const client = getSupabaseClient()
      const { data, error: fetchError } = await client
        .from("services")
        .select(`
          *,
          category:categories(name),
          subcategory:subcategories(name)
        `)
        .order("created_at", { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      if (data) {
        const processedServices: Service[] = data.map((item: any) => ({
          id: String(item.id),
          title: String(item.title),
          description: String(item.description),
          category_id: String(item.category_id),
          subcategory_id: item.subcategory_id ? String(item.subcategory_id) : undefined,
          price: Number(item.price),
          price_type: (item.price_type === 'per_person' || item.price_type === 'total') ? item.price_type : 'per_person',
          images: Array.isArray(item.images) ? item.images.map(String) : [],
          available: Boolean(item.available),
          featured: Boolean(item.featured),
          duration: item.duration !== undefined ? Number(item.duration) : undefined,
          location: item.location ? String(item.location) : undefined,
          min_group_size: item.min_group_size !== undefined ? Number(item.min_group_size) : undefined,
          max_group_size: item.max_group_size !== undefined ? Number(item.max_group_size) : undefined,
          difficulty_level: (item.difficulty_level === 'facil' || item.difficulty_level === 'moderado' || item.difficulty_level === 'dificil') ? item.difficulty_level : undefined,
          vehicle_type: item.vehicle_type ? String(item.vehicle_type) : undefined,
          characteristics: item.characteristics ? String(item.characteristics) : undefined,
          insurance_included: item.insurance_included !== undefined ? Boolean(item.insurance_included) : undefined,
          fuel_included: item.fuel_included !== undefined ? Boolean(item.fuel_included) : undefined,
          menu: item.menu ? String(item.menu) : undefined,
          schedule: Array.isArray(item.schedule) ? item.schedule.map(String) : undefined,
          capacity: item.capacity !== undefined ? Number(item.capacity) : undefined,
          dietary_options: Array.isArray(item.dietary_options) ? item.dietary_options.map(String) : undefined,
          min_age: item.min_age !== undefined ? Number(item.min_age) : undefined,
          license_required: item.license_required !== undefined ? Boolean(item.license_required) : undefined,
          permit_required: item.permit_required !== undefined ? Boolean(item.permit_required) : undefined,
          what_to_bring: Array.isArray(item.what_to_bring) ? item.what_to_bring.map(String) : undefined,
          included_services: Array.isArray(item.included_services) ? item.included_services.map(String) : undefined,
          not_included_services: Array.isArray(item.not_included_services) ? item.not_included_services.map(String) : undefined,
          meeting_point_details: item.meeting_point_details ? String(item.meeting_point_details) : undefined,
          transmission: (item.transmission === 'manual' || item.transmission === 'automatic') ? item.transmission : undefined,
          seats: item.seats !== undefined ? Number(item.seats) : undefined,
          doors: item.doors !== undefined ? Number(item.doors) : undefined,
          fuel_policy: item.fuel_policy ? String(item.fuel_policy) : undefined,
          pickup_locations: Array.isArray(item.pickup_locations) ? item.pickup_locations.map(String) : undefined,
          deposit_required: item.deposit_required !== undefined ? Boolean(item.deposit_required) : undefined,
          deposit_amount: item.deposit_amount !== undefined ? Number(item.deposit_amount) : undefined,
          experience_type: item.experience_type ? String(item.experience_type) : undefined,
          chef_name: item.chef_name ? String(item.chef_name) : undefined,
          drink_options: item.drink_options ? String(item.drink_options) : undefined,
          ambience: item.ambience ? String(item.ambience) : undefined,
          activity_type: item.activity_type ? String(item.activity_type) : undefined,
          fitness_level_required: (item.fitness_level_required === 'bajo' || item.fitness_level_required === 'medio' || item.fitness_level_required === 'alto') ? item.fitness_level_required : undefined,
          equipment_provided: Array.isArray(item.equipment_provided) ? item.equipment_provided.map(String) : undefined,
          cancellation_policy: item.cancellation_policy ? String(item.cancellation_policy) : undefined,
          itinerary: item.itinerary ? String(item.itinerary) : undefined,
          guide_languages: Array.isArray(item.guide_languages) ? item.guide_languages.map(String) : undefined,
          created_at: String(item.created_at),
          updated_at: String(item.updated_at),
          category: (typeof item.category === 'object' && item.category !== null) ? item.category as any : undefined,
          subcategory: (typeof item.subcategory === 'object' && item.subcategory !== null) ? item.subcategory as any : undefined
        }))

        setServices(processedServices)
        setLastFetch(now)
        console.log(`✅ ${processedServices.length} services loaded`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error fetching services"
      setError(errorMessage)
      console.error('❌ Error fetching services:', err)
    } finally {
      setLoading(false)
    }
  }, [services.length, lastFetch])

  // Función para refrescar datos desde la base de datos
  const refreshServices = useCallback(async () => {
    console.log('🔄 Refrescando servicios desde la base de datos...')
    await fetchServices(true)
  }, [fetchServices])

  // Función para obtener un servicio específico con datos frescos
  const getFreshService = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔄 Obteniendo servicio fresco desde la base de datos:', id)

      const client = getSupabaseClient()
      const { data, error: fetchError } = await client
        .from("services")
        .select('*')
        .eq("id", id)
        .single()

      if (fetchError) {
        throw fetchError
      }

      if (data) {
        // Actualizar el servicio en el estado local
        const freshService: Service = {
          id: String(data.id),
          title: String(data.title),
          description: String(data.description),
          category_id: String(data.category_id),
          subcategory_id: data.subcategory_id ? String(data.subcategory_id) : undefined,
          price: Number(data.price),
          price_type: (data.price_type === 'per_person' || data.price_type === 'total') ? data.price_type : 'per_person',
          images: Array.isArray(data.images) ? data.images.map(String) : [],
          available: Boolean(data.available),
          featured: Boolean(data.featured),
          duration: data.duration !== undefined ? Number(data.duration) : undefined,
          location: data.location ? String(data.location) : undefined,
          min_group_size: data.min_group_size !== undefined ? Number(data.min_group_size) : undefined,
          max_group_size: data.max_group_size !== undefined ? Number(data.max_group_size) : undefined,
          difficulty_level: (data.difficulty_level === 'facil' || data.difficulty_level === 'moderado' || data.difficulty_level === 'dificil') ? data.difficulty_level : undefined,
          vehicle_type: data.vehicle_type ? String(data.vehicle_type) : undefined,
          characteristics: data.characteristics ? String(data.characteristics) : undefined,
          insurance_included: data.insurance_included !== undefined ? Boolean(data.insurance_included) : undefined,
          fuel_included: data.fuel_included !== undefined ? Boolean(data.fuel_included) : undefined,
          menu: data.menu ? String(data.menu) : undefined,
          schedule: Array.isArray(data.schedule) ? data.schedule.map(String) : undefined,
          capacity: data.capacity !== undefined ? Number(data.capacity) : undefined,
          dietary_options: Array.isArray(data.dietary_options) ? data.dietary_options.map(String) : undefined,
          min_age: data.min_age !== undefined ? Number(data.min_age) : undefined,
          license_required: data.license_required !== undefined ? Boolean(data.license_required) : undefined,
          permit_required: data.permit_required !== undefined ? Boolean(data.permit_required) : undefined,
          what_to_bring: Array.isArray(data.what_to_bring) ? data.what_to_bring.map(String) : undefined,
          included_services: Array.isArray(data.included_services) ? data.included_services.map(String) : undefined,
          not_included_services: Array.isArray(data.not_included_services) ? data.not_included_services.map(String) : undefined,
          meeting_point_details: data.meeting_point_details ? String(data.meeting_point_details) : undefined,
          transmission: (data.transmission === 'manual' || data.transmission === 'automatic') ? data.transmission : undefined,
          seats: data.seats !== undefined ? Number(data.seats) : undefined,
          doors: data.doors !== undefined ? Number(data.doors) : undefined,
          fuel_policy: data.fuel_policy ? String(data.fuel_policy) : undefined,
          pickup_locations: Array.isArray(data.pickup_locations) ? data.pickup_locations.map(String) : undefined,
          deposit_required: data.deposit_required !== undefined ? Boolean(data.deposit_required) : undefined,
          deposit_amount: data.deposit_amount !== undefined ? Number(data.deposit_amount) : undefined,
          experience_type: data.experience_type ? String(data.experience_type) : undefined,
          chef_name: data.chef_name ? String(data.chef_name) : undefined,
          drink_options: data.drink_options ? String(data.drink_options) : undefined,
          ambience: data.ambience ? String(data.ambience) : undefined,
          activity_type: data.activity_type ? String(data.activity_type) : undefined,
          fitness_level_required: (data.fitness_level_required === 'bajo' || data.fitness_level_required === 'medio' || data.fitness_level_required === 'alto') ? data.fitness_level_required : undefined,
          equipment_provided: Array.isArray(data.equipment_provided) ? data.equipment_provided.map(String) : undefined,
          cancellation_policy: data.cancellation_policy ? String(data.cancellation_policy) : undefined,
          itinerary: data.itinerary ? String(data.itinerary) : undefined,
          guide_languages: Array.isArray(data.guide_languages) ? data.guide_languages.map(String) : undefined,
          created_at: String(data.created_at),
          updated_at: String(data.updated_at),
          category: (typeof data.category === 'object' && data.category !== null) ? data.category as any : undefined,
          subcategory: (typeof data.subcategory === 'object' && data.subcategory !== null) ? data.subcategory as any : undefined
        }

        setServices((prev) => prev.map((service) => (service.id === id ? freshService : service)))
        console.log('✅ Servicio actualizado en el estado local:', freshService)
      }

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error fetching fresh service"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createService = useCallback(async (serviceData: Partial<Service>) => {
    try {
      setError(null)
      const client = getSupabaseClient()
      const { error } = await client.from("services").insert([serviceData])
      if (error) throw error
      await fetchServices(true) // Refresh after creation
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error creating service"
      setError(errorMessage)
      throw err
    }
  }, [fetchServices])

  const updateService = useCallback(async (id: string, serviceData: Partial<Service>) => {
    try {
      setError(null)
      const client = getSupabaseClient()
      const { error } = await client.from("services").update(serviceData).eq("id", id)
      if (error) throw error
      await fetchServices(true) // Refresh after update
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error updating service"
      setError(errorMessage)
      throw err
    }
  }, [fetchServices])

  const deleteService = useCallback(async (id: string) => {
    try {
      setError(null)
      console.log('🗑️ Intentando eliminar servicio:', id)
      
      // Primero verificar si el servicio existe
      const client = getSupabaseClient()
      const { data: existingService, error: fetchError } = await client
        .from("services")
        .select("id, title")
        .eq("id", id)
        .single()

      if (fetchError) {
        throw new Error(`Servicio no encontrado: ${fetchError.message}`)
      }

      if (!existingService) {
        throw new Error("Servicio no encontrado")
      }

      console.log('✅ Servicio encontrado:', existingService.title)

      // Intentar usar la función SQL personalizada primero
      const { data: result, error: functionError } = await client
        .rpc('delete_service_with_reservations', { service_id: id })

      if (functionError) {
        console.log('⚠️ Función SQL no disponible, intentando eliminación directa...')
        
        // Fallback: intentar eliminar directamente
        const { error: deleteError } = await client
          .from("services")
          .delete()
          .eq("id", id)

        if (deleteError) {
          console.error('❌ Error de eliminación:', deleteError)
          
          // Analizar el tipo de error
          if (deleteError.code === '42501') {
            throw new Error('No tienes permisos para eliminar servicios. Contacta al administrador.')
          } else if (deleteError.code === '23503') {
            throw new Error('No se puede eliminar el servicio porque tiene reservas asociadas. Ejecuta el script SQL para configurar eliminación en cascada.')
          } else if (deleteError.code === 'PGRST116') {
            throw new Error('Error de autenticación. Por favor, inicia sesión nuevamente.')
          } else {
            throw new Error(`Error al eliminar: ${deleteError.message}`)
          }
        }
      } else {
        console.log('✅ Resultado de eliminación:', result)
        
        // Verificar si hubo error en la función SQL
        if (typeof result === 'string' && result.startsWith('Error:')) {
          throw new Error(result)
        }
      }

      console.log('✅ Servicio eliminado exitosamente')
      await fetchServices(true) // Refresh after deletion
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error deleting service"
      setError(errorMessage)
      console.error('❌ Error en deleteService:', err)
      throw err
    }
  }, [fetchServices])

  // Memoized computed values
  const featuredServices = useMemo(() => 
    services.filter((s) => s.featured).slice(0, 6), 
    [services]
  )

  const servicesByCategory = useMemo(() => {
    const grouped: Record<string, Service[]> = {}
    services.forEach(service => {
      const category = service.category_id
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(service)
    })
    return grouped
  }, [services])

  // Prefetch services on mount para mejor rendimiento
  useEffect(() => {
    const prefetchServices = async () => {
      if (services.length === 0) {
        await fetchServices()
      }
    }
    
    prefetchServices()
  }, []) // Solo se ejecuta una vez al montar

  return {
    services,
    loading,
    error,
    createService,
    updateService,
    deleteService,
    fetchServices,
    refreshServices,
    getFreshService,
    featuredServices,
    servicesByCategory
  }
}
