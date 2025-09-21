"use client"

import React, { useState, useEffect, useCallback, memo } from 'react'
import Image from 'next/image'
import SupabaseStorageImage from "@/components/supabase-storage-image"
import { ArrowLeft, ArrowRight, ZoomIn, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { 
  useImagePreloading, 
  IMAGE_CONFIG 
} from '@/lib/image-optimization'

interface OptimizedServiceGalleryProps {
  images: string[]
  serviceTitle: string
  className?: string
  priority?: boolean
}

export const OptimizedServiceGallery = memo(({
  images,
  serviceTitle,
  className = "",
  priority = false
}: OptimizedServiceGalleryProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  // Hook para preloading de imágenes
  useImagePreloading(images, selectedImageIndex, {
    distance: 2,
    priority: ['first', 'last']
  })

  // Función para navegar a la siguiente imagen
  const nextImage = useCallback(() => {
    setSelectedImageIndex(prev => 
      prev < images.length - 1 ? prev + 1 : 0
    )
  }, [images.length])

  // Función para navegar a la imagen anterior
  const previousImage = useCallback(() => {
    setSelectedImageIndex(prev => 
      prev > 0 ? prev - 1 : images.length - 1
    )
  }, [images.length])

  // Función para manejar carga de imagen
  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages(prev => new Set([...prev, index]))
  }, [])

  // Función para manejar error de imagen
  const handleImageError = useCallback((index: number) => {
    setImageErrors(prev => new Set([...prev, index]))
  }, [])

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          nextImage()
          break
        case 'ArrowLeft':
          e.preventDefault()
          previousImage()
          break
        case 'Escape':
          e.preventDefault()
          setIsModalOpen(false)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, nextImage, previousImage])

  // Precargar imagen principal al cambiar
  useEffect(() => {
    if (images[selectedImageIndex] && typeof window !== 'undefined') {
      const img = new window.Image()
      img.src = images[selectedImageIndex] // Assuming optimizeImageUrl is no longer needed
    }
  }, [selectedImageIndex, images])

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center h-64 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">📷</span>
          </div>
          <p className="text-sm">No hay imágenes disponibles</p>
        </div>
      </div>
    )
  }

  const currentImage = images[selectedImageIndex]
  const isImageLoaded = loadedImages.has(selectedImageIndex)
  const hasImageError = imageErrors.has(selectedImageIndex)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Imagen principal optimizada */}
      <div className="relative group">
        <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden rounded-lg bg-gray-100">
          {!hasImageError ? (
            <>
              <SupabaseStorageImage
                src={currentImage}
                alt={`${serviceTitle} - Imagen ${selectedImageIndex + 1}`}
                fill={true}
                className={`object-cover transition-all duration-500 w-full h-full ${
                  isImageLoaded 
                    ? 'opacity-100 scale-100' 
                    : 'opacity-0 scale-105'
                } group-hover:scale-105`}
                priority={priority}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                fallbackSrc="/placeholder.jpg"
              />
              
              {/* Skeleton loading */}
              {!isImageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-xl">⚠️</span>
                </div>
                <p className="text-sm">Error cargando imagen</p>
              </div>
            </div>
          )}
          
          {/* Overlay con controles */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white text-gray-800 shadow-lg"
                  >
                    <ZoomIn className="h-4 w-4 mr-1" />
                    Ampliar
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black/95 border-0">
                  <div className="relative h-full flex items-center justify-center">
                    <SupabaseStorageImage
                      src={currentImage}
                      alt={`${serviceTitle} - Imagen ${selectedImageIndex + 1}`}
                      fill={true}
                      className="max-h-full max-w-full object-contain w-full h-full"
                      priority={true}
                      sizes="90vw"
                      fallbackSrc="/placeholder.jpg"
                    />
                    
                    {/* Controles de navegación en modal */}
                    {images.length > 1 && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute left-4 bg-black/50 hover:bg-black/70 text-white"
                          onClick={previousImage}
                        >
                          <ArrowLeft className="h-6 w-6" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute right-4 bg-black/50 hover:bg-black/70 text-white"
                          onClick={nextImage}
                        >
                          <ArrowRight className="h-6 w-6" />
                        </Button>
                      </>
                    )}
                  </div>
                  
                  {/* Indicador de imagen en modal */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <Badge variant="secondary" className="bg-black/50 text-white">
                      {selectedImageIndex + 1} / {images.length}
                    </Badge>
                  </div>
                  
                  {/* Botón de cerrar */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Controles de navegación (solo si hay más de una imagen) */}
        {images.length > 1 && (
          <>
            <Button
              size="sm"
              variant="ghost"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={previousImage}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={nextImage}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            
            {/* Indicador de imagen */}
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="bg-black/70 text-white">
                {selectedImageIndex + 1} / {images.length}
              </Badge>
            </div>
          </>
        )}
      </div>

      {/* Miniaturas optimizadas */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {images.map((image, index) => {
            const isThumbnailLoaded = loadedImages.has(index)
            const hasThumbnailError = imageErrors.has(index)
            
            return (
              <div
                key={index}
                className={`relative aspect-square rounded-lg cursor-pointer transition-all duration-200 overflow-hidden ${
                  index === selectedImageIndex 
                    ? 'ring-3 ring-blue-500 shadow-lg scale-105' 
                    : 'hover:opacity-80 hover:scale-105'
                }`}
                onClick={() => setSelectedImageIndex(index)}
              >
                {!hasThumbnailError ? (
                  <>
                    <SupabaseStorageImage
                      src={image}
                      alt={`${serviceTitle} - Miniatura ${index + 1}`}
                      fill={true}
                      className={`object-cover transition-opacity duration-300 w-full h-full ${
                        isThumbnailLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      sizes="(max-width: 768px) 25vw, (max-width: 1200px) 16vw, 12vw"
                      fallbackSrc="/placeholder.jpg"
                    />
                    
                    {/* Skeleton para miniatura */}
                    {!isThumbnailLoaded && (
                      <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">⚠️</span>
                  </div>
                )}
                
                {/* Indicador de imagen seleccionada */}
                {index === selectedImageIndex && (
                  <div className="absolute inset-0 bg-blue-500/20 rounded-lg" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
})

OptimizedServiceGallery.displayName = 'OptimizedServiceGallery' 