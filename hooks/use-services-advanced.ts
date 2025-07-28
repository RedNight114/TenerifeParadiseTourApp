"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { getSupabaseClient } from "@/lib/supabase-optimized"
import { useErrorHandler } from "@/components/advanced-error-handling"
import type { Service } from "@/lib/supabase"

interface UseServicesAdvancedReturn {
  // Datos
  services: Service[]
  categories: any[]
  subcategories: any[]
  
  // Estados de loading
  isLoading: boolean
  isInitialLoading: boolean
  isRefreshing: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  
  // Estados de error
  error: any
  hasError: boolean
  
  // Acciones
  fetchServices: (forceRefresh?: boolean) => Promise<void>
  fetchServiceById: (id: string) => Promise<Service | null>
  createService: (serviceData: Partial<Service>) => Promise<boolean>
  updateService: (id: string, serviceData: Partial<Service>) => Promise<boolean>
  deleteService: (id: string) => Promise<boolean>
  refreshServices: () => Promise<void>
  clearError: () => void
  
  // Utilidades
  getServiceById: (id: string) => Service | undefined
  getServicesByCategory: (categoryId: string) => Service[]
  getServicesBySubcategory: (subcategoryId: string) => Service[]
  searchServices: (query: string) => Service[]
  
  // Estadísticas
  totalServices: number
  servicesByCategory: Record<string, number>
  servicesByStatus: Record<string, number>
}

export function useServicesAdvanced(): UseServicesAdvancedReturn {
  // Estados de datos
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  
  // Estados de loading
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Cache y control
  const [lastFetch, setLastFetch] = useState<number>(0)
  const [cacheKey, setCacheKey] = useState<string>('')
  
  // Manejo de errores
  const { currentError, addError, dismissError } = useErrorHandler()
  
  // Configuración
  const CACHE_DURATION = 10 * 60 * 1000 // 10 minutos
  const MAX_RETRIES = 3
  const RETRY_DELAY = 2000 // 2 segundos

  // Función de retry con delay exponencial
  const retryWithDelay = useCallback(async <T>(
    operation: () => Promise<T>,
    retryCount = 0
  ): Promise<T> => {
    try {
      return await operation()
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        await new Promise(resolve => 
          setTimeout(resolve, RETRY_DELAY * Math.pow(2, retryCount))
        )
        return retryWithDelay(operation, retryCount + 1)
      }
      throw error
    }
  }, [])

  // Función principal para obtener servicios
  const fetchServices = useCallback(async (forceRefresh = false) => {
    try {
      const now = Date.now()
      
      // Verificar caché
      if (!forceRefresh && now - lastFetch < CACHE_DURATION && services.length > 0) {
        console.log('📦 Usando datos en caché')
        return
      }

      setIsLoading(true)
      setLastFetch(now)
      
      console.log('🔄 Obteniendo servicios desde la base de datos...')
      
      const client = getSupabaseClient()
      
      // Obtener servicios con relaciones
      const servicesResult = await retryWithDelay(async () => {
        return await client
          .from("services")
          .select(`
            *,
            category:categories(name, description),
            subcategory:subcategories(name, description)
          `)
          .order('created_at', { ascending: false })
      })

      if (servicesResult.error) {
        throw new Error(`Error obteniendo servicios: ${servicesResult.error.message}`)
      }

      // Obtener categorías
      const categoriesResult = await retryWithDelay(async () => {
        return await client
          .from("categories")
          .select("*")
          .order('name')
      })

      if (categoriesResult.error) {
        throw new Error(`Error obteniendo categorías: ${categoriesResult.error.message}`)
      }

      // Obtener subcategorías
      const subcategoriesResult = await retryWithDelay(async () => {
        return await client
          .from("subcategories")
          .select("*")
          .order('name')
      })

      if (subcategoriesResult.error) {
        throw new Error(`Error obteniendo subcategorías: ${subcategoriesResult.error.message}`)
      }

      // Actualizar estados
      setServices(servicesResult.data || [])
      setCategories(categoriesResult.data || [])
      setSubcategories(subcategoriesResult.data || [])
      
      // Limpiar errores si todo fue exitoso
      if (currentError) {
        dismissError()
      }
      
      console.log(`✅ ${servicesResult.data?.length || 0} servicios cargados exitosamente`)
      
    } catch (error: any) {
      console.error('❌ Error obteniendo servicios:', error)
      
      // Determinar tipo de error
      let errorType: 'network' | 'server' | 'auth' | 'validation' | 'unknown' = 'unknown'
      
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorType = 'network'
      } else if (error.message?.includes('auth') || error.message?.includes('permission')) {
        errorType = 'auth'
      } else if (error.message?.includes('validation')) {
        errorType = 'validation'
      } else if (error.message?.includes('server') || error.message?.includes('database')) {
        errorType = 'server'
      }
      
      addError({
        code: 'SERVICES_FETCH_ERROR',
        message: error.message || 'Error desconocido al cargar servicios',
        type: errorType,
        userAction: 'fetchServices'
      })
      
    } finally {
      setIsLoading(false)
      setIsInitialLoading(false)
    }
  }, [lastFetch, services.length, currentError, dismissError, addError, retryWithDelay])

  // Obtener servicio por ID
  const fetchServiceById = useCallback(async (id: string): Promise<Service | null> => {
    try {
      console.log('🔄 Obteniendo servicio específico:', id)
      
      const client = getSupabaseClient()
      const { data, error } = await retryWithDelay(() =>
        client
          .from("services")
          .select(`
            *,
            category:categories(name, description),
            subcategory:subcategories(name, description)
          `)
          .eq("id", id)
          .single()
      )

      if (error) {
        throw new Error(`Error obteniendo servicio: ${error.message}`)
      }

      return data
    } catch (error: any) {
      console.error('❌ Error obteniendo servicio:', error)
      addError({
        code: 'SERVICE_FETCH_ERROR',
        message: error.message || 'Error al obtener el servicio',
        type: 'server',
        userAction: 'fetchServiceById'
      })
      return null
    }
  }, [addError, retryWithDelay])

  // Crear servicio
  const createService = useCallback(async (serviceData: Partial<Service>): Promise<boolean> => {
    try {
      setIsCreating(true)
      console.log('🔄 Creando nuevo servicio...')
      
      const client = getSupabaseClient()
      const { error } = await retryWithDelay(() =>
        client.from("services").insert([serviceData])
      )

      if (error) {
        throw new Error(`Error creando servicio: ${error.message}`)
      }

      // Recargar servicios
      await fetchServices(true)
      
      console.log('✅ Servicio creado exitosamente')
      return true
      
    } catch (error: any) {
      console.error('❌ Error creando servicio:', error)
      addError({
        code: 'SERVICE_CREATE_ERROR',
        message: error.message || 'Error al crear el servicio',
        type: 'validation',
        userAction: 'createService'
      })
      return false
    } finally {
      setIsCreating(false)
    }
  }, [fetchServices, addError, retryWithDelay])

  // Actualizar servicio
  const updateService = useCallback(async (id: string, serviceData: Partial<Service>): Promise<boolean> => {
    try {
      setIsUpdating(true)
      console.log('🔄 Actualizando servicio:', id)
      
      const client = getSupabaseClient()
      const { error } = await retryWithDelay(() =>
        client.from("services").update(serviceData).eq("id", id)
      )

      if (error) {
        throw new Error(`Error actualizando servicio: ${error.message}`)
      }

      // Recargar servicios
      await fetchServices(true)
      
      console.log('✅ Servicio actualizado exitosamente')
      return true
      
    } catch (error: any) {
      console.error('❌ Error actualizando servicio:', error)
      addError({
        code: 'SERVICE_UPDATE_ERROR',
        message: error.message || 'Error al actualizar el servicio',
        type: 'validation',
        userAction: 'updateService'
      })
      return false
    } finally {
      setIsUpdating(false)
    }
  }, [fetchServices, addError, retryWithDelay])

  // Eliminar servicio
  const deleteService = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true)
      console.log('🗑️ Eliminando servicio:', id)
      
      const client = getSupabaseClient()
      
      // Verificar si el servicio existe
      const { data: existingService, error: fetchError } = await client
        .from("services")
        .select("id, title")
        .eq("id", id)
        .single()

      if (fetchError || !existingService) {
        throw new Error('Servicio no encontrado')
      }

      // Intentar usar la función SQL personalizada
      const { data: result, error: functionError } = await retryWithDelay(() =>
        client.rpc('delete_service_with_reservations', { service_id: id })
      )

      if (functionError) {
        console.log('⚠️ Error con función personalizada, intentando eliminación directa')
        
        // Fallback: intentar eliminar directamente
        const { error: deleteError } = await retryWithDelay(() =>
          client.from("services").delete().eq("id", id)
        )

        if (deleteError) {
          throw new Error(`Error eliminando servicio: ${deleteError.message}`)
        }
      }

      // Recargar servicios
      await fetchServices(true)
      
      console.log('✅ Servicio eliminado exitosamente')
      return true
      
    } catch (error: any) {
      console.error('❌ Error eliminando servicio:', error)
      addError({
        code: 'SERVICE_DELETE_ERROR',
        message: error.message || 'Error al eliminar el servicio',
        type: 'server',
        userAction: 'deleteService'
      })
      return false
    } finally {
      setIsDeleting(false)
    }
  }, [fetchServices, addError, retryWithDelay])

  // Refrescar servicios
  const refreshServices = useCallback(async () => {
    setIsRefreshing(true)
    await fetchServices(true)
    setIsRefreshing(false)
  }, [fetchServices])

  // Limpiar error
  const clearError = useCallback(() => {
    dismissError()
  }, [dismissError])

  // Utilidades
  const getServiceById = useCallback((id: string) => {
    return services.find(service => service.id === id)
  }, [services])

  const getServicesByCategory = useCallback((categoryId: string) => {
    return services.filter(service => service.category_id === categoryId)
  }, [services])

  const getServicesBySubcategory = useCallback((subcategoryId: string) => {
    return services.filter(service => service.subcategory_id === subcategoryId)
  }, [services])

  const searchServices = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase()
    return services.filter(service =>
      service.title?.toLowerCase().includes(lowerQuery) ||
      service.description?.toLowerCase().includes(lowerQuery) ||
      service.category?.name?.toLowerCase().includes(lowerQuery) ||
      service.subcategory?.name?.toLowerCase().includes(lowerQuery)
    )
  }, [services])

  // Estadísticas calculadas
  const totalServices = useMemo(() => services.length, [services])
  
  const servicesByCategory = useMemo(() => {
    return services.reduce((acc, service) => {
      const categoryName = service.category?.name || 'Sin categoría'
      acc[categoryName] = (acc[categoryName] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [services])
  
  const servicesByStatus = useMemo(() => {
    return services.reduce((acc, service) => {
      const status = service.status || 'inactive'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [services])

  // Cargar datos iniciales
  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  return {
    // Datos
    services,
    categories,
    subcategories,
    
    // Estados de loading
    isLoading,
    isInitialLoading,
    isRefreshing,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Estados de error
    error: currentError,
    hasError: !!currentError,
    
    // Acciones
    fetchServices,
    fetchServiceById,
    createService,
    updateService,
    deleteService,
    refreshServices,
    clearError,
    
    // Utilidades
    getServiceById,
    getServicesByCategory,
    getServicesBySubcategory,
    searchServices,
    
    // Estadísticas
    totalServices,
    servicesByCategory,
    servicesByStatus
  }
} 