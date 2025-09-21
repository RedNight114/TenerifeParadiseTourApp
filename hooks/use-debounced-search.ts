"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import type { Service } from "@/lib/supabase"

interface UseDebouncedSearchReturn {
  searchTerm: string
  setSearchTerm: (term: string) => void
  debouncedSearchTerm: string
  filteredServices: Service[]
  isSearching: boolean
  clearSearch: () => void
  searchStats: {
    total: number
    filtered: number
    searchTime: number
  }
}

export function useDebouncedSearch(
  services: Service[], 
  delay: number = 300,
  searchFields: (keyof Service)[] = ['title', 'description']
): UseDebouncedSearchReturn {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchStats, setSearchStats] = useState({
    total: services.length,
    filtered: services.length,
    searchTime: 0
  })

  // Debouncing del término de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, delay)

    return () => clearTimeout(timer)
  }, [searchTerm, delay])

  // Filtrado optimizado de servicios
  const filteredServices = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return services
    }

    const startTime = performance.now()
    setIsSearching(true)

    const searchLower = debouncedSearchTerm.toLowerCase()
    
    const filtered = services.filter(service => {
      return searchFields.some(field => {
        const value = service[field]
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchLower)
        }
        return false
      })
    })

    const endTime = performance.now()
    const searchTime = Math.round(endTime - startTime)

    setSearchStats({
      total: services.length,
      filtered: filtered.length,
      searchTime
    })

    setIsSearching(false)
    return filtered
  }, [services, debouncedSearchTerm, searchFields])

  // Función para limpiar búsqueda
  const clearSearch = useCallback(() => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
  }, [])

  // Función para establecer término de búsqueda con validación
  const handleSetSearchTerm = useCallback((term: string) => {
    // Limitar longitud para evitar búsquedas muy largas
    const truncatedTerm = term.slice(0, 100)
    setSearchTerm(truncatedTerm)
  }, [])

  return {
    searchTerm,
    setSearchTerm: handleSetSearchTerm,
    debouncedSearchTerm,
    filteredServices,
    isSearching,
    clearSearch,
    searchStats
  }
}

// Hook especializado para búsqueda de servicios
export function useServicesSearch(services: Service[], delay: number = 300) {
  return useDebouncedSearch(services, delay, [
    'title', 
    'description', 
    'location', 
    'characteristics'
  ])
}

// Hook especializado para búsqueda de categorías
export function useCategoriesSearch(categories: unknown[], delay: number = 300) {
  return useDebouncedSearch(categories as Service[], delay, ['title', 'description'])
}

