'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface SupabaseStorageImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fallbackSrc?: string
  fill?: boolean
  sizes?: string
}

export default function SupabaseStorageImage({
  src,
  alt,
  width = 400,
  height = 300,
  className = '',
  priority = false,
  fallbackSrc = '/images/placeholder.jpg',
  fill = false,
  sizes
}: SupabaseStorageImageProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Función para validar URL de imagen
  const isValidImageUrl = (url: string) => {
    try {
      new URL(url)
      return url.startsWith('http://') || url.startsWith('https://')
    } catch {
      return false
    }
  }

  // Actualizar src cuando cambie
  useEffect(() => {
    if (src !== imageSrc) {
      setImageSrc(src)
      setIsLoading(true)
      setHasError(false)
    }
  }, [src, imageSrc])

  // Función para manejar errores de carga
  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      // Solo usar fallback si es diferente al src original
      if (fallbackSrc && fallbackSrc !== src) {
        setImageSrc(fallbackSrc)
      }
      setIsLoading(false)
    }
  }

  // Función para manejar carga exitosa
  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  // Función para manejar carga
  const handleLoadStart = () => {
    setIsLoading(true)
  }

  // ✅ OPTIMIZADO: Debug logging solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    }

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''} ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <span className="text-gray-500 text-xs">Cargando imagen...</span>
          </div>
        </div>
      )}
      
      <Image
        src={imageSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${fill ? 'object-cover' : ''}`}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        onLoadStart={handleLoadStart}
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        style={fill ? { 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        } : undefined}
      />
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-gray-500 text-sm">Imagen no disponible</span>
        </div>
      )}
    </div>
  )
}
