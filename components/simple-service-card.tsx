"use client"

import { useState, useCallback, memo, useRef, useEffect, useMemo } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Clock, Users, Car, Utensils, Activity, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import type { Service } from "@/lib/supabase"
import SupabaseStorageImage from "@/components/supabase-storage-image"

interface SimpleServiceCardProps {
  service: Service
  priority?: boolean
  className?: string
}

// ✅ OPTIMIZADO: Componente de skeleton memoizado
const ServiceCardSkeleton = memo(() => (
  <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
    <div className="relative h-72 w-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-t-xl" />
    <CardContent className="p-4">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </CardContent>
    <CardFooter className="p-4 pt-0">
      <div className="flex items-center justify-between w-full">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    </CardFooter>
  </Card>
))

ServiceCardSkeleton.displayName = 'ServiceCardSkeleton'

// ✅ OPTIMIZADO: Componente de imagen con memoización mejorada
const SimpleServiceImage = memo(({ 
  service, 
  priority = false 
}: { 
  service: Service
  priority?: boolean 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // ✅ OPTIMIZADO: Memoizar imágenes filtradas
  const images = useMemo(() => 
    service.images?.filter(img => img && img.trim()) || [], 
    [service.images]
  )
  
  // ✅ OPTIMIZADO: Callbacks memoizados
  const handleNextImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (images.length > 1) {
      setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)
    }
  }, [images.length])

  const handlePrevImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (images.length > 1) {
      setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)
    }
  }, [images.length])

  const handleIndicatorClick = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex(index)
  }, [])

  // ✅ OPTIMIZADO: Memoizar placeholder
  const placeholder = useMemo(() => (
    <div className="relative h-72 w-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-xl flex items-center justify-center">
      <div className="text-center">
        <Activity className="h-16 w-16 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">Sin imágenes</p>
      </div>
    </div>
  ), [])

  // Mostrar placeholder si no hay imágenes
  if (images.length === 0) {
    return placeholder
  }

  const currentImage = images[currentImageIndex]

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-t-xl group">
      {/* ✅ CORREGIDO: Imagen principal con dimensiones explícitas */}
      <SupabaseStorageImage
        src={currentImage}
        alt={`${service.title} - Imagen ${currentImageIndex + 1}`}
        width={400}
        height={288}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      
      {/* ✅ OPTIMIZADO: Controles de navegación solo si hay múltiples imágenes */}
      {images.length > 1 && (
        <>
          {/* Botón anterior */}
          <button
            onClick={handlePrevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          {/* Botón siguiente */}
          <button
            onClick={handleNextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Imagen siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          
          {/* Indicadores de imagen */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => handleIndicatorClick(index, e)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentImageIndex 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
})

SimpleServiceImage.displayName = 'SimpleServiceImage'

// ✅ OPTIMIZADO: Componente principal con memoización mejorada
export const SimpleServiceCard = memo(({ 
  service, 
  priority = false,
  className = "" 
}: SimpleServiceCardProps) => {

  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // ✅ OPTIMIZADO: Intersection Observer con cleanup mejorado
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

  // ✅ OPTIMIZADO: Funciones memoizadas para evitar recreaciones
  const getCategoryIcon = useCallback((categoryName: string) => {
    const name = categoryName.toLowerCase()
    if (name.includes('barco') || name.includes('boat')) return <Car className="w-4 h-4" />
    if (name.includes('actividad') || name.includes('aventura')) return <Activity className="w-4 h-4" />
    if (name.includes('restaurante') || name.includes('food')) return <Utensils className="w-4 h-4" />
    return <Activity className="w-4 h-4" />
  }, [])

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price)
  }, [])




  const participantsInfo = useMemo(() => {
    if (!service.max_group_size) return null
    
    return (
      <div className="flex items-center gap-1 text-gray-600 text-sm">
        <Users className="w-4 h-4" />
        <span>Máx. {service.max_group_size} personas</span>
      </div>
    )
  }, [service.max_group_size])

  // ✅ OPTIMIZADO: Memoizar precio formateado
  const formattedPrice = useMemo(() => 
    formatPrice(service.price), 
    [service.price, formatPrice]
  )



  return (
    <Card 
      ref={cardRef}
      className={`group overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}

    >
      {/* Imagen del servicio */}
      <SimpleServiceImage service={service} priority={priority} />

      {/* Contenido de la tarjeta */}
      <CardContent className="p-4">
        {/* Título y descripción */}
        <div className="mb-3">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {service.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {service.description}
          </p>
        </div>

        {/* Información del servicio */}
        <div className="space-y-2 mb-4">
          {/* Ubicación */}
          {service.location && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="line-clamp-1">{service.location}</span>
            </div>
          )}

          {/* Duración */}
          {service.duration && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{service.duration}</span>
            </div>
          )}

          {/* Capacidad */}
                      <div className="flex items-center text-sm text-gray-500">
              <Users className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{service.max_group_size || '1+'} personas</span>
            </div>
        </div>
      </CardContent>

      {/* Footer de la tarjeta */}
      <CardFooter className="p-4 pt-0">
        <div className="flex items-center justify-between w-full">
          {/* Precio */}
          <div className="text-left">
            <div className="text-2xl font-bold text-green-600">
              {formattedPrice}
            </div>
            <div className="text-xs text-gray-500">por persona</div>
          </div>

          {/* Botón de ver detalles */}
          <Link href={`/services/${service.id}`}>
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Ver detalles
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
})

SimpleServiceCard.displayName = 'SimpleServiceCard'
