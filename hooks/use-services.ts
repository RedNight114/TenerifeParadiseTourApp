"use client"

import { useState, useCallback, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Service } from "@/lib/supabase"

interface UseServicesOptions {
  categoryId?: string
  featured?: boolean
  available?: boolean
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchServices = useCallback(async (options: UseServicesOptions = {}) => {
    try {
      setLoading(true)
      setError(null)
      let query = supabase
        .from("services")
        .select(`
          *,
          category:categories(*)
        `)
        .order("created_at", { ascending: false })

      if (options.categoryId) {
        query = query.eq("category_id", options.categoryId)
      }

      if (options.featured !== undefined) {
        query = query.eq("featured", options.featured)
      }

      if (options.available !== undefined) {
        query = query.eq("available", options.available)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw fetchError
      }

      setServices(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error fetching services"
      setError(errorMessage)
      } finally {
      setLoading(false)
    }
  }, [])

  const createService = useCallback(async (serviceData: Omit<Service, "id" | "created_at" | "updated_at">) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: createError } = await supabase
        .from("services")
        .insert([serviceData])
        .select(`
          *,
          category:categories(*)
        `)
        .single()

      if (createError) {
        throw createError
      }

      if (data) {
        setServices((prev) => [data, ...prev])
      }

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error creating service"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateService = useCallback(async (id: string, updates: Partial<Service>) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: updateError } = await supabase
        .from("services")
        .update(updates)
        .eq("id", id)
        .select(`
          *,
          category:categories(*)
        `)
        .single()

      if (updateError) {
        throw updateError
      }

      if (data) {
        setServices((prev) => prev.map((service) => (service.id === id ? data : service)))
      }

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error updating service"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteService = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const { error: deleteError } = await supabase.from("services").delete().eq("id", id)

      if (deleteError) {
        throw deleteError
      }

      setServices((prev) => prev.filter((service) => service.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error deleting service"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getServiceById = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from("services")
        .select(`
          *,
          category:categories(*)
        `)
        .eq("id", id)
        .single()

      if (fetchError) {
        throw fetchError
      }

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error fetching service"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar servicios automáticamente al inicializar el hook
  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  return {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
    getServiceById,
  }
}
