"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useServiceDetails } from "@/hooks/use-service-details"
import { useAuthContext } from "@/components/auth-provider"
import { ServiceDetailsLoading } from "@/components/service-details-loading"

import UnifiedPricingParticipantSelector from "@/components/unified-pricing-participant-selector"
import { useAgePricing } from "@/hooks/use-age-pricing"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Calendar, Clock, Users, MapPin, Star, Euro, Shield, CheckCircle, XCircle, AlertTriangle, 
  ArrowLeft, Phone, Mail, Mountain, Camera, Heart, Share2, ChevronDown, ChevronUp, MessageCircle, 
  Zap, Info, Car, Utensils, Award, Globe, ShieldCheck, Eye, EyeOff, BookOpen, Map, 
  Navigation, CalendarDays, UserCheck, Users2, Clock3, Thermometer, Wind, Sun, CloudRain,
  Baby, User, Plus, Minus, CreditCard, Copy
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import SupabaseStorageImage from "@/components/supabase-storage-image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"

// Función helper para manejar toasts de manera segura
const showToast = (type: 'success' | 'error' | 'info', message: string, options?: any) => {
  if (typeof window !== 'undefined' && toast) {
    toast[type](message, options)
  } else {
    // Fallback para SSR - solo log en consola
    console.log(`[${type.toUpperCase()}]: ${message}`)
  }
}

export default function ServiceDetailsPage() {
  const { serviceId } = useParams()
  const router = useRouter()
  const {
    service,
    loading: isLoading,
    error,
    refreshService
  } = useServiceDetails(serviceId as string)
  const { user, loading: authLoading } = useAuthContext()
  const { getServicePricing, loading: pricingLoading } = useAgePricing()
  

  const [selectedDate, setSelectedDate] = useState<Date>()
  const [participants, setParticipants] = useState<any[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    details: false,
    included: false,
    policies: false
  })
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const [servicePricing, setServicePricing] = useState<any>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)
  const [imageZoom, setImageZoom] = useState(1)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showReviews, setShowReviews] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [showWeather, setShowWeather] = useState(false)
  const [weatherData, setWeatherData] = useState<any>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<any[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [showTimeSlots, setShowTimeSlots] = useState(false)

  useEffect(() => {
    if (service) {
      // Cargar precios por edad cuando el servicio esté disponible
      loadServicePricing(service.id)
      // Cargar reseñas del servicio
      loadServiceReviews(service.id)
      // Cargar datos del clima si hay ubicación
      if (service.location) {
        loadWeatherData(service.location)
      }
    }
  }, [service])

  // Cargar precios por edad del servicio
  const loadServicePricing = async (serviceId: string) => {
    try {
      const pricing = await getServicePricing(serviceId)
      if (pricing) {
        setServicePricing(pricing)
      }
    } catch (error) {
      }
  }

  // Cargar reseñas del servicio
  const loadServiceReviews = async (serviceId: string) => {
    setIsLoadingReviews(true)
    try {
      // Simular carga de reseñas (en una implementación real, harías una llamada a la API)
      const mockReviews = [
        {
          id: 1,
          user: "María González",
          rating: 5,
          comment: "¡Experiencia increíble! El tour fue perfecto y el guía muy profesional.",
          date: "2024-01-15",
          verified: true
        },
        {
          id: 2,
          user: "Juan Pérez",
          rating: 4,
          comment: "Muy buena actividad, recomendable para familias.",
          date: "2024-01-10",
          verified: true
        },
        {
          id: 3,
          user: "Ana Martín",
          rating: 5,
          comment: "Superó mis expectativas. Volveré seguro.",
          date: "2024-01-05",
          verified: false
        }
      ]
      
      setReviews(mockReviews)
      setTotalReviews(mockReviews.length)
      setAverageRating(mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length)
    } catch (error) {
      } finally {
      setIsLoadingReviews(false)
    }
  }

  // Cargar datos del clima
  const loadWeatherData = async (location: string) => {
    try {
      // Simular datos del clima (en una implementación real, usarías una API del clima)
      const mockWeatherData = {
        temperature: 22,
        condition: "Soleado",
        humidity: 65,
        windSpeed: 15,
        icon: "☀️",
        description: "Día perfecto para actividades al aire libre"
      }
      setWeatherData(mockWeatherData)
    } catch (error) {
      }
  }

  // Abrir modal de imagen
  const openImageModal = (index: number) => {
    setModalImageIndex(index)
    setShowImageModal(true)
    setImageZoom(1)
    setImagePosition({ x: 0, y: 0 })
  }

  // Cerrar modal de imagen
  const closeImageModal = () => {
    setShowImageModal(false)
    setImageZoom(1)
    setImagePosition({ x: 0, y: 0 })
    setIsDragging(false)
  }

  // Navegar entre imágenes en el modal
  const navigateImage = (direction: 'prev' | 'next') => {
    if (!service?.images) return
    
    if (direction === 'prev') {
      setModalImageIndex(prev => prev > 0 ? prev - 1 : service.images!.length - 1)
    } else {
      setModalImageIndex(prev => prev < service.images!.length - 1 ? prev + 1 : 0)
    }
    // Reset zoom y posición al cambiar imagen
    setImageZoom(1)
    setImagePosition({ x: 0, y: 0 })
  }

  // Manejar zoom de imagen
  const handleImageZoom = (delta: number) => {
    setImageZoom(prev => {
      const newZoom = Math.max(0.5, Math.min(3, prev + delta))
      return newZoom
    })
  }

  // Manejar arrastrar imagen
  const handleMouseDown = (e: React.MouseEvent) => {
    if (imageZoom > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && imageZoom > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Manejar zoom con rueda del mouse
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    handleImageZoom(delta)
  }

  // Manejar navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showImageModal || !service?.images) return

      switch (e.key) {
        case 'Escape':
          closeImageModal()
          break
        case 'ArrowLeft':
          navigateImage('prev')
          break
        case 'ArrowRight':
          navigateImage('next')
          break
        case '+':
        case '=':
          handleImageZoom(0.25)
          break
        case '-':
          handleImageZoom(-0.25)
          break
        case '0':
          setImageZoom(1)
          setImagePosition({ x: 0, y: 0 })
          break
      }
    }

    if (showImageModal) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [showImageModal, service?.images, modalImageIndex, imageZoom])

  // Cargar horarios disponibles
  const loadAvailableTimeSlots = async (date: Date) => {
    try {
      // Simular horarios disponibles (en una implementación real, harías una llamada a la API)
      const mockTimeSlots = [
        { id: '1', time: '09:00', available: true, price: totalPrice },
        { id: '2', time: '10:30', available: true, price: totalPrice },
        { id: '3', time: '12:00', available: false, price: totalPrice },
        { id: '4', time: '14:00', available: true, price: totalPrice },
        { id: '5', time: '15:30', available: true, price: totalPrice },
        { id: '6', time: '17:00', available: true, price: totalPrice }
      ]
      setAvailableTimeSlots(mockTimeSlots)
      setShowTimeSlots(true)
    } catch (error) {
      }
  }

  // Función para truncar texto
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return `${text.substring(0, maxLength).trim()}...`
  }

  // Función para formatear duración
  const formatDuration = (durationMinutes: number) => {
    if (!durationMinutes || durationMinutes <= 0) return 'No especificada'
    
    const hours = Math.floor(durationMinutes / 60)
    const minutes = durationMinutes % 60
    
    if (hours === 0) {
      return `${minutes} min`
    } else if (minutes === 0) {
      return `${hours}h`
    } else {
      return `${hours}h ${minutes}min`
    }
  }

  // Función para contar palabras
  const countWords = (text: string) => {
    return text.trim().split(/\s+/).length
  }

  // Loading inicial optimizado
  // Loading inicial optimizado
  if (isLoading) {
    return (
      <ServiceDetailsLoading
        isLoading={isLoading}
        error={error}
        onRetry={refreshService}
        timeout={8000} // 8 segundos para servicios
      />
    )
  }

  // Error
  if (error) {
    return (
      <ServiceDetailsLoading
        isLoading={false}
        error={error}
        onRetry={refreshService}
      />
    )
  }

  // Verificar que el servicio esté cargado
  if (!service) {
    return (
      <ServiceDetailsLoading
        isLoading={false}
        error="Servicio no encontrado"
        onRetry={refreshService}
      />
    )
  }

  // Verificar si tiene precio de niños (mantener para compatibilidad)
  const hasChildrenPrice = service.price_children && service.price_children > 0

  // Formatear precio
  const formatPrice = (price: number, priceType: string) => {
    if (priceType === "per_person") {
      return `€${price.toFixed(2)} por persona`
    } else if (priceType === "per_group") {
      return `€${price.toFixed(2)} por grupo`
    } else if (priceType === "per_hour") {
      return `€${price.toFixed(2)} por hora`
    }
    return `€${price.toFixed(2)}`
  }

  // Formatear precio de niños
  const formatChildrenPrice = (price: number, priceType: string) => {
    if (priceType === "per_person") {
      return `€${price.toFixed(2)} por niño`
    } else if (priceType === "per_group") {
      return `€${price.toFixed(2)} por grupo`
    } else if (priceType === "per_hour") {
      return `€${price.toFixed(2)} por hora`
    }
    return `€${price.toFixed(2)}`
  }

  // Obtener icono de categoría
  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'excursion':
        return <Mountain className="h-4 w-4" />
      case 'tour':
        return <Map className="h-4 w-4" />
      case 'activity':
        return <Zap className="h-4 w-4" />
      case 'transport':
        return <Car className="h-4 w-4" />
      case 'food':
        return <Utensils className="h-4 w-4" />
      default:
        return <Star className="h-4 w-4" />
    }
  }

  // Obtener nombre de categoría
  const getCategoryName = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'excursion':
        return 'Excursión'
      case 'tour':
        return 'Tour'
      case 'activity':
        return 'Actividad'
      case 'transport':
        return 'Transporte'
      case 'food':
        return 'Gastronomía'
      default:
        return category || 'Servicio'
    }
  }

  // Calcular total con el nuevo sistema de participantes
  const calculateTotal = () => {
    return totalPrice
  }

  // Manejar cambio de participantes
  const handleParticipantsChange = (newParticipants: any[], newTotalPrice: number) => {
    setParticipants(newParticipants)
    setTotalPrice(newTotalPrice)
  }

  // Manejar reserva
  const handleBooking = async () => {
    // Validar usuario autenticado
    if (!user) {
      showToast('error', "Debes iniciar sesión para hacer una reserva")
      router.push("/auth/login")
      return
    }
    
    // Validar fecha seleccionada
    if (!selectedDate) {
      showToast('error', "Por favor selecciona una fecha para el servicio")
      return
    }

    // Validar participantes
    if (participants.length === 0) {
      showToast('error', "Debes seleccionar al menos un participante")
      return
    }

    // Validar que la fecha no sea en el pasado
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
      showToast('error', "No puedes seleccionar una fecha en el pasado")
      return
    }

    setIsSubmitting(true)
    try {
      const reservationData = {
        serviceId: service.id,
        userId: user.id,
        reservationDate: format(selectedDate, "yyyy-MM-dd"),
        participants,
        totalPrice,
        specialRequests: "",
      }

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al crear la reserva")
      }

      const result = await response.json()
      showToast('success', "¡Reserva creada exitosamente!")
      router.push(`/booking/${result.reservationId}`)
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : "Error al procesar la reserva")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFavorite = () => {
    setIsFavorite(!isFavorite)
    showToast('success', isFavorite ? "Eliminado de favoritos" : "Añadido a favoritos")
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: service.title,
          text: service.description,
          url: window.location.href,
        })
      } catch (error) {
        }
    } else {
      setShowShareModal(true)
    }
  }

  // Función para copiar enlace
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      showToast('success', "Enlace copiado al portapapeles")
      setShowShareModal(false)
    } catch (error) {
      showToast('error', "Error al copiar el enlace")
    }
  }

  // Función para compartir en redes sociales
  const shareOnSocial = (platform: string) => {
    const url = encodeURIComponent(window.location.href)
    const title = encodeURIComponent(service.title)
    const description = encodeURIComponent(service.description)
    
    let shareUrl = ''
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`
        break
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${title}%20${url}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
        break
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
      setShowShareModal(false)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleReserveClick = () => {
    if (!user) {
      router.push("/auth/login")
      return
    }
    
    if (user) {
      router.push(`/booking/${service.id}`)
      return
    }
  }

  return (
    <div className="min-h-screen bg-white">
              {/* Hero Section */}
        <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
          <SupabaseStorageImage
            src={service.images && service.images.length > 0 ? service.images[0] : '/images/hero-services.jpg'}
            alt={`${service.title} - Tenerife Paradise Tours & Excursions`}
            fill={true}
            className="object-cover blur-sm w-full h-full"
            priority={true}
            sizes="100vw"
            fallbackSrc="/images/hero-services.jpg"
          />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {service.title}
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto px-4">
              Descubre la magia de Tenerife con nuestras experiencias únicas
            </p>
          </div>
        </div>
      </div>

      {/* Contenido Principal - Layout corregido */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navegación simple */}
        <div className="mb-6">
          <Link 
            href="/services" 
            className="text-gray-600 hover:text-green-600 transition-colors flex items-center gap-2 w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Volver a Servicios</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna Izquierda - Información del Servicio */}
          <div className="space-y-6">
            {/* Categoría y Badge */}
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-green-500 text-white text-xs">
                {getCategoryIcon(service.category_id)}
                {getCategoryName(service.category_id)}
              </Badge>
              {service.featured && (
                <Badge variant="secondary" className="bg-yellow-500 text-white text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Destacado
                </Badge>
              )}
              </div>
              
              {/* Botones de acción */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFavorite}
                  className={`h-8 w-8 p-0 ${isFavorite ? 'text-red-500 border-red-500' : 'text-gray-500'}`}
                  title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="h-8 w-8 p-0 text-gray-500"
                  title="Compartir"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                {weatherData && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowWeather(!showWeather)}
                    className="h-8 w-8 p-0 text-gray-500"
                    title="Ver clima"
                  >
                    {weatherData.icon}
                  </Button>
                )}
              </div>
            </div>

            {/* Título */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {service.title}
            </h1>

            {/* Reseñas */}
            {totalReviews > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                  <span className="ml-1 text-sm font-medium text-gray-700">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
                <button
                  onClick={() => setShowReviews(!showReviews)}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  {totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'}
                </button>
              </div>
            )}

            {/* Descripción */}
            <div className="text-sm text-gray-600 leading-relaxed">
              {descriptionExpanded 
                ? service.description 
                : truncateText(service.description, 120)
              }
              {countWords(service.description) > 20 && (
                <button
                  onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                  className="ml-2 text-green-600 hover:text-green-700 font-medium text-xs"
                >
                  {descriptionExpanded ? 'Ver menos' : 'Ver más'}
                </button>
              )}
            </div>

            {/* Información Rápida - Ultra Compacta */}
            <div className="grid grid-cols-3 gap-2">
              {service.duration && (
                <Card className="text-center p-3 border border-gray-200 hover:border-green-300 transition-colors">
                  <Clock className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="font-bold text-gray-900 text-xs">{formatDuration(service.duration)}</p>
                  <p className="text-xs text-gray-600">Duración</p>
                </Card>
              )}
              
              {service.location && (
                <Card className="text-center p-3 border border-gray-200 hover:border-green-300 transition-colors">
                  <MapPin className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="font-bold text-gray-900 text-xs leading-tight break-words">{service.location}</p>
                  <p className="text-xs text-gray-600">Ubicación</p>
                </Card>
              )}

              <Card className="text-center p-3 border border-gray-200 hover:border-green-300 transition-colors">
                <Zap className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <p className="font-bold text-gray-900 text-xs">Actividad acuática</p>
                <p className="text-xs text-gray-600">Tipo</p>
              </Card>
            </div>

            {/* Selector de Fecha Mejorado */}
            <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-blue-900 flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                  Seleccionar Fecha
                  </div>
                  <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
                    Requerido
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Input de fecha mejorado */}
                  <div className="relative">
                    <Label htmlFor="service-date" className="text-sm font-semibold text-gray-800 mb-3 block">
                      📅 Fecha del servicio *
                    </Label>
                    <div className="relative">
                    <Input
                      id="service-date"
                      type="date"
                      value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => {
                          const newDate = e.target.value ? new Date(e.target.value) : undefined
                          setSelectedDate(newDate)
                          if (newDate) {
                            loadAvailableTimeSlots(newDate)
                          }
                        }}
                      min={format(new Date(), 'yyyy-MM-dd')}
                        className="w-full h-12 text-lg border-2 border-blue-300 focus:border-blue-500 rounded-lg pl-4 pr-4"
                      required
                    />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5" />
                    </div>
                    <p className="text-xs text-gray-600 mt-2 flex items-center">
                      <Info className="w-3 h-3 mr-1" />
                      Selecciona la fecha en la que deseas realizar el servicio
                    </p>
                  </div>
                  
                  {/* Información de fecha seleccionada */}
                  {selectedDate && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-300 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-green-800">
                            ✅ Fecha confirmada
                          </p>
                          <p className="text-sm text-green-700">
                            {format(selectedDate, 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: es })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Información adicional */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs font-medium text-blue-800">Disponibilidad</p>
                          <p className="text-xs text-blue-600">Verificar al reservar</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="text-xs font-medium text-purple-800">Cancelación</p>
                          <p className="text-xs text-purple-600">Gratuita 24h antes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selector de Horarios */}
            {showTimeSlots && availableTimeSlots.length > 0 && (
              <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-purple-900 flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Horarios Disponibles
                    </div>
                    <Badge variant="secondary" className="bg-purple-600 text-white text-xs">
                      {availableTimeSlots.filter(slot => slot.available).length} disponibles
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-purple-700 mb-4">
                      Selecciona el horario que mejor se adapte a tu disponibilidad:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {availableTimeSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => slot.available && setSelectedTimeSlot(slot.time)}
                          disabled={!slot.available}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                            selectedTimeSlot === slot.time
                              ? 'border-purple-500 bg-purple-100 text-purple-900'
                              : slot.available
                              ? 'border-purple-200 bg-white hover:border-purple-300 hover:bg-purple-50 text-purple-800'
                              : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-lg font-bold">{slot.time}</div>
                            <div className="text-xs mt-1">
                              {slot.available ? (
                                <span className="text-green-600">✓ Disponible</span>
                              ) : (
                                <span className="text-red-500">✗ Agotado</span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {selectedTimeSlot && (
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-800">
                            Horario seleccionado: {selectedTimeSlot}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            )}

            {/* Selector de Participantes Mejorado */}
            <Card className="border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-green-900 flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Seleccionar Participantes
                  </div>
                  <Badge variant="secondary" className="bg-green-600 text-white text-xs">
                    {participants.length} seleccionados
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pricingLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <span className="ml-2 text-sm text-gray-600">Cargando precios...</span>
                  </div>
                ) : servicePricing ? (
                  <div className="space-y-4">
                  <UnifiedPricingParticipantSelector
                    serviceId={service.id}
                    basePrice={service.price}
                    onParticipantsChange={handleParticipantsChange}
                    onPricingChange={(updatedRanges) => {
                      }}
                    maxParticipants={20}
                    className=""
                    ageRanges={servicePricing.ageRanges.map((range: any) => ({
                      id: range.id,
                      serviceId: range.serviceId,
                      rangeName: range.rangeName,
                      minAge: range.minAge,
                      maxAge: range.maxAge,
                      price: range.price,
                      priceType: range.priceType,
                      description: range.description,
                      ageLabel: range.ageLabel
                    }))}
                      isAdmin={false}
                    />
                    
                    {/* Resumen de participantes */}
                    {participants.length > 0 && (
                      <div className="p-4 bg-white rounded-lg border border-green-200 shadow-sm">
                        <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Resumen de Participantes
                        </h4>
                        <div className="space-y-2">
                          {participants.map((participant, index) => (
                            <div key={index} className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                  {index + 1}
                                </div>
                                <span className="text-sm font-medium text-green-800">
                                  {participant.ageLabel}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-green-700">
                                €{participant.price.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No se pudieron cargar los precios por edad</p>
                    <p className="text-sm">Usa el botón de reserva para continuar</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumen de Reserva y Botón Mejorado */}
            <Card className="border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-orange-900 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Resumen de Reserva
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Resumen de la reserva */}
                <div className="space-y-3">
                  {selectedDate && (
                    <div className="p-3 bg-white rounded-lg border border-orange-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium text-gray-700">Fecha:</span>
                        </div>
                        <span className="text-sm font-bold text-orange-800">
                          {format(selectedDate, 'dd/MM/yyyy', { locale: es })}
                        </span>
                      </div>
                      {selectedTimeSlot && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-medium text-gray-700">Horario:</span>
                          </div>
                          <span className="text-sm font-bold text-orange-800">
                            {selectedTimeSlot}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {participants.length > 0 && (
                    <div className="p-3 bg-white rounded-lg border border-orange-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium text-gray-700">Participantes:</span>
                        </div>
                        <span className="text-sm font-bold text-orange-800">
                          {participants.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Total:</span>
                        <span className="text-lg font-bold text-orange-700">
                          €{totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

            {/* Botón de reserva mejorado */}
                <Button 
                  onClick={handleBooking}
                  disabled={!selectedDate || !selectedTimeSlot || participants.length === 0 || isSubmitting}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Procesando reserva...
                    </>
                  ) : !selectedDate ? (
                    <>
                      <Calendar className="h-5 w-5 mr-3" />
                      Selecciona una fecha primero
                    </>
                  ) : !selectedTimeSlot ? (
                    <>
                      <Clock className="h-5 w-5 mr-3" />
                      Selecciona un horario
                    </>
                  ) : participants.length === 0 ? (
                    <>
                      <Users className="h-5 w-5 mr-3" />
                      Selecciona participantes
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-3" />
                      ¡Reservar Ahora! - €{totalPrice.toFixed(2)}
                    </>
                  )}
                </Button>
                
                {/* Información de seguridad */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center justify-center space-x-1 p-2 bg-green-50 rounded-lg border border-green-200">
                    <Shield className="w-3 h-3 text-green-600" />
                    <span className="text-green-700 font-medium">Pago seguro</span>
                      </div>
                  <div className="flex items-center justify-center space-x-1 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <Clock className="w-3 h-3 text-blue-600" />
                    <span className="text-blue-700 font-medium">Confirmación inmediata</span>
                    </div>
                  <div className="flex items-center justify-center space-x-1 p-2 bg-purple-50 rounded-lg border border-purple-200">
                    <Shield className="w-3 h-3 text-purple-600" />
                    <span className="text-purple-700 font-medium">Cancelación gratuita</span>
                      </div>
                      </div>

                {/* Información adicional */}
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-amber-800">
                      <p className="font-medium mb-1">Información importante:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Recibirás confirmación por email</li>
                        <li>• Puedes cancelar hasta 24h antes</li>
                        <li>• Pago seguro con tarjeta o PayPal</li>
                      </ul>
                    </div>
                </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna Derecha - Galería y Contacto */}
          <div className="space-y-6 w-full max-w-lg">
            {/* Galería Mejorada */}
            <div className="flex justify-center lg:justify-end">
              {service.images && service.images.length > 0 ? (
                <div className="w-full">
                  {/* Imagen principal - Tamaño y calidad mejorados */}
                  <div 
                    className="relative h-96 w-full rounded-xl overflow-hidden mb-6 border-2 border-gray-200 shadow-2xl cursor-pointer group bg-gray-100"
                    onClick={() => openImageModal(currentImageIndex)}
                  >
                    <SupabaseStorageImage
                      src={service.images[currentImageIndex] || '/placeholder.jpg'}
                      alt={`${service.title} - Imagen ${currentImageIndex + 1}`}
                      fill={true}
                      className="object-cover transition-all duration-500 group-hover:scale-110 w-full h-full"
                      priority={true}
                      sizes="(max-width: 768px) 100vw, 60vw"
                      fallbackSrc="/placeholder.jpg"
                    />
                    
                    {/* Overlay de zoom mejorado */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent group-hover:from-black/40 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 border border-white/30">
                          <Eye className="h-10 w-10 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Indicadores de imagen mejorados */}
                    {service.images && service.images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-2">
                        {service.images.map((_: string, index: number) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentImageIndex(index)
                            }}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                              index === currentImageIndex 
                                ? 'bg-green-400 scale-125 shadow-lg shadow-green-400/50' 
                                : 'bg-white/60 hover:bg-white/90 hover:scale-110'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Botones de navegación mejorados */}
                    {service.images && service.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setCurrentImageIndex(prev => prev > 0 ? prev - 1 : (service.images?.length || 1) - 1)
                          }}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-110"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setCurrentImageIndex(prev => prev < (service.images?.length || 1) - 1 ? prev + 1 : 0)
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-110"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}

                    {/* Contador de imágenes */}
                    {service.images && service.images.length > 1 && (
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-white/20">
                        {currentImageIndex + 1} / {service.images.length}
                      </div>
                    )}
                  </div>

                  {/* Miniaturas mejoradas */}
                  {service.images && service.images.length > 1 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Galería de Imágenes
                      </h3>
                      <div className="grid grid-cols-4 gap-3">
                        {service.images.map((image: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`relative h-20 w-full rounded-lg overflow-hidden transition-all duration-300 border-2 group ${
                              index === currentImageIndex 
                                ? 'border-green-500 ring-2 ring-green-200 shadow-lg shadow-green-200/50' 
                                : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                            }`}
                          >
                            <SupabaseStorageImage
                              src={image}
                              alt={`${service.title} - Miniatura ${index + 1}`}
                              fill={true}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 768px) 25vw, 15vw"
                              fallbackSrc="/placeholder.jpg"
                            />
                            
                            {/* Overlay para la miniatura seleccionada */}
                            {index === currentImageIndex && (
                              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-green-600 bg-white rounded-full" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      
                      {/* Botón para ver todas las imágenes */}
                      {service.images.length > 4 && (
                        <div className="text-center">
                          <button
                            onClick={() => openImageModal(currentImageIndex)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
                          >
                            Ver todas las imágenes ({service.images.length})
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Placeholder cuando no hay imágenes */
                <div className="w-full">
                  <div className="h-80 w-full rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 shadow-lg">
                    <div className="text-center text-gray-500">
                      <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-base font-medium">Sin imágenes</p>
                      <p className="text-sm">No hay imágenes disponibles</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

                {/* Sección de Contacto con Datos Reales */}
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
        Contacto y Reservas
      </h3>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-3 p-2 bg-white rounded-lg border border-blue-100">
          <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-800 text-sm">+34 617 30 39 29</p>
            <p className="text-xs text-gray-600">Línea directa</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-2 bg-white rounded-lg border border-blue-100">
          <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-800 text-sm">Tenerifeparadisetoursandexcursions@hotmail.com</p>
            <p className="text-xs text-gray-600">Email de contacto</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-2 bg-white rounded-lg border border-blue-100">
          <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-800 text-sm">Lun - Dom: 8:00 - 20:00</p>
            <p className="text-xs text-gray-600">Atención 24/7 para emergencias</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-2 bg-white rounded-lg border border-blue-100">
          <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-800 text-sm">Santa Cruz de Tenerife</p>
            <p className="text-xs text-gray-600">Islas Canarias, España</p>
          </div>
        </div>
      </div>

      {/* Información de reservas */}
      <div className="space-y-2">
        <div className="p-2 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Reserva anticipada recomendada</span>
          </div>
        </div>
        <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Pago seguro online</span>
          </div>
        </div>
        <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Cancelación gratuita</span>
          </div>
        </div>
      </div>
    </div>

            {/* Tarjeta de Información Adicional */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-purple-600">
                  <Info className="h-4 w-4" />
                  Información
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Categoría</span>
                  <Badge variant="secondary" className="text-xs">
                    {getCategoryName(service.category_id)}
                  </Badge>
                </div>
                {service.duration && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Duración</span>
                    <span className="text-xs font-medium">{formatDuration(service.duration)}</span>
                  </div>
                )}
                {service.min_age && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Edad mínima</span>
                    <span className="text-xs font-medium">{service.min_age} años</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contenido adicional - Mejor espaciado */}
      <div className="bg-gray-50 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="space-y-6">
            {/* Información Detallada - Ancho completo */}
            <div className="space-y-6">
              <Card className="shadow-lg border-2 border-blue-100">
                <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-blue-100 p-3 rounded-lg transition-all duration-200"
                    onClick={() => toggleSection('details')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Info className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-blue-900">
                      Información Detallada
                    </CardTitle>
                        <p className="text-sm text-blue-700 mt-1">
                          Toda la información que necesitas saber sobre esta experiencia
                        </p>
                      </div>
                    </div>
                    {expandedSections.details ? (
                      <ChevronUp className="h-6 w-6 text-blue-600" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                </CardHeader>
                
                {expandedSections.details && (
                  <CardContent className="p-6">
                    {/* Información Principal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {/* Duración y Dificultad */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-blue-200 pb-2">
                          📅 Duración y Dificultad
                        </h3>
                        
                        {service.duration && (
                          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <Clock className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Duración</p>
                              <p className="text-blue-700 font-medium">{formatDuration(service.duration)}</p>
                          </div>
                        </div>
                      )}
                      
                        {service.difficulty_level && (
                          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                            <div className="p-2 bg-orange-500 rounded-lg">
                              <Mountain className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Dificultad</p>
                              <p className="text-orange-700 font-medium capitalize">{service.difficulty_level}</p>
                          </div>
                        </div>
                      )}
                      </div>

                      {/* Ubicación y Grupo */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-green-200 pb-2">
                          📍 Ubicación y Grupo
                        </h3>

                      {service.location && (
                          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                            <div className="p-2 bg-green-500 rounded-lg">
                              <MapPin className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Ubicación</p>
                              <p className="text-green-700 font-medium break-words">{service.location}</p>
                          </div>
                        </div>
                      )}

                        {(service.min_group_size || service.max_group_size) && (
                          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                            <div className="p-2 bg-purple-500 rounded-lg">
                              <Users2 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Tamaño del Grupo</p>
                              <p className="text-purple-700 font-medium">
                                {service.min_group_size && service.max_group_size 
                                  ? `${service.min_group_size}-${service.max_group_size} personas`
                                  : service.max_group_size 
                                    ? `Hasta ${service.max_group_size} personas`
                                    : `Mínimo ${service.min_group_size} personas`
                                }
                              </p>
                          </div>
                        </div>
                      )}
                      </div>

                      {/* Requisitos y Edades */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-red-200 pb-2">
                          ⚡ Requisitos y Edades
                        </h3>

                      {service.min_age && (
                          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
                            <div className="p-2 bg-red-500 rounded-lg">
                              <UserCheck className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Edad Mínima</p>
                              <p className="text-red-700 font-medium">{service.min_age} años</p>
                          </div>
                        </div>
                      )}

                        {service.fitness_level_required && (
                          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                            <div className="p-2 bg-yellow-500 rounded-lg">
                              <Zap className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Nivel de Forma Física</p>
                              <p className="text-yellow-700 font-medium capitalize">{service.fitness_level_required}</p>
                          </div>
                        </div>
                      )}
                        </div>
                      </div>

                    {/* Información de Precios */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-3 mb-6">
                        💰 Información de Precios
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {service.price && (
                          <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="p-2 bg-green-500 rounded-lg">
                              <Euro className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Precio Adultos</p>
                              <p className="text-green-700 font-bold text-lg">
                              {formatPrice(service.price, service.price_type || "per_person")}
                            </p>
                          </div>
                        </div>
                      )}

                      {hasChildrenPrice && (
                          <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <Baby className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Precio Niños</p>
                              <p className="text-blue-700 font-bold text-lg">
                              {formatChildrenPrice(service.price_children || 0, service.price_type || "per_person")}
                            </p>
                          </div>
                        </div>
                      )}
                      </div>
                    </div>

                    {/* Políticas */}
                    <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                      <h3 className="text-lg font-semibold text-gray-900 border-b border-green-300 pb-3 mb-4">
                        🛡️ Políticas y Términos
                      </h3>
                      
                      <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-green-200 shadow-sm">
                        <div className="p-2 bg-green-500 rounded-lg">
                          <ShieldCheck className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Política de Cancelación</p>
                          <p className="text-green-700 font-medium">
                            Cancelación gratuita con 24 horas de antelación
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Servicios Incluidos */}
              {((service.included_services?.length ?? 0) > 0 || (service.what_to_bring?.length ?? 0) > 0) && (
                <Card className="shadow-lg border-2 border-green-100">
                  <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div 
                      className="flex items-center justify-between cursor-pointer hover:bg-green-100 p-3 rounded-lg transition-all duration-200"
                      onClick={() => toggleSection('included')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold text-green-900">
                        Qué Incluye
                      </CardTitle>
                          <p className="text-sm text-green-700 mt-1">
                            Servicios incluidos y qué necesitas llevar
                          </p>
                        </div>
                      </div>
                      {expandedSections.included ? (
                        <ChevronUp className="h-6 w-6 text-green-600" />
                      ) : (
                        <ChevronDown className="h-6 w-6 text-green-600" />
                      )}
                    </div>
                  </CardHeader>
                  
                  {expandedSections.included && (
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Servicios Incluidos */}
                      {(service.included_services?.length ?? 0) > 0 && service.included_services && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-green-500 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-white" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                ✅ Incluido en el Precio
                              </h3>
                            </div>
                            
                            <div className="space-y-3">
                            {service.included_services.map((item: string, index: number) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                                  <div className="flex-shrink-0 mt-0.5">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  </div>
                                  <span className="text-gray-700 font-medium">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                        {/* Qué Llevar */}
                      {(service.what_to_bring?.length ?? 0) > 0 && service.what_to_bring && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-blue-500 rounded-lg">
                                <BookOpen className="h-5 w-5 text-white" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                🎒 Qué Llevar
                              </h3>
                            </div>
                            
                            <div className="space-y-3">
                            {service.what_to_bring.map((item: string, index: number) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                  <div className="flex-shrink-0 mt-0.5">
                                    <BookOpen className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <span className="text-gray-700 font-medium">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      </div>

                      {/* Información adicional si solo hay una sección */}
                      {((service.included_services?.length ?? 0) > 0 && (service.what_to_bring?.length ?? 0) === 0) || 
                       ((service.included_services?.length ?? 0) === 0 && (service.what_to_bring?.length ?? 0) > 0) ? (
                        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                          <div className="flex items-center gap-3">
                            <Info className="h-5 w-5 text-gray-600" />
                            <p className="text-sm text-gray-700">
                              Para más información sobre qué incluye o qué llevar, no dudes en contactarnos.
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Políticas y Términos */}
              <Card className="shadow-lg border-2 border-orange-100">
                <CardHeader className="pb-4 bg-gradient-to-r from-orange-50 to-red-50">
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-orange-100 p-3 rounded-lg transition-all duration-200"
                    onClick={() => toggleSection('policies')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-full">
                        <ShieldCheck className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-orange-900">
                      Políticas y Términos
                    </CardTitle>
                        <p className="text-sm text-orange-700 mt-1">
                          Condiciones de reserva y políticas de cancelación
                        </p>
                      </div>
                    </div>
                    {expandedSections.policies ? (
                      <ChevronUp className="h-6 w-6 text-orange-600" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-orange-600" />
                    )}
                  </div>
                </CardHeader>
                
                {expandedSections.policies && (
                  <CardContent className="p-6">
                    {/* Políticas Principales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {/* Política de Cancelación */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-red-200 pb-2">
                          📅 Política de Cancelación
                        </h3>
                        
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                          <div className="p-2 bg-green-500 rounded-lg">
                            <Calendar className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Cancelación Gratuita</p>
                            <p className="text-green-700 font-medium">
                              Hasta 24 horas antes del tour
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Confirmación y Seguro */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-blue-200 pb-2">
                          ✅ Confirmación y Seguro
                        </h3>
                        
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                          <div className="p-2 bg-blue-500 rounded-lg">
                            <Clock className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Confirmación</p>
                            <p className="text-blue-700 font-medium">Inmediata por email</p>
                        </div>
                      </div>

                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                          <div className="p-2 bg-purple-500 rounded-lg">
                            <Shield className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Seguro</p>
                            <p className="text-purple-700 font-medium">Incluido en el precio</p>
                          </div>
                        </div>
                        </div>
                      </div>

                    {/* Información del Grupo */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-3 mb-4">
                        👥 Información del Grupo
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="p-2 bg-orange-500 rounded-lg">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Tamaño del Grupo</p>
                            <p className="text-orange-700 font-medium">
                              {service.max_group_size 
                                ? `Máximo ${service.max_group_size} personas`
                                : service.min_group_size 
                                  ? `Mínimo ${service.min_group_size} personas`
                                  : 'Grupo pequeño garantizado'
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="p-2 bg-teal-500 rounded-lg">
                            <UserCheck className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Guía Profesional</p>
                            <p className="text-teal-700 font-medium">
                              Incluido en todos los tours
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Términos y Condiciones */}
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
                      <h3 className="text-lg font-semibold text-gray-900 border-b border-amber-300 pb-3 mb-4">
                        📋 Términos y Condiciones
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200">
                          <div className="flex-shrink-0 mt-1">
                            <Info className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">Reserva y Pago</p>
                            <p className="text-amber-700 text-sm">
                              La reserva se confirma con el pago completo. Aceptamos tarjetas de crédito y PayPal.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200">
                          <div className="flex-shrink-0 mt-1">
                            <Info className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">Condiciones Climáticas</p>
                            <p className="text-amber-700 text-sm">
                              En caso de mal tiempo, ofrecemos reembolso completo o cambio de fecha.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200">
                          <div className="flex-shrink-0 mt-1">
                            <Info className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">Responsabilidad</p>
                            <p className="text-amber-700 text-sm">
                              Todos los participantes deben seguir las instrucciones del guía por seguridad.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Imagen Mejorado */}
      {showImageModal && service?.images && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="relative max-w-6xl max-h-[95vh] w-full h-full flex flex-col">
            
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm rounded-t-xl border-b border-white/10">
              <div className="flex items-center gap-4">
                <h3 className="text-white font-semibold text-lg">
                  {service.title} - Imagen {modalImageIndex + 1}
                </h3>
                {service.images.length > 1 && (
                  <span className="text-white/70 text-sm">
                    {modalImageIndex + 1} de {service.images.length}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Controles de Zoom */}
                <div className="flex items-center gap-1 bg-black/30 rounded-lg p-1">
                  <button
                    onClick={() => handleImageZoom(-0.25)}
                    className="p-2 text-white hover:bg-white/20 rounded transition-colors"
                    title="Alejar (-)"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-white text-sm px-2 min-w-[3rem] text-center">
                    {Math.round(imageZoom * 100)}%
                  </span>
                  <button
                    onClick={() => handleImageZoom(0.25)}
                    className="p-2 text-white hover:bg-white/20 rounded transition-colors"
                    title="Acercar (+)"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setImageZoom(1)
                      setImagePosition({ x: 0, y: 0 })
                    }}
                    className="p-2 text-white hover:bg-white/20 rounded transition-colors text-xs"
                    title="Tamaño original (0)"
                  >
                    1:1
                  </button>
                </div>
                
                <button
                  onClick={closeImageModal}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                  title="Cerrar (ESC)"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {/* Contenedor de Imagen */}
            <div className="flex-1 relative overflow-hidden bg-gray-900">
              <div 
                className="relative w-full h-full flex items-center justify-center"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                style={{ cursor: imageZoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
              >
                <div
                  className="relative transition-transform duration-200 ease-out"
                  style={{
                    transform: `scale(${imageZoom}) translate(${imagePosition.x / imageZoom}px, ${imagePosition.y / imageZoom}px)`,
                  }}
                >
                  <SupabaseStorageImage
                    src={service.images[modalImageIndex]}
                    alt={`${service.title} - Imagen ${modalImageIndex + 1}`}
                    width={1200}
                    height={800}
                    className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                    sizes="90vw"
                    fallbackSrc="/placeholder.jpg"
                  />
                </div>
              </div>
              
              {/* Navegación Lateral */}
              {service.images.length > 1 && (
                <>
                  <button
                    onClick={() => navigateImage('prev')}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-110"
                    title="Imagen anterior (←)"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => navigateImage('next')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-110"
                    title="Imagen siguiente (→)"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            
            {/* Footer con Miniaturas */}
            {service.images.length > 1 && (
              <div className="p-4 bg-black/50 backdrop-blur-sm rounded-b-xl border-t border-white/10">
                <div className="flex items-center justify-center gap-2 overflow-x-auto">
                  {service.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setModalImageIndex(index)}
                      className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all duration-300 border-2 ${
                        index === modalImageIndex 
                          ? 'border-green-400 ring-2 ring-green-200 shadow-lg shadow-green-200/50' 
                          : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      <SupabaseStorageImage
                        src={image}
                        alt={`Miniatura ${index + 1}`}
                        fill={true}
                        className="object-cover"
                        sizes="64px"
                        fallbackSrc="/placeholder.jpg"
                      />
                      {index === modalImageIndex && (
                        <div className="absolute inset-0 bg-green-400/20 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-400 bg-black/50 rounded-full" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Instrucciones de navegación */}
                <div className="text-center mt-3 text-white/60 text-xs">
                  Usa las flechas del teclado para navegar • + / - para zoom • ESC para cerrar
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Compartir */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Compartir servicio</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={copyLink}
                className="w-full justify-start"
                variant="outline"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar enlace
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => shareOnSocial('facebook')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Facebook
                </Button>
                <Button
                  onClick={() => shareOnSocial('twitter')}
                  className="bg-blue-400 hover:bg-blue-500 text-white"
                >
                  Twitter
                </Button>
                <Button
                  onClick={() => shareOnSocial('whatsapp')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  WhatsApp
                </Button>
                <Button
                  onClick={() => shareOnSocial('linkedin')}
                  className="bg-blue-800 hover:bg-blue-900 text-white"
                >
                  LinkedIn
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sección de Reseñas Expandible */}
      {showReviews && reviews.length > 0 && (
        <div className="bg-gray-50 py-8 mt-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Reseñas de clientes</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-lg font-medium">{averageRating.toFixed(1)} de 5</span>
                <span className="text-gray-600">({totalReviews} reseñas)</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.user}</span>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">
                            ✓ Verificado
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Información del Clima */}
      {showWeather && weatherData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-blue-900">Clima actual en {service.location}</h4>
            <button
              onClick={() => setShowWeather(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{weatherData.icon}</span>
              <div>
                <div className="font-medium">{weatherData.temperature}°C</div>
                <div className="text-gray-600">{weatherData.condition}</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Humedad:</span>
                <span>{weatherData.humidity}%</span>
              </div>
              <div className="flex justify-between">
                <span>Viento:</span>
                <span>{weatherData.windSpeed} km/h</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-blue-700 mt-2">{weatherData.description}</p>
        </div>
      )}
    </div>
  )
} 