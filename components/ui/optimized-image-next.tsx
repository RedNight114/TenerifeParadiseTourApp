"use client"

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  fill?: boolean
  style?: React.CSSProperties
  onClick?: () => void
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImageNext({
  src,
  alt,
  width = 800,
  height = 600,
  className,
  priority = false,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  style,
  onClick,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Generar blur data URL si no se proporciona
  const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  // Si hay error, mostrar imagen de fallback
  if (hasError) {
    return (
      <div 
        className={cn(
          'bg-gray-200 flex items-center justify-center text-gray-500',
          className
        )}
        style={fill ? { width: '100%', height: '100%' } : { width, height }}
        onClick={onClick}
      >
        <span className="text-sm">Imagen no disponible</span>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)} onClick={onClick}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={fill ? { width: '100%', height: '100%' } : { width, height }}
        >
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL || defaultBlurDataURL}
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          fill ? 'object-cover' : ''
        )}
        style={style}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
}

// Componente especializado para imágenes hero
export function HeroImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <OptimizedImageNext
      src={src}
      alt={alt}
      fill
      priority
      quality={90}
      placeholder="blur"
      sizes="100vw"
      className={className}
    />
  )
}

// Componente especializado para imágenes de servicios
export function ServiceImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <OptimizedImageNext
      src={src}
      alt={alt}
      width={400}
      height={300}
      quality={85}
      placeholder="blur"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className={className}
    />
  )
}

// Componente especializado para avatares
export function AvatarImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <OptimizedImageNext
      src={src}
      alt={alt}
      width={64}
      height={64}
      quality={80}
      placeholder="blur"
      sizes="64px"
      className={cn('rounded-full', className)}
    />
  )
}

// Componente especializado para imágenes de galería
export function GalleryImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <OptimizedImageNext
      src={src}
      alt={alt}
      width={300}
      height={200}
      quality={85}
      placeholder="blur"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
      className={cn('rounded-lg', className)}
    />
  )
}

export default OptimizedImageNext
