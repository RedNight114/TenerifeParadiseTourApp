"use client"

import { useState, useEffect } from 'react'

interface RobustImageProps {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
  fill?: boolean
}

export function RobustImage({
  src,
  alt,
  className = '',
  fallbackSrc = '/images/service-default.jpg',
  fill = false
}: RobustImageProps) {
  const [currentSrc, setCurrentSrc] = useState(fallbackSrc)
  const [isLoading, setIsLoading] = useState(true)
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    if (!src) {
      setCurrentSrc(fallbackSrc)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setAttempts(0)
    
    // Función para intentar cargar la imagen
    const tryLoadImage = (imageSrc: string) => {
      return new Promise<boolean>((resolve) => {
        const img = new Image()
        
        img.onload = () => {
          setCurrentSrc(imageSrc)
          setIsLoading(false)
          resolve(true)
        }
        
        img.onerror = () => {
          console.warn(`Error cargando imagen (intento ${attempts + 1}): ${imageSrc}`)
          resolve(false)
        }
        
        // Timeout después de 5 segundos
        setTimeout(() => {
          resolve(false)
        }, 5000)
        
        img.src = imageSrc
      })
    }

    // Intentar cargar la imagen principal
    tryLoadImage(src).then((success) => {
      if (!success && fallbackSrc && fallbackSrc !== src) {
        // Si falla, intentar con el fallback
        tryLoadImage(fallbackSrc).then((fallbackSuccess) => {
          if (!fallbackSuccess) {
            // Si también falla el fallback, usar una imagen por defecto
            setCurrentSrc('/images/service-default.jpg')
            setIsLoading(false)
          }
        })
      }
    })
  }, [src, fallbackSrc, attempts])

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''} ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 mx-auto mb-2"></div>
            <span className="text-gray-500 text-xs">Cargando imagen...</span>
          </div>
        </div>
      )}
      
      <img
        src={currentSrc}
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
        onError={() => {
          // Si aún falla, usar imagen por defecto
          if (currentSrc !== '/images/service-default.jpg') {
            setCurrentSrc('/images/service-default.jpg')
            setIsLoading(false)
          }
        }}
      />
    </div>
  )
}
