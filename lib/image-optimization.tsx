import { memo, useState, useEffect, useCallback } from 'react'

// Configuración de optimización de imágenes
export const IMAGE_CONFIG = {
  // Formatos preferidos (orden de prioridad)
  PREFERRED_FORMATS: ['webp', 'avif', 'jpg', 'jpeg', 'png'],
  
  // Tamaños de imagen optimizados
  SIZES: {
    thumbnail: '150x150',
    small: '300x300',
    medium: '600x600',
    large: '1200x1200',
    full: '1920x1920'
  },
  
  // Configuración de lazy loading
  LAZY_LOADING: {
    threshold: 0.1,
    rootMargin: '50px',
    delay: 100
  },
  
  // Configuración de cache
  CACHE: {
    ttl: 24 * 60 * 60 * 1000, // 24 horas
    maxSize: 100 // Máximo 100 imágenes en cache
  },
  
  // Configuración de preloading
  PRELOAD: {
    enabled: true,
    distance: 2, // Precargar 2 imágenes antes y después
    priority: ['first', 'last'] // Priorizar primera y última imagen
  }
}

// Cache global para imágenes
const imageCache = new Map<string, { url: string; timestamp: number }>()

// Función para limpiar cache expirado
const cleanupCache = () => {
  const now = Date.now()
  for (const [key, value] of imageCache.entries()) {
    if (now - value.timestamp > IMAGE_CONFIG.CACHE.ttl) {
      imageCache.delete(key)
    }
  }
  
  // Si el cache es muy grande, eliminar las entradas más antiguas
  if (imageCache.size > IMAGE_CONFIG.CACHE.maxSize) {
    const entries = Array.from(imageCache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    const toDelete = entries.slice(0, entries.length - IMAGE_CONFIG.CACHE.maxSize)
    toDelete.forEach(([key]) => imageCache.delete(key))
  }
}

// Función optimizada para normalizar URLs de imagen
export function optimizeImageUrl(
  imageUrl: string | null | undefined,
  size: keyof typeof IMAGE_CONFIG.SIZES = 'medium',
  format?: string
): string {
  if (!imageUrl) {
    return "/placeholder.jpg"
  }

  // Limpiar cache periódicamente
  if (Math.random() < 0.01) { // 1% de probabilidad
    cleanupCache()
  }

  // Verificar cache
  const cacheKey = `${imageUrl}-${size}-${format}`
  const cached = imageCache.get(cacheKey)
  if (cached) {
    return cached.url
  }

  let optimizedUrl = imageUrl

  // Si es una URL completa, optimizarla
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // Para Supabase Storage
    if (imageUrl.includes('supabase.co')) {
      optimizedUrl = optimizeSupabaseUrl(imageUrl, size, format)
    }
    // Para Vercel Blob
    else if (imageUrl.includes('vercel-storage.com')) {
      optimizedUrl = optimizeVercelUrl(imageUrl, size, format)
    }
  }
  // Si es un archivo local
  else if (imageUrl.includes('.jpg') || imageUrl.includes('.jpeg') || imageUrl.includes('.png') || imageUrl.includes('.webp') || imageUrl.includes('.avif')) {
    optimizedUrl = `/images/${imageUrl}`
  }
  else {
    optimizedUrl = "/placeholder.jpg"
  }

  // Guardar en cache
  imageCache.set(cacheKey, {
    url: optimizedUrl,
    timestamp: Date.now()
  })

  return optimizedUrl
}

// Optimizar URL de Supabase Storage
function optimizeSupabaseUrl(url: string, size: keyof typeof IMAGE_CONFIG.SIZES, format?: string): string {
  try {
    const urlObj = new URL(url)
    
    // Agregar parámetros de transformación si es posible
    if (urlObj.pathname.includes('/storage/v1/object/public/')) {
      const params = new URLSearchParams(urlObj.search)
      
      // Agregar tamaño si no está presente
      if (!params.has('width') && !params.has('height')) {
        const [width, height] = IMAGE_CONFIG.SIZES[size].split('x')
        params.set('width', width)
        params.set('height', height)
      }
      
      // Agregar formato preferido
      if (format && !params.has('format')) {
        params.set('format', format)
      }
      
      // Agregar calidad
      if (!params.has('quality')) {
        params.set('quality', '85')
      }
      
      urlObj.search = params.toString()
      return urlObj.toString()
    }
  } catch (error) {
    // Error handled
  }
  return url
}

// Optimizar URL de Vercel Blob
function optimizeVercelUrl(url: string, size: keyof typeof IMAGE_CONFIG.SIZES, format?: string): string {
  try {
    const urlObj = new URL(url)
    
    // Vercel Blob soporta transformaciones automáticas
    const params = new URLSearchParams(urlObj.search)
    
    // Agregar tamaño
    if (!params.has('w') && !params.has('h')) {
      const [width, height] = IMAGE_CONFIG.SIZES[size].split('x')
      params.set('w', width)
      params.set('h', height)
    }
    
    // Agregar formato
    if (format && !params.has('f')) {
      params.set('f', format)
    }
    
    // Agregar calidad
    if (!params.has('q')) {
      params.set('q', '85')
    }
    
    urlObj.search = params.toString()
    return urlObj.toString()
  } catch (error) {
    // Error handled
  }
  return url
}

// Hook para lazy loading de imágenes
export function useImageLazyLoading(
  images: string[],
  options: {
    threshold?: number
    rootMargin?: string
    delay?: number
  } = {}
) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const [visibleImages, setVisibleImages] = useState<Set<number>>(new Set())
  
  const {
    threshold = IMAGE_CONFIG.LAZY_LOADING.threshold,
    rootMargin = IMAGE_CONFIG.LAZY_LOADING.rootMargin,
    delay = IMAGE_CONFIG.LAZY_LOADING.delay
  } = options

  // Función para cargar imagen
  const loadImage = useCallback((index: number) => {
    if (loadedImages.has(index)) return

    const img = new Image()
    img.onload = () => {
      setLoadedImages(prev => new Set([...prev, index]))
    }
    img.onerror = () => {
}
    img.src = optimizeImageUrl(images[index])
  }, [images, loadedImages])

  // Función para manejar intersección
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      const index = parseInt(entry.target.getAttribute('data-index') || '0')
      
      if (entry.isIntersecting) {
        setVisibleImages(prev => new Set([...prev, index]))
        
        // Cargar imagen con delay
        setTimeout(() => {
          loadImage(index)
        }, delay)
      }
    })
  }, [loadImage, delay])

  // Configurar observer
  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin
    })

    // Observar elementos de imagen
    if (typeof document !== 'undefined') {
      const imageElements = document.querySelectorAll('[data-image-lazy]')
      imageElements.forEach(el => observer.observe(el))
    }

    return () => observer.disconnect()
  }, [handleIntersection, threshold, rootMargin])

  return {
    loadedImages,
    visibleImages,
    loadImage,
    isImageLoaded: (index: number) => loadedImages.has(index),
    isImageVisible: (index: number) => visibleImages.has(index)
  }
}

// Hook para preloading de imágenes
export function useImagePreloading(
  images: string[],
  currentIndex: number,
  options: {
    distance?: number
    priority?: string[]
  } = {}
) {
  const {
    distance = IMAGE_CONFIG.PRELOAD.distance,
    priority = IMAGE_CONFIG.PRELOAD.priority
  } = options

  const preloadImages = useCallback(() => {
    const imagesToPreload = new Set<number>()

    // Agregar imágenes prioritarias
    if (priority.includes('first')) {
      imagesToPreload.add(0)
    }
    if (priority.includes('last')) {
      imagesToPreload.add(images.length - 1)
    }

    // Agregar imágenes cercanas al índice actual
    for (let i = Math.max(0, currentIndex - distance); i <= Math.min(images.length - 1, currentIndex + distance); i++) {
      imagesToPreload.add(i)
    }

    // Precargar imágenes
    imagesToPreload.forEach(index => {
      const img = new Image()
      img.src = optimizeImageUrl(images[index])
    })
  }, [images, currentIndex, distance, priority])

  useEffect(() => {
    if (IMAGE_CONFIG.PRELOAD.enabled) {
      preloadImages()
    }
  }, [preloadImages])

  return { preloadImages }
}

// Componente optimizado para imagen
export const OptimizedImage = memo(({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  onLoad,
  onError,
  ...props
}: {
  src: string
  alt: string
  className?: string
  priority?: boolean
  sizes?: string
  onLoad?: () => void
  onError?: () => void
  [key: string]: any
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [optimizedSrc, setOptimizedSrc] = useState<string>("")

  useEffect(() => {
    const optimized = optimizeImageUrl(src)
    setOptimizedSrc(optimized)
  }, [src])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Error cargando imagen</span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={optimizedSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  )
})

OptimizedImage.displayName = 'OptimizedImage' 

