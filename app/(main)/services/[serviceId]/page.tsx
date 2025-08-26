"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useServiceDetails } from "@/hooks/use-service-details"
import { useAuthContext } from "@/components/auth-provider"
import { ServiceDetailsLoading } from "@/components/service-details-loading"

import { UnifiedPricingParticipantSelector } from "@/components/unified-pricing-participant-selector"
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
  Baby, User, Plus, Minus, CreditCard
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import SupabaseStorageImage from "@/components/supabase-storage-image"
import { format } from "date-fns"
import { toast } from "sonner"

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

  useEffect(() => {
    if (service) {
      // Cargar precios por edad cuando el servicio esté disponible
      loadServicePricing(service.id)
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
      console.error('Error cargando precios por edad:', error)
    }
  }

  // Función para truncar texto
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return `${text.substring(0, maxLength).trim()}...`
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
      toast.error("Debes iniciar sesión para hacer una reserva")
      router.push("/auth/login")
      return
    }
    
    // Validar fecha seleccionada
    if (!selectedDate) {
      toast.error("Por favor selecciona una fecha para el servicio")
      return
    }

    // Validar participantes
    if (participants.length === 0) {
      toast.error("Debes seleccionar al menos un participante")
      return
    }

    // Validar que la fecha no sea en el pasado
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
      toast.error("No puedes seleccionar una fecha en el pasado")
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

      console.log("Creando reserva:", reservationData)

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
      toast.success("¡Reserva creada exitosamente!")
      router.push(`/booking/${result.reservationId}`)
    } catch (error) {
      console.error("Error al crear reserva:", error)
      toast.error(error instanceof Error ? error.message : "Error al procesar la reserva")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast.success(isFavorite ? "Eliminado de favoritos" : "Añadido a favoritos")
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
        console.log('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Enlace copiado al portapapeles")
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

            {/* Título */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {service.title}
            </h1>

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
                  <p className="font-bold text-gray-900 text-xs">{service.duration} horas</p>
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

            {/* Selector de Fecha - OBLIGATORIO */}
            <Card className="border border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-blue-800 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Seleccionar Fecha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-lg border border-blue-200">
                    <Label htmlFor="service-date" className="text-sm font-medium text-gray-700 mb-2 block">
                      Fecha del servicio *
                    </Label>
                    <Input
                      id="service-date"
                      type="date"
                      value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                      onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : undefined)}
                      min={format(new Date(), 'yyyy-MM-dd')}
                      className="w-full"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Selecciona la fecha en la que deseas realizar el servicio
                    </p>
                  </div>
                  
                  {selectedDate && (
                    <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Fecha seleccionada: {format(selectedDate, 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Selector de Participantes por Edad */}
            <Card className="border border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-blue-800 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Precios por Edad y Selección de Participantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pricingLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-600">Cargando precios...</span>
                  </div>
                ) : servicePricing ? (
                  <UnifiedPricingParticipantSelector
                    serviceId={service.id}
                    basePrice={service.price}
                    onParticipantsChange={handleParticipantsChange}
                    onPricingChange={(updatedRanges) => {
                      // Aquí podrías implementar la lógica para guardar los cambios en la base de datos
                      console.log('Precios actualizados:', updatedRanges)
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
                    isAdmin={false} // Cambiar a true si el usuario es administrador
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No se pudieron cargar los precios por edad</p>
                    <p className="text-sm">Usa el botón de reserva para continuar</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botón de reserva mejorado */}
            <Card className="border border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <Button 
                  onClick={handleBooking}
                  disabled={!selectedDate || participants.length === 0 || isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : !selectedDate ? (
                    <>
                      <Calendar className="h-5 w-5 mr-2" />
                      Selecciona una fecha primero
                    </>
                  ) : (
                    <>
                      <Calendar className="h-5 w-5 mr-2" />
                      ¡Reservar Ahora!
                    </>
                  )}
                </Button>
                
                {/* Información de la reserva */}
                <div className="mt-4 space-y-2">
                  {selectedDate && (
                    <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Fecha:</span>
                        <span className="text-sm font-medium text-blue-800">
                          {format(selectedDate, 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {participants.length > 0 && (
                    <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Participantes:</span>
                        <span className="text-sm font-medium text-green-800">
                          {participants.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-700">Total:</span>
                        <span className="text-sm font-bold text-green-700">
                          €{totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                <p className="text-center text-xs text-gray-600 mt-3">
                  Reserva rápida y segura
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Columna Derecha - Galería y Contacto */}
          <div className="space-y-6 w-full max-w-md">
            {/* Galería */}
            <div className="flex justify-center lg:justify-end">
              {service.images && service.images.length > 0 ? (
                <div className="w-full">
                  {/* Imagen principal - Tamaño mejorado */}
                  <div className="relative h-80 w-full rounded-lg overflow-hidden mb-4 border border-gray-200 shadow-lg">
                    <SupabaseStorageImage
                      src={service.images[currentImageIndex] || '/placeholder.jpg'}
                      alt={`${service.title} - Imagen ${currentImageIndex + 1}`}
                      fill={true}
                      className="object-cover transition-all duration-300 hover:scale-105 w-full h-full"
                      priority={true}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      fallbackSrc="/images/placeholder.jpg"
                    />
                    
                    {/* Indicadores de imagen */}
                    {service.images && service.images.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        {service.images.map((_: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              index === currentImageIndex ? 'bg-green-500 scale-125' : 'bg-white/60 hover:bg-white/80'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Botones de navegación */}
                    {service.images && service.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : (service.images?.length || 1) - 1)}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-1 rounded-full transition-all duration-300"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex(prev => prev < (service.images?.length || 1) - 1 ? prev + 1 : 0)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-1 rounded-full transition-all duration-300"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Miniaturas - Tamaño mejorado */}
                  {service.images && service.images.length > 1 && (
                    <div className="grid grid-cols-3 gap-3">
                      {service.images.slice(0, 3).map((image: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative h-20 w-full rounded-lg overflow-hidden transition-all duration-300 border-2 ${
                            index === currentImageIndex ? 'border-green-500' : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <SupabaseStorageImage
                            src={image}
                            alt={`${service.title} - Miniatura ${index + 1}`}
                            fill={true}
                            className="object-cover w-full h-full"
                            sizes="(max-width: 768px) 33vw, 16vw"
                            fallbackSrc="/images/placeholder.jpg"
                          />
                        </button>
                      ))}
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
                    <span className="text-xs font-medium">{service.duration} horas</span>
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
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    onClick={() => toggleSection('details')}
                  >
                    <CardTitle className="text-base flex items-center gap-2 text-blue-600">
                      <Info className="h-4 w-4" />
                      Información Detallada
                    </CardTitle>
                    {expandedSections.details ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
                
                {expandedSections.details && (
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {service.difficulty_level && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <Mountain className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm">Dificultad</p>
                            <p className="text-xs text-gray-600 capitalize truncate">{service.difficulty_level}</p>
                          </div>
                        </div>
                      )}
                      
                      {service.min_group_size && service.max_group_size && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <Users2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm">Tamaño del Grupo</p>
                            <p className="text-xs text-gray-600 truncate">
                              {service.min_group_size}-{service.max_group_size} personas
                            </p>
                          </div>
                        </div>
                      )}

                      {service.location && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm">Ubicación</p>
                            <p className="text-xs text-gray-600 break-words">{service.location}</p>
                          </div>
                        </div>
                      )}

                      {service.fitness_level_required && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <Zap className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm">Nivel de Forma Física</p>
                            <p className="text-xs text-gray-600 capitalize truncate">{service.fitness_level_required}</p>
                          </div>
                        </div>
                      )}

                      {service.min_age && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <UserCheck className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm">Edad Mínima</p>
                            <p className="text-xs text-gray-600">{service.min_age} años</p>
                          </div>
                        </div>
                      )}

                      {service.max_group_size && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm">Tamaño Máximo del Grupo</p>
                            <p className="text-xs text-gray-600">{service.max_group_size} personas</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <ShieldCheck className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm">Política de Cancelación</p>
                          <p className="text-xs text-gray-600">
                            Cancelación gratuita con 24 h de antelación
                          </p>
                        </div>
                      </div>

                      {service.price && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <Euro className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm">Precio Adultos</p>
                            <p className="text-xs text-gray-600 truncate">
                              {formatPrice(service.price, service.price_type || "per_person")}
                            </p>
                          </div>
                        </div>
                      )}

                      {hasChildrenPrice && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <Baby className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm">Precio Niños</p>
                            <p className="text-xs text-gray-600 truncate">
                              {formatChildrenPrice(service.price_children || 0, service.price_type || "per_person")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Servicios Incluidos */}
              {((service.included_services?.length ?? 0) > 0 || (service.what_to_bring?.length ?? 0) > 0) && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <div 
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                      onClick={() => toggleSection('included')}
                    >
                      <CardTitle className="text-base flex items-center gap-2 text-green-600">
                        <Shield className="h-4 w-4" />
                        Qué Incluye
                      </CardTitle>
                      {expandedSections.included ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </CardHeader>
                  
                  {expandedSections.included && (
                    <CardContent className="space-y-2">
                      {(service.included_services?.length ?? 0) > 0 && service.included_services && (
                        <div>
                          <h4 className="font-medium text-green-700 mb-2 text-sm">Incluido en el Precio</h4>
                          <div className="space-y-1">
                            {service.included_services.map((item: string, index: number) => (
                              <div key={index} className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span className="text-sm text-gray-600">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(service.what_to_bring?.length ?? 0) > 0 && service.what_to_bring && (
                        <div>
                          <h4 className="font-medium text-blue-700 mb-2 text-sm">Qué Llevar</h4>
                          <div className="space-y-1">
                            {service.what_to_bring.map((item: string, index: number) => (
                              <div key={index} className="flex items-center gap-2">
                                <BookOpen className="h-3 w-3 text-blue-500" />
                                <span className="text-sm text-gray-600">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Políticas y Términos */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    onClick={() => toggleSection('policies')}
                  >
                    <CardTitle className="text-base flex items-center gap-2 text-orange-600">
                      <ShieldCheck className="h-4 w-4" />
                      Políticas y Términos
                    </CardTitle>
                    {expandedSections.policies ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
                
                {expandedSections.policies && (
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <Calendar className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm">Cancelación</p>
                          <p className="text-xs text-gray-600">Gratuita hasta 24h antes</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <Clock className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm">Confirmación</p>
                          <p className="text-xs text-gray-600">Inmediata</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <Shield className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm">Seguro</p>
                          <p className="text-xs text-gray-600">Incluido</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <Users className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm">Grupo</p>
                          <p className="text-xs text-gray-600">Máximo 20 personas</p>
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
    </div>
  )
} 