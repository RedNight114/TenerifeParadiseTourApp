"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { getSupabaseClient } from "@/lib/supabase-optimized"
import type { Service } from "@/lib/supabase"

interface UseServicesSimpleReturn {
  services: Service[]
  loading: boolean
  error: string | null
  featuredServices: Service[]
  servicesByCategory: Record<string, Service[]>
  refreshServices: () => Promise<void>
  totalServices: number
}

export function useServicesSimple(): UseServicesSimpleReturn {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const supabaseClient = getSupabaseClient()
      const supabase = await supabaseClient.getClient()
      
      if (!supabase) {
        throw new Error('No se pudo obtener el cliente de Supabase')
      }

      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          category:categories(name, description),
          subcategory:subcategories(name, description)
        `)
        .eq('available', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setServices(data || [])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(errorMessage)
} finally {
      setLoading(false)
    }
  }, [])

  // Carga inicial
  useEffect(() => {
    fetchServices()
  }, []) // Removida la dependencia fetchServices para evitar bucle infinito

  // Servicios destacados
  const featuredServices = services.filter(service => service.featured).slice(0, 6)

  // Servicios por categoría
  const servicesByCategory = services.reduce((acc, service) => {
    const categoryId = service.category_id
    if (!acc[categoryId]) {
      acc[categoryId] = []
    }
    acc[categoryId].push(service)
    return acc
  }, {} as Record<string, Service[]>)

  // Log solo en desarrollo y solo cuando cambian los datos importantes
  const prevServicesCount = useRef(services.length)
  const prevLoading = useRef(loading)
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && 
        (prevServicesCount.current !== services.length || prevLoading.current !== loading)) {
prevServicesCount.current = services.length
      prevLoading.current = loading
    }
  }, [services.length, loading, error, featuredServices.length])

  return {
    services,
    loading,
    error,
    featuredServices,
    servicesByCategory,
    refreshServices: fetchServices,
    totalServices: services.length
  }
}


