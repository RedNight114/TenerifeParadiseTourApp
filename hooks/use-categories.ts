"use client"

import { useState, useEffect, useCallback } from "react"
import { getSupabaseClient } from "@/lib/supabase-unified"

interface Category {
  id: string
  name: string
  description?: string
  created_at: string
}

interface Subcategory {
  id: string
  name: string
  description?: string
  category_id: string
  created_at: string
}

// Cache global para evitar múltiples peticiones
const globalCategoriesCache = {
  categories: [] as Category[],
  subcategories: [] as Subcategory[],
  lastFetch: 0,
  isFetching: false,
  promise: null as Promise<void> | null
}

const CACHE_TTL = 10 * 60 * 1000 // 10 minutos

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(globalCategoriesCache.categories)
  const [subcategories, setSubcategories] = useState<Subcategory[]>(globalCategoriesCache.subcategories)
  const [loading, setLoading] = useState(globalCategoriesCache.categories.length === 0)
  const [error, setError] = useState<string | null>(null)

  const loadCategories = useCallback(async (forceRefresh = false) => {
    // Evitar múltiples peticiones simultáneas
    if (globalCategoriesCache.isFetching && !forceRefresh) {
      if (globalCategoriesCache.promise) {
        await globalCategoriesCache.promise
      }
      return
    }

    // Usar cache si está disponible y fresco
    const now = Date.now()
    const cacheAge = now - globalCategoriesCache.lastFetch
    
    if (!forceRefresh && 
        globalCategoriesCache.categories.length > 0 && 
        globalCategoriesCache.subcategories.length > 0 && 
        cacheAge < CACHE_TTL) {
      setCategories(globalCategoriesCache.categories)
      setSubcategories(globalCategoriesCache.subcategories)
      setLoading(false)
      setError(null)
      return
    }

    // Marcar como fetching
    globalCategoriesCache.isFetching = true
    
    try {
      setLoading(true)
      setError(null)

      // Crear promesa global para evitar duplicados
      globalCategoriesCache.promise = (async () => {
        const client = await getSupabaseClient()
        
        if (!client) {
          throw new Error("No se pudo obtener el cliente de Supabase")
        }

        const { data: categoriesData, error: categoriesError } = await client
          .from("categories")
          .select("*")
          .order("name")

        if (categoriesError) throw categoriesError

        const { data: subcategoriesData, error: subcategoriesError } = await client
          .from("subcategories")
          .select("*")
          .order("name")

        if (subcategoriesError) throw subcategoriesError

        // Actualizar cache global
        globalCategoriesCache.categories = (categoriesData || []) as unknown as Category[]
        globalCategoriesCache.subcategories = (subcategoriesData || []) as unknown as Subcategory[]
        globalCategoriesCache.lastFetch = Date.now()
        globalCategoriesCache.isFetching = false
        globalCategoriesCache.promise = null

        // Actualizar estado local
        setCategories(globalCategoriesCache.categories)
        setSubcategories(globalCategoriesCache.subcategories)
        setLoading(false)
        setError(null)
      })()

      await globalCategoriesCache.promise

    } catch (err) {
      globalCategoriesCache.isFetching = false
      globalCategoriesCache.promise = null
      
      const errorMessage = err instanceof Error ? err.message : "Error al cargar categorías"
      setError(errorMessage)
      setLoading(false)
      
      // Solo log en desarrollo
      if (process.env.NODE_ENV === 'development') {
}
    }
  }, [])

  const getSubcategoriesByCategory = useCallback((categoryId: string) => {
    return subcategories.filter(sub => sub.category_id === categoryId)
  }, [subcategories])

  // Carga inicial - solo una vez
  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  return {
    categories,
    subcategories,
    loading,
    error,
    loadCategories: () => loadCategories(true), // Siempre force refresh para el usuario
    getSubcategoriesByCategory,
  }
}

