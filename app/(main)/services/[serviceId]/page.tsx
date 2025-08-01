"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useServicesSimple } from "@/hooks/use-services-simple"
import { useAuth } from "@/components/auth-provider-simple"
import { AdvancedLoading } from "@/components/advanced-loading"
import { AdvancedError } from "@/components/advanced-error-handling"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Calendar, Clock, Users, MapPin, Star, Euro, Shield, CheckCircle, XCircle, AlertTriangle, 
  ArrowLeft, Phone, Mail, Mountain, Camera, Heart, Share2, ChevronDown, ChevronUp, MessageCircle, 
  Zap, Info, Car, Utensils, Award, Globe, ShieldCheck, Eye, EyeOff, BookOpen, Map, 
  Navigation, CalendarDays, UserCheck, Users2, Clock3, Thermometer, Wind, Sun, CloudRain
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { toast } from "sonner"
import { normalizeImageUrl } from "@/lib/utils"

export default function ServiceDetailsPage() {
  const { serviceId } = useParams()
  const router = useRouter()
  const {
    services,
    isLoading,
    isInitialLoading,
    error,
    hasError,
    getServiceById,
    fetchServiceById,
    refreshServices
  } = useServicesSimple()
  const { user, loading: authLoading } = useAuth()
  
  const [service, setService] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [guests, setGuests] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    details: true,
    included: false,
    policies: false
  })
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)

  useEffect(() => {
    if (serviceId) {
      const foundService = getServiceById(serviceId as string)
      
      if (foundService) {
        setService(foundService)
        document.title = `${foundService.title} - Tenerife Paradise`
      } else if (services.length > 0) {
        fetchServiceById(serviceId as string)
          .then((freshData) => {
            if (freshData) {
              setService(freshData)
              document.title = `${freshData.title} - Tenerife Paradise`
            }
          })
          .catch((error) => {
            console.error('Error obteniendo servicio:', error)
            toast.error('Error al cargar los detalles del servicio')
          })
      }
    }
  }, [serviceId, services, getServiceById, fetchServiceById])

  // Función para truncar texto
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  // Función para contar palabras
  const countWords = (text: string) => {
    return text.trim().split(/\s+/).length
  }

  // Loading inicial
  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AdvancedLoading
          isLoading={true}
          variant="fullscreen"
          showProgress={true}
          size="lg"
          message="Cargando detalles del servicio..."
        />
      </div>
    )
  }

  // Error crítico
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold mb-4">Error al cargar el servicio</div>
          <Button onClick={refreshServices} className="bg-[#0061A8] hover:bg-[#0061A8]/90">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  // Servicio no encontrado
  if (!service && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-600">Servicio No Encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/services">
              <Button className="w-full bg-[#0061A8] hover:bg-[#0061A8]/90">
                Volver a Servicios
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading de servicio específico
  if (!service && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0061A8] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando servicio...</p>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number, priceType: string) => {
    const formatted = new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(price)
    return `${formatted}${priceType === "per_person" ? "/persona" : ""}`
  }

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'excursiones':
        return <Mountain className="h-5 w-5" />
      case 'tours':
        return <Map className="h-5 w-5" />
      case 'actividades':
        return <Zap className="h-5 w-5" />
      case 'transporte':
        return <Car className="h-5 w-5" />
      case 'gastronomía':
        return <Utensils className="h-5 w-5" />
      default:
        return <Globe className="h-5 w-5" />
    }
  }

  const getCategoryName = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'excursiones':
        return 'Excursiones'
      case 'tours':
        return 'Tours Guiados'
      case 'actividades':
        return 'Actividades'
      case 'transporte':
        return 'Transporte'
      case 'gastronomía':
        return 'Gastronomía'
      default:
        return 'Servicios'
    }
  }

  const calculateTotal = () => {
    if (!service) return 0
    return service.price * guests
  }

  const handleBooking = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }
    
    if (!selectedDate) {
      toast.error("Por favor selecciona una fecha")
      return
    }

    setIsSubmitting(true)
    try {
      const reservationData = {
        service_id: service.id,
        reservation_date: format(selectedDate, "yyyy-MM-dd"),
        guests: guests,
        total_amount: calculateTotal(),
        special_requests: "",
      }

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      })

      if (!response.ok) {
        throw new Error("Error al crear la reserva")
      }

      toast.success("¡Reserva creada exitosamente!")
      router.push(`/booking/${service.id}`)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al procesar la reserva")
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
    <div className="min-h-screen">
      {/* Hero Section con Navbar Integrado */}
      <div className="relative min-h-screen bg-gradient-to-r from-blue-900 via-blue-800 to-orange-600">
        {/* Fondo de montañas (placeholder) */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-orange-600/60"></div>
        
        {/* Navbar integrado */}
        <nav className="relative z-10 max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Lado Izquierdo - Navegación */}
            <div className="flex items-center gap-6">
              <Link 
                href="/services" 
                className="text-white hover:text-yellow-300 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="hidden md:flex items-center gap-6 text-white text-sm">
                <Link href="/" className="hover:text-yellow-300 transition-colors">Inicio</Link>
                <Link href="/services" className="hover:text-yellow-300 transition-colors">Servicios</Link>
                <Link href="/about" className="hover:text-yellow-300 transition-colors">Nosotros</Link>
                <Link href="/contact" className="hover:text-yellow-300 transition-colors">Contacto</Link>
              </div>
            </div>

            {/* Centro - Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">TP</span>
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold text-white">Tenerife Paradise</h1>
                <p className="text-yellow-300 text-xs">Tours & Excursions</p>
              </div>
            </div>

            {/* Lado Derecho - Avatar */}
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
          </div>
        </nav>

        {/* Contenido del Hero */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-40px)] py-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start w-full max-w-6xl">
            {/* Columna Izquierda - Información del Servicio */}
            <div className="space-y-6 min-w-0">
              {/* Badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {getCategoryIcon(service.category_id)}
                  <span className="ml-2">{getCategoryName(service.category_id)}</span>
                </Badge>
                {service.available && (
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Disponible
                  </Badge>
                )}
              </div>

              {/* Título */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight break-words">
                {service.title}
              </h1>

              {/* Descripción con manejo de textos largos */}
              <div className="space-y-3">
                <div className="relative">
                  <div className={`text-white/90 text-base leading-relaxed break-words ${
                    descriptionExpanded && service.description.length > 800 ? 'max-h-96 overflow-y-auto pr-2' : ''
                  }`}>
                    {descriptionExpanded 
                      ? service.description 
                      : truncateText(service.description, 300)
                    }
                  </div>
                  
                  {/* Botón de expandir/contraer si el texto es largo */}
                  {service.description.length > 300 && (
                    <button
                      onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                      className="mt-2 text-yellow-300 hover:text-yellow-200 text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      {descriptionExpanded ? (
                        <>
                          <span>Mostrar menos</span>
                          <ChevronUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          <span>Leer más</span>
                          <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  )}
                  
                  {/* Indicador de longitud del texto */}
                  {service.description.length > 200 && (
                    <div className="text-white/50 text-xs mt-1">
                      {countWords(service.description)} palabras
                      {!descriptionExpanded && service.description.length > 300 && (
                        <span> • {Math.round((300 / service.description.length) * 100)}% mostrado</span>
                      )}
                      {descriptionExpanded && service.description.length > 800 && (
                        <span> • Desplázate para ver más</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Información rápida */}
              <div className="grid grid-cols-3 gap-3">
                {service.duration && (
                  <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Clock className="h-5 w-5 text-yellow-300 mx-auto mb-1" />
                    <p className="font-semibold text-white text-sm">{service.duration} min</p>
                    <p className="text-xs text-white/70">Duración</p>
                  </div>
                )}
                
                {service.location && (
                  <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <MapPin className="h-5 w-5 text-yellow-300 mx-auto mb-1" />
                    <p className="font-semibold text-white text-xs leading-tight break-words">{service.location}</p>
                    <p className="text-xs text-white/70">Ubicación</p>
                  </div>
                )}

                <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Zap className="h-5 w-5 text-yellow-300 mx-auto mb-1" />
                  <p className="font-semibold text-white text-xs">Actividad acuática</p>
                  <p className="text-xs text-white/70">Tipo</p>
                </div>
              </div>

              {/* Botón de reserva */}
              <Button 
                onClick={handleReserveClick}
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 text-base"
                size="lg"
              >
                <Calendar className="h-4 w-4 mr-2" />
                ¡Reservar Ahora!
              </Button>
              <p className="text-white/70 text-xs">
                Reserva rápida y segura
              </p>
            </div>

            {/* Columna Derecha - Galería de Imágenes */}
            <div className="relative lg:sticky lg:top-8">
              {service.images && service.images.length > 0 ? (
                <div className="bg-white/10 rounded-xl overflow-hidden backdrop-blur-sm shadow-2xl border border-white/20">
                  {/* Imagen Principal */}
                  <div className="relative h-72 md:h-96">
                    <Image
                      src={normalizeImageUrl(service.images[currentImageIndex])}
                      alt={service.title}
                      fill
                      className="object-cover"
                      priority
                    />
                    
                    {/* Controles de navegación */}
                    {service.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : service.images.length - 1)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-all duration-200 hover:scale-110 shadow-lg"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex(prev => prev < service.images.length - 1 ? prev + 1 : 0)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-all duration-200 hover:scale-110 shadow-lg"
                        >
                          <ArrowLeft className="h-5 w-5 rotate-180" />
                        </button>
                        
                        {/* Indicador de imagen */}
                        <div className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
                          {currentImageIndex + 1} / {service.images.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Miniaturas */}
                  {service.images.length > 1 && (
                    <div className="p-5 grid grid-cols-4 gap-3">
                      {service.images.map((image: string, index: number) => (
                        <div
                          key={index}
                          className={`relative h-20 rounded-lg cursor-pointer transition-all duration-200 ${
                            index === currentImageIndex 
                              ? 'ring-3 ring-yellow-400 shadow-lg scale-105' 
                              : 'hover:opacity-80 hover:scale-105'
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <Image
                            src={normalizeImageUrl(image)}
                            alt={`${service.title} - ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                          />
                          {index === currentImageIndex && (
                            <div className="absolute inset-0 bg-yellow-400/20 rounded-lg"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Placeholder cuando no hay imágenes */
                <div className="bg-white/10 rounded-xl overflow-hidden backdrop-blur-sm shadow-2xl border border-white/20 h-72 md:h-96 flex items-center justify-center">
                  <div className="text-center text-white/70">
                    <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Sin imágenes</p>
                    <p className="text-sm">No hay imágenes disponibles para este servicio</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido adicional debajo del hero */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información Detallada */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    onClick={() => toggleSection('details')}
                  >
                    <h3 className="text-base font-semibold flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-500" />
                      Información Detallada
                    </h3>
                    {expandedSections.details ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                  
                  {expandedSections.details && (
                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {service.difficulty_level && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Mountain className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Dificultad</p>
                              <p className="text-xs text-gray-600 capitalize">{service.difficulty_level}</p>
                            </div>
                          </div>
                        )}
                        
                        {service.min_group_size && service.max_group_size && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Users2 className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Tamaño del Grupo</p>
                              <p className="text-xs text-gray-600">
                                {service.min_group_size}-{service.max_group_size} personas
                              </p>
                            </div>
                          </div>
                        )}

                        {service.location && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Ubicación</p>
                              <p className="text-xs text-gray-600 break-words">{service.location}</p>
                            </div>
                          </div>
                        )}

                        {service.fitness_level_required && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Zap className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Nivel de Forma Física</p>
                              <p className="text-xs text-gray-600 capitalize">{service.fitness_level_required}</p>
                            </div>
                          </div>
                        )}

                        {service.min_age && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <UserCheck className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Edad Mínima</p>
                              <p className="text-xs text-gray-600">{service.min_age} años</p>
                            </div>
                          </div>
                        )}

                        {service.max_guests && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Users className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Máximo de Huéspedes</p>
                              <p className="text-xs text-gray-600">{service.max_guests} personas</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <ShieldCheck className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">Política de Cancelación</p>
                            <p className="text-xs text-gray-600">
                              Cancelación gratuita con 24 h de antelación
                            </p>
                          </div>
                        </div>

                        {service.price && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Euro className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Precio</p>
                              <p className="text-xs text-gray-600">
                                {formatPrice(service.price, service.price_type || "per_person")}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Servicios Incluidos */}
              {(service.included_services?.length > 0 || service.what_to_bring?.length > 0) && (
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-4">
                    <div 
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                      onClick={() => toggleSection('included')}
                    >
                      <h3 className="text-base font-semibold flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-500" />
                        Qué Incluye
                      </h3>
                      {expandedSections.included ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    
                    {expandedSections.included && (
                      <div className="mt-4 space-y-3">
                        {service.included_services?.length > 0 && (
                          <div>
                            <h4 className="font-medium text-green-700 mb-2 text-sm">Incluido en el Precio</h4>
                            <div className="space-y-2">
                              {service.included_services.map((item: string, index: number) => (
                                <div key={index} className="flex items-center gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  <span className="text-xs text-gray-600">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {service.what_to_bring?.length > 0 && (
                          <div>
                            <h4 className="font-medium text-blue-700 mb-2 text-sm">Qué Llevar</h4>
                            <div className="space-y-2">
                              {service.what_to_bring.map((item: string, index: number) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Shield className="h-3 w-3 text-blue-500" />
                                  <span className="text-xs text-gray-600">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar de Reserva */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-green-500 text-white p-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-5 w-5" />
                      Reserva Aquí
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="p-4 space-y-4">
                    {/* Precio */}
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {formatPrice(service.price, service.price_type || "per_person")}
                      </div>
                    </div>

                    {/* Disponibilidad */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 text-sm">Disponibilidad</span>
                      <Badge variant={service.available ? "default" : "destructive"}>
                        {service.available ? "Disponible" : "No disponible"}
                      </Badge>
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 text-sm">
                        Total para {guests} persona{guests > 1 ? 's' : ''}
                      </span>
                      <span className="font-bold text-base text-blue-600">
                        {formatPrice(calculateTotal(), "total")}
                      </span>
                    </div>

                    {/* Botón de reserva */}
                    {!user ? (
                      <div className="space-y-3">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Shield className="h-4 w-4 text-orange-500" />
                            <span className="font-medium text-orange-700 text-sm">Acceso requerido</span>
                          </div>
                          <p className="text-xs text-orange-600 mb-3">
                            Inicia sesión para poder realizar reservas
                          </p>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => router.push("/auth/login")}
                              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm py-2"
                            >
                              Iniciar Sesión
                            </Button>
                            <Button 
                              onClick={() => router.push("/auth/register")}
                              variant="outline"
                              className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50 text-sm py-2"
                            >
                              Registrarse
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : service.available ? (
                      <div className="space-y-3">
                        <Button 
                          onClick={handleReserveClick}
                          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 text-base"
                          size="lg"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          ¡Reservar Ahora!
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 text-xs">Servicio no disponible</p>
                      </div>
                    )}

                    {/* Información de contacto */}
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                        <MessageCircle className="h-4 w-4 text-blue-500" />
                        ¿Necesitas ayuda?
                      </h4>
                      <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded transition-colors">
                          <Phone className="h-3 w-3 text-blue-500" />
                          <span>+34 617 30 39 29</span>
                        </div>
                        <div className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded transition-colors">
                          <Mail className="h-3 w-3 text-blue-500" />
                          <span className="break-all">Tenerifeparadisetoursandexcursions@hotmail.com</span>
                        </div>
                        <div className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded transition-colors">
                          <MapPin className="h-3 w-3 text-blue-500" />
                          <span>Santa Cruz de Tenerife, Islas Canarias</span>
                        </div>
                        <div className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded transition-colors">
                          <Clock className="h-3 w-3 text-blue-500" />
                          <span>Lun - Dom: 8:00 - 20:00</span>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3 text-orange-500" />
                            <span className="text-xs text-orange-700">Atención 24/7 para emergencias</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={handleFavorite}
                        className="flex-1 text-xs py-2"
                      >
                        <Heart className={`h-3 w-3 mr-1 ${isFavorite ? 'fill-current' : ''}`} />
                        Favorito
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleShare}
                        className="flex-1 text-xs py-2"
                      >
                        <Share2 className="h-3 w-3 mr-1" />
                        Compartir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botón flotante de scroll-to-top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 w-10 h-10 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-50"
        aria-label="Volver arriba"
      >
        <ArrowLeft className="h-4 w-4 rotate-90" />
      </button>
    </div>
  )
} 