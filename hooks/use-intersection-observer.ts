"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface UseIntersectionObserverOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
  freezeOnceVisible?: boolean
}

interface UseIntersectionObserverReturn {
  ref: React.RefObject<Element>
  isIntersecting: boolean
  isVisible: boolean
  entry?: IntersectionObserverEntry
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const {
    root = null,
    rootMargin = '50px', // Precargar 50px antes
    threshold = 0,
    freezeOnceVisible = true
  } = options

  const [isIntersecting, setIsIntersecting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const ref = useRef<Element>(null)

  const updateEntry = useCallback(([entry]: IntersectionObserverEntry[]) => {
    setEntry(entry)
    setIsIntersecting(entry.isIntersecting)
    
    if (entry.isIntersecting && freezeOnceVisible) {
      setIsVisible(true)
    }
  }, [freezeOnceVisible])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(updateEntry, {
      root,
      rootMargin,
      threshold
    })

    observer.observe(element)

    return () => observer.disconnect()
  }, [root, rootMargin, threshold, updateEntry])

  return { ref, isIntersecting, isVisible, entry }
}

// Hook especializado para lazy loading de imágenes
export function useImageLazyLoading(
  src: string,
  placeholder?: string,
  options?: UseIntersectionObserverOptions
) {
  const { ref, isIntersecting, isVisible } = useIntersectionObserver({
    rootMargin: '100px', // Precargar 100px antes para imágenes
    threshold: 0.1, // 10% visible
    freezeOnceVisible: true,
    ...options
  })

  const [imageSrc, setImageSrc] = useState(placeholder || '')
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!isIntersecting || !src) return

    const img = new Image()
    
    img.onload = () => {
      setImageSrc(src)
      setIsLoaded(true)
      setHasError(false)
    }

    img.onerror = () => {
      setHasError(true)
      setIsLoaded(false)
      // Fallback a placeholder si hay error
      if (placeholder) {
        setImageSrc(placeholder)
      }
    }

    img.src = src

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [isIntersecting, src, placeholder])

  return {
    ref,
    imageSrc,
    isLoaded,
    hasError,
    isIntersecting,
    isVisible
  }
}

// Hook para precarga inteligente de múltiples imágenes
export function useBatchImagePreloading(
  imageUrls: string[],
  batchSize: number = 3,
  options?: UseIntersectionObserverOptions
) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set())
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  const preloadBatch = useCallback(async (urls: string[]) => {
    const promises = urls.map(url => {
      if (loadedImages.has(url) || failedImages.has(url)) {
        return Promise.resolve()
      }

      setLoadingImages(prev => new Set(prev).add(url))

      return new Promise<void>((resolve) => {
        const img = new Image()
        
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(url))
          setLoadingImages(prev => {
            const newSet = new Set(prev)
            newSet.delete(url)
            return newSet
          })
          resolve()
        }

        img.onerror = () => {
          setFailedImages(prev => new Set(prev).add(url))
          setLoadingImages(prev => {
            const newSet = new Set(prev)
            newSet.delete(url)
            return newSet
          })
          resolve()
        }

        img.src = url
      })
    })

    await Promise.all(promises)
  }, [loadedImages, failedImages])

  const preloadAll = useCallback(async () => {
    for (let i = 0; i < imageUrls.length; i += batchSize) {
      const batch = imageUrls.slice(i, i + batchSize)
      await preloadBatch(batch)
      
      // Pausa entre lotes para no bloquear la UI
      if (i + batchSize < imageUrls.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
  }, [imageUrls, batchSize, preloadBatch])

  return {
    loadedImages,
    loadingImages,
    failedImages,
    preloadBatch,
    preloadAll,
    progress: loadedImages.size / imageUrls.length
  }
}
