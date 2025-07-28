"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
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
  
  // Control de operaciones en curso
  const isFetchingRef = useRef(false)
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Manejo de errores
  const { currentError, addError, dismissError, clearErrors } = useErrorHandler()
  
  // Configuración
  const CACHE_DURATION = 10 * 60 * 1000 // 10 minutos
  const MAX_RETRIES = 3
  const RETRY_DELAY = 2000 // 2 segundos
  const ERROR_TIMEOUT = 30 * 1000 // 30 segundos para limpiar errores automáticamente

  // Limpiar timeout de error
  const clearErrorTimeout = useCallback(() => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current)
      errorTimeoutRef.current = null
    }
  }, [])

  // Configurar timeout para limpiar error automáticamente
  const setErrorTimeout = useCallback(() => {
    clearErrorTimeout()
    errorTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Limpiando error automáticamente por timeout')
      dismissError()
    }, ERROR_TIMEOUT)
  }, [clearErrorTimeout, dismissError])

  // Limpiar error y timeout
  const clearErrorWithTimeout = useCallback(() => {
    clearErrorTimeout()
    dismissError()
  }, [clearErrorTimeout, dismissError])

  // Función de retry con delay exponencial
  const retryWithDelay = useCallback(async <T>(
    operation: () => Promise<T>,
    retryCount = 0
  ): Promise<T> => {
    try {
      const result = await operation()
      return result
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        console.log(`🔄 Reintento ${retryCount + 1}/${MAX_RETRIES} en ${RETRY_DELAY * Math.pow(2, retryCount)}ms`)
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
    // Evitar múltiples llamadas simultáneas
    if (isFetchingRef.current && !forceRefresh) {
      console.log('⚠️ Operación de fetch ya en curso, saltando...')
      return
    }

    try {
      const now = Date.now()
      
      // Verificar caché
      if (!forceRefresh && now - lastFetch < CACHE_DURATION && services.length > 0) {
        console.log('📦 Usando datos en caché')
        return
      }

      // Limpiar error existente al iniciar nueva operación
      if (currentError) {
        console.log('🧹 Limpiando error anterior para nueva operación')
        clearErrorWithTimeout()
      }

      isFetchingRef.current = true
      setIsLoading(true)
      setLastFetch(now)
      
      console.log('🔄 Obteniendo servicios desde la base de datos...')
      
      const client = getSupabaseClient()
      
      // Obtener servicios con relaciones
      const servicesResult = await retryWithDelay(async () => {
        const result = await client
          .from("services")
          .select(`
            *,
            category:categories(name, description),
            subcategory:subcategories(name, description)
          `)
          .order('created_at', { ascending: false })
        return result
      })

      if (servicesResult.error) {
        throw new Error(`Error obteniendo servicios: ${servicesResult.error.message}`)
      }

      // Obtener categorías
      const categoriesResult = await retryWithDelay(async () => {
        const result = await client
          .from("categories")
          .select("*")
          .order('name')
        return result
      })

      if (categoriesResult.error) {
        throw new Error(`Error obteniendo categorías: ${categoriesResult.error.message}`)
      }

      // Obtener subcategorías
      const subcategoriesResult = await retryWithDelay(async () => {
        const result = await client
          .from("subcategories")
          .select("*")
          .order('name')
        return result
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
        clearErrorWithTimeout()
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

      // Configurar timeout para limpiar error automáticamente
      setErrorTimeout()
      
    } finally {
      setIsLoading(false)
      setIsInitialLoading(false)
      isFetchingRef.current = false
    }
  }, [lastFetch, services.length, currentError, clearErrorWithTimeout, setErrorTimeout, addError, retryWithDelay])

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
          .eq('id', id)
          .single()
      )

      if (error) {
        throw new Error(`Error obteniendo servicio: ${error.message}`)
      }

      return data
    } catch (error: any) {
      console.error('❌ Error obteniendo servicio específico:', error)
      
      addError({
        code: 'SERVICE_FETCH_ERROR',
        message: error.message || 'Error al cargar el servicio',
        type: 'server',
        userAction: 'fetchServiceById'
      })

      setErrorTimeout()
      return null
    }
  }, [addError, setErrorTimeout, retryWithDelay])

  // Crear servicio
  const createService = useCallback(async (serviceData: Partial<Service>): Promise<boolean> => {
    try {
      setIsCreating(true)
      clearErrorWithTimeout()
      
      const client = getSupabaseClient()
      const { data, error } = await retryWithDelay(() =>
        client.from("services").insert(serviceData).select().single()
      )

      if (error) {
        throw new Error(`Error creando servicio: ${error.message}`)
      }

      // Actualizar lista de servicios
      setServices(prev => [data, ...prev])
      
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

      setErrorTimeout()
      return false
    } finally {
      setIsCreating(false)
    }
  }, [clearErrorWithTimeout, addError, setErrorTimeout, retryWithDelay])

  // Actualizar servicio
  const updateService = useCallback(async (id: string, serviceData: Partial<Service>): Promise<boolean> => {
    try {
      setIsUpdating(true)
      clearErrorWithTimeout()
      
      const client = getSupabaseClient()
      const { data, error } = await retryWithDelay(() =>
        client.from("services").update(serviceData).eq('id', id).select().single()
      )

      if (error) {
        throw new Error(`Error actualizando servicio: ${error.message}`)
      }

      // Actualizar servicio en la lista
      setServices(prev => prev.map(service => 
        service.id === id ? { ...service, ...data } : service
      ))
      
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

      setErrorTimeout()
      return false
    } finally {
      setIsUpdating(false)
    }
  }, [clearErrorWithTimeout, addError, setErrorTimeout, retryWithDelay])

  // Eliminar servicio
  const deleteService = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true)
      clearErrorWithTimeout()
      
      const client = getSupabaseClient()
      const { error } = await retryWithDelay(() =>
        client.from("services").delete().eq('id', id)
      )

      if (error) {
        throw new Error(`Error eliminando servicio: ${error.message}`)
      }

      // Remover servicio de la lista
      setServices(prev => prev.filter(service => service.id !== id))
      
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

      setErrorTimeout()
      return false
    } finally {
      setIsDeleting(false)
    }
  }, [clearErrorWithTimeout, addError, setErrorTimeout, retryWithDelay])

  // Refrescar servicios
  const refreshServices = useCallback(async () => {
    setIsRefreshing(true)
    await fetchServices(true)
    setIsRefreshing(false)
  }, [fetchServices])

  // Limpiar error
  const clearError = useCallback(() => {
    clearErrorWithTimeout()
  }, [clearErrorWithTimeout])

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

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      clearErrorTimeout()
    }
  }, [clearErrorTimeout])

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