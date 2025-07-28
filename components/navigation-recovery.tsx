"use client"

import { useState, useEffect } from 'react'
import { useNavigationRecovery } from '@/hooks/use-navigation-recovery'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { RefreshCw, Trash2, Home, AlertTriangle } from 'lucide-react'

interface NavigationRecoveryProps {
  showOnError?: boolean
  autoHide?: boolean
  hideDelay?: number
  className?: string
}

export function NavigationRecovery({
  showOnError = true,
  autoHide = true,
  hideDelay = 10000,
  className = ""
}: NavigationRecoveryProps) {
  const [showRecovery, setShowRecovery] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const {
    isRecovering,
    retryCount,
    lastError,
    manualRecover,
    manualClearCache
  } = useNavigationRecovery({
    maxRetries: 3,
    retryDelay: 2000,
    autoRecover: true,
    clearCacheOnError: true
  })

  // Detectar problemas de carga
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const checkForProblems = () => {
      // Detectar si hay problemas de carga
      const hasLoadingIssues = document.querySelectorAll('[data-loading="true"]').length > 0
      const hasNetworkErrors = lastError !== null
      const hasFailedRequests = document.querySelectorAll('.network-error').length > 0

      if (hasLoadingIssues || hasNetworkErrors || hasFailedRequests) {
        setShowRecovery(true)
        setErrorMessage(lastError || 'Problemas de carga detectados')
        
        // Auto-ocultar después del delay
        if (autoHide) {
          timeoutId = setTimeout(() => {
            setShowRecovery(false)
            setErrorMessage(null)
          }, hideDelay)
        }
      } else {
        setShowRecovery(false)
        setErrorMessage(null)
      }
    }

    // Verificar cada 5 segundos
    const intervalId = setInterval(checkForProblems, 5000)

    // Verificación inicial
    checkForProblems()

    return () => {
      clearInterval(intervalId)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [lastError, autoHide, hideDelay])

  // No mostrar si no hay problemas
  if (!showRecovery && !showOnError) {
    return null
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-sm ${className}`}>
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-800">
          Problemas de navegación detectados
        </AlertTitle>
        <AlertDescription className="text-orange-700 mt-2">
          {errorMessage || 'Se detectaron problemas al cargar los datos. Esto puede ocurrir después de navegar a una página errónea.'}
          
          {retryCount > 0 && (
            <div className="mt-2 text-sm">
              Intentos de recuperación: {retryCount}/3
            </div>
          )}
        </AlertDescription>

        <div className="mt-4 space-y-2">
          {/* Botón de recuperación automática */}
          <Button
            onClick={manualRecover}
            disabled={isRecovering}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRecovering ? 'animate-spin' : ''}`} />
            {isRecovering ? 'Recuperando...' : 'Recuperar automáticamente'}
          </Button>

          {/* Botón de limpiar caché */}
          <Button
            onClick={manualClearCache}
            variant="outline"
            className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpiar caché
          </Button>

          {/* Botón de ir al inicio */}
          <Button
            onClick={() => window.location.href = '/'}
            variant="ghost"
            className="w-full text-orange-600 hover:bg-orange-100"
            size="sm"
          >
            <Home className="h-4 w-4 mr-2" />
            Ir al inicio
          </Button>
        </div>

        {/* Información adicional */}
        <div className="mt-3 text-xs text-orange-600">
          💡 Si los problemas persisten, intenta:
          <ul className="mt-1 ml-4 list-disc">
            <li>Limpiar caché del navegador</li>
            <li>Recargar la página</li>
            <li>Usar modo incógnito</li>
          </ul>
        </div>
      </Alert>
    </div>
  )
}

// Componente de detección de problemas
export function ProblemDetector() {
  const [hasProblems, setHasProblems] = useState(false)

  useEffect(() => {
    const checkForProblems = () => {
      // Detectar problemas comunes
      const problems = []

      // Problemas de red
      if (navigator.onLine === false) {
        problems.push('Sin conexión a internet')
      }

      // Problemas de carga
      const loadingElements = document.querySelectorAll('[data-loading="true"]')
      if (loadingElements.length > 5) {
        problems.push('Muchos elementos cargando')
      }

      // Problemas de caché
      const cacheErrors = document.querySelectorAll('.cache-error')
      if (cacheErrors.length > 0) {
        problems.push('Errores de caché')
      }

      // Problemas de hidratación
      const hydrationErrors = document.querySelectorAll('.hydration-error')
      if (hydrationErrors.length > 0) {
        problems.push('Errores de hidratación')
      }

      setHasProblems(problems.length > 0)
    }

    // Verificar cada 3 segundos
    const intervalId = setInterval(checkForProblems, 3000)
    
    // Verificación inicial
    checkForProblems()

    return () => clearInterval(intervalId)
  }, [])

  if (!hasProblems) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">
          Problemas detectados
        </AlertTitle>
        <AlertDescription className="text-red-700">
          Se detectaron problemas técnicos. Considera recargar la página.
        </AlertDescription>
      </Alert>
    </div>
  )
} 