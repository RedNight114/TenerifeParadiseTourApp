"use client"

import { useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
// import { setCache, getCache } from '@/lib/performance-optimizer' // Módulo eliminado

// Funciones mock para reemplazar setCache y getCache
const setCache = (key: string, value: any, ttl?: number) => {
  // Implementación mock simple
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify({ value, timestamp: Date.now(), ttl }))
  }
}

const getCache = (key: string) => {
  // Implementación mock simple
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(key)
    if (cached) {
      try {
        const { value, timestamp, ttl } = JSON.parse(cached)
        if (ttl && Date.now() - timestamp > ttl) {
          localStorage.removeItem(key)
          return null
        }
        return value
      } catch {
        return null
      }
    }
  }
  return null
}

interface RouteOptimizationConfig {
  enablePrefetch: boolean;
  enablePreload: boolean;
  preloadDistance: number;
  cacheTTL: number;
}

interface RouteInfo {
  path: string;
  priority: 'high' | 'medium' | 'low';
  lastAccessed: number;
  accessCount: number;
}

export function useRouteOptimization(
  config: Partial<RouteOptimizationConfig> = {}
) {
  const router = useRouter()
  const pathname = usePathname()
  
  const {
    enablePrefetch = true,
    enablePreload = true,
    preloadDistance = 2,
    cacheTTL = 10 * 60 * 1000 // 10 minutos
  } = config

  const routesRef = useRef<Map<string, RouteInfo>>(new Map())
  const prefetchQueueRef = useRef<Set<string>>(new Set())
  const isPrefetchingRef = useRef(false)

  // Registrar acceso a una ruta
  const registerRouteAccess = useCallback((path: string) => {
    const now = Date.now()
    const existing = routesRef.current.get(path)
    
    if (existing) {
      existing.lastAccessed = now
      existing.accessCount++
    } else {
      routesRef.current.set(path, {
        path,
        priority: 'low',
        lastAccessed: now,
        accessCount: 1
      })
    }

    // Actualizar prioridad basada en uso
    updateRoutePriority(path)
  }, [])

  // Actualizar prioridad de una ruta
  const updateRoutePriority = useCallback((path: string) => {
    const route = routesRef.current.get(path)
    if (!route) return

    const now = Date.now()
    const timeSinceLastAccess = now - route.lastAccessed
    const accessFrequency = route.accessCount / (timeSinceLastAccess / (1000 * 60)) // accesos por minuto

    if (accessFrequency > 5 || timeSinceLastAccess < 5 * 60 * 1000) {
      route.priority = 'high'
    } else if (accessFrequency > 2 || timeSinceLastAccess < 15 * 60 * 1000) {
      route.priority = 'medium'
    } else {
      route.priority = 'low'
    }
  }, [])

  // Prefetch de rutas prioritarias
  const prefetchPriorityRoutes = useCallback(async () => {
    if (!enablePrefetch || isPrefetchingRef.current) return

    try {
      isPrefetchingRef.current = true

      // Obtener rutas de alta prioridad
      const highPriorityRoutes = Array.from(routesRef.current.values())
        .filter(route => route.priority === 'high')
        .sort((a, b) => b.accessCount - a.accessCount)
        .slice(0, 5)

      // Prefetch en paralelo
      const prefetchPromises = highPriorityRoutes.map(async (route) => {
        if (prefetchQueueRef.current.has(route.path)) return

        try {
          prefetchQueueRef.current.add(route.path)
          
          // Intentar prefetch
          await router.prefetch(route.path)
          
          // Guardar en caché
          setCache(`route_${route.path}`, {
            status: 'prefetched',
            timestamp: Date.now()
          }, cacheTTL)

        } catch (error) {
          // Error handled
        } finally {
          prefetchQueueRef.current.delete(route.path)
        }
      })

      await Promise.allSettled(prefetchPromises)

    } finally {
      isPrefetchingRef.current = false
    }
  }, [enablePrefetch, router, cacheTTL])

  // Prefetch de ruta específica
  const prefetchRoute = useCallback(async (path: string) => {
    if (!enablePrefetch || prefetchQueueRef.current.has(path)) return

    try {
      prefetchQueueRef.current.add(path)
      
      // Verificar caché primero
      const cached = getCache(`route_${path}`)
      if (cached && cached.status === 'prefetched') {
        return
      }

      // Ejecutar prefetch
      await router.prefetch(path)
      
      // Guardar en caché
      setCache(`route_${path}`, {
        status: 'prefetched',
        timestamp: Date.now()
      }, cacheTTL)

    } catch (error) {
      // Error handled
    } finally {
      prefetchQueueRef.current.delete(path)
    }
  }, [enablePrefetch, router, cacheTTL])

  // Prefetch de rutas cercanas
  const prefetchNearbyRoutes = useCallback(async (currentPath: string) => {
    if (!enablePrefetch) return

    // Obtener rutas relacionadas basadas en la ruta actual
    const relatedRoutes = getRelatedRoutes(currentPath)
    
    // Prefetch de rutas relacionadas
    for (const route of relatedRoutes) {
      await prefetchRoute(route)
    }
  }, [enablePrefetch, prefetchRoute])

  // Obtener rutas relacionadas
  const getRelatedRoutes = useCallback((path: string): string[] => {
    const routes: string[] = []
    
    // Rutas comunes relacionadas
    if (path === '/') {
      routes.push('/services', '/about', '/contact')
    } else if (path.startsWith('/services')) {
      routes.push('/services', '/booking', '/contact')
    } else if (path.startsWith('/admin')) {
      routes.push('/admin/dashboard', '/admin/services', '/admin/users')
    }

    return routes
  }, [])

  // Preload de datos de ruta
  const preloadRouteData = useCallback(async (path: string) => {
    if (!enablePreload) return

    try {
      // Verificar caché
      const cached = getCache(`data_${path}`)
      if (cached) return

      // Preload de datos específicos de la ruta
      if (path === '/services') {
        // Preload de servicios
        const response = await fetch('/api/services?limit=6')
        if (response.ok) {
          const data = await response.json()
          setCache(`data_${path}`, data, cacheTTL)
        }
      } else if (path === '/admin/dashboard') {
        // Preload de estadísticas del dashboard
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setCache(`data_${path}`, data, cacheTTL)
        }
      }

    } catch (error) {
      // Error handled
    }
  }, [enablePreload, cacheTTL])

  // Navegación optimizada
  const navigateTo = useCallback(async (path: string, options?: { replace?: boolean }) => {
    // Registrar acceso
    registerRouteAccess(path)

    // Prefetch si no está en caché
    if (enablePrefetch) {
      const cached = getCache(`route_${path}`)
      if (!cached) {
        // Prefetch en paralelo con la navegación
        prefetchRoute(path).catch(() => {})
      }
    }

    // Preload datos si es necesario
    if (enablePreload) {
      preloadRouteData(path).catch(() => {})
    }

    // Navegar
    if (options?.replace) {
      router.replace(path)
    } else {
      router.push(path)
    }
  }, [router, enablePrefetch, enablePreload, registerRouteAccess, prefetchRoute, preloadRouteData])

  // Limpiar rutas antiguas
  const cleanupOldRoutes = useCallback(() => {
    const now = Date.now()
    const maxAge = 30 * 60 * 1000 // 30 minutos

    for (const [path, route] of routesRef.current.entries()) {
      if (now - route.lastAccessed > maxAge && route.priority === 'low') {
        routesRef.current.delete(path)
      }
    }
  }, [])

  // Efecto para registrar la ruta actual
  useEffect(() => {
    if (pathname) {
      registerRouteAccess(pathname)
      
      // Prefetch de rutas cercanas
      prefetchNearbyRoutes(pathname)
      
      // Preload de datos
      preloadRouteData(pathname)
    }
  }, [pathname, registerRouteAccess, prefetchNearbyRoutes, preloadRouteData])

  // Efecto para prefetch periódico
  useEffect(() => {
    if (!enablePrefetch) return

    const interval = setInterval(() => {
      prefetchPriorityRoutes()
      cleanupOldRoutes()
    }, 30 * 1000) // Cada 30 segundos

    return () => clearInterval(interval)
  }, [enablePrefetch, prefetchPriorityRoutes, cleanupOldRoutes])

  // Efecto para prefetch en idle
  useEffect(() => {
    if (!enablePrefetch || typeof window === 'undefined') return

    const handleIdle = () => {
      prefetchPriorityRoutes()
    }

    if ('requestIdleCallback' in window) {
      const idleId = requestIdleCallback(handleIdle)
      return () => cancelIdleCallback(idleId)
    } else {
      // Fallback para navegadores que no soportan requestIdleCallback
      const timeoutId = setTimeout(handleIdle, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [enablePrefetch, prefetchPriorityRoutes])

  return {
    navigateTo,
    prefetchRoute,
    prefetchPriorityRoutes,
    registerRouteAccess,
    getRouteStats: () => ({
      totalRoutes: routesRef.current.size,
      highPriorityRoutes: Array.from(routesRef.current.values()).filter(r => r.priority === 'high').length,
      prefetchQueueSize: prefetchQueueRef.current.size,
      isPrefetching: isPrefetchingRef.current
    })
  }
}

// Hook para optimización de navegación específica
export function useNavigationOptimization() {
  const router = useRouter()
  const pathname = usePathname()

  // Prefetch de enlaces visibles
  const prefetchVisibleLinks = useCallback(() => {
    if (typeof window === 'undefined') return

    const links = document.querySelectorAll('a[href^="/"]')
    const visibleLinks = Array.from(links).filter(link => {
      const rect = link.getBoundingClientRect()
      return rect.top >= 0 && rect.bottom <= window.innerHeight
    })

    // Prefetch de enlaces visibles
    visibleLinks.forEach(link => {
      const href = link.getAttribute('href')
      if (href && href !== pathname) {
        try {
          router.prefetch(href)
        } catch (error) {
          // Silenciar errores de prefetch
        }
      }
    })
  }, [router, pathname])

  // Efecto para prefetch de enlaces visibles
  useEffect(() => {
    const handleScroll = () => {
      // Throttle del scroll
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        requestIdleCallback(prefetchVisibleLinks)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [prefetchVisibleLinks])

  return {
    prefetchVisibleLinks
  }
}

export default useRouteOptimization






