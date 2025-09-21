"use client"

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { getQueryConfig } from '@/lib/cache-config'

// Configuración optimizada de QueryClient usando configuración centralizada
const createQueryClient = () => {
  const config = getQueryConfig()
  
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Configuración de stale time (cuánto tiempo consideramos los datos frescos)
        staleTime: 5 * 60 * 1000, // 5 minutos
        
        // Configuración de garbage collection time (cuánto tiempo mantener en memoria)
        gcTime: 10 * 60 * 1000, // 10 minutos
        
        // Configuración de reintentos
        retry: (failureCount, error) => {
          // No reintentar para errores 4xx (errores del cliente)
          if (error instanceof Error && 'status' in error) {
            const status = (error as any).status
            if (status >= 400 && status < 500) {
              return false
            }
          }
          
          // Máximo 3 reintentos
          return failureCount < 3
        },
        
        // Delay entre reintentos con backoff exponencial
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Configuración de refetch
        refetchOnWindowFocus: false, // No refetch al cambiar de ventana
        refetchOnMount: false, // No refetch al montar si los datos están frescos
        refetchOnReconnect: 'always', // Refetch al reconectar
        
        // Configuración de red
        networkMode: 'online', // Solo ejecutar queries cuando hay conexión
      },
      mutations: {
        // Configuración de reintentos para mutaciones
        retry: 1,
        
        // Delay entre reintentos
        retryDelay: 1000,
      },
    },
  })
}

// Instancia global del QueryClient
let queryClient: QueryClient | undefined

const getQueryClient = () => {
  if (!queryClient) {
    queryClient = createQueryClient()
  }
  return queryClient
}

// Provider principal
interface UnifiedQueryProviderProps {
  children: React.ReactNode
}

export const UnifiedQueryProvider: React.FC<UnifiedQueryProviderProps> = ({ children }) => {
  const client = getQueryClient()

  return (
    <QueryClientProvider client={client}>
      {children}
      
      {/* DevTools solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  )
}

// Hook para obtener el QueryClient
export const useQueryClient = () => {
  const client = getQueryClient()
  return client
}

// Hook para gestión del caché simplificado
export const useCacheManagement = () => {
  const queryClient = useQueryClient()

  const clearCache = React.useCallback(async () => {
    try {
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

      } catch (error) {
      }
  }, [queryClient])

  const invalidateAll = React.useCallback(() => {
    queryClient.invalidateQueries()
    }, [queryClient])

  return {
    clearCache,
    invalidateAll,
  }
}

export default UnifiedQueryProvider