"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import NextImage from 'next/image'
// import { optimizeImage } from '@/lib/performance-optimizer' // Módulo eliminado

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty' | 'data:image/...'
  sizes?: string
  fill?: boolean
  style?: React.CSSProperties
  onClick?: () => void
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'empty',
  sizes = '100vw',
  fill = false,
  style,
  onClick,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Función para optimizar URL de imagen
  const optimizeImageUrl = useCallback((url: string): string => {
    if (!url) return ''

    // Si es una URL de Vercel Blob, optimizar
    if (url.includes('vercel-storage.com')) {
      // Agregar parámetros de optimización
      const urlObj = new URL(url)
      urlObj.searchParams.set('q', quality.toString())
      urlObj.searchParams.set('w', width?.toString() || '800')
      urlObj.searchParams.set('h', height?.toString() || '600')
      urlObj.searchParams.set('fit', 'cover')
      urlObj.searchParams.set('fm', 'webp')
      return urlObj.toString()
    }

    // Si es una URL local, mantener como está
    if (url.startsWith('/')) {
      return url
    }

    return url
  }, [quality, width, height])

  // Configurar Intersection Observer para lazy loading
  useEffect(() => {
    if (!imgRef.current || priority) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    )

    observerRef.current = observer
    observer.observe(imgRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [priority])

  // Cargar imagen cuando esté en vista
  useEffect(() => {
    if (isInView && src) {
      const optimizedUrl = optimizeImageUrl(src)
      setImageSrc(optimizedUrl)
    }
  }, [isInView, src, optimizeImageUrl])

  // Optimizar imagen cuando se carga
  useEffect(() => {
    if (imgRef.current && imageSrc) {
      // optimizeImage(imgRef.current) // Función no disponible
    }
  }, [imageSrc])

  // Manejar carga exitosa
  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }, [onLoad])

  // Manejar error de carga
  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }, [onError])

  // Renderizar placeholder mientras carga
  if (!isInView && !priority) {
    return (
      <div
        ref={imgRef}
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          ...style
        }}
      />
    )
  }

  // Renderizar imagen con error
  if (hasError) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center text-gray-500 ${className}`}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          ...style
        }}
        onClick={onClick}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">🖼️</div>
          <div className="text-sm">Error cargando imagen</div>
        </div>
      </div>
    )
  }

  // Renderizar imagen optimizada
  return (
    <div
      className={`relative ${className}`}
      style={{
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
        ...style
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      
      <NextImage
        ref={imgRef}
        src={imageSrc || src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        sizes={sizes}
        fill={fill}
        onLoad={handleLoad}
        onError={handleError}
        onClick={onClick}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={{
          objectFit: 'cover',
          ...style
        }}
      />
    </div>
  )
}

// Componente de imagen con compresión automática
export function CompressedImage({
  src,
  alt,
  maxWidth = 800,
  maxHeight = 600,
  quality = 80,
  ...props
}: OptimizedImageProps & {
  maxWidth?: number
  maxHeight?: number
}) {
  const [compressedSrc, setCompressedSrc] = useState<string>('')

  // Comprimir imagen en el cliente
  useEffect(() => {
    if (!src) return

    const compressImage = async () => {
      if (typeof window === 'undefined' || typeof document === 'undefined') return
      
      try {
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) return

          // Calcular dimensiones manteniendo proporción
          let { width, height } = img
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }

          canvas.width = width
          canvas.height = height

          // Dibujar imagen comprimida
          ctx.drawImage(img, 0, 0, width, height)

          // Convertir a blob con calidad especificada
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob)
                setCompressedSrc(url)
              }
            },
            'image/webp',
            quality / 100
          )
        }

        img.src = src
      } catch (error) {
setCompressedSrc(src)
      }
    }

    compressImage()
  }, [src, maxWidth, maxHeight, quality])

  return (
    <OptimizedImage
      {...props}
      src={compressedSrc || src}
      alt={alt}
      quality={quality}
    />
  )
}

// Componente de imagen con lazy loading avanzado
export function LazyImage({
  src,
  alt,
  threshold = 0.1,
  rootMargin = '50px 0px',
  ...props
}: OptimizedImageProps & {
  threshold?: number
  rootMargin?: string
}) {
  const [isVisible, setIsVisible] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!imgRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
          }
        })
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  if (!isVisible) {
    return (
      <div
        ref={imgRef}
        className="bg-gray-200 animate-pulse rounded"
        style={{
          width: props.width,
          height: props.height
        }}
      />
    )
  }

  return (
    <OptimizedImage
      {...props}
      src={src}
      alt={alt}
      priority={false}
    />
  )
}

export default OptimizedImage





