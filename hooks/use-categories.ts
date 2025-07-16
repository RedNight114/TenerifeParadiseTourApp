"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { Category, Subcategory } from "@/lib/supabase"

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingSubcategories, setLoadingSubcategories] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true)
      setError(null)

      const { data, error } = await supabase.from("categories").select("*").order("name")

      if (error) throw error

      setCategories(data || [])
      } catch (error) {
      setError(error instanceof Error ? error.message : "Error al cargar categorías")
    } finally {
      setLoadingCategories(false)
    }
  }, [])

  const fetchSubcategories = useCallback(async (categoryId: string) => {
    try {
      setLoadingSubcategories(true)
      setError(null)

      const { data, error } = await supabase
        .from("subcategories")
        .select("*")
        .eq("category_id", categoryId)
        .order("name")

      if (error) throw error

      setSubcategories(data || [])
      } catch (error) {
      setError(error instanceof Error ? error.message : "Error al cargar subcategorías")
    } finally {
      setLoadingSubcategories(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    subcategories,
    setSubcategories,
    loadingCategories,
    loadingSubcategories,
    error,
    fetchCategories,
    fetchSubcategories,
  }
}
