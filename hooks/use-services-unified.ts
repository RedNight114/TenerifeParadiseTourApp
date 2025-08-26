"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { getSupabaseClient } from "@/lib/supabase-optimized"
import type { Service } from "@/lib/supabase"

// Cache global para evitar múltiples peticiones
const globalCache = {
  services: [] as Service[],
  lastFetch: 0,
  isFetching: false,
  promise: null as Promise<void> | null
}

const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

interface UseServicesUnifiedReturn {
  services: Service[]
  loading: boolean
  error: string | null
  featuredServices: Service[]
  servicesByCategory: Record<string, Service[]>
  refreshServices: () => Promise<void>
  totalServices: number
}

export function useServicesUnified(): UseServicesUnifiedReturn {
  const [services, setServices] = useState<Service[]>(globalCache.services)
  const [loading, setLoading] = useState(globalCache.services.length === 0)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const fetchServices = useCallback(async (forceRefresh = false) => {
    // Evitar múltiples peticiones simultáneas
    if (globalCache.isFetching && !forceRefresh) {
      if (globalCache.promise) {
        await globalCache.promise
      }
      return
    }

    // Usar cache si está disponible y fresco
    const now = Date.now()
    const cacheAge = now - globalCache.lastFetch
    
    if (!forceRefresh && globalCache.services.length > 0 && cacheAge < CACHE_TTL) {
      if (mountedRef.current) {
        setServices(globalCache.services)
        setLoading(false)
        setError(null)
      }
      return
    }

    // Marcar como fetching
    globalCache.isFetching = true
    
    try {
      if (mountedRef.current) {
        setLoading(true)
        setError(null)
      }

      // Crear promesa global para evitar duplicados
      globalCache.promise = (async () => {
        const supabaseClient = getSupabaseClient()
        const supabase = await supabaseClient.getClient()
        
        if (!supabase) {
          throw new Error('No se pudo obtener el cliente de Supabase')
        }

        const { data, error: fetchError } = await supabase
          .from('services')
          .select(`
            *,
            category:categories(id, name, description),
            subcategory:subcategories(id, name, description)
          `)
          .eq('available', true)
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false })

        if (fetchError) {
          throw fetchError
        }

        // Actualizar cache global
        globalCache.services = data || []
        globalCache.lastFetch = Date.now()
        globalCache.isFetching = false
        globalCache.promise = null

        if (mountedRef.current) {
          setServices(globalCache.services)
          setLoading(false)
          setError(null)
        }
      })()

      await globalCache.promise

    } catch (error) {
      globalCache.isFetching = false
      globalCache.promise = null
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      
      if (mountedRef.current) {
        setError(errorMessage)
        setLoading(false)
      }
      
      // Solo log en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching services:', errorMessage)
      }
    }
  }, [])

  // Carga inicial
  useEffect(() => {
    fetchServices()
    
    // Cleanup
    return () => {
      mountedRef.current = false
    }
  }, [fetchServices])

  // Servicios destacados (memoizado)
  const featuredServices = services.filter(service => service.featured).slice(0, 6)

  // Servicios por categoría (memoizado)
  const servicesByCategory = services.reduce((acc, service) => {
    const categoryId = service.category_id
    if (!acc[categoryId]) {
      acc[categoryId] = []
    }
    acc[categoryId].push(service)
    return acc
  }, {} as Record<string, Service[]>)

  // Log solo cuando cambian datos importantes - CON THROTTLING
  const prevServicesCount = useRef(services.length)
  const prevLoading = useRef(loading)
  const lastLogTime = useRef(0)
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && 
        (prevServicesCount.current !== services.length || prevLoading.current !== loading)) {
      // Usar throttling para evitar logs excesivos
      if (Date.now() - lastLogTime.current > 10000) { // 10 segundos
        console.log('Services hook update:', {
          count: services.length,
          loading,
          error,
          featured: featuredServices.length,
          cacheAge: Math.round((Date.now() - globalCache.lastFetch) / 1000)
        })
        lastLogTime.current = Date.now()
      }
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
    refreshServices: () => fetchServices(true),
    totalServices: services.length
  }
}


