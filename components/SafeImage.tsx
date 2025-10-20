"use client"

import { useState, useEffect } from 'react'

interface SafeImageProps {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
  fill?: boolean
  sizes?: string
}

export function SafeImage({
  src,
  alt,
  className = '',
  fallbackSrc = '/images/service-default.jpg',
  fill = false,
  sizes
}: SafeImageProps) {
  const [imageSrc, setImageSrc] = useState(fallbackSrc)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (src) {
      setIsLoading(true)
      setHasError(false)
      
      // Crear una nueva imagen para probar la carga
      const img = new Image()
      
      img.onload = () => {
        setImageSrc(src)
        setIsLoading(false)
        setHasError(false)
      }
      
      img.onerror = () => {
        console.warn(`Error cargando imagen: ${src}, usando fallback`)
        setImageSrc(fallbackSrc)
        setIsLoading(false)
        setHasError(true)
      }
      
      // Intentar cargar la imagen
      img.src = src
    }
  }, [src, fallbackSrc])

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''} ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 mx-auto mb-2"></div>
            <span className="text-gray-500 text-xs">Cargando...</span>
          </div>
        </div>
      )}
      
      <img
        src={imageSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${fill ? 'object-cover w-full h-full' : ''}`}
        style={fill ? { 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        } : undefined}
        sizes={sizes}
      />
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-sm">📷</span>
            </div>
            <span className="text-xs">Imagen no disponible</span>
          </div>
        </div>
      )}
    </div>
  )
}
