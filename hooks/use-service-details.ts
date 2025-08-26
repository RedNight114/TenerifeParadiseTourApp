"use client"

import { useState, useEffect, useCallback } from "react"
import { getSupabaseClient } from '@/lib/supabase-singleton'
import type { Service } from "@/lib/supabase"

interface UseServiceDetailsReturn {
  service: Service | null
  loading: boolean
  error: string | null
  refreshService: () => Promise<void>
}

export function useServiceDetails(serviceId: string): UseServiceDetailsReturn {
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadService = useCallback(async () => {
    if (!serviceId) return

    try {
      setLoading(true)
      setError(null)

      const supabase = getSupabaseClient()
      
      // Cargar servicio con relaciones en una sola consulta
      const { data, error: fetchError } = await supabase
        .from('services')
        .select(`
          *,
          category:categories(id, name, description),
          subcategory:subcategories(id, name, description)
        `)
        .eq('id', serviceId)
        .eq('available', true)
        .single()

      if (fetchError) {
        throw fetchError
      }

      if (data) {
        setService(data)
        // Actualizar título de la página
        document.title = `${data.title} - Tenerife Paradise`
      } else {
        setError('Servicio no encontrado')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando servicio'
      setError(errorMessage)
      console.error('Error cargando servicio:', err)
    } finally {
      setLoading(false)
    }
  }, [serviceId])

  const refreshService = useCallback(async () => {
    await loadService()
  }, [loadService])

  // Cargar servicio cuando cambie el ID
  useEffect(() => {
    loadService()
  }, [loadService])

  return {
    service,
    loading,
    error,
    refreshService
  }
}
