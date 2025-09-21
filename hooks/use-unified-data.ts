/**
 * Hook unificado para manejo de datos
 * Centraliza la lógica de carga y gestión de estado
 */

import { useState, useEffect, useCallback } from 'react'

export interface UnifiedDataState<T> {
  data: T | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export interface UnifiedDataOptions {
  enabled?: boolean
  refetchOnMount?: boolean
  refetchInterval?: number
  staleTime?: number
}

export function useUnifiedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UnifiedDataOptions = {}
): UnifiedDataState<T> & {
  refetch: () => Promise<void>
  mutate: (data: T) => void
  clear: () => void
} {
  const {
    enabled = true,
    refetchOnMount = true,
    refetchInterval,
    staleTime = 5 * 60 * 1000 // 5 minutos por defecto
  } = options

  const [state, setState] = useState<UnifiedDataState<T>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null
  })

  const fetchData = useCallback(async () => {
    if (!enabled) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const data = await fetcher()
      setState({
        data,
        loading: false,
        error: null,
        lastUpdated: new Date()
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }))
    }
  }, [fetcher, enabled])

  const refetch = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  const mutate = useCallback((data: T) => {
    setState(prev => ({
      ...prev,
      data,
      lastUpdated: new Date()
    }))
  }, [])

  const clear = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      lastUpdated: null
    })
  }, [])

  useEffect(() => {
    if (refetchOnMount) {
      fetchData()
    }
  }, [fetchData, refetchOnMount])

  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(fetchData, refetchInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, refetchInterval, enabled])

  return {
    ...state,
    refetch,
    mutate,
    clear
  }
}

/**
 * Hook para datos de servicios
 */
export function useServiceData(serviceId: string) {
  return useUnifiedData(
    `service-${serviceId}`,
    async () => {
      // Implementación mock por ahora
      return {
        id: serviceId,
        title: 'Servicio de Ejemplo',
        description: 'Descripción del servicio',
        price: 50,
        duration: 120,
        images: [],
        available: true
      }
    },
    {
      enabled: !!serviceId,
      staleTime: 2 * 60 * 1000 // 2 minutos
    }
  )
}

/**
 * Hook para datos de reservas
 */
export function useReservationData(userId: string) {
  return useUnifiedData(
    `reservations-${userId}`,
    async () => {
      // Implementación mock por ahora
      return []
    },
    {
      enabled: !!userId,
      staleTime: 1 * 60 * 1000 // 1 minuto
    }
  )
}

/**
 * Hook para datos de usuario
 */
export function useUserData(userId: string) {
  return useUnifiedData(
    `user-${userId}`,
    async () => {
      // Implementación mock por ahora
      return {
        id: userId,
        name: 'Usuario',
        email: 'usuario@ejemplo.com',
        role: 'user'
      }
    },
    {
      enabled: !!userId,
      staleTime: 10 * 60 * 1000 // 10 minutos
    }
  )
}
