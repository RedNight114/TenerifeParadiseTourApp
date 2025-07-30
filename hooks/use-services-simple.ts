"use client"

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase-optimized'
import type { Service, Category, Subcategory } from '@/lib/supabase'

interface UseServicesSimpleReturn {
  services: Service[]
  categories: Category[]
  subcategories: Subcategory[]
  isLoading: boolean
  isInitialLoading: boolean
  isRefreshing: boolean
  error: string | null
  hasError: boolean
  refreshServices: () => Promise<void>
  clearError: () => void
  searchServices: (query: string) => Service[]
  getServiceById: (id: string) => Service | undefined
  fetchServiceById: (id: string) => Promise<Service | null>
  totalServices: number
  servicesByCategory: Record<string, Service[]>
}

export function useServicesSimple(): UseServicesSimpleReturn {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const supabase = getSupabaseClient()
      
      // Cargar servicios
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (servicesError) throw servicesError
      
      // Cargar categorías
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
      
      if (categoriesError) throw categoriesError
      
      // Cargar subcategorías
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('*')
      
      if (subcategoriesError) throw subcategoriesError
      
      // Actualizar estados
      setServices(servicesData || [])
      setCategories(categoriesData || [])
      setSubcategories(subcategoriesData || [])
      
    } catch (error: any) {
      console.error('Error cargando servicios:', error)
      setError(error.message || 'Error al cargar los servicios')
    } finally {
      setIsLoading(false)
      setIsInitialLoading(false)
    }
  }, [])
  
  const refreshServices = useCallback(async () => {
    setIsRefreshing(true)
    await loadData()
    setIsRefreshing(false)
  }, [loadData])
  
  const clearError = useCallback(() => {
    setError(null)
  }, [])
  
  const searchServices = useCallback((query: string): Service[] => {
    if (!query.trim()) return services
    
    const searchTerm = query.toLowerCase()
    return services.filter(service => 
      service.title.toLowerCase().includes(searchTerm) ||
      service.description.toLowerCase().includes(searchTerm)
    )
  }, [services])
  
  const getServiceById = useCallback((id: string): Service | undefined => {
    return services.find(service => service.id === id)
  }, [services])
  
  const fetchServiceById = useCallback(async (id: string): Promise<Service | null> => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error fetching service by ID:', error)
      return null
    }
  }, [])
  
  // Calcular estadísticas
  const totalServices = services.length
  
  const servicesByCategory = services.reduce((acc, service) => {
    const categoryId = service.category_id
    if (!acc[categoryId]) {
      acc[categoryId] = []
    }
    acc[categoryId].push(service)
    return acc
  }, {} as Record<string, Service[]>)
  
  // Carga inicial
  useEffect(() => {
    loadData()
  }, [loadData])
  
  return {
    services,
    categories,
    subcategories,
    isLoading,
    isInitialLoading,
    isRefreshing,
    error,
    hasError: !!error,
    refreshServices,
    clearError,
    searchServices,
    getServiceById,
    fetchServiceById,
    totalServices,
    servicesByCategory
  }
} 