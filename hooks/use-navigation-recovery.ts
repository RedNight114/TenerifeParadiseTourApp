"use client"

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface NavigationRecoveryOptions {
  maxRetries?: number
  retryDelay?: number
  autoRecover?: boolean
  clearCacheOnError?: boolean
}

interface NavigationState {
  isRecovering: boolean
  retryCount: number
  lastError: string | null
  lastNavigation: string | null
}

/**
 * Hook para manejar la recuperación automática después de navegación a páginas erróneas
 */
export function useNavigationRecovery(options: NavigationRecoveryOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 2000,
    autoRecover = true,
    clearCacheOnError = true
  } = options

  const router = useRouter()
  const stateRef = useRef<NavigationState>({
    isRecovering: false,
    retryCount: 0,
    lastError: null,
    lastNavigation: null
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Limpiar caché del cliente
  const clearClientCache = useCallback(() => {
    try {
      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        
        // Limpiar caché de imágenes
        if ('caches' in window) {
          caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
              caches.delete(cacheName)
            })
          })
        }

        // Limpiar caché de Service Workers
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => {
              registration.unregister()
            })
          })
        }

        console.log('🧹 Caché del cliente limpiado')
      }
    } catch (error) {
      console.error('Error limpiando caché:', error)
    }
  }, [])

  // Función de recuperación automática
  const recoverFromError = useCallback(async (error?: string) => {
    if (stateRef.current.isRecovering) {
      console.log('⚠️ Recuperación ya en curso, saltando...')
      return
    }

    stateRef.current.isRecovering = true
    stateRef.current.lastError = error || 'Error de navegación'
    stateRef.current.retryCount++

    console.log(`🔄 Intento de recuperación ${stateRef.current.retryCount}/${maxRetries}`)

    try {
      // Limpiar caché si está habilitado
      if (clearCacheOnError) {
        clearClientCache()
      }

      // Esperar un poco antes de reintentar
      await new Promise(resolve => setTimeout(resolve, retryDelay))

      // Forzar recarga de la página actual
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        
        // Si estamos en una página errónea, volver a la página principal
        if (currentPath.includes('error') || currentPath.includes('404')) {
          console.log('🔄 Redirigiendo a página principal...')
          router.push('/')
        } else {
          // Recargar la página actual
          console.log('🔄 Recargando página actual...')
          window.location.reload()
        }
      }

    } catch (recoveryError) {
      console.error('❌ Error durante la recuperación:', recoveryError)
      
      // Si hemos agotado los intentos, mostrar error al usuario
      if (stateRef.current.retryCount >= maxRetries) {
        console.error('❌ Máximo de intentos de recuperación alcanzado')
        stateRef.current.isRecovering = false
        return
      }

      // Programar siguiente intento
      timeoutRef.current = setTimeout(() => {
        recoverFromError(error)
      }, retryDelay * Math.pow(2, stateRef.current.retryCount))
    }
  }, [maxRetries, retryDelay, clearCacheOnError, clearClientCache, router])

  // Detectar errores de navegación
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error = event.error || event.message
      
      // Detectar errores específicos de navegación
      if (
        error.includes('navigation') ||
        error.includes('routing') ||
        error.includes('404') ||
        error.includes('fetch') ||
        error.includes('network')
      ) {
        console.log('🚨 Error de navegación detectado:', error)
        
        if (autoRecover) {
          recoverFromError(error)
        }
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason?.message || 'Promise rejection'
      
      if (
        error.includes('navigation') ||
        error.includes('routing') ||
        error.includes('fetch')
      ) {
        console.log('🚨 Promise rejection de navegación:', error)
        
        if (autoRecover) {
          recoverFromError(error)
        }
      }
    }

    // Escuchar errores globales
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      
      // Limpiar timeout al desmontar
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [autoRecover, recoverFromError])

  // Detectar cambios de ruta
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      stateRef.current.lastNavigation = url
      stateRef.current.retryCount = 0 // Resetear contador en navegación exitosa
      
      console.log('📍 Navegación a:', url)
    }

    // Escuchar cambios de ruta
    if (typeof window !== 'undefined') {
      const originalPushState = history.pushState
      const originalReplaceState = history.replaceState

      history.pushState = function(...args) {
        originalPushState.apply(history, args)
        handleRouteChange(args[2] as string)
      }

      history.replaceState = function(...args) {
        originalReplaceState.apply(history, args)
        handleRouteChange(args[2] as string)
      }

      return () => {
        history.pushState = originalPushState
        history.replaceState = originalReplaceState
      }
    }
  }, [])

  // Función manual para recuperación
  const manualRecover = useCallback(() => {
    console.log('🔧 Recuperación manual iniciada')
    stateRef.current.retryCount = 0
    recoverFromError('Recuperación manual')
  }, [recoverFromError])

  // Función para limpiar caché manualmente
  const manualClearCache = useCallback(() => {
    console.log('🧹 Limpieza manual de caché')
    clearClientCache()
  }, [clearClientCache])

  return {
    isRecovering: stateRef.current.isRecovering,
    retryCount: stateRef.current.retryCount,
    lastError: stateRef.current.lastError,
    lastNavigation: stateRef.current.lastNavigation,
    manualRecover,
    manualClearCache,
    recoverFromError
  }
} 