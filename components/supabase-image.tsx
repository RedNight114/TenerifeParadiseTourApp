"use client"

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface SupabaseImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  sizes?: string
}

export function SupabaseImage({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}: SupabaseImageProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)



  // Función para obtener imagen de fallback
  const getFallbackImage = () => {
    return '/placeholder.jpg'
  }

  useEffect(() => {
    // Resetear estado cuando cambie la fuente
    setImageSrc(src)
    setIsLoaded(false)
    setHasError(false)
    setIsLoading(true)
  }, [src])

  const handleLoad = () => {
    setIsLoaded(true)
    setHasError(false)
    setIsLoading(false)
  }

  const handleError = () => {
    // Si es la primera vez que falla, intentar con la URL original
    if (!hasError) {
      setHasError(true)
      // Mantener la URL original para reintentos
      return
    }
    
    // Si ya falló antes, usar imagen de fallback
    setImageSrc(getFallbackImage())
    setHasError(false)
    setIsLoading(true)
    setIsLoaded(false)
  }

  // Mostrar placeholder mientras carga
  if (isLoading && !isLoaded) {
    return (
      <div className={`relative bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-500 text-xs">Cargando imagen...</p>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar imagen principal
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={imageSrc}
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
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-1" />
            <p className="text-gray-500 text-xs">Cargando...</p>
          </div>
        </div>
      )}
    </div>
  )
}




