"use client"

import { useState } from 'react'
import Image from 'next/image'

interface SimpleImageLoaderProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
}

export default function SimpleImageLoader({
  src,
  alt,
  width = 400,
  height = 300,
  className = '',
  priority = false,
  fill = false,
  sizes
}: SimpleImageLoaderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
    }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    }

  // Si hay error, mostrar placeholder
  if (hasError) {
    return (
      <div className={`relative ${fill ? 'w-full h-full' : ''} ${className}`}>
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <span className="text-red-600 text-xs font-medium">Error de carga</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''} ${className}`}>
      {/* Loading overlay - solo visible brevemente */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center z-20 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <span className="text-gray-600 text-xs">Cargando...</span>
          </div>
        </div>
      )}
      
      {/* Imagen principal - siempre renderizada */}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={`${fill ? 'object-cover' : ''} transition-opacity duration-300`}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        quality={85}
        style={fill ? { 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        } : undefined}
      />
      
      {/* Debug info solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded text-[10px] z-30">
          {isLoading ? 'Loading' : 'Loaded'}
        </div>
      )}
    </div>
  )
}
