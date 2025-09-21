"use client"

import { useEffect, useState, useCallback } from 'react'

interface ServiceWorkerState {
  isSupported: boolean
  isInstalled: boolean
  isUpdated: boolean
  isOnline: boolean
  cacheSize: number
  error: string | null
}

interface ServiceWorkerActions {
  update: () => void
  clearCache: () => Promise<void>
  preloadResources: (resources: string[]) => Promise<void>
  getCacheSize: () => Promise<number>
}

export function useServiceWorker(): ServiceWorkerState & ServiceWorkerActions {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isInstalled: false,
    isUpdated: false,
    isOnline: navigator.onLine,
    cacheSize: 0,
    error: null
  })

  // Verificar soporte de Service Worker
  useEffect(() => {
    const isSupported = 'serviceWorker' in navigator
    setState(prev => ({ ...prev, isSupported }))
  }, [])

  // Registrar Service Worker
  useEffect(() => {
    if (!state.isSupported) return

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })

        setState(prev => ({ 
          ...prev, 
          isInstalled: true,
          error: null 
        }))

        // Manejar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setState(prev => ({ ...prev, isUpdated: true }))
              }
            })
          }
        })

        // Manejar mensajes del Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          const { type, payload } = event.data
          
          switch (type) {
            case 'CACHE_SIZE_UPDATED':
              setState(prev => ({ ...prev, cacheSize: payload.size }))
              break
            case 'CACHE_CLEARED':
              setState(prev => ({ ...prev, cacheSize: 0 }))
              break
          }
        })

      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Error desconocido' 
        }))
      }
    }

    registerSW()
  }, [state.isSupported])

  // Manejar estado de conexión
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Actualizar Service Worker
  const update = useCallback(() => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }, [])

  // Limpiar caché
  const clearCache = useCallback(async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!navigator.serviceWorker.controller) {
        reject(new Error('Service Worker no disponible'))
        return
      }

      const messageChannel = new MessageChannel()
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          setState(prev => ({ ...prev, cacheSize: 0 }))
          resolve()
        } else {
          reject(new Error('Error limpiando caché'))
        }
      }

      navigator.serviceWorker.controller.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      )
    })
  }, [])

  // Precargar recursos
  const preloadResources = useCallback(async (resources: string[]): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!navigator.serviceWorker.controller) {
        reject(new Error('Service Worker no disponible'))
        return
      }

      const messageChannel = new MessageChannel()
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          resolve()
        } else {
          reject(new Error('Error precargando recursos'))
        }
      }

      navigator.serviceWorker.controller.postMessage(
        { 
          type: 'PRELOAD_RESOURCES',
          payload: { resources }
        },
        [messageChannel.port2]
      )
    })
  }, [])

  // Obtener tamaño del caché
  const getCacheSize = useCallback(async (): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (!navigator.serviceWorker.controller) {
        reject(new Error('Service Worker no disponible'))
        return
      }

      const messageChannel = new MessageChannel()
      
      messageChannel.port1.onmessage = (event) => {
        const { sizes } = event.data
        const totalSize = sizes.reduce((acc: number, size: any) => acc + size.count, 0)
        setState(prev => ({ ...prev, cacheSize: totalSize }))
        resolve(totalSize)
      }

      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_CACHE_SIZE' },
        [messageChannel.port2]
      )
    })
  }, [])

  return {
    ...state,
    update,
    clearCache,
    preloadResources,
    getCacheSize
  }
}

// Hook para precargar recursos críticos
export function usePreloadCriticalResources() {
  const { preloadResources } = useServiceWorker()

  useEffect(() => {
    // Precargar recursos críticos después de 2 segundos
    const timer = setTimeout(() => {
      const criticalResources = [
        '/api/services',
        '/api/categories',
        '/images/placeholder.jpg',
        '/images/error.jpg'
      ]

      preloadResources(criticalResources).catch((error) => {
        })
    }, 2000)

    return () => clearTimeout(timer)
  }, [preloadResources])
}

// Hook para manejar actualizaciones del Service Worker
export function useServiceWorkerUpdate() {
  const { isUpdated, update } = useServiceWorker()
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)

  useEffect(() => {
    if (isUpdated) {
      setShowUpdatePrompt(true)
    }
  }, [isUpdated])

  const handleUpdate = () => {
    update()
    setShowUpdatePrompt(false)
  }

  const dismissUpdate = () => {
    setShowUpdatePrompt(false)
  }

  return {
    showUpdatePrompt,
    handleUpdate,
    dismissUpdate
  }
}


