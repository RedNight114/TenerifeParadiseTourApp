"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { getSupabaseClient } from '@/lib/supabase-optimized'
import type { Service } from "@/lib/supabase"

// Event emitter global para sincronización
class GlobalDataEmitter {
  private listeners: Set<(data: any) => void> = new Set()
  private _data: any = {
    services: [],
    categories: [],
    subcategories: [],
    loading: false,
    error: null,
    lastFetch: 0
  }
  private isFetching = false
  
  // ✅ NUEVO: Getter público para acceder a los datos
  get data() {
    return this._data
  }

  subscribe(listener: (data: any) => void) {
    this.listeners.add(listener)
    
    // Solo enviar datos si ya están cargados
    if (this._data.services.length > 0 || this._data.categories.length > 0) {
      listener(this._data)
    }
    
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify(data: any) {
    this._data = { ...this._data, ...data }
    
    // Notificar a todos los listeners
    const notifyListeners = () => {
      this.listeners.forEach((listener) => {
        try {
          listener(this._data)
        } catch (error) {
}
      })
    }
    
    // Notificar inmediatamente
    notifyListeners()
    
    // Notificar de nuevo después de un breve delay para asegurar recepción
    setTimeout(() => {
      if (this.listeners.size > 0) {
        notifyListeners()
      }
    }, 500)
  }

  async fetchData(forceRefresh = false) {
    // Sistema de cola para múltiples peticiones
    if (this.isFetching && !forceRefresh) {
      // Esperar a que termine la petición actual
      return new Promise<void>((resolve) => {
        const checkComplete = () => {
          if (!this.isFetching) {
            resolve()
          } else {
            setTimeout(checkComplete, 100)
          }
        }
        checkComplete()
      })
    }

    // ✅ NUEVO: Timeout de seguridad para evitar peticiones infinitas
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout de petición')), 15000) // 15 segundos
    })

    // Verificar cache
    const now = Date.now()
    const cacheAge = now - this._data.lastFetch
    
    if (!forceRefresh && 
        this._data.services.length > 0 && 
        this._data.categories.length > 0 && 
        this._data.subcategories.length > 0 && 
        cacheAge < 5 * 60 * 1000) { // 5 minutos
      return
    }
    


    this.isFetching = true
    this.notify({ loading: true, error: null })

    try {
      // ✅ NUEVO: Usar Promise.race para implementar timeout
      const fetchPromise = this.performFetch()
      await Promise.race([fetchPromise, timeoutPromise])
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
this.notify({ 
        loading: false, 
        error: errorMessage 
      })
    } finally {
      this.isFetching = false
    }
  }

  // ✅ NUEVO: Método separado para realizar la petición
  async performFetch() {
    // Usar el cliente optimizado existente
    const supabaseClient = getSupabaseClient()
    const supabase = await supabaseClient.getClient()

    if (!supabase) {
      throw new Error('No se pudo obtener el cliente de Supabase')
    }

    // Cargar datos en paralelo
    const [categoriesResult, subcategoriesResult, servicesResult] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('subcategories').select('*').order('name'),
      supabase.from('services').select(`
        *,
        category:categories(id, name, description),
        subcategory:subcategories(id, name, description)
      `).eq('available', true).order('featured', { ascending: false }).order('created_at', { ascending: false })
    ])

          // Verificar errores
      if (categoriesResult.error) throw categoriesResult.error
      if (subcategoriesResult.error) throw subcategoriesResult.error
      if (servicesResult.error) throw servicesResult.error

      const newData = {
        services: servicesResult.data || [],
        categories: categoriesResult.data || [],
        subcategories: subcategoriesResult.data || [],
        lastFetch: Date.now(),
        loading: false,
        error: null
      }



      // Notificar con todos los datos nuevos
      this.notify(newData)
  }

  clearCache() {
    this.notify({
      services: [],
      categories: [],
      subcategories: [],
      lastFetch: 0,
      loading: false,
      error: null
    })
    // Forzar nueva carga
    this.fetchData(true)
  }
}

// Instancia global única
const globalEmitter = new GlobalDataEmitter()



interface UseUnifiedDataReturn {
  services: Service[]
  categories: any[]
  subcategories: any[]
  loading: boolean
  error: string | null
  featuredServices: Service[]
  servicesByCategory: Record<string, Service[]>
  refreshData: () => Promise<void>
  clearCache: () => void
  totalServices: number
  getServiceById: (id: string) => Service | undefined
  getSubcategoriesByCategory: (categoryId: string) => any[]
  isInitialized: boolean
}

export function useUnifiedData(): UseUnifiedDataReturn {
  const [data, setData] = useState({
    services: [] as Service[],
    categories: [] as any[],
    subcategories: [] as any[],
    loading: true,
    error: null as string | null,
    lastFetch: 0
  })
  
  // ✅ NUEVO: Estado para controlar si ya se configuró la suscripción
  const [isInitialized, setIsInitialized] = useState(false)

  const mountedRef = useRef(true)

  useEffect(() => {
    // Función para manejar la suscripción
    const setupSubscription = () => {
      const unsubscribe = globalEmitter.subscribe((newData) => {
        if (mountedRef.current) {
          setData(newData)
          // Solo marcar como inicializado si tenemos tanto servicios como categorías
          if (newData.services.length > 0 && newData.categories.length > 0) {
            setIsInitialized(true)
          }
        }
      })
      
      return unsubscribe
    }
    
    // Primero suscribirse, luego cargar datos
    const unsubscribe = setupSubscription()
    
    // Después de suscribirse, cargar datos si es necesario
    const loadDataIfNeeded = async () => {
      try {
        // Siempre cargar datos si no tenemos categorías
        if (globalEmitter.data.categories.length === 0) {
          await globalEmitter.fetchData()
        } else if (globalEmitter.data.services.length === 0) {
          await globalEmitter.fetchData()
        }
      } catch (error) {
}
    }
    
    // Cargar datos de forma no bloqueante
    loadDataIfNeeded()
    
    // Fallback: asegurar que los datos se carguen después de un breve delay
    const fallbackTimer = setTimeout(() => {
      if (mountedRef.current && (globalEmitter.data.services.length === 0 || globalEmitter.data.categories.length === 0)) {
        globalEmitter.fetchData()
      }
    }, 1000)
    
    // Forzar carga inmediata si no hay categorías
    if (globalEmitter.data.categories.length === 0) {
      globalEmitter.fetchData()
    }

    // Timeout de seguridad para evitar carga infinita
    const safetyTimer = setTimeout(() => {
      if (mountedRef.current && data.loading) {
        setData(prev => ({ ...prev, loading: false, error: 'Timeout de carga' }))
        // Solo marcar como inicializado si tenemos datos
        if (data.services.length > 0 || data.categories.length > 0) {
          setIsInitialized(true)
        }
      }
    }, 10000) // 10 segundos máximo

    return () => {
      mountedRef.current = false
      unsubscribe()
      clearTimeout(fallbackTimer)
      clearTimeout(safetyTimer)
    }
  }, [])

  const refreshData = useCallback(async () => {
    await globalEmitter.fetchData(true)
  }, [])

  const clearCache = useCallback(() => {
    globalEmitter.clearCache()
  }, [])

  // Servicios destacados (memoizado)
  const featuredServices = useMemo(() => 
    data.services.filter(service => service.featured).slice(0, 6), 
    [data.services]
  )

  // Servicios por categoría (memoizado)
  const servicesByCategory = useMemo(() => 
    data.services.reduce((acc, service) => {
      const categoryId = service.category_id
      if (!acc[categoryId]) {
        acc[categoryId] = []
      }
      acc[categoryId].push(service)
      return acc
    }, {} as Record<string, Service[]>), 
    [data.services]
  )

  // Función para obtener servicio por ID
  const getServiceById = useCallback((id: string) => 
    data.services.find(service => service.id === id), 
    [data.services]
  )

  // Función para obtener subcategorías por categoría
  const getSubcategoriesByCategory = useCallback((categoryId: string) => 
    data.subcategories.filter(sub => sub.category_id === categoryId), 
    [data.subcategories]
  )



  return {
    services: data.services,
    categories: data.categories,
    subcategories: data.subcategories,
    loading: data.loading,
    error: data.error,
    featuredServices,
    servicesByCategory,
    refreshData,
    clearCache,
    totalServices: data.services.length,
    getServiceById,
    getSubcategoriesByCategory,
    isInitialized
  }
}

