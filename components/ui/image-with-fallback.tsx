'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ImageWithFallbackProps {
  src: string
  alt: string
  fallbackSrc?: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
  quality?: number
  fill?: boolean
  sizes?: string
  style?: React.CSSProperties
}

export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc = '/images/placeholder.jpg',
  className,
  width,
  height,
  priority = false,
  quality = 75,
  fill = false,
  sizes,
  style,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
              // Imagen no encontrada, usando fallback
      setImgSrc(fallbackSrc)
      setHasError(true)
    } else {
      console.error(`❌ Imagen de fallback también falló: ${fallbackSrc}`)
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  // Si la imagen es una URL completa (Vercel Blob), usar directamente
  if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
    return (
      <div className={`relative ${className || ''}`} style={style}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
            <div className="text-gray-400 text-sm">Cargando...</div>
          </div>
        )}
        
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          quality={quality}
          fill={fill}
          sizes={sizes}
          className={`transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onError={handleError}
          onLoad={handleLoad}
          {...props}
        />
      </div>
    )
  }

  // Para imágenes locales, usar un enfoque más simple
  return (
    <div className={`relative ${className || ''}`} style={style}>
      <Image
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        fill={fill}
        sizes={sizes}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${hasError ? 'grayscale' : ''}`}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
          <div className="text-center text-gray-500">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-xs">Imagen no disponible</div>
          </div>
        </div>
      )}
    </div>
  )
} 