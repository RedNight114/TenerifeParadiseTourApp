"use client"

import { useState, useEffect } from "react"
import { useNavigationRecovery } from "@/hooks/use-navigation-recovery"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export function NavigationRecovery() {
  const {
    safeNavigate,
    handleBackButton,
    hasNavigated,
    isNavigationLoading,
  } = useNavigationRecovery()

  // Renderizar solo la UI relevante con las propiedades disponibles
  return (
    <div>
      <button onClick={() => safeNavigate("/")}>Ir al inicio</button>
      <button onClick={handleBackButton}>Atrás</button>
      {isNavigationLoading && <span>Cargando navegación...</span>}
      {hasNavigated && <span>Navegación completada</span>}
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

      if (typeof document !== 'undefined') {
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