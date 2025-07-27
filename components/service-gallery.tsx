"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { normalizeImageUrl } from "@/lib/utils"

interface ServiceGalleryProps {
  images: string[]
  serviceTitle: string
  className?: string
}

export function ServiceGallery({ images, serviceTitle, className = "" }: ServiceGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
        <div className="text-gray-500">
          <Image
            src="/placeholder.svg?height=200&width=300&text=Sin+imágenes"
            alt="Sin imágenes"
            width={300}
            height={200}
            className="mx-auto mb-4 opacity-50"
          />
          <p className="text-sm">No hay imágenes disponibles para este servicio</p>
        </div>
      </div>
    )
  }

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length)
  }

  const previousImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      nextImage()
    } else if (e.key === "ArrowLeft") {
      previousImage()
    } else if (e.key === "Escape") {
      setIsModalOpen(false)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Imagen principal */}
      <div className="relative group">
        <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden rounded-lg">
          <Image
            src={normalizeImageUrl(images[selectedImageIndex])}
            alt={`${serviceTitle} - Imagen ${selectedImageIndex + 1}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Overlay con controles */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white text-gray-800"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black">
                  <div className="relative h-full">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
                      onClick={() => setIsModalOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    
                    <div className="relative h-full flex items-center justify-center">
                      <Image
                        src={normalizeImageUrl(images[selectedImageIndex])}
                        alt={`${serviceTitle} - Imagen ${selectedImageIndex + 1}`}
                        fill
                        className="object-contain"
                        sizes="90vw"
                      />
                      
                      {/* Controles de navegación */}
                      {images.length > 1 && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute left-4 bg-black/50 hover:bg-black/70 text-white"
                            onClick={previousImage}
                          >
                            <ChevronLeft className="h-6 w-6" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute right-4 bg-black/50 hover:bg-black/70 text-white"
                            onClick={nextImage}
                          >
                            <ChevronRight className="h-6 w-6" />
                          </Button>
                        </>
                      )}
                    </div>
                    
                    {/* Indicador de imagen */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <Badge variant="secondary" className="bg-black/50 text-white">
                        {selectedImageIndex + 1} / {images.length}
                      </Badge>
                    </div>
                  </div>
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
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={previousImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Indicador de imagen actual */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <Badge variant="secondary" className="bg-black/50 text-white">
              {selectedImageIndex + 1} / {images.length}
            </Badge>
          </div>
        )}
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                index === selectedImageIndex
                  ? "border-[#0061A8] ring-2 ring-[#0061A8]/20"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Image
                src={normalizeImageUrl(image)}
                alt={`${serviceTitle} - Miniatura ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, (max-width: 1200px) 16vw, 12vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 