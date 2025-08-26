"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Activity, Shield, AlertTriangle } from 'lucide-react'

interface BlockedImageProps {
  src: string
  alt: string
  fallbackSrc?: string
  className?: string
  priority?: boolean
  sizes?: string
}

export function BlockedImage({
  src,
  alt,
  fallbackSrc = '/placeholder.jpg',
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}: BlockedImageProps) {
  const [currentSrc, setCurrentSrc] = useState(fallbackSrc)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isBlocked, setIsBlocked] = useState(false)

  // Función para verificar si la URL está bloqueada (Vercel Blob)
  const isBlockedUrl = (url: string) => {
    return url.includes('vercel-storage.com') || 
           url.includes('blob.vercel-storage.com') ||
           url.includes('kykyyqga68e5j72o.public.blob.vercel-storage.com')
  }

  // Efecto para manejar cambios de fuente
  useEffect(() => {
// Si la URL está bloqueada, usar fallback inmediatamente
    if (isBlockedUrl(src)) {

setCurrentSrc(fallbackSrc)
      setIsBlocked(true)
      setIsLoading(true)
      setIsLoaded(false)
      return
    }

    // Si la URL no está bloqueada, intentar cargarla
setCurrentSrc(src)
    setIsBlocked(false)
    setIsLoading(true)
    setIsLoaded(false)
  }, [src, fallbackSrc])

  // Función para manejar carga exitosa
  const handleLoad = () => {
setIsLoaded(true)
    setIsLoading(false)
  }

  // Función para manejar error de carga
  const handleError = () => {
// Si hay error, usar fallback
    setCurrentSrc(fallbackSrc)
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
            <p className="text-gray-500 text-xs">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar imagen bloqueada
  if (isBlocked) {
    return (
      <div className={`relative bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Shield className="h-16 w-16 text-red-400 mx-auto mb-2" />
            <p className="text-red-600 text-sm font-medium mb-1">Imagen bloqueada</p>
            <p className="text-red-500 text-xs">URL de Vercel Blob no accesible</p>
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





