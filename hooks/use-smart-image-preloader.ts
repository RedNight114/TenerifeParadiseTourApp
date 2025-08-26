"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { logError, logWarn, logInfo, logDebug } from '@/lib/logger'

interface SmartImagePreloaderOptions {
  batchSize?: number
  delayBetweenBatches?: number
  maxConcurrent?: number
  enableLogs?: boolean
}

interface PreloadResult {
  url: string
  success: boolean
  error?: string
  loadTime?: number
}

export function useSmartImagePreloader(
  images: string[],
  options: SmartImagePreloaderOptions = {}
) {
  const {
    batchSize = 3,
    delayBetweenBatches = 100,
    maxConcurrent = 2,
    enableLogs = process.env.NODE_ENV === 'development'
  } = options

  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set())
  const [isPreloading, setIsPreloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<PreloadResult[]>([])
  
  const hasPreloadedRef = useRef(false)
  const isPreloadingRef = useRef(false)
  const abortControllerRef = useRef<AbortController>()

  // Función para precargar una sola imagen - usando useRef para estabilidad
  const preloadSingleImageRef = useRef(async (imageUrl: string): Promise<PreloadResult> => {
    if (!imageUrl || imageUrl.trim() === '') {
      return { url: imageUrl, success: false, error: 'URL vacía' }
    }

    const startTime = performance.now()

    try {
      const img = new Image()
      
      const result = await new Promise<PreloadResult>((resolve) => {
        const timeout = setTimeout(() => {
          resolve({ 
            url: imageUrl, 
            success: false, 
            error: 'Timeout', 
            loadTime: performance.now() - startTime 
          })
        }, 10000) // 10 segundos timeout

        img.onload = () => {
          clearTimeout(timeout)
          resolve({ 
            url: imageUrl, 
            success: true, 
            loadTime: performance.now() - startTime 
          })
        }
        
        img.onerror = () => {
          clearTimeout(timeout)
          resolve({ 
            url: imageUrl, 
            success: false, 
            error: 'Error de carga', 
            loadTime: performance.now() - startTime 
          })
        }
        
        img.src = imageUrl
      })

      return result
    } catch (error) {
      return { 
        url: imageUrl, 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido',
        loadTime: performance.now() - startTime
      }
    }
  })

  // Función estable para precargar una sola imagen
  const preloadSingleImage = useCallback((imageUrl: string) => {
    return preloadSingleImageRef.current(imageUrl)
  }, [])

  // Función para precargar imágenes en lotes - usando useRef para estabilidad
  const preloadBatchRef = useRef(async (
    batch: string[], 
    concurrentLimit: number
  ): Promise<PreloadResult[]> => {
    const results: PreloadResult[] = []
    
    // Procesar en lotes con límite de concurrencia
    for (let i = 0; i < batch.length; i += concurrentLimit) {
      const currentBatch = batch.slice(i, i + concurrentLimit)
      const batchPromises = currentBatch.map(url => preloadSingleImageRef.current(url))
      
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
      
      // Pequeña pausa entre lotes para no sobrecargar
      if (i + concurrentLimit < batch.length) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }
    
    return results
  })

  // Función estable para precargar en lotes
  const preloadBatch = useCallback((batch: string[], concurrentLimit: number) => {
    return preloadBatchRef.current(batch, concurrentLimit)
  }, [])

  // Función estable para precargar imágenes
  const preloadImages = useCallback(async () => {
    if (images.length === 0 || hasPreloadedRef.current || isPreloadingRef.current) {
      return
    }

    isPreloadingRef.current = true
    setIsPreloading(true)
    setProgress(0)
    setResults([])

    try {
      // Crear nuevo AbortController
      const controller = new AbortController()
      abortControllerRef.current = controller

      const validImages = images.filter(url => url && url.trim() !== '')
      const totalImages = validImages.length
      
      if (totalImages === 0) {
        setIsPreloading(false)
        isPreloadingRef.current = false
        return
      }

      let processedCount = 0
      const allResults: PreloadResult[] = []

      // Procesar en lotes
      for (let i = 0; i < validImages.length; i += batchSize) {
        // Verificar si se canceló
        if (controller.signal.aborted) {
          break
        }

        const batch = validImages.slice(i, i + batchSize)
        const batchResults = await preloadBatchRef.current(batch, maxConcurrent)
        
        allResults.push(...batchResults)
        processedCount += batch.length
        
        // Actualizar progreso
        const newProgress = (processedCount / totalImages) * 100
        setProgress(newProgress)

        // Pausa entre lotes
        if (i + batchSize < validImages.length) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
        }
      }

      // Actualizar resultados una sola vez al final
      setResults(allResults)

      // Actualizar estado final
      const successfulImages = allResults.filter(r => r.success).map(r => r.url)
      setPreloadedImages(new Set(successfulImages))
      
      hasPreloadedRef.current = true
      
      // Solo log una vez al final
      if (enableLogs) {
        const successCount = successfulImages.length
        const avgLoadTime = allResults
          .filter(r => r.loadTime)
          .reduce((sum, r) => sum + (r.loadTime || 0), 0) / successCount || 0
        
        logInfo('Precarga inteligente completada', { 
          total: totalImages, 
          successful: successCount,
          failed: totalImages - successCount,
          avgLoadTime: Math.round(avgLoadTime)
        })
      }

    } catch (error) {
      logError('Error en precarga inteligente', error)
    } finally {
      setIsPreloading(false)
      isPreloadingRef.current = false
    }
  }, []) // Removidas todas las dependencias para evitar bucles

  // Función para verificar si una imagen está precargada
  const isImagePreloaded = useCallback((imageUrl: string) => {
    return preloadedImages.has(imageUrl)
  }, [preloadedImages])

  // Función para forzar reprecarga
  const forceReload = useCallback(() => {
    hasPreloadedRef.current = false
    isPreloadingRef.current = false
    setPreloadedImages(new Set())
    setProgress(0)
    setResults([])
    preloadImages()
  }, [preloadImages]) // Ahora depende de preloadImages que es estable

  // Función para cancelar precarga
  const cancelPreload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsPreloading(false)
    isPreloadingRef.current = false
  }, [])

  // Efecto para iniciar precarga automática
  useEffect(() => {
    if (images.length > 0 && !hasPreloadedRef.current && !isPreloadingRef.current) {
      preloadImages()
    }
  }, [images, preloadImages]) // Removida dependencia preloadImages para evitar bucle infinito

  // Resetear cuando cambien las imágenes completamente
  useEffect(() => {
    hasPreloadedRef.current = false
    isPreloadingRef.current = false
  }, [images]) // Solo depende de images, que es estable

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    preloadedImages: Array.from(preloadedImages),
    isPreloading,
    progress,
    results,
    isImagePreloaded,
    preloadImages,
    forceReload,
    cancelPreload,
    stats: {
      total: images.length,
      loaded: preloadedImages.size,
      failed: results.filter(r => !r.success).length,
      successRate: images.length > 0 ? (preloadedImages.size / images.length) * 100 : 0
    }
  }
}
