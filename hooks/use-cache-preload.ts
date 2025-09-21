/**
 * Hook para precarga inteligente de datos críticos
 * Optimiza la carga inicial de la aplicación
 */

import { useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { unifiedCache, cacheServices, cacheCategories } from '@/lib/unified-cache-system'
import { PRELOAD_CONFIG } from '@/lib/cache-config'
import { getSupabaseClient } from '@/lib/supabase-unified'

export interface PreloadOptions {
  // Datos críticos que se precargan inmediatamente
  critical?: boolean
  
  // Datos que se precargan en background
  background?: boolean
  
  // Intervalo de precarga en background (ms)
  backgroundInterval?: number
  
  // Callback cuando se completa la precarga
  onComplete?: (type: 'critical' | 'background') => void
  
  // Callback en caso de error
  onError?: (error: Error, type: 'critical' | 'background') => void
}

export function useCachePreload(options: PreloadOptions = {}) {
  const queryClient = useQueryClient()
  const {
    critical = true,
    background = true,
    backgroundInterval = PRELOAD_CONFIG.BACKGROUND_INTERVAL,
    onComplete,
    onError
  } = options

  // Precargar datos críticos
  const preloadCriticalData = useCallback(async () => {
    try {
      const promises = []

      // Precargar servicios destacados
      promises.push(
        queryClient.prefetchQuery({
          queryKey: ['services'],
          queryFn: async () => {
            const cached = await cacheServices.get('all')
            if (cached) return cached

            const supabase = await getSupabaseClient()
            const { data } = await supabase
              .from('services')
              .select('*')
              .eq('featured', true)
              .limit(6)

            return data || []
          },
          staleTime: 15 * 60 * 1000,
        })
      )

      // Precargar categorías
      promises.push(
        queryClient.prefetchQuery({
          queryKey: ['categories'],
          queryFn: async () => {
            const cached = await cacheCategories.get('all')
            if (cached) return cached

            const supabase = await getSupabaseClient()
            const { data } = await supabase
              .from('categories')
              .select('*')
              .order('name')

            return data || []
          },
          staleTime: 60 * 60 * 1000,
        })
      )

      // Precargar subcategorías
      promises.push(
        queryClient.prefetchQuery({
          queryKey: ['subcategories'],
          queryFn: async () => {
            const cached = await cacheCategories.get('subcategories')
            if (cached) return cached

            const supabase = await getSupabaseClient()
            const { data } = await supabase
              .from('subcategories')
              .select('*')
              .order('name')

            return data || []
          },
          staleTime: 60 * 60 * 1000,
        })
      )

      await Promise.allSettled(promises)
      onComplete?.('critical')
    } catch (error) {
      onError?.(error as Error, 'critical')
    }
  }, [queryClient, onComplete, onError])

  // Precargar datos en background
  const preloadBackgroundData = useCallback(async () => {
    try {
      const supabase = await getSupabaseClient()

      // Precargar servicios populares
      const { data: popularServices } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (popularServices) {
        await cacheServices.set('popular', popularServices)
      }

      // Precargar estadísticas de servicios
      const { data: serviceStats } = await supabase
        .from('services')
        .select('category_id')

      if (serviceStats) {
        await cacheServices.set('stats', serviceStats)
      }

      onComplete?.('background')
    } catch (error) {
      onError?.(error as Error, 'background')
    }
  }, [onComplete, onError])

  // Efecto para precarga crítica
  useEffect(() => {
    if (critical) {
      preloadCriticalData()
    }
  }, [critical, preloadCriticalData])

  // Efecto para precarga en background
  useEffect(() => {
    if (!background) return

    // Precarga inicial en background
    const timeoutId = setTimeout(() => {
      preloadBackgroundData()
    }, 2000) // Esperar 2 segundos después de la carga crítica

    // Precarga periódica en background
    const intervalId = setInterval(() => {
      preloadBackgroundData()
    }, backgroundInterval)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [background, backgroundInterval, preloadBackgroundData])

  // Función para precarga manual
  const preloadManually = useCallback(async (type: 'critical' | 'background' | 'all') => {
    switch (type) {
      case 'critical':
        await preloadCriticalData()
        break
      case 'background':
        await preloadBackgroundData()
        break
      case 'all':
        await Promise.all([preloadCriticalData(), preloadBackgroundData()])
        break
    }
  }, [preloadCriticalData, preloadBackgroundData])

  return {
    preloadCriticalData,
    preloadBackgroundData,
    preloadManually
  }
}

// Hook simplificado para uso común
export function usePreloadCriticalData() {
  return useCachePreload({ critical: true, background: false })
}

// Hook para precarga completa
export function usePreloadAllData() {
  return useCachePreload({ critical: true, background: true })
}

export default useCachePreload
