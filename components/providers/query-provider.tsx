"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Configuración por defecto para queries
        staleTime: 5 * 60 * 1000, // 5 minutos
        gcTime: 10 * 60 * 1000, // 10 minutos (antes cacheTime)
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount, error) => {
          // Reintentar solo para errores de red, no para errores 4xx
          if (error instanceof Error && error.message.includes('network')) {
            return failureCount < 3
          }
          return false
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Configuración para queries en segundo plano
        refetchInterval: false,
        refetchIntervalInBackground: false,
      },
      mutations: {
        // Configuración por defecto para mutaciones
        retry: 1,
        retryDelay: 1000,
        // Rollback automático en caso de error
        onError: (error, variables, context) => {
// Aquí puedes implementar lógica de rollback
        },
      },
    },
  }))

  // Configuración dinámica basada en el entorno
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // En desarrollo, habilitar devtools y logging
      queryClient.setDefaultOptions({
        queries: {
          ...queryClient.getDefaultOptions().queries,
          staleTime: 1 * 60 * 1000, // 1 minuto en desarrollo
        },
      })
    } else {
      // En producción, configuraciones más conservadoras
      queryClient.setDefaultOptions({
        queries: {
          ...queryClient.getDefaultOptions().queries,
          staleTime: 10 * 60 * 1000, // 10 minutos en producción
          gcTime: 30 * 60 * 1000, // 30 minutos en producción
        },
      })
    }
  }, [queryClient])

  // Configuración para prefetching inteligente
  useEffect(() => {
    // Prefetch de datos críticos cuando la app se carga
    const prefetchCriticalData = async () => {
      try {
        // Prefetch de categorías y servicios básicos
        await queryClient.prefetchQuery({
          queryKey: ['unified-data'],
          queryFn: async () => {
            // Aquí puedes implementar prefetch de datos críticos
            return { services: [], categories: [], subcategories: [] }
          },
          staleTime: 5 * 60 * 1000,
        })
      } catch (error) {
}
    }

    prefetchCriticalData()
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      {children}

    </QueryClientProvider>
  )
}

// Hook para acceder al QueryClient desde cualquier lugar
export function useQueryClient() {
  return useQueryClient()
}

// Configuración de React Query para diferentes entornos
export const queryConfig = {
  development: {
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
    retryDelay: 1000,
  },
  production: {
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    retry: 2,
    retryDelay: 2000,
  },
  test: {
    staleTime: 0, // Sin cache en tests
    gcTime: 0,
    retry: 0,
    retryDelay: 0,
  },
}

