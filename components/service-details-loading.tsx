"use client"

import { useState, useEffect } from 'react'
import { Loader2, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface ServiceDetailsLoadingProps {
  isLoading: boolean
  error?: string | null
  onRetry?: () => void
  timeout?: number
}

export function ServiceDetailsLoading({
  isLoading,
  error,
  onRetry,
  timeout = 10000 // 10 segundos para servicios
}: ServiceDetailsLoadingProps) {
  const [showTimeout, setShowTimeout] = useState(false)
  const [progress, setProgress] = useState(0)

  // Simular progreso realista
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 85) return prev // No llegar al 100% hasta que esté listo
          return prev + Math.random() * 8
        })
      }, 300)

      return () => clearInterval(interval)
    } else {
      setProgress(100)
    }
  }, [isLoading])

  // Manejar timeout
  useEffect(() => {
    if (isLoading && timeout) {
      const timer = setTimeout(() => {
        setShowTimeout(true)
      }, timeout)

      return () => clearTimeout(timer)
    }
  }, [isLoading, timeout])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error al cargar el servicio
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Intentar de nuevo
            </button>
          )}
        </div>
      </div>
    )
  }

  if (showTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md mx-auto px-4">
          <Clock className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            La carga está tardando más de lo esperado
          </h2>
          <p className="text-gray-600 mb-4">
            Estamos optimizando la experiencia. Por favor, espera un momento más.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500">{Math.round(progress)}%</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Recargar página
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="relative mb-6">
          <Loader2 className="h-16 w-16 text-blue-600 mx-auto animate-spin" />
          <CheckCircle className="h-6 w-6 text-green-500 absolute -bottom-2 -right-2" />
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Cargando servicio...
        </h2>
        
        <p className="text-gray-600 mb-4">
          Preparando todos los detalles para ti
        </p>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-500">{Math.round(progress)}%</p>
        
        <div className="mt-6 space-y-2 text-sm text-gray-500">
          <p>• Verificando disponibilidad</p>
          <p>• Cargando imágenes</p>
          <p>• Preparando precios</p>
        </div>
      </div>
    </div>
  )
}
