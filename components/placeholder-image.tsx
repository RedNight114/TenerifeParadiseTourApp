"use client"

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface PlaceholderImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  sizes?: string
}

export function PlaceholderImage({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}: PlaceholderImageProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  // Función para verificar si la URL es de Vercel Blob
  const isVercelBlobUrl = (url: string) => {
    return url.includes('vercel-storage.com') || 
           url.includes('blob.vercel-storage.com') ||
           url.includes('kykyyqga68e5j72o.public.blob.vercel-storage.com')
  }

  // Función para obtener imagen de placeholder basada en el título
  const getPlaceholderImage = (title: string) => {
    const name = title.toLowerCase()
    
    // Mapear servicios a imágenes de placeholder que SÍ existen
    if (name.includes('freebird') || name.includes('f24') || name.includes('4x4')) {
      return '/placeholder.jpg' // Imagen por defecto que existe
    }
    if (name.includes('forestal') || name.includes('park') || name.includes('senderismo')) {
      return '/placeholder.jpg' // Imagen por defecto que existe
    }
    if (name.includes('peter') || name.includes('pan') || name.includes('barco')) {
      return '/placeholder.jpg' // Imagen por defecto que existe
    }
    if (name.includes('restaurante') || name.includes('food')) {
      return '/placeholder.jpg' // Imagen por defecto que existe
    }
    
    // Imagen por defecto que sabemos que existe
    return '/placeholder.jpg'
  }

  useEffect(() => {
    // Si es una URL de Vercel Blob, usar placeholder inmediatamente
    if (isVercelBlobUrl(src)) {
const title = alt.split(' - ')[0] || 'Servicio'
      const placeholderImage = getPlaceholderImage(title)
      setImageSrc(placeholderImage)
      setHasError(false)
    } else {
      setImageSrc(src)
      setHasError(false)
    }
  }, [src, alt])

  const handleError = () => {
if (!hasError) {
      setHasError(true)
      const title = alt.split(' - ')[0] || 'Servicio'
      const placeholderImage = getPlaceholderImage(title)
      setImageSrc(placeholderImage)
    }
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={imageSrc}
        alt={alt}
        fill
        className="object-cover"
        priority={priority}
        sizes={sizes}
        onError={handleError}
      />
    </div>
  )
}





