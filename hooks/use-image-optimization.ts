"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { logError, logWarn, logInfo, logDebug, logUI } from '@/lib/logger'

interface UseImageOptimizationOptions {
  retryCount?: number
  retryDelay?: number
  timeout?: number
  preloadDistance?: number
  fallbackImage?: string
}

interface UseImageOptimizationReturn {
  isLoaded: boolean
  hasError: boolean
  currentSrc: string
  retryCount: number
  retry: () => void
  preloadNext: () => void
  preloadPrev: () => void
}

export function useImageOptimization(
  images: string[],
  currentIndex: number = 0,
  options: UseImageOptimizationOptions = {}
): UseImageOptimizationReturn {
  const {
    retryCount: maxRetries = 3,
    retryDelay = 1000,
    timeout = 10000,
    preloadDistance = 2,
    fallbackImage = '/placeholder.jpg'
  } = options

  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set())

  const timeoutRef = useRef<NodeJS.Timeout>()
  const abortControllerRef = useRef<AbortController>()
  const lastImageRef = useRef<string>('')
  const lastIndexRef = useRef<number>(-1)
  
  // Referencias estables para evitar dependencias circulares
  const imagesRef = useRef(images)
  const currentIndexRef = useRef(currentIndex)
  const fallbackImageRef = useRef(fallbackImage)
  const timeoutRef2 = useRef(timeout)
  const preloadDistanceRef = useRef(preloadDistance)

  // Función para optimizar URL de imagen
  const optimizeImageUrl = useCallback((url: string): string => {
    if (!url || url.trim() === '') return fallbackImage
    
    // Si ya es una URL de Vercel Blob, no optimizar
    if (url.includes('vercel-storage.com')) {
      return url
    }
    
    // Si es una URL relativa, convertir a absoluta
    if (url.startsWith('/')) {
      return `${window.location.origin}${url}`
    }
    
    return url
  }, [fallbackImage])

  // Función para cargar imagen con timeout y abort
  const loadImage = useCallback(async (imageUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!imageUrl || imageUrl.trim() === '') {
        resolve(false)
        return
      }

      // Crear nuevo AbortController para esta carga
      const controller = new AbortController()
      abortControllerRef.current = controller
      const { signal } = controller

      // Timeout para la carga
      timeoutRef.current = setTimeout(() => {
        if (!signal.aborted) {
          controller.abort()
          logWarn(`Timeout cargando imagen: ${imageUrl}`)
          resolve(false)
        }
      }, timeout)

      // Crear imagen para precarga
      const img = new Image()
      
      img.onload = () => {
        if (!signal.aborted) {
          clearTimeout(timeoutRef.current!)
          // Solo log en desarrollo
          if (process.env.NODE_ENV === 'development') {
            logDebug(`Imagen precargada: ${imageUrl}`)
          }
          resolve(true)
        }
      }
      
      img.onerror = () => {
        if (!signal.aborted) {
          clearTimeout(timeoutRef.current!)
          logWarn(`Error precargando imagen: ${imageUrl}`)
          resolve(false)
        }
      }

      img.src = optimizeImageUrl(imageUrl)
    })
  }, [optimizeImageUrl, timeout, fallbackImage])

  // Función para precargar imagen
  const preloadImage = useCallback(async (imageUrl: string) => {
    if (preloadedImages.has(imageUrl)) return
    
    const success = await loadImage(imageUrl)
    if (success) {
      setPreloadedImages(prev => new Set([...prev, imageUrl]))
    }
  }, [loadImage, preloadedImages])

  // Función para precargar imágenes cercanas
  const preloadNearbyImages = useCallback(() => {
    const startIndex = Math.max(0, currentIndex - preloadDistance)
    const endIndex = Math.min(images.length - 1, currentIndex + preloadDistance)
    
    for (let i = startIndex; i <= endIndex; i++) {
      if (i !== currentIndex && images[i]) {
        preloadImage(images[i])
      }
    }
  }, [currentIndex, images, preloadDistance, preloadImage])

  // Función para reintentar carga
  const retry = useCallback(() => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1)
      setHasError(false)
      setIsLoaded(false)
      
      // Reintentar después de un delay
      setTimeout(() => {
        if (currentSrc && currentSrc !== fallbackImage) {
          loadImage(currentSrc).then(success => {
            if (success) {
              setIsLoaded(true)
              setHasError(false)
            } else {
              setHasError(true)
            }
          })
        }
      }, retryDelay)
    }
  }, [retryCount, maxRetries, currentSrc, fallbackImage, loadImage, retryDelay])

  // Función para precargar siguiente imagen
  const preloadNext = useCallback(() => {
    if (currentIndex < images.length - 1 && images[currentIndex + 1]) {
      preloadImage(images[currentIndex + 1])
    }
  }, [currentIndex, images, preloadImage])

  // Función para precargar imagen anterior
  const preloadPrev = useCallback(() => {
    if (currentIndex > 0 && images[currentIndex - 1]) {
      preloadImage(images[currentIndex - 1])
    }
  }, [currentIndex, images, preloadImage])

  // Efecto para cargar la imagen actual - OPTIMIZADO Y ESTABILIZADO
  useEffect(() => {
    // Actualizar referencias estables
    imagesRef.current = images
    currentIndexRef.current = currentIndex
    fallbackImageRef.current = fallbackImage
    timeoutRef2.current = timeout
    preloadDistanceRef.current = preloadDistance
    
    // Evitar recargas innecesarias
    const currentImage = images[currentIndex]
    if (currentImage === lastImageRef.current && currentIndex === lastIndexRef.current) {
      return
    }

    // Actualizar referencias
    lastImageRef.current = currentImage
    lastIndexRef.current = currentIndex

    if (!currentImage || !currentImage.trim()) {
      setCurrentSrc(fallbackImage)
      setIsLoaded(true)
      setHasError(false)
      return
    }

    const optimizedUrl = optimizeImageUrl(currentImage)
    
    // Asegurar que siempre tengamos una URL válida
    if (optimizedUrl && optimizedUrl.trim()) {
      setCurrentSrc(optimizedUrl)
    } else {
      setCurrentSrc(fallbackImage)
      setIsLoaded(true)
      setHasError(false)
      return
    }

    // Resetear estado
    setIsLoaded(false)
    setHasError(false)
    setRetryCount(0)

    // Cargar imagen usando referencia estable
    const loadImageStable = async () => {
      try {
        const success = await loadImage(optimizedUrl)
        if (success) {
          setIsLoaded(true)
          setHasError(false)
        } else {
          setHasError(true)
        }
      } catch (error) {
        setHasError(true)
      }
    }
    
    loadImageStable()

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Limpiar abort controller anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Precargar imágenes cercanas solo si es necesario
    if (images.length > 1) {
      const preloadNearbyStable = () => {
        const startIndex = Math.max(0, currentIndex - preloadDistanceRef.current)
        const endIndex = Math.min(images.length - 1, currentIndex + preloadDistanceRef.current)
        
        for (let i = startIndex; i <= endIndex; i++) {
          if (i !== currentIndex && images[i]) {
            preloadImage(images[i])
          }
        }
      }
      
      preloadNearbyStable()
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [currentIndex, images, fallbackImage, timeout, preloadDistance]) // Solo dependencias estables

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    isLoaded,
    hasError,
    currentSrc,
    retryCount,
    retry,
    preloadNext,
    preloadPrev
  }
}

// Hook para precargar múltiples imágenes
export function useImagePreloader(images: string[]) {
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set())
  const [isPreloading, setIsPreloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const hasPreloadedRef = useRef(false)

  const preloadImages = useCallback(async () => {
    if (images.length === 0 || hasPreloadedRef.current) return

    setIsPreloading(true)
    setProgress(0)

    const newPreloadedImages = new Set<string>()
    let loadedCount = 0

    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i]
      
      if (!imageUrl || imageUrl.trim() === '') continue

      try {
        const img = new Image()
        
        await new Promise<boolean>((resolve) => {
          img.onload = () => {
            newPreloadedImages.add(imageUrl)
            loadedCount++
            setProgress((loadedCount / images.length) * 100)
            resolve(true)
          }
          
          img.onerror = () => {
            loadedCount++
            setProgress((loadedCount / images.length) * 100)
            resolve(false)
          }
          
          img.src = imageUrl
        })
      } catch (error) {
        loadedCount++
        setProgress((loadedCount / images.length) * 100)
        logError('Error precargando imagen', { imageUrl, error })
      }
    }

    setPreloadedImages(newPreloadedImages)
    setIsPreloading(false)
    hasPreloadedRef.current = true
    
    // Solo log en desarrollo y una vez
    if (process.env.NODE_ENV === 'development') {
      logInfo('Precarga de imágenes completada', { 
        total: images.length, 
        loaded: newPreloadedImages.size 
      })
    }
  }, [images])

  const isImagePreloaded = useCallback((imageUrl: string) => {
    return preloadedImages.has(imageUrl)
  }, [preloadedImages])

  // Solo ejecutar una vez cuando cambien las imágenes
  useEffect(() => {
    if (images.length > 0 && !hasPreloadedRef.current) {
      preloadImages()
    }
  }, [images, preloadImages])

  // Resetear cuando cambien las imágenes completamente
  useEffect(() => {
    hasPreloadedRef.current = false
  }, [images])

  return {
    preloadedImages: Array.from(preloadedImages),
    isPreloading,
    progress,
    isImagePreloaded,
    preloadImages
  }
}

// Hook para optimización de imagen individual
export function useSingleImageOptimization(
  imageUrl: string,
  options: {
    fallbackImage?: string
    timeout?: number
    retryCount?: number
    retryDelay?: number
  } = {}
) {
  const {
    fallbackImage = '/placeholder.jpg',
    timeout = 10000,
    retryCount: maxRetries = 3,
    retryDelay = 1000
  } = options

  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  const timeoutRef = useRef<NodeJS.Timeout>()
  const abortControllerRef = useRef<AbortController>()

  const loadImage = useCallback(async (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!url || url.trim() === '') {
        resolve(false)
        return
      }

      const controller = new AbortController()
      abortControllerRef.current = controller
      const { signal } = controller

      timeoutRef.current = setTimeout(() => {
        if (!signal.aborted) {
          controller.abort()
          logWarn(`Timeout cargando imagen individual: ${url}`)
          resolve(false)
        }
      }, timeout)

      const img = new Image()
      
      img.onload = () => {
        if (!signal.aborted) {
          clearTimeout(timeoutRef.current!)
          logDebug(`Imagen individual cargada: ${url}`)
          resolve(true)
        }
      }
      
      img.onerror = () => {
        if (!signal.aborted) {
          clearTimeout(timeoutRef.current!)
          logWarn(`Error cargando imagen individual: ${url}`)
          resolve(false)
        }
      }

      img.src = url
    })
  }, [timeout])

  const retry = useCallback(() => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1)
      setHasError(false)
      setIsLoaded(false)
      
      setTimeout(() => {
        if (currentSrc && currentSrc !== fallbackImage) {
          loadImage(currentSrc).then(success => {
            if (success) {
              setIsLoaded(true)
              setHasError(false)
            } else {
              setHasError(true)
            }
          })
        }
      }, retryDelay)
    }
  }, [retryCount, maxRetries, currentSrc, fallbackImage, loadImage, retryDelay])

  useEffect(() => {
    if (!imageUrl || !imageUrl.trim()) {
      setCurrentSrc(fallbackImage)
      setIsLoaded(true)
      setHasError(false)
      return
    }

    setCurrentSrc(imageUrl)
    setIsLoaded(false)
    setHasError(false)
    setRetryCount(0)

    loadImage(imageUrl).then(success => {
      if (success) {
        setIsLoaded(true)
        setHasError(false)
      } else {
        setHasError(true)
      }
    })

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [imageUrl, fallbackImage, loadImage])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    isLoaded,
    hasError,
    currentSrc,
    retryCount,
    retry
  }
}
