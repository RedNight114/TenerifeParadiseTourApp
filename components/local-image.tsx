"use client"

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface LocalImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  sizes?: string
}

export function LocalImage({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}: LocalImageProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  // Función para verificar si la URL es de Vercel Blob
  const isVercelBlobUrl = (url: string) => {
    return url.includes('vercel-storage.com') || 
           url.includes('blob.vercel-storage.com') ||
           url.includes('kykyyqga68e5j72o.public.blob.vercel-storage.com')
  }

  // Función para obtener imagen local basada en el título
  const getLocalImage = (title: string) => {
    const name = title.toLowerCase()
    
    // Mapear servicios a imágenes locales
    if (name.includes('freebird') || name.includes('f24')) {
      return '/images/4x4_1.jpg' // Imagen de 4x4
    }
    if (name.includes('forestal') || name.includes('park')) {
      return '/images/anaga1.jpg' // Imagen de senderismo
    }
    if (name.includes('peter') || name.includes('pan')) {
      return '/images/barco1.jpg' // Imagen de barco
    }
    if (name.includes('barco') || name.includes('boat')) {
      return '/images/barco1.jpg'
    }
    if (name.includes('senderismo') || name.includes('hiking')) {
      return '/images/anaga1.jpg'
    }
    if (name.includes('4x4') || name.includes('offroad')) {
      return '/images/4x4_1.jpg'
    }
    if (name.includes('restaurante') || name.includes('food')) {
      return '/images/restaurante1.jpg'
    }
    
    // Imagen por defecto
    return '/placeholder.jpg'
  }

  useEffect(() => {
    // Si es una URL de Vercel Blob, usar imagen local inmediatamente
    if (isVercelBlobUrl(src)) {
// Extraer el título del alt para mapear a imagen local
      const title = alt.split(' - ')[0] || 'Servicio'
      const localImage = getLocalImage(title)
      setImageSrc(localImage)
      setHasError(false)
    } else {
      setImageSrc(src)
      setHasError(false)
    }
  }, [src, alt])

  const handleError = () => {
if (!hasError) {
      setHasError(true)
      // Extraer el título del alt para mapear a imagen local
      const title = alt.split(' - ')[0] || 'Servicio'
      const localImage = getLocalImage(title)
      setImageSrc(localImage)
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





