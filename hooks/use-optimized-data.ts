"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { supabaseClient } from '@/lib/supabase-client'
import type { Service, Category, Subcategory } from "@/lib/types"

// Tipos de datos optimizados
interface OptimizedData {
  services: Service[]
  categories: Category[]
  subcategories: Subcategory[]
  loading: boolean
  error: string | null
  lastFetch: number
  cacheHit: boolean
}

// Configuración del hook
interface UseOptimizedDataConfig {
  enableCache: boolean
  cacheTTL: number
  enableBackgroundRefresh: boolean
  maxRetries: number
  retryDelay: number
}

// Estado del hook
interface UseOptimizedDataState {
  data: OptimizedData
  isInitialized: boolean
  refreshData: (forceRefresh?: boolean) => Promise<void>
  getStats: () => any
}

export function useOptimizedData(
  config: Partial<UseOptimizedDataConfig> = {}
): UseOptimizedDataState {
  // Configuración por defecto
  const defaultConfig: UseOptimizedDataConfig = {
    enableCache: true,
    cacheTTL: 30 * 60 * 1000, // 30 minutos
    enableBackgroundRefresh: true,
    maxRetries: 3,
    retryDelay: 1000,
    ...config
  }

  // Estado del hook
  const [data, setData] = useState<OptimizedData>({
    services: [],
    categories: [],
    subcategories: [],
    loading: false,
    error: null,
    lastFetch: 0,
    cacheHit: false
  })

  const [isInitialized, setIsInitialized] = useState(false)
  
  // Referencias para control de peticiones
  const abortController = useRef<AbortController | null>(null)
  const lastFetchTime = useRef(0)
  const isFetching = useRef(false)
  const retryCount = useRef(0)
  const backgroundRefreshTimer = useRef<NodeJS.Timeout | null>(null)

  // Verificar si necesitamos hacer fetch
  const shouldFetch = useCallback((forceRefresh: boolean = false): boolean => {
    const now = Date.now()
    const cacheAge = now - lastFetchTime.current
    
    // Siempre hacer fetch si se fuerza
    if (forceRefresh) return true
    
    // Hacer fetch si no hay datos o el caché expiró
    if (data.services.length === 0 || 
        data.categories.length === 0 || 
        data.subcategories.length === 0) {
      return true
    }
    
    // Hacer fetch si el caché expiró
    if (cacheAge > defaultConfig.cacheTTL) {
      return true
    }
    
    return false
  }, [data.services.length, data.categories.length, data.subcategories.length, defaultConfig.cacheTTL])

  // Función principal de fetch de datos
  const fetchData = useCallback(async (forceRefresh: boolean = false) => {
    // Evitar peticiones simultáneas
    if (isFetching.current && !forceRefresh) {
return
    }

    // Verificar si necesitamos hacer fetch
    if (!shouldFetch(forceRefresh)) {
setData(prev => ({ ...prev, cacheHit: true }))
      return
    }

    // Cancelar petición anterior si existe
    if (abortController.current) {
      abortController.current.abort()
    }

    abortController.current = new AbortController()
    isFetching.current = true
    retryCount.current = 0
    
    setData(prev => ({ 
      ...prev, 
      loading: true, 
      error: null, 
      cacheHit: false 
    }))

    try {
// Fetch paralelo optimizado con timeout
      const fetchWithTimeout = async (promise: Promise<any>, timeout: number) => {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), timeout)
        })
        return Promise.race([promise, timeoutPromise])
      }

      const timeout = 15000 // 15 segundos
const [servicesData, categoriesData, subcategoriesData] = await Promise.allSettled([
         fetchWithTimeout(
           supabaseClient.query('services', { 
             select: '*',
             order: { column: 'featured', ascending: false },
             cacheTTL: defaultConfig.cacheTTL
           }),
           timeout
         ),
         fetchWithTimeout(
           supabaseClient.query('categories', { 
             select: '*',
             order: { column: 'name', ascending: true },
             cacheTTL: defaultConfig.cacheTTL
           }),
           timeout
         ),
         fetchWithTimeout(
           supabaseClient.query('subcategories', { 
             select: '*',
             order: { column: 'name', ascending: true },
             cacheTTL: defaultConfig.cacheTTL
           }),
           timeout
         )
       ])

             // Log detallado de cada consulta



// Procesar resultados
       const newData = {
         services: servicesData.status === 'fulfilled' ? servicesData.value : [],
         categories: categoriesData.status === 'fulfilled' ? categoriesData.value : [],
         subcategories: subcategoriesData.status === 'fulfilled' ? subcategoriesData.value : []
       }

             // Log para debuggear la estructura de datos
       if (newData.services.length > 0) {
         console.log('Estructura de servicios:', {
           sample: newData.services[0]
         })
       }
       
       if (newData.categories.length > 0) {
         console.log('Estructura de categorías:', {
           sample: newData.categories[0]
         })
       }

      // Verificar que al menos los servicios se cargaron correctamente
      if (newData.services.length === 0 && servicesData.status === 'rejected') {
        const errorMessage = servicesData.reason?.message || 'Error desconocido'
        throw new Error(`Error cargando servicios: ${errorMessage}`)
      }

      // Actualizar estado
      setData(prev => ({
        ...prev,
        ...newData,
        loading: false,
        error: null,
        lastFetch: Date.now(),
        cacheHit: false
      }))

      lastFetchTime.current = Date.now()
      setIsInitialized(true)
      retryCount.current = 0
      
      // Configurar refresh en segundo plano si está habilitado
      if (defaultConfig.enableBackgroundRefresh) {
        setupBackgroundRefresh()
      }

    } catch (error: unknown) {
      // Reintentar si no hemos excedido el máximo de reintentos
      if (retryCount.current < defaultConfig.maxRetries) {
        retryCount.current++
        setTimeout(() => {
          fetchData(forceRefresh)
        }, defaultConfig.retryDelay * retryCount.current)
        
        return
      }

      // Error final después de todos los reintentos
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido cargando datos',
        cacheHit: false
      }))
    } finally {
      isFetching.current = false
    }
  }, [shouldFetch, defaultConfig.cacheTTL, defaultConfig.maxRetries, defaultConfig.retryDelay])

  // Configurar refresh en segundo plano
  const setupBackgroundRefresh = useCallback(() => {
    if (backgroundRefreshTimer.current) {
      clearTimeout(backgroundRefreshTimer.current)
    }

    // Refresh cada 10 minutos en segundo plano
    backgroundRefreshTimer.current = setTimeout(() => {
      if (document.visibilityState === 'visible') {
fetchData(false) // No forzar refresh
      }
    }, 10 * 60 * 1000) // 10 minutos
  }, [fetchData])

  // Función de refresh público
  const refreshData = useCallback(async (forceRefresh: boolean = false) => {
    console.log(`Refreshing data${forceRefresh ? ' (forced)' : ''}`)
    await fetchData(forceRefresh)
  }, [fetchData])

  // Obtener estadísticas del hook
  const getStats = useCallback(() => {
    const now = Date.now()
    const cacheAge = now - lastFetchTime.current
    
    return {
      isInitialized,
      isFetching: isFetching.current,
      retryCount: retryCount.current,
      cacheAge: Math.round(cacheAge / 1000), // en segundos
      dataAge: Math.round((now - data.lastFetch) / 1000), // en segundos
      cacheHit: data.cacheHit,
      servicesCount: data.services.length,
      categoriesCount: data.categories.length,
      subcategoriesCount: data.subcategories.length,
      lastFetch: new Date(lastFetchTime.current).toISOString(),
      supabaseStats: supabaseClient.getStats()
    }
  }, [isInitialized, data, lastFetchTime])

  // Efecto inicial
  useEffect(() => {
fetchData()
    
    return () => {
      // Cleanup al desmontar
      if (abortController.current) {
        abortController.current.abort()
      }
      if (backgroundRefreshTimer.current) {
        clearTimeout(backgroundRefreshTimer.current)
      }
    }
  }, []) // Solo se ejecuta una vez al montar

  // Efecto para refresh en segundo plano cuando la página se vuelve visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isInitialized) {
        const now = Date.now()
        const cacheAge = now - lastFetchTime.current
        
        // Refresh si han pasado más de 5 minutos desde la última carga
        if (cacheAge > 5 * 60 * 1000) {
fetchData(false)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isInitialized, fetchData])

  // Memoizar datos para evitar re-renderizados innecesarios
  const memoizedData = useMemo(() => data, [
    data.services.length,
    data.categories.length,
    data.subcategories.length,
    data.loading,
    data.error,
    data.cacheHit
  ])

  return {
    data: memoizedData,
    isInitialized,
    refreshData,
    getStats
  }
}

// Hook especializado para servicios
export function useOptimizedServices() {
  const { data, isInitialized, refreshData, getStats } = useOptimizedData({
    cacheTTL: 15 * 60 * 1000, // 15 minutos para servicios
    enableBackgroundRefresh: true
  })

  return {
    services: data.services,
    loading: data.loading,
    error: data.error,
    isInitialized,
    refreshServices: refreshData,
    getStats
  }
}

// Hook especializado para categorías
export function useOptimizedCategories() {
  const { data, isInitialized, refreshData, getStats } = useOptimizedData({
    cacheTTL: 60 * 60 * 1000, // 1 hora para categorías
    enableBackgroundRefresh: false
  })

  return {
    categories: data.categories,
    subcategories: data.subcategories,
    loading: data.loading,
    error: data.error,
    isInitialized,
    refreshCategories: refreshData,
    getStats
  }
}

// Hook para datos específicos de un servicio
export function useOptimizedService(serviceId: string) {
  const { data, isInitialized, refreshData, getStats } = useOptimizedData({
    cacheTTL: 10 * 60 * 1000, // 10 minutos para servicios individuales
    enableBackgroundRefresh: false
  })

  const service = useMemo(() => 
    data.services.find(s => s.id === serviceId),
    [data.services, serviceId]
  )

  return {
    service,
    loading: data.loading,
    error: data.error,
    isInitialized,
    refreshService: refreshData,
    getStats
  }
}

