"use client"

import { useState, useCallback, memo, useRef, useEffect, useMemo } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Clock, Users, Car, Utensils, Activity, ChevronLeft, ChevronRight, Heart, Share2, Eye, Calendar, Euro, Zap, Shield, Award, XCircle } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import type { Service } from "@/lib/supabase"
import SupabaseStorageImage from "@/components/supabase-storage-image"
import DirectImage from "@/components/direct-image"
import SupabaseImageFix from "@/components/supabase-image-fix"
import SimpleImageLoader from "@/components/simple-image-loader"
import WorkingImage from "@/components/working-image"

interface SimpleServiceCardProps {
  service: Service
  priority?: boolean
  className?: string
}

// ✅ OPTIMIZADO: Componente de skeleton mejorado
const ServiceCardSkeleton = memo(() => (
  <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-0 shadow-lg bg-white">
    {/* Skeleton de imagen mejorado */}
    <div className="relative h-80 w-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-t-xl">
      <div className="absolute top-4 left-4">
        <Skeleton className="h-6 w-16 bg-gray-300" />
      </div>
      <div className="absolute top-4 right-4">
        <Skeleton className="h-6 w-12 bg-gray-300" />
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        <Skeleton className="h-2 w-2 rounded-full bg-gray-300" />
        <Skeleton className="h-2 w-2 rounded-full bg-gray-300" />
        <Skeleton className="h-2 w-2 rounded-full bg-gray-300" />
      </div>
    </div>
    
    {/* Skeleton de contenido mejorado */}
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="ml-4 flex flex-col gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-5" />
      
      <div className="space-y-3 mb-5">
        <div className="flex items-center">
          <Skeleton className="h-6 w-6 mr-3 rounded-lg" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex items-center">
          <Skeleton className="h-6 w-6 mr-3 rounded-lg" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="flex items-center">
          <Skeleton className="h-6 w-6 mr-3 rounded-lg" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
    </CardContent>
    
    {/* Skeleton de footer mejorado */}
    <CardFooter className="p-6 pt-0">
      <div className="w-full space-y-4">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-baseline space-x-1">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="text-right">
              <Skeleton className="h-3 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="text-center">
          <Skeleton className="h-3 w-32 mx-auto" />
        </div>
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
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [preloadImages, setPreloadImages] = useState<string[]>([])

  // ✅ OPTIMIZADO: Memoizar imágenes filtradas
  const images = useMemo(() => 
    service.images?.filter(img => img && img.trim()) || [], 
    [service.images]
  )

  // ✅ OPTIMIZADO: Preload de imágenes para mejor UX
  useEffect(() => {
    if (images.length > 1) {
      const preloadPromises = images.slice(1, 3).map(src => {
        return new Promise<string>((resolve) => {
          const img = new Image()
          img.onload = () => resolve(src)
          img.onerror = () => resolve('')
          img.src = src
        })
      })
      
      Promise.all(preloadPromises).then(loadedImages => {
        setPreloadImages(loadedImages.filter(Boolean))
      })
    }
  }, [images])

  // ✅ OPTIMIZADO: Auto-play del carrusel
  useEffect(() => {
    if (images.length > 1 && isHovered) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)
      }, 3000)
      
      return () => clearInterval(interval)
    }
  }, [images.length, isHovered])
  
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

  // ✅ OPTIMIZADO: Memoizar placeholder mejorado
  const placeholder = useMemo(() => (
    <div className="relative h-80 w-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 rounded-t-xl flex items-center justify-center group">
      <div className="text-center">
        <Activity className="h-16 w-16 text-gray-500 mx-auto mb-3 group-hover:text-gray-600 transition-colors" />
        <p className="text-gray-600 text-sm font-medium">Sin imágenes</p>
        <p className="text-gray-500 text-xs mt-1">Imagen no disponible</p>
      </div>
    </div>
  ), [])

  // ✅ OPTIMIZADO: Handlers para carga de imagen
  const handleImageLoad = useCallback(() => {
    setIsLoading(false)
    setImageError(false)
  }, [])

  const handleImageError = useCallback(() => {
    setIsLoading(false)
    setImageError(true)
  }, [])

  // Mostrar placeholder si no hay imágenes o hay error
  if (images.length === 0 || imageError) {
    return placeholder
  }

  const currentImage = images[currentImageIndex]

  return (
    <div 
      className="relative h-80 w-full overflow-hidden rounded-t-xl group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      {/* Imagen principal optimizada */}
      <WorkingImage
        src={currentImage}
        alt={`${service.title} - Imagen ${currentImageIndex + 1}`}
        width={400}
        height={320}
        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110`}
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      
      {/* Overlay gradiente mejorado */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Badges superpuestos reorganizados */}
      <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[60%]">
        {service.featured && (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-semibold shadow-lg border-0">
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

      
      {/* Controles de navegación avanzados */}
      {images.length > 1 && (
        <>
          {/* Botón anterior mejorado */}
          <button
            onClick={handlePrevImage}
            className={`absolute left-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-md border border-white/30 hover:scale-110 hover:shadow-lg hover:shadow-black/50 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            aria-label="Imagen anterior"
            disabled={currentImageIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          {/* Botón siguiente mejorado */}
          <button
            onClick={handleNextImage}
            className={`absolute right-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-md border border-white/30 hover:scale-110 hover:shadow-lg hover:shadow-black/50 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            aria-label="Imagen siguiente"
            disabled={currentImageIndex === images.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          
          {/* Indicadores de imagen avanzados */}
          <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 transition-all duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-80'
          }`}>
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => handleIndicatorClick(index, e)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? 'bg-green-400 scale-125 shadow-lg shadow-green-400/50 ring-2 ring-green-300/50' 
                    : 'bg-white/60 hover:bg-white/90 hover:scale-110 hover:shadow-md'
                }`}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>

          {/* Indicador de auto-play */}
          {isHovered && (
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-full text-xs border border-white/20">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span>Auto</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Botones de acción reorganizados horizontalmente */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
        {/* Botón de favoritos */}
        <button
          className="bg-black/70 hover:bg-red-500/90 text-white p-2 rounded-full transition-all duration-300 backdrop-blur-md border border-white/30 hover:scale-110 hover:shadow-lg hover:shadow-red-500/50"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            // TODO: Implementar favoritos
          }}
          aria-label="Agregar a favoritos"
        >
          <Heart className="h-3.5 w-3.5" />
        </button>

        {/* Botón de compartir */}
        <button
          className="bg-black/70 hover:bg-blue-500/90 text-white p-2 rounded-full transition-all duration-300 backdrop-blur-md border border-white/30 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            // TODO: Implementar compartir
          }}
          aria-label="Compartir servicio"
        >
          <Share2 className="h-3.5 w-3.5" />
        </button>

        {/* Botón de zoom */}
        <button
          className="bg-black/70 hover:bg-green-500/90 text-white p-2 rounded-full transition-all duration-300 backdrop-blur-md border border-white/30 hover:scale-110 hover:shadow-lg hover:shadow-green-500/50"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            // TODO: Implementar zoom/modal
          }}
          aria-label="Ver imagen en grande"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      </div>
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
      className={`group overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] border-0 shadow-lg bg-white flex flex-col ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {/* Imagen del servicio mejorada */}
      <SimpleServiceImage service={service} priority={priority} />

      {/* Contenido de la tarjeta mejorado */}
      <CardContent className="p-6 flex-1">
        {/* Header mejorado con título y categoría */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-xl mb-3 line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
              {service.title}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              {service.category && (
                <Badge variant="outline" className="text-xs font-medium border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
                  {service.category.name}
                </Badge>
              )}
              {service.featured && (
                <Badge className="text-xs font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-sm">
                  <Star className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Descripción mejorada */}
        <p className="text-gray-600 text-sm mb-5 line-clamp-2 leading-relaxed">
          {service.description}
        </p>

        {/* Información del servicio con diseño mejorado */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Ubicación */}
          {service.location && (
            <div className="flex items-center text-sm text-gray-600 p-2 bg-blue-50 rounded-lg border border-blue-100">
              <div className="p-1.5 bg-blue-100 rounded-lg mr-2">
                <MapPin className="w-3 h-3 text-blue-600" />
              </div>
              <span className="line-clamp-1 font-medium text-xs">{service.location}</span>
            </div>
          )}

          {/* Duración */}
          {service.duration && (
            <div className="flex items-center text-sm text-gray-600 p-2 bg-green-50 rounded-lg border border-green-100">
              <div className="p-1.5 bg-green-100 rounded-lg mr-2">
                <Clock className="w-3 h-3 text-green-600" />
              </div>
              <span className="font-medium text-xs">{service.duration} min</span>
            </div>
          )}

          {/* Capacidad */}
          <div className="flex items-center text-sm text-gray-600 p-2 bg-purple-50 rounded-lg border border-purple-100">
            <div className="p-1.5 bg-purple-100 rounded-lg mr-2">
              <Users className="w-3 h-3 text-purple-600" />
            </div>
            <span className="font-medium text-xs">
              {service.min_group_size && service.max_group_size 
                ? `${service.min_group_size}-${service.max_group_size}`
                : service.max_group_size 
                  ? `Máx. ${service.max_group_size}`
                  : service.min_group_size
                    ? `Mín. ${service.min_group_size}`
                    : '1+'
              }
            </span>
          </div>

          {/* Dificultad */}
          {service.difficulty_level && (
            <div className="flex items-center text-sm text-gray-600 p-2 bg-orange-50 rounded-lg border border-orange-100">
              <div className="p-1.5 bg-orange-100 rounded-lg mr-2">
                <Zap className="w-3 h-3 text-orange-600" />
              </div>
              <span className="font-medium text-xs capitalize">{service.difficulty_level}</span>
            </div>
          )}
        </div>

        {/* Características destacadas mejoradas */}
        <div className="flex flex-wrap gap-2 mb-4">
          {service.insurance_included && (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200 hover:bg-green-200 transition-colors">
              <Shield className="w-3 h-3 mr-1" />
              Seguro incluido
            </Badge>
          )}
          {service.featured && (
            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200 transition-colors">
              <Award className="w-3 h-3 mr-1" />
              Experiencia premium
            </Badge>
          )}
          {service.available && (
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 transition-colors">
              <Calendar className="w-3 h-3 mr-1" />
              Disponible 24/7
            </Badge>
          )}
        </div>
      </CardContent>

      {/* Footer de la tarjeta mejorado */}
      <CardFooter className="p-6 pt-0">
        <div className="w-full space-y-4">
          {/* Sección de precio premium */}
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl p-4 border-2 border-green-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-bold text-green-600">
                  {formattedPrice}
                </span>
                <span className="text-sm font-medium text-green-700">
                  {service.price_type === 'per_person' ? '/persona' : ''}
                </span>
              </div>
              <div className="text-right">
                <div className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full">Precio final</div>
                <div className="text-xs text-green-500 mt-1">Sin cargos ocultos</div>
              </div>
            </div>
            
            {/* Información adicional del precio */}
            {service.price_children && (
              <div className="bg-white/50 rounded-lg p-2 border border-green-200">
                <div className="text-xs text-green-700 font-medium flex items-center gap-2">
                  <Euro className="w-3 h-3" />
                  Niños: €{service.price_children} (hasta 12 años)
                </div>
              </div>
            )}
          </div>

          {/* Botón de acción premium */}
          <Link href={`/services/${service.id}`} className="w-full">
            <Button 
              className={`w-full transition-all duration-300 hover:scale-105 font-semibold text-sm py-4 shadow-lg hover:shadow-xl ${
                service.available 
                  ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!service.available}
            >
              <div className="flex items-center justify-center gap-2">
                {service.available ? (
                  <>
                    <Eye className="w-5 h-5" />
                    <span>Ver detalles y reservar</span>
                    <div className="ml-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    <span>No disponible</span>
                  </>
                )}
              </div>
            </Button>
          </Link>

          {/* Información de disponibilidad mejorada */}
          <div className="text-center">
            <div className={`flex items-center justify-center gap-2 text-xs ${
              service.available ? 'text-green-600' : 'text-gray-500'
            }`}>
              <Calendar className="w-3 h-3" />
              <span>{service.available ? 'Reserva disponible 24/7' : 'Servicio temporalmente no disponible'}</span>
              {service.available && <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
})

SimpleServiceCard.displayName = 'SimpleServiceCard'
