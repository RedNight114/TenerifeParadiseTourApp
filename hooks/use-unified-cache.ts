"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { unifiedCache, cacheServices, cacheCategories, cacheUsers, cacheConversations, cacheAPI } from '@/lib/unified-cache-system'
import { getQueryConfig, TTL_CONFIG, CACHE_TAGS } from '@/lib/cache-config'
import { getSupabaseClient } from '@/lib/supabase-unified'
import type { Service, Category, Subcategory } from '@/lib/types'

// Configuración de TanStack Query centralizada
export const queryConfig = getQueryConfig()

// Tipos para las queries
interface QueryKeys {
  services: ['services']
  servicesByCategory: ['services', 'category', string]
  serviceById: ['services', 'id', string]
  categories: ['categories']
  subcategories: ['subcategories']
  userProfile: ['users', 'profile', string]
}

// Claves de query tipadas
export const queryKeys = {
  services: ['services'] as const,
  servicesByCategory: (categoryId: string) => ['services', 'category', categoryId] as const,
  serviceById: (id: string) => ['services', 'id', id] as const,
  categories: ['categories'] as const,
  subcategories: ['subcategories'] as const,
  userProfile: (userId: string) => ['users', 'profile', userId] as const,
}

// Hook para servicios con caché unificado
export function useServices() {
  return useQuery({
    queryKey: queryKeys.services,
    queryFn: async (): Promise<Service[]> => {
      // Intentar obtener del caché primero
      const cached = await cacheServices.get<Service[]>('all')
      if (cached) {
        return cached
      }

      // Si no está en caché, obtener de Supabase
      const supabase = await getSupabaseClient()
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          category:categories(id, name, description),
          subcategory:subcategories(id, name, description)
        `)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      if (!data) return []

      // Guardar en caché con TTL optimizado
      await cacheServices.set('all', data)

      return data
    },
    staleTime: TTL_CONFIG.SERVICES,
    gcTime: TTL_CONFIG.SERVICES * 2
  })
}

// Hook para servicios destacados
export function useFeaturedServices() {
  const { data: services, ...rest } = useServices()
  
  return {
    ...rest,
    data: services?.filter(service => service.featured).slice(0, 6) || [],
  }
}

// Hook para servicios por categoría
export function useServicesByCategory(categoryId: string) {
  return useQuery({
    queryKey: queryKeys.servicesByCategory(categoryId),
    queryFn: async (): Promise<Service[]> => {
      const cached = await cacheServices.get<Service[]>(`category:${categoryId}`)
      if (cached) {
        return cached
      }

      const supabase = await getSupabaseClient()
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          category:categories(id, name, description),
          subcategory:subcategories(id, name, description)
        `)
        .eq('category_id', categoryId)
        .order('featured', { ascending: false })

      if (error) throw error
      if (!data) return []

      await cacheServices.set(`category:${categoryId}`, data)
      return data
    },
    enabled: !!categoryId,
    staleTime: TTL_CONFIG.SERVICES,
    gcTime: TTL_CONFIG.SERVICES * 2,
  })
}

// Hook para servicio individual
export function useService(id: string) {
  return useQuery({
    queryKey: queryKeys.serviceById(id),
    queryFn: async (): Promise<Service | null> => {
      const cached = await cacheServices.get<Service>(`id:${id}`)
      if (cached) {
        return cached
      }

      const supabase = await getSupabaseClient()
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          category:categories(id, name, description),
          subcategory:subcategories(id, name, description)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) return null

      await cacheServices.set(`id:${id}`, data)
      return data
    },
    enabled: !!id,
    staleTime: TTL_CONFIG.SERVICES,
    gcTime: TTL_CONFIG.SERVICES * 2,
  })
}

// Hook para categorías
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async (): Promise<Category[]> => {
      const cached = await cacheCategories.get<Category[]>('all')
      if (cached) {
        return cached
      }

      const supabase = await getSupabaseClient()
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      if (!data) return []

      await cacheCategories.set('all', data)
      return data
    },
    staleTime: TTL_CONFIG.STATIC,
    gcTime: TTL_CONFIG.STATIC * 2,
  })
}

// Hook para subcategorías
export function useSubcategories() {
  return useQuery({
    queryKey: queryKeys.subcategories,
    queryFn: async (): Promise<Subcategory[]> => {
      const cached = await cacheCategories.get<Subcategory[]>('subcategories')
      if (cached) {
        return cached
      }

      const supabase = await getSupabaseClient()
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      if (!data) return []

      await cacheCategories.set('subcategories', data)
      return data
    },
    staleTime: TTL_CONFIG.STATIC,
    gcTime: TTL_CONFIG.STATIC * 2,
  })
}

// Hook para búsqueda de servicios
export function useServiceSearch(query: string) {
  const { data: services, ...rest } = useServices()
  
  return {
    ...rest,
    data: services?.filter(service => 
      service.title.toLowerCase().includes(query.toLowerCase()) ||
      service.description.toLowerCase().includes(query.toLowerCase()) ||
      service.location?.toLowerCase().includes(query.toLowerCase())
    ) || [],
  }
}

// Mutaciones para servicios
export function useServiceMutations() {
  const queryClient = useQueryClient()

  const createService = useMutation({
    mutationFn: async (serviceData: Partial<Service>) => {
      const supabase = await getSupabaseClient()
      const { data, error } = await supabase
        .from('services')
        .insert(serviceData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidar caché de servicios
      queryClient.invalidateQueries({ queryKey: queryKeys.services })
      cacheServices.invalidate()
    },
  })

  const updateService = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Service> }) => {
      const supabase = await getSupabaseClient()
      const { data: result, error } = await supabase
        .from('services')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: (data) => {
      // Actualizar caché específico
      queryClient.setQueryData(queryKeys.serviceById(data.id), data)
      queryClient.invalidateQueries({ queryKey: queryKeys.services })
      cacheServices.invalidatePattern(new RegExp(`id:${data.id}`))
    },
  })

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const supabase = await getSupabaseClient()
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, id) => {
      // Eliminar del caché
      queryClient.removeQueries({ queryKey: queryKeys.serviceById(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.services })
      cacheServices.invalidatePattern(new RegExp(`id:${id}`))
    },
  })

  return {
    createService,
    updateService,
    deleteService,
  }
}

// Hook para estadísticas del caché
export function useCacheStats() {
  return useQuery({
    queryKey: ['cache', 'stats'],
    queryFn: () => unifiedCache.getStats(),
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 30 * 1000, // Refrescar cada 30 segundos
  })
}

// Hook para gestión del caché
export function useCacheManagement() {
  const queryClient = useQueryClient()

  const clearCache = async () => {
    // Limpiar caché unificado
    unifiedCache.clear()
    
    // Limpiar caché de TanStack Query
    queryClient.clear()
    
    // Limpiar localStorage de cachés antiguos
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('tpt_') || 
        key.startsWith('tenerife-') ||
        key.includes('cache')
      )
      keys.forEach(key => localStorage.removeItem(key))
    }
  }

  const invalidateServices = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.services })
    cacheServices.invalidate()
  }

  const invalidateCategories = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.categories })
    queryClient.invalidateQueries({ queryKey: queryKeys.subcategories })
    cacheCategories.invalidate()
  }

  const invalidateAll = () => {
    queryClient.invalidateQueries()
    unifiedCache.clear()
  }

  return {
    clearCache,
    invalidateServices,
    invalidateCategories,
    invalidateAll,
  }
}

// Re-exportar hook de precarga optimizado
export { usePreloadCriticalData, usePreloadAllData } from './use-cache-preload'

// Hook para datos optimizados (reemplaza useOptimizedData)
export function useOptimizedData() {
  const services = useServices()
  const categories = useCategories()
  const subcategories = useSubcategories()

  return {
    data: {
      services: services.data || [],
      categories: categories.data || [],
      subcategories: subcategories.data || [],
      loading: services.isLoading || categories.isLoading || subcategories.isLoading,
      error: services.error || categories.error || subcategories.error,
      lastFetch: Date.now(),
      cacheHit: !services.isLoading && !categories.isLoading && !subcategories.isLoading,
    },
    isInitialized: services.isSuccess && categories.isSuccess && subcategories.isSuccess,
    refreshData: async () => {
      await Promise.all([
        services.refetch(),
        categories.refetch(),
        subcategories.refetch(),
      ])
    },
    getStats: () => unifiedCache.getStats(),
  }
}

export default {
  useServices,
  useFeaturedServices,
  useServicesByCategory,
  useService,
  useCategories,
  useSubcategories,
  useServiceSearch,
  useServiceMutations,
  useCacheStats,
  useCacheManagement,
  useOptimizedData,
}
