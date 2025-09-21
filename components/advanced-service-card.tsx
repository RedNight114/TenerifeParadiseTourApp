"use client"

import { useState, useCallback, memo, useRef, useEffect, useMemo } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Clock, Users, Car, Utensils, Activity, ChevronLeft, ChevronRight, Heart, Share2, Eye, Calendar, Euro, Zap, Shield, Award, XCircle, Play, Pause } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import type { Service } from "@/lib/supabase"
import SupabaseStorageImage from "@/components/supabase-storage-image"
import DirectImage from "@/components/direct-image"
import SupabaseImageFix from "@/components/supabase-image-fix"
import SimpleImageLoader from "@/components/simple-image-loader"
import WorkingImage from "@/components/working-image"

interface AdvancedServiceCardProps {
  service: Service
  priority?: boolean
  className?: string
  variant?: 'default' | 'compact' | 'featured'
}

// Componente de carrusel de imágenes ultra-optimizado
const AdvancedServiceImage = memo(({ 
  service, 
  priority = false,
  variant = 'default'
}: { 
  service: Service
  priority?: boolean
  variant?: 'default' | 'compact' | 'featured'
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [preloadImages, setPreloadImages] = useState<string[]>([])
  const [imageLoaded, setImageLoaded] = useState<boolean[]>([])

  const images = useMemo(() => 
    service.images?.filter(img => img && img.trim()) || [], 
    [service.images]
  )

  // Altura dinámica según variante
  const imageHeight = useMemo(() => {
    switch (variant) {
      case 'compact': return 'h-64'
      case 'featured': return 'h-96'
      default: return 'h-80'
    }
  }, [variant])

  // Preload inteligente de imágenes
  useEffect(() => {
    if (images.length > 1) {
      const preloadPromises = images.slice(1, 4).map((src, index) => {
        return new Promise<string>((resolve) => {
          const img = new Image()
          img.onload = () => {
            setImageLoaded(prev => {
              const newLoaded = [...prev]
              newLoaded[index + 1] = true
              return newLoaded
            })
            resolve(src)
          }
          img.onerror = () => resolve('')
          img.src = src
        })
      })
      
      Promise.all(preloadPromises).then(loadedImages => {
        setPreloadImages(loadedImages.filter(Boolean))
      })
    }
  }, [images])

  // Auto-play inteligente
  useEffect(() => {
    if (images.length > 1 && isHovered && isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)
      }, 2500)
      
      return () => clearInterval(interval)
    }
  }, [images.length, isHovered, isAutoPlaying])

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
    setIsAutoPlaying(false) // Pausar auto-play al hacer clic manual
  }, [])

  const handleImageLoad = useCallback(() => {
    setIsLoading(false)
    setImageError(false)
  }, [])

  const handleImageError = useCallback(() => {
    setIsLoading(false)
    setImageError(true)
  }, [])

  const placeholder = useMemo(() => (
    <div className={`relative ${imageHeight} w-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 rounded-t-xl flex items-center justify-center group`}>
      <div className="text-center">
        <Activity className="h-16 w-16 text-gray-500 mx-auto mb-3 group-hover:text-gray-600 transition-colors" />
        <p className="text-gray-600 text-sm font-medium">Sin imágenes</p>
        <p className="text-gray-500 text-xs mt-1">Imagen no disponible</p>
      </div>
    </div>
  ), [imageHeight])

  if (images.length === 0 || imageError) {
    return placeholder
  }

  const currentImage = images[currentImageIndex]

  return (
    <div 
      className={`relative ${imageHeight} w-full overflow-hidden rounded-t-xl group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      {/* Imagen principal con efectos avanzados */}
      <WorkingImage
        src={currentImage}
        alt={`${service.title} - Imagen ${currentImageIndex + 1}`}
        width={400}
        height={variant === 'featured' ? 384 : variant === 'compact' ? 256 : 320}
        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110`}
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      
      {/* Overlay gradiente dinámico */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
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
        {variant === 'featured' && (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold shadow-lg border-0">
            <Award className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        )}
      </div>

      
      {/* Controles de navegación ultra-avanzados */}
      {images.length > 1 && (
        <>
          {/* Botón anterior */}
          <button
            onClick={handlePrevImage}
            className={`absolute left-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-md border border-white/30 hover:scale-110 hover:shadow-lg hover:shadow-black/50 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          {/* Botón siguiente */}
          <button
            onClick={handleNextImage}
            className={`absolute right-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-md border border-white/30 hover:scale-110 hover:shadow-lg hover:shadow-black/50 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            aria-label="Imagen siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          
          {/* Indicadores de imagen con animaciones */}
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

          {/* Control de auto-play */}
          {isHovered && images.length > 1 && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsAutoPlaying(!isAutoPlaying)
                }}
                className="bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-full text-xs border border-white/20 hover:bg-black/80 transition-colors"
                aria-label={isAutoPlaying ? "Pausar auto-play" : "Activar auto-play"}
              >
                {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
              <div className="bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-full text-xs border border-white/20">
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${isAutoPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span>Auto</span>
                </div>
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

AdvancedServiceImage.displayName = 'AdvancedServiceImage'

// Componente principal de tarjeta avanzada
export const AdvancedServiceCard = memo(({ 
  service, 
  priority = false,
  className = "",
  variant = 'default'
}: AdvancedServiceCardProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Intersection Observer mejorado
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
        rootMargin: '100px'
      }
    )

    observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [])

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price)
  }, [])

  const formattedPrice = useMemo(() => 
    formatPrice(service.price), 
    [service.price, formatPrice]
  )

  const cardVariants = {
    default: 'hover:scale-[1.02]',
    compact: 'hover:scale-[1.01]',
    featured: 'hover:scale-[1.03]'
  }

  return (
    <Card 
      ref={cardRef}
      className={`group overflow-hidden transition-all duration-700 hover:shadow-2xl border-0 shadow-lg bg-white flex flex-col ${
        cardVariants[variant]
      } ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagen del servicio avanzada */}
      <AdvancedServiceImage service={service} priority={priority} variant={variant} />

      {/* Contenido adaptado según variante */}
      <CardContent className={`flex-1 ${variant === 'compact' ? 'p-4' : 'p-6'}`}>
        {/* Header dinámico */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className={`font-bold line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors leading-tight ${
              variant === 'featured' ? 'text-2xl mb-3' : variant === 'compact' ? 'text-lg mb-2' : 'text-xl mb-3'
            }`}>
              {service.title}
            </h3>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
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

        {/* Descripción adaptada */}
        <p className={`text-gray-600 leading-relaxed mb-4 ${
          variant === 'compact' ? 'text-xs line-clamp-1' : 'text-sm line-clamp-2'
        }`}>
          {service.description}
        </p>

        {/* Información del servicio optimizada */}
        <div className={`grid gap-2 mb-4 ${
          variant === 'compact' ? 'grid-cols-1' : 'grid-cols-2'
        }`}>
          {service.location && (
            <div className="flex items-center text-xs text-gray-600 p-2 bg-blue-50 rounded-lg border border-blue-100">
              <MapPin className="w-3 h-3 text-blue-600 mr-2" />
              <span className="line-clamp-1 font-medium">{service.location}</span>
            </div>
          )}

          {service.duration && (
            <div className="flex items-center text-xs text-gray-600 p-2 bg-green-50 rounded-lg border border-green-100">
              <Clock className="w-3 h-3 text-green-600 mr-2" />
              <span className="font-medium">{service.duration} min</span>
            </div>
          )}

          <div className="flex items-center text-xs text-gray-600 p-2 bg-purple-50 rounded-lg border border-purple-100">
            <Users className="w-3 h-3 text-purple-600 mr-2" />
            <span className="font-medium">
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

          {service.difficulty_level && (
            <div className="flex items-center text-xs text-gray-600 p-2 bg-orange-50 rounded-lg border border-orange-100">
              <Zap className="w-3 h-3 text-orange-600 mr-2" />
              <span className="font-medium capitalize">{service.difficulty_level}</span>
            </div>
          )}
        </div>

        {/* Características destacadas */}
        <div className="flex flex-wrap gap-2 mb-4">
          {service.insurance_included && (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200 hover:bg-green-200 transition-colors">
              <Shield className="w-3 h-3 mr-1" />
              Seguro incluido
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

      {/* Footer optimizado */}
      <CardFooter className={variant === 'compact' ? 'p-4 pt-0' : 'p-6 pt-0'}>
        <div className="w-full space-y-3">
          {/* Precio premium */}
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl p-4 border-2 border-green-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-baseline space-x-1">
                <span className={`font-bold text-green-600 ${
                  variant === 'featured' ? 'text-4xl' : variant === 'compact' ? 'text-2xl' : 'text-3xl'
                }`}>
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
              className={`w-full transition-all duration-300 hover:scale-105 font-semibold shadow-lg hover:shadow-xl ${
                variant === 'compact' ? 'py-2 text-xs' : 'py-4 text-sm'
              } ${
                service.available 
                  ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!service.available}
            >
              <div className="flex items-center justify-center gap-2">
                {service.available ? (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>{variant === 'compact' ? 'Ver detalles' : 'Ver detalles y reservar'}</span>
                    <div className="ml-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>No disponible</span>
                  </>
                )}
              </div>
            </Button>
          </Link>

          {/* Información de disponibilidad */}
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

AdvancedServiceCard.displayName = 'AdvancedServiceCard'

// Skeleton avanzado
export const AdvancedServiceCardSkeleton = memo(() => (
  <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-0 shadow-lg bg-white">
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
    
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-5" />
      
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
      
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
    </CardContent>
    
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

AdvancedServiceCardSkeleton.displayName = 'AdvancedServiceCardSkeleton'
