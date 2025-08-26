"use client"

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { getSupabaseClient } from "@/lib/supabase-optimized"
import type { Service } from "@/lib/supabase"

interface UseUnifiedDataQueryReturn {
  services: Service[]
  categories: any[]
  subcategories: any[]
  loading: boolean
  error: string | null
  featuredServices: Service[]
  servicesByCategory: Record<string, Service[]>
  refreshData: () => Promise<void>
  totalServices: number
  getServiceById: (id: string) => Service | undefined
  getSubcategoriesByCategory: (categoryId: string) => any[]
  searchServices: (query: string) => Service[]
  filterByCategory: (categoryId: string) => Service[]
  filterByPrice: (minPrice: number, maxPrice: number) => Service[]
  filterByDuration: (minDuration: number, maxDuration: number) => Service[]
  // Mutaciones para actualizar datos
  updateService: (serviceId: string, updates: Partial<Service>) => Promise<void>
  deleteService: (serviceId: string) => Promise<void>
  createService: (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
}

// Función para obtener datos unificados
const fetchUnifiedData = async () => {
  const supabaseClient = getSupabaseClient()
  const supabase = await supabaseClient.getClient()
  
  if (!supabase) {
    throw new Error('No se pudo obtener el cliente de Supabase')
  }

  // UNA SOLA PETICIÓN para obtener todo
  const { data: servicesData, error: servicesError } = await supabase
    .from('services')
    .select(`
      *,
      category:categories(id, name, description),
      subcategory:subcategories(id, name, description)
    `)
    .eq('available', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (servicesError) {
    throw servicesError
  }

  // Extraer categorías y subcategorías únicas de los servicios
  const uniqueCategories = new Map()
  const uniqueSubcategories = new Map()

  servicesData?.forEach((service: any) => {
    if (service.category && !uniqueCategories.has(service.category.id)) {
      uniqueCategories.set(service.category.id, service.category)
    }
    if (service.subcategory && !uniqueSubcategories.has(service.subcategory.id)) {
      uniqueSubcategories.set(service.subcategory.id, service.subcategory)
    }
  })

  return {
    services: servicesData || [],
    categories: Array.from(uniqueCategories.values()),
    subcategories: Array.from(uniqueSubcategories.values())
  }
}

export function useUnifiedDataQuery(): UseUnifiedDataQueryReturn {
  const queryClient = useQueryClient()

  // Query principal para datos unificados
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['unified-data'],
    queryFn: fetchUnifiedData,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos (antes cacheTime)
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })

  // Mutación para actualizar servicio
  const updateServiceMutation = useMutation({
    mutationFn: async ({ serviceId, updates }: { serviceId: string, updates: Partial<Service> }) => {
      const supabaseClient = getSupabaseClient()
      const supabase = await supabaseClient.getClient()
      
      if (!supabase) {
        throw new Error('No se pudo obtener el cliente de Supabase')
      }

      const { error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', serviceId)

      if (error) throw error
    },
    onSuccess: () => {
      // Invalidar cache para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['unified-data'] })
    }
  })

  // Mutación para eliminar servicio
  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const supabaseClient = getSupabaseClient()
      const supabase = await supabaseClient.getClient()
      
      if (!supabase) {
        throw new Error('No se pudo obtener el cliente de Supabase')
      }

      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-data'] })
    }
  })

  // Mutación para crear servicio
  const createServiceMutation = useMutation({
    mutationFn: async (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => {
      const supabaseClient = getSupabaseClient()
      const supabase = await supabaseClient.getClient()
      
      if (!supabase) {
        throw new Error('No se pudo obtener el cliente de Supabase')
      }

      const { error } = await supabase
        .from('services')
        .insert(service)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-data'] })
    }
  })

  // Datos por defecto
  const services = data?.services || []
  const categories = data?.categories || []
  const subcategories = data?.subcategories || []

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

  // Función para obtener servicio por ID
  const getServiceById = (id: string) => 
    services.find(service => service.id === id)

  // Función para obtener subcategorías por categoría
  const getSubcategoriesByCategory = (categoryId: string) => 
    subcategories.filter(sub => sub.category_id === categoryId)

  // Funciones de búsqueda y filtrado optimizadas
  const searchServices = (query: string) => {
    if (!query.trim()) return services
    
    const searchLower = query.toLowerCase()
    return services.filter(service =>
      service.title.toLowerCase().includes(searchLower) ||
      service.description.toLowerCase().includes(searchLower) ||
      service.location?.toLowerCase().includes(searchLower) ||
      service.characteristics?.toLowerCase().includes(searchLower)
    )
  }

  const filterByCategory = (categoryId: string) => 
    services.filter(service => service.category_id === categoryId)

  const filterByPrice = (minPrice: number, maxPrice: number) => 
    services.filter(service => 
      service.price >= minPrice && service.price <= maxPrice
    )

  const filterByDuration = (minDuration: number, maxDuration: number) => 
    services.filter(service => 
      service.duration && 
      service.duration >= minDuration && 
      service.duration <= maxDuration
    )

  // Funciones de mutación
  const updateService = async (serviceId: string, updates: Partial<Service>) => {
    await updateServiceMutation.mutateAsync({ serviceId, updates })
  }

  const deleteService = async (serviceId: string) => {
    await deleteServiceMutation.mutateAsync(serviceId)
  }

  const createService = async (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => {
    await createServiceMutation.mutateAsync(service)
  }

  return {
    services,
    categories,
    subcategories,
    loading: isLoading,
    error: error?.message || null,
    featuredServices,
    servicesByCategory,
    refreshData: async () => { await refetch(); },
    totalServices: services.length,
    getServiceById,
    getSubcategoriesByCategory,
    searchServices,
    filterByCategory,
    filterByPrice,
    filterByDuration,
    updateService,
    deleteService,
    createService
  }
}
