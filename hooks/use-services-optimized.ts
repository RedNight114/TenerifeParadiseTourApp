"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { getSupabaseClient } from "@/lib/supabase-optimized"
import type { Service, Category, Subcategory } from "@/lib/supabase"
import { logError, logInfo, logDebug, logPerformance, logWarn } from '@/lib/logger';

interface UseServicesOptimizedReturn {
  services: Service[]
  loading: boolean
  error: string | null
  featuredServices: Service[]
  servicesByCategory: Record<string, Service[]>
  refreshServices: () => Promise<void>
  getServiceById: (id: string) => Service | undefined
  searchServices: (query: string) => Service[]
  totalServices: number
  isInitialLoading: boolean
  fetchServices: () => Promise<void>
  fetchServiceById: (id: string) => Promise<Service | undefined>
  createService: (service: Partial<Service>) => Promise<void>
  updateService: (id: string, service: Partial<Service>) => Promise<void>
  deleteService: (id: string) => Promise<void>
}

// Cache global optimizado con TTL y prefetch
const globalCache = {
  services: [] as Service[],
  lastFetch: 0,
  isFetching: false,
  promise: null as Promise<void> | null,
  categories: [] as Category[],
  subcategories: [] as Subcategory[],
  // Nuevo: Cache de servicios procesados
  processedServices: new Map<string, Service>(),
}

// Configuración de caché optimizada para mejor rendimiento
const CACHE_CONFIG = {
  TTL: 5 * 60 * 1000, // 5 minutos (reducido para datos más frescos)
  PRELOAD_THRESHOLD: 0.7, // Preload cuando el caché esté al 70% de expiración
  BATCH_SIZE: 20, // Tamaño de lote reducido para mejor responsividad
  RETRY_ATTEMPTS: 2, // Reducido para fallback más rápido
  RETRY_DELAY: 500, // Reducido para mejor UX
  LAZY_LOAD_THRESHOLD: 10, // Número de servicios para lazy loading
}

// Función optimizada para procesar servicios en lotes más pequeños
const processServicesBatch = (data: unknown[]): Service[] => {
  const processed: Service[] = []
  
  // Procesar en lotes más pequeños para mejor responsividad
  for (let i = 0; i < data.length; i += CACHE_CONFIG.BATCH_SIZE) {
    const batch = data.slice(i, i + CACHE_CONFIG.BATCH_SIZE)
    
    for (const item of batch) {
      if (!item || typeof item !== 'object') continue
      
      const serviceItem = item as Record<string, unknown>
      
      try {
        const service: Service = {
          id: String(serviceItem.id),
          title: String(serviceItem.title || ''),
          description: String(serviceItem.description || ''),
          category_id: String(serviceItem.category_id || ''),
          subcategory_id: serviceItem.subcategory_id ? String(serviceItem.subcategory_id) : undefined,
          price: Number(serviceItem.price) || 0,
          price_children: serviceItem.price_children !== undefined ? Number(serviceItem.price_children) : undefined,
          price_type: (serviceItem.price_type === 'per_person' || serviceItem.price_type === 'total') ? serviceItem.price_type : 'per_person',
          images: Array.isArray(serviceItem.images) ? serviceItem.images.map(String) : [],
          available: Boolean(serviceItem.available),
          featured: Boolean(serviceItem.featured),
          duration: serviceItem.duration !== undefined ? Number(serviceItem.duration) : undefined,
          location: serviceItem.location ? String(serviceItem.location) : undefined,
          min_group_size: serviceItem.min_group_size !== undefined ? Number(serviceItem.min_group_size) : undefined,
          max_group_size: serviceItem.max_group_size !== undefined ? Number(serviceItem.max_group_size) : undefined,
          difficulty_level: (serviceItem.difficulty_level === 'facil' || serviceItem.difficulty_level === 'moderado' || serviceItem.difficulty_level === 'dificil') ? serviceItem.difficulty_level : undefined,
          vehicle_type: serviceItem.vehicle_type ? String(serviceItem.vehicle_type) : undefined,
          characteristics: serviceItem.characteristics ? String(serviceItem.characteristics) : undefined,
          insurance_included: serviceItem.insurance_included !== undefined ? Boolean(serviceItem.insurance_included) : undefined,
          fuel_included: serviceItem.fuel_included !== undefined ? Boolean(serviceItem.fuel_included) : undefined,
          menu: serviceItem.menu ? String(serviceItem.menu) : undefined,
          schedule: Array.isArray(serviceItem.schedule) ? serviceItem.schedule.map(String) : undefined,
          capacity: serviceItem.capacity !== undefined ? Number(serviceItem.capacity) : undefined,
          dietary_options: Array.isArray(serviceItem.dietary_options) ? serviceItem.dietary_options.map(String) : undefined,
          min_age: serviceItem.min_age !== undefined ? Number(serviceItem.min_age) : undefined,
          license_required: serviceItem.license_required !== undefined ? Boolean(serviceItem.license_required) : undefined,
          permit_required: serviceItem.permit_required !== undefined ? Boolean(serviceItem.permit_required) : undefined,
          what_to_bring: Array.isArray(serviceItem.what_to_bring) ? serviceItem.what_to_bring.map(String) : undefined,
          included_services: Array.isArray(serviceItem.included_services) ? serviceItem.included_services.map(String) : undefined,
          not_included_services: Array.isArray(serviceItem.not_included_services) ? serviceItem.not_included_services.map(String) : undefined,
          meeting_point_details: serviceItem.meeting_point_details ? String(serviceItem.meeting_point_details) : undefined,
          transmission: (serviceItem.transmission === 'manual' || serviceItem.transmission === 'automatic') ? serviceItem.transmission : undefined,
          seats: serviceItem.seats !== undefined ? Number(serviceItem.seats) : undefined,
          doors: serviceItem.doors !== undefined ? Number(serviceItem.doors) : undefined,
          fuel_policy: serviceItem.fuel_policy ? String(serviceItem.fuel_policy) : undefined,
          pickup_locations: Array.isArray(serviceItem.pickup_locations) ? serviceItem.pickup_locations.map(String) : undefined,
          deposit_required: serviceItem.deposit_required !== undefined ? Boolean(serviceItem.deposit_required) : undefined,
          deposit_amount: serviceItem.deposit_amount !== undefined ? Number(serviceItem.deposit_amount) : undefined,
          experience_type: serviceItem.experience_type ? String(serviceItem.experience_type) : undefined,
          chef_name: serviceItem.chef_name ? String(serviceItem.chef_name) : undefined,
          drink_options: serviceItem.drink_options ? String(serviceItem.drink_options) : undefined,
          ambience: serviceItem.ambience ? String(serviceItem.ambience) : undefined,
          activity_type: serviceItem.activity_type ? String(serviceItem.activity_type) : undefined,
          created_at: String(serviceItem.created_at || new Date().toISOString()),
          updated_at: String(serviceItem.updated_at || new Date().toISOString()),
          category: serviceItem.category ? (serviceItem.category as Category) : undefined,
          subcategory: serviceItem.subcategory ? (serviceItem.subcategory as Subcategory) : undefined,
        }
        
        processed.push(service)
        // Cache individual del servicio
        globalCache.processedServices.set(service.id, service)
        
      } catch (error) {
continue
      }
    }
  }
  
  return processed
}

// Función de retry optimizada con backoff exponencial
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  attempts: number = CACHE_CONFIG.RETRY_ATTEMPTS
): Promise<T> => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === attempts - 1) throw error
      
              const delay = CACHE_CONFIG.RETRY_DELAY * Math.pow(2, i)
        if (process.env.NODE_ENV === 'development') {
}
        await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error('Max retry attempts reached')
}

export function useServicesOptimized(): UseServicesOptimizedReturn {
  // Log solo en desarrollo y solo una vez
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {

}
  }, [])
  
  const [services, setServices] = useState<Service[]>(globalCache.services)
  // Corregir la lógica de estado inicial - solo mostrar loading si no hay datos y no hay fetch en curso
  const [loading, setLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(globalCache.services.length === 0 && !globalCache.isFetching)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)
  const prefetchTimeoutRef = useRef<NodeJS.Timeout>()
  const initialLoadTimeoutRef = useRef<NodeJS.Timeout>()

  // Función optimizada para cargar servicios con lazy loading
  const fetchServices = useCallback(async (forceRefresh = false) => {
    const startTime = performance.now();
    
    try {
      // Verificar si ya hay una petición en curso
      if (loading) {
        logDebug('Ya hay una petición en curso, esperando...');
        return;
      }

      // Verificar cache si no se fuerza refresh
      if (!forceRefresh && services.length > 0 && Date.now() - globalCache.lastFetch < CACHE_CONFIG.TTL) {
        const cacheAge = Date.now() - globalCache.lastFetch;
        
        if (cacheAge < CACHE_CONFIG.TTL) {
          logDebug('Usando datos del cache', { cacheAge: Math.round(cacheAge / 1000) });
          return;
        }
      }

      setLoading(true);
      setError(null);

      // Programar prefetch para la siguiente carga
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }

      // Esperar a que termine la petición existente
      if (globalCache.promise) {
        logDebug('Esperando a que termine la petición existente...');
        await globalCache.promise;
        return;
      }

      // Crear nueva promesa de petición
      globalCache.promise = (async () => {
        try {
          logInfo('Iniciando nueva petición a la base de datos');
          
          const supabase = getSupabaseClient()
          if (!supabase) {
            throw new Error("No se pudo obtener el cliente de Supabase")
          }

          const client = await supabase.getClient()
          if (!client) {
            throw new Error("No se pudo inicializar el cliente de Supabase")
          }

          // Query optimizada con select específico y ordenamiento
          const { data, error: fetchError } = await retryWithBackoff(async () => {
            return await client
              .from("services")
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
              .order('featured', { ascending: false })
              .order('created_at', { ascending: false })
              .limit(100) // Limitar para mejor rendimiento
          })

          if (fetchError) {
            throw new Error(`Error fetching services: ${fetchError.message}`)
          }

          if (!data || data.length === 0) {
            logInfo('No se encontraron servicios');
            globalCache.services = []
            globalCache.lastFetch = Date.now()
            if (mountedRef.current) {
              setServices([])
              setLoading(false)
              setIsInitialLoading(false)
            }
            return
          }

          // Procesar datos en lotes para mejor responsividad
          logDebug(`Procesando ${data.length} servicios...`);
          const processedServices = processServicesBatch(data)
          
          const endTime = performance.now()
          logPerformance('Procesamiento de servicios', endTime - startTime, { count: processedServices.length });

          // Actualizar caché global
          globalCache.services = processedServices
          globalCache.lastFetch = Date.now()

          if (mountedRef.current) {
            setServices(processedServices)
            setLoading(false)
            setIsInitialLoading(false)
          }

        } catch (error) {
          logError('Error obteniendo servicios', error);
          if (mountedRef.current) {
            setError(error instanceof Error ? error.message : 'Error desconocido')
            setLoading(false)
            setIsInitialLoading(false)
          }
        } finally {
          globalCache.isFetching = false
          globalCache.promise = null
        }
      })()

      await globalCache.promise

    } catch (error) {
      logError('Error en fetchServices', error);
      if (mountedRef.current) {
        setError(error instanceof Error ? error.message : 'Error desconocido')
        setLoading(false)
        setIsInitialLoading(false)
      }
    } finally {
      const totalTime = performance.now() - startTime;
      logPerformance('Fetch completo de servicios', totalTime);
    }
  }, [])

  // Carga inicial optimizada con timeout
  useEffect(() => {
    const loadInitialData = async () => {
      // Si ya hay datos en caché, usarlos inmediatamente
      if (globalCache.services.length > 0) {
        logDebug('Usando datos del cache inmediatamente');
        if (mountedRef.current) {
          setServices(globalCache.services)
          setLoading(false)
          setIsInitialLoading(false)
        }
        
        // Refrescar en background si el caché es antiguo
        const cacheAge = Date.now() - globalCache.lastFetch
        if (cacheAge > CACHE_CONFIG.TTL * 0.5) {
          setTimeout(() => {
            if (mountedRef.current) {
              fetchServices(true)
            }
          }, 100)
        }
        return
      }

      // Si no hay datos, iniciar carga
      logInfo('No hay datos en cache, iniciando carga inicial...');
      setIsInitialLoading(true)
      
      // Timeout más agresivo para evitar carga infinita
      initialLoadTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current && isInitialLoading) {
          logWarn('⚠️ Initial load timeout reached, stopping loading state');
          setIsInitialLoading(false)
          setLoading(false)
          // Mostrar servicios vacíos en lugar de quedarse en loading
          setServices([])
        }
      }, 5000) // Reducido a 5 segundos

      try {
        await fetchServices()
      } catch (error) {
        logError('Error en carga inicial', error);
        if (mountedRef.current) {
          setIsInitialLoading(false)
          setLoading(false)
          setError(error instanceof Error ? error.message : 'Error desconocido')
        }
      } finally {
        if (initialLoadTimeoutRef.current) {
          clearTimeout(initialLoadTimeoutRef.current)
        }
      }
    }

    loadInitialData()

    return () => {
      if (initialLoadTimeoutRef.current) {
        clearTimeout(initialLoadTimeoutRef.current)
      }
    }
  }, []) // Removida la dependencia fetchServices para evitar re-ejecuciones

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current)
      }
      if (initialLoadTimeoutRef.current) {
        clearTimeout(initialLoadTimeoutRef.current)
      }
    }
  }, [])

  // Memoización optimizada de servicios destacados
  const featuredServices = useMemo(() => {
    return services.filter(service => service.featured).slice(0, 6)
  }, [services])

  // Memoización optimizada de servicios por categoría
  const servicesByCategory = useMemo(() => {
    const grouped: Record<string, Service[]> = {}
    services.forEach(service => {
      const categoryId = service.category_id
      if (!grouped[categoryId]) {
        grouped[categoryId] = []
      }
      grouped[categoryId].push(service)
    })
    return grouped
  }, [services])

  // Función optimizada para obtener servicio por ID
  const getServiceById = useCallback((id: string): Service | undefined => {
    // Primero buscar en caché individual
    const cached = globalCache.processedServices.get(id)
    if (cached) return cached
    
    // Luego buscar en servicios cargados
    return services.find(service => service.id === id)
  }, [services])

  // Función optimizada para buscar servicios
  const searchServices = useCallback((query: string): Service[] => {
    if (!query.trim()) return services
    
    const searchTerm = query.toLowerCase()
    return services.filter(service => 
      service.title.toLowerCase().includes(searchTerm) ||
      service.description.toLowerCase().includes(searchTerm) ||
      service.location?.toLowerCase().includes(searchTerm)
    )
  }, [services])

  // Función para refrescar servicios
  const refreshServices = useCallback(async () => {
    await fetchServices(true)
  }, [fetchServices])

  // Funciones CRUD optimizadas
  const fetchServiceById = useCallback(async (id: string): Promise<Service | undefined> => {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) throw new Error("No se pudo obtener el cliente de Supabase")

      const client = await supabase.getClient()
      if (!client) throw new Error("No se pudo inicializar el cliente de Supabase")

      const { data, error } = await client
        .from("services")
        .select(`
          *,
          category:categories(id, name, description),
          subcategory:subcategories(id, name, description)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) return undefined

      const service = processServicesBatch([data])[0]
      return service
    } catch (error) {
      logError('Error obteniendo servicio por ID', error);
      return undefined
    }
  }, [])

  const createService = useCallback(async (serviceData: Partial<Service>) => {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) throw new Error("No se pudo obtener el cliente de Supabase")

      const client = await supabase.getClient()
      if (!client) throw new Error("No se pudo inicializar el cliente de Supabase")

      const { error } = await client
        .from("services")
        .insert(serviceData)

      if (error) throw error
      
      // Refrescar caché
      await refreshServices()
    } catch (error) {
      logError('Error creando servicio', error);
      throw error
    }
  }, [refreshServices])

  const updateService = useCallback(async (id: string, serviceData: Partial<Service>) => {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) throw new Error("No se pudo obtener el cliente de Supabase")

      const client = await supabase.getClient()
      if (!client) throw new Error("No se pudo inicializar el cliente de Supabase")

      const { error } = await client
        .from("services")
        .update(serviceData)
        .eq('id', id)

      if (error) throw error
      
      // Actualizar caché individual
      globalCache.processedServices.delete(id)
      
      // Refrescar caché
      await refreshServices()
    } catch (error) {
      logError('Error actualizando servicio', error);
      throw error
    }
  }, [refreshServices])

  const deleteService = useCallback(async (id: string) => {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) throw new Error("No se pudo obtener el cliente de Supabase")

      const client = await supabase.getClient()
      if (!client) throw new Error("No se pudo inicializar el cliente de Supabase")

      const { error } = await client
        .from("services")
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Limpiar caché individual
      globalCache.processedServices.delete(id)
      
      // Refrescar caché
      await refreshServices()
    } catch (error) {
      logError('Error eliminando servicio', error);
      throw error
    }
  }, [refreshServices])

  return {
    services,
    loading,
    error,
    featuredServices,
    servicesByCategory,
    refreshServices,
    getServiceById,
    searchServices,
    totalServices: services.length,
    isInitialLoading,
    fetchServices,
    fetchServiceById,
    createService,
    updateService,
    deleteService,
  }
} 
