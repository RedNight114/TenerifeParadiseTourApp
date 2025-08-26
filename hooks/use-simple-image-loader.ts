"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseSimpleImageLoaderOptions {
  timeout?: number
  retryCount?: number
  retryDelay?: number
  fallbackImage?: string
}

interface UseSimpleImageLoaderReturn {
  isLoaded: boolean
  hasError: boolean
  currentSrc: string
  retry: () => void
  retryCount: number
}

export function useSimpleImageLoader(
  images: string[],
  currentIndex: number = 0,
  options: UseSimpleImageLoaderOptions = {}
): UseSimpleImageLoaderReturn {
  const {
    timeout = 15000,
    retryCount: maxRetries = 3,
    retryDelay = 2000,
    fallbackImage = '/placeholder.jpg'
  } = options

  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  
  const timeoutRef = useRef<NodeJS.Timeout>()
  const abortControllerRef = useRef<AbortController>()
  const lastImageRef = useRef<string>('')
  const lastIndexRef = useRef<number>(-1)

  // Función simple para cargar imagen
  const loadImage = useCallback(async (imageUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!imageUrl || imageUrl.trim() === '') {
        resolve(false)
        return
      }

      // Crear nuevo AbortController
      const controller = new AbortController()
      abortControllerRef.current = controller
      const { signal } = controller

      // Timeout para la carga
      timeoutRef.current = setTimeout(() => {
        if (!signal.aborted) {
          controller.abort()
resolve(false)
        }
      }, timeout)

      // Crear imagen para precarga
      const img = new Image()
      
      img.onload = () => {
        if (!signal.aborted) {
          clearTimeout(timeoutRef.current!)
resolve(true)
        }
      }
      
      img.onerror = () => {
        if (!signal.aborted) {
          clearTimeout(timeoutRef.current!)
resolve(false)
        }
      }

      // Intentar cargar la imagen
      img.src = imageUrl
    })
  }, [timeout])

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

  // Efecto principal para cargar imagen
  useEffect(() => {
    // Evitar recargas innecesarias
    const currentImage = images[currentIndex]
    if (currentImage === lastImageRef.current && currentIndex === lastIndexRef.current) {
      return
    }

    // Actualizar referencias
    lastImageRef.current = currentImage
    lastIndexRef.current = currentIndex

    // Resetear estado
    setRetryCount(0)
    setHasError(false)
    setIsLoaded(false)

    if (!currentImage || !currentImage.trim()) {
      setCurrentSrc(fallbackImage)
      setIsLoaded(true)
      setHasError(false)
      return
    }

    // Establecer URL actual
    setCurrentSrc(currentImage)

    // Cargar imagen
    const loadCurrentImage = async () => {
      try {
        const success = await loadImage(currentImage)
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

    loadCurrentImage()

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [currentIndex, images, fallbackImage, loadImage])

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
    retry,
    retryCount
  }
}





