"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Activity } from 'lucide-react'

interface UltraSimpleImageProps {
  src: string
  alt: string
  fallbackSrc?: string
  className?: string
  priority?: boolean
  sizes?: string
}

export function UltraSimpleImage({
  src,
  alt,
  fallbackSrc = '/placeholder.jpg',
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}: UltraSimpleImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Función para verificar si la URL es de Vercel Blob (que sabemos que falla)
  const isVercelBlobUrl = (url: string) => {
    return url.includes('vercel-storage.com') || url.includes('blob.vercel-storage.com')
  }

  // Función para manejar error de carga
  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    
    // Si es una URL de Vercel Blob que falla, usar fallback inmediatamente
    if (isVercelBlobUrl(currentSrc)) {
      setCurrentSrc(fallbackSrc)
      setHasError(false)
      setIsLoading(true)
    }
  }

  // Función para manejar carga exitosa
  const handleLoad = () => {
    setIsLoaded(true)
    setHasError(false)
    setIsLoading(false)
  }

  // Efecto para manejar cambios de fuente
  useEffect(() => {
    // Si la URL es de Vercel Blob, usar fallback inmediatamente
    if (isVercelBlobUrl(src)) {
      setCurrentSrc(fallbackSrc)
      setHasError(false)
      setIsLoading(true)
      setIsLoaded(false)
    } else {
      setCurrentSrc(src)
      setHasError(false)
      setIsLoading(true)
      setIsLoaded(false)
    }
  }, [src, fallbackSrc])

  // Mostrar placeholder mientras carga
  if (isLoading && !isLoaded) {
    return (
      <div className={`relative bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-500 text-xs">Cargando...</p>
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
            <p className="text-gray-500 text-sm">Imagen no disponible</p>
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
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-1" />
            <p className="text-gray-500 text-xs">Cargando...</p>
          </div>
        </div>
      )}
    </div>
  )
}




