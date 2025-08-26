import { useState, useEffect, useCallback, useMemo } from 'react'
import { getSupabaseClient } from '@/lib/supabase-optimized'
import type { Service } from '@/lib/supabase'

export interface UseServicesReturn {
  services: Service[]
  loading: boolean
  error: string | null
  featuredServices: Service[]
  servicesByCategory: Record<string, Service[]>
  refreshServices: () => Promise<void>
}

export function useServicesSimpleFixed(): UseServicesReturn {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  // Función para cargar servicios
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const supabaseClient = getSupabaseClient()
      const client = await supabaseClient.getClient()
      
      if (!client) {
        throw new Error('No se pudo inicializar el cliente de Supabase')
      }

      const { data, error: fetchError } = await client
        .from('services')
        .select(`
          id,
          title,
          description,
          category_id,
          subcategory_id,
          price,
          price_children,
          price_type,
          images,
          available,
          featured,
          duration,
          location,
          min_group_size,
          max_group_size,
          difficulty_level,
          vehicle_type,
          characteristics,
          insurance_included,
          fuel_included,
          menu,
          schedule,
          capacity,
          dietary_options,
          min_age,
          license_required,
          permit_required,
          what_to_bring,
          included_services,
          not_included_services,
          meeting_point_details,
          transmission,
          seats,
          doors,
          fuel_policy,
          pickup_locations,
          deposit_required,
          deposit_amount,
          experience_type,
          chef_name,
          drink_options,
          ambience,
          activity_type,
          created_at,
          updated_at,
          category:categories(id, name, description),
          subcategory:subcategories(id, name, description)
        `)
        .eq('available', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw new Error(`Error obteniendo servicios: ${fetchError.message}`)
      }

      if (data) {
        const processedServices = data.map((service: any) => ({
          id: service.id,
          title: service.title || '',
          description: service.description || '',
          price: service.price || 0,
          price_children: service.price_children || 0,
          price_type: service.price_type || 'per_person',
          images: Array.isArray(service.images) ? service.images : [],
          available: service.available || false,
          featured: service.featured || false,
          duration: service.duration || '',
          location: service.location || '',
          category_id: service.category_id,
          subcategory_id: service.subcategory_id,
          category: service.category,
          subcategory: service.subcategory,
          created_at: service.created_at || new Date().toISOString(),
          updated_at: service.updated_at || new Date().toISOString()
        }))

        setServices(processedServices)
        setHasLoaded(true)
      } else {
        setServices([])
        setHasLoaded(true)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
setHasLoaded(true)
    } finally {
      setLoading(false)
    }
  }, [])

  // Función para refrescar servicios
  const refreshServices = useCallback(async () => {
    await fetchServices()
  }, [fetchServices])

  // Carga inicial
  useEffect(() => {
    if (!hasLoaded) {
      fetchServices()
    }
  }, [fetchServices, hasLoaded])

  // Memoización de servicios destacados
  const featuredServices = useMemo(() => {
    return services.filter(service => service.featured).slice(0, 6)
  }, [services])

  // Memoización de servicios por categoría
  const servicesByCategory = useMemo(() => {
    const grouped: Record<string, Service[]> = {}
    services.forEach(service => {
      const categoryId = service.category_id || 'uncategorized'
      if (!grouped[categoryId]) {
        grouped[categoryId] = []
      }
      grouped[categoryId].push(service)
    })
    return grouped
  }, [services])

  return {
    services,
    loading,
    error,
    featuredServices,
    servicesByCategory,
    refreshServices
  }
}

