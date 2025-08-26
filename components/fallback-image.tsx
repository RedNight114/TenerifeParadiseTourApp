"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Activity, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FallbackImageProps {
  src: string
  alt: string
  fallbackSrc?: string
  className?: string
  priority?: boolean
  sizes?: string
  onLoad?: () => void
  onError?: () => void
}

export function FallbackImage({
  src,
  alt,
  fallbackSrc = '/placeholder.jpg',
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  onLoad,
  onError
}: FallbackImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 2

  // Función para manejar error de carga
  const handleError = () => {
    if (retryCount < maxRetries && currentSrc !== fallbackSrc) {
      // Reintentar con la imagen original
      setRetryCount(prev => prev + 1)
      setCurrentSrc(src)
      setHasError(false)
      setIsLoaded(false)
    } else {
      // Usar imagen de respaldo
      setCurrentSrc(fallbackSrc)
      setHasError(true)
      setIsLoaded(false)
    }
    onError?.()
  }

  // Función para manejar carga exitosa
  const handleLoad = () => {
    setIsLoaded(true)
    setHasError(false)
    onLoad?.()
  }

  // Función para reintentar manualmente
  const handleRetry = () => {
    setRetryCount(0)
    setCurrentSrc(src)
    setHasError(false)
    setIsLoaded(false)
  }

  // Resetear cuando cambie la fuente
  useEffect(() => {
    setCurrentSrc(src)
    setRetryCount(0)
    setHasError(false)
    setIsLoaded(false)
  }, [src])

  // Mostrar placeholder mientras carga
  if (!isLoaded && !hasError) {
    return (
      <div className={`relative bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Cargando imagen...</p>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar imagen de respaldo si hay error
  if (hasError && currentSrc === fallbackSrc) {
    return (
      <div className={`relative bg-gradient-to-br from-gray-200 to-gray-300 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Activity className="h-16 w-16 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm mb-2">Imagen no disponible</p>
            <Button 
              onClick={handleRetry} 
              size="sm" 
              variant="outline"
              className="text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar imagen principal
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={currentSrc}
        alt={alt}
        fill
        className={`object-cover transition-all duration-500 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        }`}
        priority={priority}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {/* Indicador de estado */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-500 text-xs">Cargando...</p>
          </div>
        </div>
      )}
    </div>
  )
}




