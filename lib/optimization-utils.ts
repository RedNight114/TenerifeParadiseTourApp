
// Utilidades para optimización de rendimiento

// Función para debounce
export const debounce = <T extends (...args: unknown[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Función para throttle
export const throttle = <T extends (...args: unknown[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Función para memoización
export const memoize = <T extends (...args: unknown[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>()
  
  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
}

// Función para lazy loading de imágenes
export const lazyLoadImage = (src: string, threshold: number = 0.1): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => resolve(src)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    
    img.src = src
  })
}

// Función para optimizar imágenes
export const optimizeImageUrl = (url: string, options: {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
} = {}) => {
  const { width, height, quality = 85, format = 'webp' } = options
  
  if (!url) return url
  
  // Si es una URL de Supabase Storage, aplicar transformaciones
  if (url.includes('supabase.co')) {
    const params = new URLSearchParams()
    
    if (width) params.append('width', width.toString())
    if (height) params.append('height', height.toString())
    params.append('quality', quality.toString())
    params.append('format', format)
    
    return `${url}?${params.toString()}`
  }
  
  return url
}

// Función para preload recursos críticos
export const preloadCriticalResources = (urls: string[]) => {
  if (typeof document === 'undefined') return
  
  urls.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = url
    document.head.appendChild(link)
  })
}

// Función para medir Core Web Vitals
export const measureWebVitals = () => {
  if (typeof window === 'undefined') return
  
  // LCP (Largest Contentful Paint)
  new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const lastEntry = entries[entries.length - 1]
}).observe({ entryTypes: ['largest-contentful-paint'] })
  
  // FID (First Input Delay)
  new PerformanceObserver((list) => {
    const entries = list.getEntries()
    entries.forEach(entry => {
      const fidEntry = entry as PerformanceEventTiming
})
  }).observe({ entryTypes: ['first-input'] })
  
  // CLS (Cumulative Layout Shift)
  new PerformanceObserver((list) => {
    let cls = 0
    const entries = list.getEntries()
    entries.forEach(entry => {
      const layoutEntry = entry as any
      if (!layoutEntry.hadRecentInput) {
        cls += layoutEntry.value
      }
    })
}).observe({ entryTypes: ['layout-shift'] })
}


