"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Trash2, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CacheCleanupProps {
  onCleanup?: () => void
  showButton?: boolean
  autoCleanup?: boolean
}

export function CacheCleanup({ 
  onCleanup, 
  showButton = true, 
  autoCleanup = false 
}: CacheCleanupProps) {
  const [isCleaning, setIsCleaning] = useState(false)
  const [lastCleanup, setLastCleanup] = useState<Date | null>(null)

  const clearAllCache = async () => {
    setIsCleaning(true)
    
    try {
      console.log('🧹 Iniciando limpieza de caché...')
      
      // 1. Limpiar localStorage
      if (typeof window !== 'undefined') {
        const keysToKeep = ['supabase.auth.token', 'supabase.auth.expires_at']
        const keysToRemove = []
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && !keysToKeep.includes(key)) {
            keysToRemove.push(key)
          }
        }
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key)
          console.log('🗑️ Removido de localStorage:', key)
        })
      }

      // 2. Limpiar sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.clear()
        console.log('🗑️ sessionStorage limpiado')
      }

      // 3. Limpiar cookies específicas
      if (typeof window !== 'undefined') {
        const cookiesToRemove = [
          'sb-',
          'supabase.',
          'next-auth.',
          'vercel-',
          '__nextjs_',
          '_next_'
        ]
        
        cookiesToRemove.forEach(prefix => {
          document.cookie.split(";").forEach(cookie => {
            const eqPos = cookie.indexOf("=")
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
            if (name.startsWith(prefix)) {
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
              console.log('🍪 Cookie removida:', name)
            }
          })
        })
      }

      // 4. Forzar recarga de recursos
      if (typeof window !== 'undefined') {
        // Limpiar caché de imágenes
        if ('caches' in window) {
          try {
            const cacheNames = await caches.keys()
            await Promise.all(
              cacheNames.map(name => caches.delete(name))
            )
            console.log('🖼️ Caché de imágenes limpiado')
          } catch (error) {
            console.log('⚠️ Error limpiando caché de imágenes:', error)
          }
        }

        // Limpiar caché de Service Worker
        if ('serviceWorker' in navigator) {
          try {
            const registrations = await navigator.serviceWorker.getRegistrations()
            await Promise.all(
              registrations.map(registration => registration.unregister())
            )
            console.log('🔧 Service Workers desregistrados')
          } catch (error) {
            console.log('⚠️ Error desregistrando Service Workers:', error)
          }
        }
      }

      // 5. Forzar recarga de la página
      setLastCleanup(new Date())
      console.log('✅ Limpieza de caché completada')
      
      // Notificar al componente padre
      if (onCleanup) {
        onCleanup()
      }

      // Recargar la página después de un breve delay
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      }, 1000)

    } catch (error) {
      console.error('❌ Error durante la limpieza de caché:', error)
    } finally {
      setIsCleaning(false)
    }
  }

  // Limpieza automática al montar el componente
  useEffect(() => {
    if (autoCleanup) {
      clearAllCache()
    }
  }, [autoCleanup])

  if (!showButton) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Alert className="w-80 bg-white shadow-lg border border-gray-200">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        <AlertDescription className="text-sm">
          <div className="space-y-2">
            <p className="font-medium">Problemas de caché detectados</p>
            <p className="text-xs text-gray-600">
              Si los datos no cargan correctamente, limpia el caché del navegador.
            </p>
            <Button
              onClick={clearAllCache}
              disabled={isCleaning}
              size="sm"
              variant="outline"
              className="w-full"
            >
              {isCleaning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Limpiando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpiar Caché
                </>
              )}
            </Button>
            {lastCleanup && (
              <p className="text-xs text-gray-500">
                Última limpieza: {lastCleanup.toLocaleTimeString()}
              </p>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
