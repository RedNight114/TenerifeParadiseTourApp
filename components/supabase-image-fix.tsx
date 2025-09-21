"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface SupabaseImageFixProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
}

export default function SupabaseImageFix({
  src,
  alt,
  width = 400,
  height = 300,
  className = '',
  priority = false,
  fill = false,
  sizes
}: SupabaseImageFixProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Función para procesar URL de Supabase
  const processSupabaseUrl = (url: string) => {
    // Si es una URL de Supabase, asegurar que tenga los parámetros correctos
    if (url.includes('supabase.co/storage/v1/object/public/')) {
      // Verificar si ya tiene parámetros de query
      if (!url.includes('?')) {
        // Agregar parámetros para optimización
        return `${url}?t=${Date.now()}`
      }
    }
    return url
  }

  // Actualizar src cuando cambie
  useEffect(() => {
    if (src) {
      const processedUrl = processSupabaseUrl(src)
      setImageSrc(processedUrl)
      setIsLoading(true)
      setHasError(false)
      
      // Forzar visibilidad después de un breve delay
      setTimeout(() => {
        setIsLoading(false)
      }, 100)
    }
  }, [src])

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
    }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    }

  // Si hay error, mostrar placeholder mejorado
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
            <div className="text-xs text-gray-500 mt-1 break-all max-w-32">
              {src.length > 30 ? `${src.substring(0, 30)}...` : src}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''} ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-blue-300 animate-pulse rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <span className="text-blue-700 text-xs font-medium">Cargando imagen...</span>
          </div>
        </div>
      )}
      
      <Image
        src={imageSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={`transition-opacity duration-500 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${fill ? 'object-cover' : ''}`}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        // Configuración específica para Supabase
        unoptimized={false}
        quality={85}
        style={fill ? { 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: isLoading ? 0 : 1
        } : {
          opacity: isLoading ? 0 : 1
        }}
      />
      
      {/* Debug info solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded text-[10px]">
          {isLoading ? 'Loading' : 'Loaded'}
        </div>
      )}
    </div>
  )
}
