"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { RefreshCw, AlertTriangle, X } from 'lucide-react'

interface WebpackErrorHandlerProps {
  onError?: (error: Error) => void
  onRecover?: () => void
  showRecovery?: boolean
}

export function WebpackErrorHandler({ 
  onError, 
  onRecover, 
  showRecovery = true 
}: WebpackErrorHandlerProps) {
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isRecovering, setIsRecovering] = useState(false)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error = event.error || event.message
      
      // Detectar errores específicos de webpack
      if (
        error.includes('Cannot read properties of undefined') ||
        error.includes('reading \'call\'') ||
        error.includes('webpack') ||
        error.includes('factory') ||
        error.includes('__webpack_require__')
      ) {
        console.log('🚨 Error de webpack detectado:', error)
        setHasError(true)
        setErrorMessage(error)
        
        if (onError) {
          onError(new Error(error))
        }
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason?.message || 'Promise rejection'
      
      if (
        error.includes('Cannot read properties of undefined') ||
        error.includes('reading \'call\'') ||
        error.includes('webpack')
      ) {
        console.log('🚨 Promise rejection de webpack:', error)
        setHasError(true)
        setErrorMessage(error)
        
        if (onError) {
          onError(new Error(error))
        }
      }
    }

    // Escuchar errores globales
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [onError])

  const handleRecover = async () => {
    setIsRecovering(true)
    
    try {
      console.log('🔄 Iniciando recuperación de error de webpack...')
      
      // Limpiar caché del navegador
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        )
        console.log('🗑️ Caché limpiado')
      }

      // Limpiar localStorage y sessionStorage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        console.log('🗑️ Storage limpiado')
      }

      // Esperar un poco antes de recargar
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Recargar la página
      window.location.reload()
      
    } catch (error) {
      console.error('❌ Error durante la recuperación:', error)
      setIsRecovering(false)
    }
  }

  const handleDismiss = () => {
    setHasError(false)
    setErrorMessage(null)
  }

  if (!hasError || !showRecovery) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Alert className="w-96 bg-white shadow-xl border-red-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-800">
              Error de Webpack Detectado
            </AlertTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <AlertDescription className="text-red-700 mt-2">
          <p className="mb-3">
            Se detectó un error de webpack relacionado con propiedades indefinidas. 
            Esto puede ser causado por problemas de caché o hidratación.
          </p>
          
          {errorMessage && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium">
                Ver detalles del error
              </summary>
              <pre className="mt-2 text-xs bg-red-50 p-2 rounded overflow-auto max-h-32">
                {errorMessage}
              </pre>
            </details>
          )}
        </AlertDescription>

        <div className="mt-4 space-y-2">
          <Button
            onClick={handleRecover}
            disabled={isRecovering}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRecovering ? 'animate-spin' : ''}`} />
            {isRecovering ? 'Recuperando...' : 'Recuperar automáticamente'}
          </Button>
          
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="w-full border-red-300 text-red-700 hover:bg-red-100"
            size="sm"
          >
            Recargar página manualmente
          </Button>
        </div>

        <div className="mt-3 text-xs text-red-600">
          💡 Si el problema persiste:
          <ul className="mt-1 ml-4 list-disc">
            <li>Limpia el caché del navegador</li>
            <li>Prueba en modo incógnito</li>
            <li>Reinicia el servidor de desarrollo</li>
          </ul>
        </div>
      </Alert>
    </div>
  )
}

// Hook para detectar errores de webpack
export function useWebpackError() {
  const [hasWebpackError, setHasWebpackError] = useState(false)
  const [webpackError, setWebpackError] = useState<Error | null>(null)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error = event.error || event.message
      
      if (
        error.includes('Cannot read properties of undefined') ||
        error.includes('reading \'call\'') ||
        error.includes('webpack') ||
        error.includes('factory')
      ) {
        setHasWebpackError(true)
        setWebpackError(new Error(error))
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  return { hasWebpackError, webpackError }
} 