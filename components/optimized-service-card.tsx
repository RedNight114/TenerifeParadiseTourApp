"use client"

import { useState, useCallback, memo, useRef, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Clock, Users, Car, Utensils, Activity, Calendar, Euro, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import type { Service } from "@/lib/supabase"
import SupabaseStorageImage from "@/components/supabase-storage-image"

interface OptimizedServiceCardProps {
  service: Service
  priority?: boolean
  className?: string
}

// Componente de skeleton mejorado
const ServiceCardSkeleton = memo(() => (
  <Card className="group transition-all duration-300 border-0 shadow-lg bg-white overflow-hidden h-full hover:shadow-xl">
    {/* Skeleton de imagen con mejor proporción */}
    <div className="relative h-72 w-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-xl">
      <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      <div className="absolute top-3 left-3">
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="absolute top-3 right-3">
        <Skeleton className="h-6 w-12" />
      </div>
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-3 rounded-full" />
      </div>
    </div>

    {/* Skeleton de contenido mejorado */}
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-6 w-6 ml-3" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-5" />
      
      <div className="space-y-3">
        <div className="flex items-center">
          <Skeleton className="h-4 w-4 mr-3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex items-center">
          <Skeleton className="h-4 w-4 mr-3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="flex items-center">
          <Skeleton className="h-4 w-4 mr-3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </CardContent>

    {/* Skeleton de footer mejorado */}
    <CardFooter className="p-6 pt-0">
      <div className="w-full space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-8 w-24 bg-gray-200" />
            <Skeleton className="h-6 w-20 bg-gray-200" />
          </div>
          <Skeleton className="h-4 w-32 bg-gray-200 mb-3" />
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </CardFooter>
  </Card>
))

ServiceCardSkeleton.displayName = 'ServiceCardSkeleton'

// Componente de imagen optimizada simplificado
const OptimizedServiceImage = memo(({ 
  service, 
  priority = false 
}: { 
  service: Service
  priority?: boolean 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const images = service.images?.filter(img => img && img.trim()) || []

  const handleNextImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
if (images.length > 1) {
      const nextIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0
      setCurrentImageIndex(nextIndex)
}
  }, [currentImageIndex, images.length])

  const handlePrevImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
if (images.length > 1) {
      const prevIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1
      setCurrentImageIndex(prevIndex)
}
  }, [currentImageIndex, images.length])

  const handleIndicatorClick = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
setCurrentImageIndex(index)
  }, [])

  // Mostrar placeholder si no hay imágenes
  if (images.length === 0) {
return (
      <div className="relative h-72 w-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-xl flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-16 w-16 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Imagen no disponible</p>
        </div>
      </div>
    )
  }

  const currentImage = images[currentImageIndex]
return (
    <div className="relative h-72 w-full overflow-hidden rounded-t-xl group">
      {/* Imagen principal usando SupabaseStorageImage */}
      <SupabaseStorageImage
        src={images[currentImageIndex] || '/placeholder.jpg'}
        alt={`${service.title} - Imagen ${currentImageIndex + 1}`}
        width={400}
        height={300}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        priority={priority}
        fallbackSrc="/placeholder.jpg"
      />


      {/* Indicadores de imagen mejorados */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => handleIndicatorClick(index, e)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex ? 'bg-white scale-125 shadow-lg' : 'bg-white/60 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}

      {/* Botones de navegación mejorados */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevImage}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
            disabled={currentImageIndex === 0}
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextImage}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
            disabled={currentImageIndex === images.length - 1}
            aria-label="Siguiente imagen"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Badges superpuestos mejorados */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {service.featured && (
          <Badge variant="secondary" className="bg-yellow-500 text-white text-xs font-semibold shadow-lg">
            <Star className="w-3 h-3 mr-1" />
            Destacado
          </Badge>
        )}
        {!service.available && (
          <Badge variant="destructive" className="text-xs font-semibold shadow-lg">
            No disponible
          </Badge>
        )}
      </div>

      {/* Contador de imágenes mejorado */}
      {images.length > 1 && (
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-black/80 text-white text-xs font-semibold shadow-lg">
            {currentImageIndex + 1} / {images.length}
          </Badge>
        </div>
      )}


    </div>
  )
})

OptimizedServiceImage.displayName = 'OptimizedServiceImage'

// Componente principal de tarjeta optimizada mejorado
export const OptimizedServiceCard = memo(({ 
  service, 
  priority = false,
  className = "" 
}: OptimizedServiceCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Intersection Observer para animación de entrada
  useEffect(() => {
    if (!cardRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    observer.observe(cardRef.current)

    return () => observer.disconnect()
  }, [])

  const getCategoryIcon = useCallback((categoryId: string) => {
    switch (categoryId) {
      case '1': return <Car className="w-5 h-5" />
      case '2': return <Utensils className="w-5 h-5" />
      case '3': return <Activity className="w-5 h-5" />
      default: return <Calendar className="w-5 h-5" />
    }
  }, [])

  const formatPrice = useCallback((price: number, priceType: string) => {
    return priceType === 'per_person' ? `€ ${price} /persona` : `€ ${price}`
  }, [])

  const truncateText = useCallback((text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return `${text.substring(0, maxLength)  }...`
  }, [])

  const hasValidPrice = service.price && service.price > 0

  return (
    <Card 
      ref={cardRef}
      className={`group transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] border-0 shadow-lg bg-white overflow-hidden h-full ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagen optimizada mejorada */}
      <OptimizedServiceImage service={service} priority={priority} />

      {/* Contenido mejorado con mejor espaciado */}
      <CardContent className="p-6 flex-1">
        {/* Título y calendario con mejor jerarquía */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-bold text-xl line-clamp-2 flex-1 text-gray-900 leading-tight">
            {service.title}
          </h3>
          <div className="ml-4 text-gray-400 flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Descripción mejorada */}
        <p className="text-gray-600 text-sm mb-5 line-clamp-2 leading-relaxed">
          {truncateText(service.description, 120)}
        </p>

        {/* Información adicional organizada mejorada */}
        <div className="space-y-3">
          {/* Ubicación */}
          {service.location && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
              <span className="truncate font-medium">{service.location}</span>
            </div>
          )}

          {/* Duración */}
          {service.duration && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
              <span className="font-medium">{service.duration} horas</span>
            </div>
          )}

          {/* Tamaño del grupo */}
          {(service.min_group_size || service.max_group_size) && (
            <div className="flex items-center text-sm text-gray-500">
              <Users className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
              <span className="font-medium">
                {service.min_group_size && service.max_group_size 
                  ? `${service.min_group_size}-${service.max_group_size} personas`
                  : service.min_group_size 
                    ? `Mín. ${service.min_group_size} personas`
                    : `Máx. ${service.max_group_size} personas`
                }
              </span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer mejorado */}
      <CardFooter className="p-6 pt-0">
        <div className="w-full space-y-4">
          {/* Sección de precios mejorada con mejor legibilidad */}
          {hasValidPrice && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              {/* Precio principal con jerarquía mejorada */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-bold text-gray-900 leading-none">
                    € {service.price}
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    {service.price_type === 'per_person' ? '/persona' : ''}
                  </span>
                </div>
                {service.category && (
                  <Badge 
                    variant="outline" 
                    className="text-xs font-medium border-gray-300 text-gray-700 bg-white"
                  >
                    {service.category.name}
                  </Badge>
                )}
              </div>
              
              {/* Información adicional del precio */}
              <div className="text-xs text-gray-500 font-medium mb-3">
                Precio final • Sin cargos ocultos
              </div>
            </div>
          )}

          {/* Categoría cuando no hay precio */}
          {!hasValidPrice && service.category && (
            <div className="flex justify-center">
              <Badge 
                variant="outline" 
                className="text-sm font-semibold border-gray-300 text-gray-700 bg-gray-50 px-3 py-1.5"
              >
                {service.category.name}
              </Badge>
            </div>
          )}

          {/* Botón de acción mejorado */}
          <Link href={`/services/${service.id}`} className="w-full">
            <Button 
              className="w-full transition-all duration-200 hover:scale-105 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-3 shadow-lg"
              disabled={!service.available}
            >
              {service.available ? 'Ver detalles' : 'No disponible'}
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
})

OptimizedServiceCard.displayName = 'OptimizedServiceCard'

// Exportar también el skeleton para uso en loading states
export { ServiceCardSkeleton } 
