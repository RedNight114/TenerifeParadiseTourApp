"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useServices } from "@/hooks/use-services"
import { useAuth } from "@/hooks/use-auth"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Users, MapPin, Star, Euro, Shield, CheckCircle, XCircle, AlertTriangle, ArrowLeft, Phone, Mail, Car, Utensils, Mountain, Camera, Heart, Share2, ChevronDown, ChevronUp, MessageCircle, Award, Zap, Globe, ShieldCheck, Info } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { toast } from "sonner"
import { normalizeImageUrl } from "@/lib/utils"

export default function ServiceDetailsPage() {
  const { serviceId } = useParams()
  const router = useRouter()
  const { services, loading: servicesLoading, fetchServices, getFreshService } = useServices()
  const { user, profile, loading: authLoading } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  
  const [service, setService] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [guests, setGuests] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    details: true,
    included: true,
    policies: false
  })
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)

  // Navegación con teclado para la galería
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showImageModal || !service?.images) return
      
      switch (e.key) {
        case 'ArrowLeft':
          setCurrentImageIndex(prev => 
            prev === 0 ? service.images.length - 1 : prev - 1
          )
          break
        case 'ArrowRight':
          setCurrentImageIndex(prev => 
            prev === service.images.length - 1 ? 0 : prev + 1
          )
          break
        case 'Escape':
          setShowImageModal(false)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showImageModal, service?.images])

  useEffect(() => {
    if (services.length === 0) {
      fetchServices()
    }
  }, [services, fetchServices])

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setIsScrolled(window.scrollY > 20)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  useEffect(() => {
    if (serviceId) {
      // Primero intentar encontrar en los servicios cargados
      const foundService = services.find((s) => s.id === serviceId)
      
      if (foundService) {
        setService(foundService)
        document.title = `${foundService.title} - Tenerife Paradise Tours & Excursions`
      } else if (services.length > 0) {
        // Si no se encuentra en los servicios cargados, obtener datos frescos
        console.log('🔄 Servicio no encontrado en cache, obteniendo datos frescos...')
        getFreshService(serviceId as string)
          .then((freshData) => {
            if (freshData) {
              const freshService = {
                id: String(freshData.id),
                title: String(freshData.title),
                description: String(freshData.description),
                category_id: String(freshData.category_id),
                subcategory_id: freshData.subcategory_id ? String(freshData.subcategory_id) : undefined,
                price: Number(freshData.price),
                price_type: (freshData.price_type === 'per_person' || freshData.price_type === 'total') ? freshData.price_type : 'per_person',
                images: Array.isArray(freshData.images) ? freshData.images.map(String) : [],
                available: Boolean(freshData.available),
                featured: Boolean(freshData.featured),
                duration: freshData.duration !== undefined ? Number(freshData.duration) : undefined,
                location: freshData.location ? String(freshData.location) : undefined,
                min_group_size: freshData.min_group_size !== undefined ? Number(freshData.min_group_size) : undefined,
                max_group_size: freshData.max_group_size !== undefined ? Number(freshData.max_group_size) : undefined,
                difficulty_level: (freshData.difficulty_level === 'facil' || freshData.difficulty_level === 'moderado' || freshData.difficulty_level === 'dificil') ? freshData.difficulty_level : undefined,
                vehicle_type: freshData.vehicle_type ? String(freshData.vehicle_type) : undefined,
                characteristics: freshData.characteristics ? String(freshData.characteristics) : undefined,
                insurance_included: freshData.insurance_included !== undefined ? Boolean(freshData.insurance_included) : undefined,
                fuel_included: freshData.fuel_included !== undefined ? Boolean(freshData.fuel_included) : undefined,
                menu: freshData.menu ? String(freshData.menu) : undefined,
                schedule: Array.isArray(freshData.schedule) ? freshData.schedule.map(String) : undefined,
                capacity: freshData.capacity !== undefined ? Number(freshData.capacity) : undefined,
                dietary_options: Array.isArray(freshData.dietary_options) ? freshData.dietary_options.map(String) : undefined,
                min_age: freshData.min_age !== undefined ? Number(freshData.min_age) : undefined,
                license_required: freshData.license_required !== undefined ? Boolean(freshData.license_required) : undefined,
                permit_required: freshData.permit_required !== undefined ? Boolean(freshData.permit_required) : undefined,
                what_to_bring: Array.isArray(freshData.what_to_bring) ? freshData.what_to_bring.map(String) : undefined,
                included_services: Array.isArray(freshData.included_services) ? freshData.included_services.map(String) : undefined,
                not_included_services: Array.isArray(freshData.not_included_services) ? freshData.not_included_services.map(String) : undefined,
                meeting_point_details: freshData.meeting_point_details ? String(freshData.meeting_point_details) : undefined,
                transmission: (freshData.transmission === 'manual' || freshData.transmission === 'automatic') ? freshData.transmission : undefined,
                seats: freshData.seats !== undefined ? Number(freshData.seats) : undefined,
                doors: freshData.doors !== undefined ? Number(freshData.doors) : undefined,
                fuel_policy: freshData.fuel_policy ? String(freshData.fuel_policy) : undefined,
                pickup_locations: Array.isArray(freshData.pickup_locations) ? freshData.pickup_locations.map(String) : undefined,
                deposit_required: freshData.deposit_required !== undefined ? Boolean(freshData.deposit_required) : undefined,
                deposit_amount: freshData.deposit_amount !== undefined ? Number(freshData.deposit_amount) : undefined,
                experience_type: freshData.experience_type ? String(freshData.experience_type) : undefined,
                chef_name: freshData.chef_name ? String(freshData.chef_name) : undefined,
                drink_options: freshData.drink_options ? String(freshData.drink_options) : undefined,
                ambience: freshData.ambience ? String(freshData.ambience) : undefined,
                activity_type: freshData.activity_type ? String(freshData.activity_type) : undefined,
                fitness_level_required: (freshData.fitness_level_required === 'bajo' || freshData.fitness_level_required === 'medio' || freshData.fitness_level_required === 'alto') ? freshData.fitness_level_required : undefined,
                equipment_provided: Array.isArray(freshData.equipment_provided) ? freshData.equipment_provided.map(String) : undefined,
                cancellation_policy: freshData.cancellation_policy ? String(freshData.cancellation_policy) : undefined,
                itinerary: freshData.itinerary ? String(freshData.itinerary) : undefined,
                guide_languages: Array.isArray(freshData.guide_languages) ? freshData.guide_languages.map(String) : undefined,
                created_at: String(freshData.created_at),
                updated_at: String(freshData.updated_at),
                category: (typeof freshData.category === 'object' && freshData.category !== null) ? freshData.category as any : undefined,
                subcategory: (typeof freshData.subcategory === 'object' && freshData.subcategory !== null) ? freshData.subcategory as any : undefined
              }
              setService(freshService)
              document.title = `${freshService.title} - Tenerife Paradise Tours & Excursions`
            }
          })
          .catch((error) => {
            console.error('❌ Error al obtener servicio fresco:', error)
          })
      }
    }
  }, [services, serviceId, getFreshService])

  const formatPrice = (price: number, priceType: string) => {
    const formatted = new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(price)
    return `${formatted}${priceType === "per_person" ? "/persona" : ""}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "facil":
        return "bg-green-100 text-green-800"
      case "moderado":
        return "bg-yellow-100 text-yellow-800"
      case "dificil":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case "actividades":
        return <Mountain className="h-5 w-5" />
      case "renting":
        return <Car className="h-5 w-5" />
      case "gastronomia":
        return <Utensils className="h-5 w-5" />
      default:
        return <Mountain className="h-5 w-5" />
    }
  }

  const getCategoryName = (categoryId: string) => {
    switch (categoryId) {
      case "actividades":
        return "Actividades"
      case "renting":
        return "Alquiler de Vehículos"
      case "gastronomia":
        return "Gastronomía"
      default:
        return "Servicio"
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

      const reservation = await response.json()
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

  const scrollToBooking = () => {
    setShowBookingForm(true)
    // Scroll al sidebar en dispositivos grandes
    if (window.innerWidth >= 1024) {
      const sidebar = document.querySelector('[data-booking-sidebar]')
      if (sidebar) {
        sidebar.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  if (servicesLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0061A8] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando servicio...</p>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-600">Servicio No Encontrado</CardTitle>
            <CardDescription>El servicio que buscas no existe o no está disponible</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/services">
              <Button className="w-full bg-[#0061A8] hover:bg-[#0061A8]/90">Ver Todos los Servicios</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-[url('/images/hero-background.avif')] bg-cover bg-center bg-no-repeat opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-purple-50/80"></div>
      
      {/* Navbar mejorado */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          isScrolled ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Botón Volver a Servicios */}
            <div className="flex-1 flex justify-start">
              <Link 
                href="/services" 
                className={`inline-flex items-center px-4 py-2 rounded-lg transition-all duration-300 group ${
                  isScrolled 
                    ? "bg-[#0061A8] hover:bg-[#004A87] text-white shadow-lg" 
                    : "bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30"
                }`}
              >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Volver a Servicios</span>
              </Link>
            </div>

            {/* Logo centrado */}
            <Link
              href="/"
              className="flex items-center space-x-3 transition-all duration-300 hover:scale-105 absolute left-1/2 transform -translate-x-1/2"
            >
              <div className="w-16 h-16 relative">
                <Image
                  src="/images/logo-tenerife.png"
                  alt="Tenerife Paradise Tours & Excursions"
                  fill
                  className="object-contain drop-shadow-xl"
                />
              </div>
              <div className="text-center">
                <h1
                  className={`font-bold text-xl transition-all duration-300 ${
                    isScrolled ? "text-[#0061A8]" : "text-white drop-shadow-lg"
                  }`}
                >
                  Tenerife Paradise
                </h1>
                <p
                  className={`font-medium transition-all duration-300 ${
                    isScrolled ? "text-[#F4C762]" : "text-[#F4C762] drop-shadow-md"
                  }`}
                >
                  Tours & Excursions
                </p>
              </div>
            </Link>

            {/* Espacio vacío para balance */}
            <div className="flex-1"></div>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/hero-tenerife-sunset.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0061A8]/85 via-[#0061A8]/70 to-[#F4C762]/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0061A8]/5 to-[#1E40AF]/5"></div>
        
        {/* Banner de CTA flotante - Más sutil */}
        <div className="absolute top-24 left-4 right-4 z-20 lg:hidden">
          {!user ? (
            <div className="bg-white/95 backdrop-blur-sm border border-orange-200 text-gray-700 p-3 rounded-lg shadow-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-orange-500" />
                <p className="font-medium text-sm text-orange-700">Acceso requerido</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => router.push("/auth/login")}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium px-3 py-1 rounded-md text-xs"
                >
                  Iniciar Sesión
                </Button>
                <Button 
                  onClick={() => router.push("/auth/register")}
                  variant="outline"
                  className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50 font-medium px-3 py-1 rounded-md text-xs"
                >
                  Registrarse
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-sm border border-green-200 text-gray-700 p-3 rounded-lg shadow-lg text-center">
              <p className="font-medium text-sm text-green-700 mb-2">¡Reserva tu aventura!</p>
              <Button 
                onClick={scrollToBooking}
                className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-1 rounded-md text-xs"
              >
                Reservar
              </Button>
            </div>
          )}
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Hero Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {/* Category and Badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full border border-[#0061A8]/20">
                  {getCategoryIcon(service.category_id)}
                  <span className="text-sm font-medium text-[#0061A8]">{getCategoryName(service.category_id)}</span>
                </div>
                {service.featured && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white border-0 shadow-lg">
                    <Star className="h-3 w-3 mr-1" />
                    Destacado
                  </Badge>
                )}
                {service.available && (
                  <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white border-0 shadow-lg">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Disponible
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg">
                {service.title}
              </h1>

              {/* Description */}
              <p className="text-xl text-white/90 max-w-2xl leading-relaxed drop-shadow-md">
                {service.description}
              </p>

              {/* Quick Info - Información única del hero */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {service.duration && (
                  <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-[#0061A8]/20">
                    <Clock className="h-6 w-6 text-[#0061A8] mx-auto mb-2" />
                    <p className="font-semibold text-gray-900">{service.duration} min</p>
                    <p className="text-sm text-gray-600">Duración</p>
                  </div>
                )}
                
                {service.location && (
                  <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-[#0061A8]/20">
                    <MapPin className="h-6 w-6 text-[#0061A8] mx-auto mb-2" />
                    <p className="font-semibold text-gray-900">{service.location}</p>
                    <p className="text-sm text-gray-600">Ubicación</p>
                  </div>
                )}

                {service.activity_type && (
                  <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-[#0061A8]/20">
                    <Zap className="h-6 w-6 text-[#0061A8] mx-auto mb-2" />
                    <p className="font-semibold text-gray-900">{service.activity_type}</p>
                    <p className="text-sm text-gray-600">Tipo</p>
                  </div>
                )}
              </div>

              {/* Botón de reserva prominente */}
              <div className="pt-6">
                {!user ? (
                  <div className="space-y-3">
                    <div className="bg-white/90 backdrop-blur-sm border border-orange-200 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-orange-500" />
                        <span className="font-medium text-orange-700 text-sm">Acceso requerido para reservar</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => router.push("/auth/login")}
                          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm"
                        >
                          Iniciar Sesión
                        </Button>
                        <Button 
                          onClick={() => router.push("/auth/register")}
                          variant="outline"
                          className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50 font-medium text-sm"
                        >
                          Registrarse
                        </Button>
                      </div>
                    </div>
                    <Button 
                      onClick={() => router.push("/auth/login")}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 border-0"
                      size="lg"
                    >
                      <Calendar className="h-6 w-6 mr-3" />
                      ¡Reservar Ahora!
                    </Button>
                    <p className="text-center text-sm text-gray-500">
                      Inicia sesión para continuar
                    </p>
                  </div>
                ) : (
                  <>
                    <Button 
                      onClick={scrollToBooking}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 border-0"
                      size="lg"
                    >
                      <Calendar className="h-6 w-6 mr-3" />
                      ¡Reservar Ahora!
                    </Button>
                    <p className="text-center text-sm text-gray-500 mt-2">
                      Reserva rápida y segura
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Galería de Imágenes */}
            <div className="relative space-y-4">
              {/* Imagen Principal */}
              <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl cursor-pointer group"
                   onClick={() => setShowImageModal(true)}>
                {service.images && service.images.length > 0 ? (
                  <Image
                    src={normalizeImageUrl(service.images[currentImageIndex])}
                    alt={`${service.title} - Imagen ${currentImageIndex + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0061A8] to-[#1E40AF] flex items-center justify-center">
                    <Camera className="h-16 w-16 text-white/50" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                
                {/* Indicador de imagen actual */}
                {service.images && service.images.length > 1 && (
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm font-medium">
                    {currentImageIndex + 1} / {service.images.length}
                  </div>
                )}
                
                {/* Botón de precio en móvil */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg lg:hidden">
                  <p className="text-xl font-bold text-[#0061A8]">
                    {formatPrice(service.price, service.price_type || "per_person")}
                  </p>
                </div>

                {/* Botón de expandir */}
                {service.images && service.images.length > 0 && (
                  <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Camera className="h-5 w-5" />
                  </div>
                )}
              </div>

              {/* Miniaturas de la galería */}
              {service.images && service.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {service.images.map((image: string, index: number) => (
                    <div
                      key={index}
                      className={`relative h-20 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'ring-2 ring-[#0061A8] ring-offset-2' 
                          : 'hover:opacity-80'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <Image
                        src={normalizeImageUrl(image)}
                        alt={`${service.title} - Miniatura ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {index === currentImageIndex && (
                        <div className="absolute inset-0 bg-[#0061A8]/20 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contenido principal */}
            <div className="lg:col-span-2 space-y-6">

              {/* Información detallada */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => toggleSection('details')}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Award className="h-6 w-6 text-[#0061A8]" />
                      Información Detallada
                    </CardTitle>
                    {expandedSections.details ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
                
                {expandedSections.details && (
                  <CardContent className="space-y-6">
                    {/* Información básica */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[#0061A8]">
                        <Info className="h-5 w-5" />
                        Información Básica
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {service.difficulty_level && (
                          <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-lg">
                            <Mountain className="h-5 w-5 text-[#0061A8]" />
                            <div>
                              <p className="font-medium">Dificultad</p>
                              <Badge className={`${getDifficultyColor(service.difficulty_level)} border-0`}>
                                {service.difficulty_level.charAt(0).toUpperCase() + service.difficulty_level.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        )}

                        {service.min_group_size && service.max_group_size && (
                          <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-lg">
                            <Users className="h-5 w-5 text-[#0061A8]" />
                            <div>
                              <p className="font-medium">Tamaño del Grupo</p>
                              <p className="text-gray-600">{service.min_group_size}-{service.max_group_size} personas</p>
                            </div>
                          </div>
                        )}

                        {service.fitness_level_required && (
                          <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-lg">
                            <Heart className="h-5 w-5 text-[#0061A8]" />
                            <div>
                              <p className="font-medium">Nivel de Forma Física</p>
                              <p className="text-gray-600 capitalize">{service.fitness_level_required}</p>
                            </div>
                          </div>
                        )}

                        {service.min_age && (
                          <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-lg">
                            <Users className="h-5 w-5 text-[#0061A8]" />
                            <div>
                              <p className="font-medium">Edad Mínima</p>
                              <p className="text-gray-600">{service.min_age} años</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Detalles específicos de la actividad */}
                    {(service.activity_type || service.equipment_provided?.length > 0 || service.guide_languages?.length > 0 || service.itinerary) && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[#0061A8]">
                          <Zap className="h-5 w-5" />
                          Detalles de la Actividad
                        </h3>
                        <div className="space-y-4">
                          {service.activity_type && (
                            <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-lg">
                              <Zap className="h-5 w-5 text-blue-500" />
                              <div>
                                <p className="font-medium">Tipo de Actividad</p>
                                <p className="text-gray-700">{service.activity_type}</p>
                              </div>
                            </div>
                          )}

                          {service.equipment_provided?.length > 0 && (
                            <div className="p-4 bg-green-50/50 rounded-lg">
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-green-500" />
                                Equipo Proporcionado
                              </h4>
                              <div className="grid grid-cols-1 gap-2">
                                {service.equipment_provided.map((item: string, index: number) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    <span className="text-gray-700 text-sm">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {service.guide_languages?.length > 0 && (
                            <div className="flex items-center gap-3 p-4 bg-purple-50/50 rounded-lg">
                              <Globe className="h-5 w-5 text-purple-500" />
                              <div>
                                <p className="font-medium">Idiomas del Guía</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {service.guide_languages.map((lang: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {lang}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {service.itinerary && (
                            <div className="p-4 bg-orange-50/50 rounded-lg">
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-orange-500" />
                                Itinerario
                              </h4>
                              <p className="text-gray-700 text-sm whitespace-pre-line">{service.itinerary}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Información de seguridad y logística */}
                    {(service.meeting_point_details || service.cancellation_policy) && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[#0061A8]">
                          <ShieldCheck className="h-5 w-5" />
                          Información de Seguridad y Logística
                        </h3>
                        <div className="space-y-4">
                          {service.meeting_point_details && (
                            <div className="p-4 bg-green-50/50 rounded-lg">
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-green-500" />
                                Punto de Encuentro
                              </h4>
                              <p className="text-gray-700 text-sm">{service.meeting_point_details}</p>
                            </div>
                          )}

                          {service.cancellation_policy && (
                            <div className="p-4 bg-blue-50/50 rounded-lg">
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-blue-500" />
                                Política de Cancelación
                              </h4>
                              <p className="text-gray-700 text-sm">{service.cancellation_policy}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>

              {/* Servicios incluidos */}
              {(service.what_to_bring?.length > 0 || service.included_services?.length > 0 || service.not_included_services?.length > 0) && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader 
                    className="cursor-pointer hover:bg-gray-50/50 transition-colors"
                    onClick={() => toggleSection('included')}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <ShieldCheck className="h-6 w-6 text-[#0061A8]" />
                        Qué Incluye
                      </CardTitle>
                      {expandedSections.included ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </CardHeader>
                  
                  {expandedSections.included && (
                    <CardContent className="space-y-4">
                      {service.included_services?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Incluido en el Precio
                          </h3>
                          <div className="grid grid-cols-1 gap-2">
                            {service.included_services.map((item: string, index: number) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-green-50/50 rounded-lg">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-gray-700">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {service.what_to_bring?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-500" />
                            Qué Llevar
                          </h3>
                          <div className="grid grid-cols-1 gap-2">
                            {service.what_to_bring.map((item: string, index: number) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-blue-50/50 rounded-lg">
                                <Shield className="h-4 w-4 text-blue-500" />
                                <span className="text-gray-700">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {service.not_included_services?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-500" />
                            No Incluido
                          </h3>
                          <div className="grid grid-cols-1 gap-2">
                            {service.not_included_services.map((item: string, index: number) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-red-50/50 rounded-lg">
                                <XCircle className="h-4 w-4 text-red-500" />
                                <span className="text-gray-700">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Políticas */}
              {(service.cancellation_policy || service.meeting_point_details) && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader 
                    className="cursor-pointer hover:bg-gray-50/50 transition-colors"
                    onClick={() => toggleSection('policies')}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <Globe className="h-6 w-6 text-[#0061A8]" />
                        Políticas y Condiciones
                      </CardTitle>
                      {expandedSections.policies ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </CardHeader>
                  
                  {expandedSections.policies && (
                    <CardContent className="space-y-4">
                      {service.cancellation_policy && (
                        <div className="p-4 bg-blue-50/50 rounded-lg">
                          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-blue-500" />
                            Política de Cancelación
                          </h3>
                          <p className="text-gray-700">{service.cancellation_policy}</p>
                        </div>
                      )}

                      {service.meeting_point_details && (
                        <div className="p-4 bg-green-50/50 rounded-lg">
                          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-green-500" />
                            Punto de Encuentro
                          </h3>
                          <p className="text-gray-700">{service.meeting_point_details}</p>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1" data-booking-sidebar>
              <Card className="sticky top-24 shadow-xl border-0 bg-white/90 backdrop-blur-sm border-2 border-green-200">
                {/* Indicador de reserva */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                  📅 Reserva Aquí
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Euro className="h-5 w-5" />
                    Precio y Reserva
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Precio y Disponibilidad - Consolidado */}
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-r from-[#0061A8]/10 to-[#1E40AF]/10 rounded-lg">
                      <div className="text-4xl font-bold text-[#0061A8] mb-2">
                        {formatPrice(service.price, service.price_type || "per_person")}
                      </div>
                      {service.price_type === "per_person" && (
                        <p className="text-sm text-gray-600">por persona</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                      <span className="text-gray-600">Disponibilidad</span>
                      <Badge variant={service.available ? "default" : "destructive"} className="bg-gradient-to-r from-green-400 to-emerald-500">
                        {service.available ? "Disponible" : "No disponible"}
                      </Badge>
                    </div>
                    
                    {service.available && (
                      <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                        <span className="text-gray-600">Total para {guests} persona{guests > 1 ? 's' : ''}</span>
                        <span className="font-semibold text-lg">{formatPrice(calculateTotal(), "total")}</span>
                      </div>
                    )}
                  </div>

                  {/* Botón de reserva */}
                  {!user ? (
                    <div className="space-y-3">
                      <div className="bg-orange-50/80 backdrop-blur-sm border border-orange-200 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Shield className="h-4 w-4 text-orange-500" />
                          <span className="font-medium text-orange-700 text-sm">Acceso requerido</span>
                        </div>
                        <p className="text-orange-600 text-xs mb-3">
                          Inicia sesión o regístrate para reservar
                        </p>
                        <div className="flex flex-col gap-2">
                          <Button 
                            onClick={() => router.push("/auth/login")}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm"
                          >
                            Iniciar Sesión
                          </Button>
                          <Button 
                            onClick={() => router.push("/auth/register")}
                            variant="outline"
                            className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 font-medium text-sm"
                          >
                            Registrarse
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : service.available ? (
                    <div className="space-y-4">
                      <Button 
                        onClick={() => setShowBookingForm(!showBookingForm)}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 font-bold text-lg py-6"
                        size="lg"
                      >
                        <Calendar className="h-5 w-5 mr-2" />
                        {showBookingForm ? "Ocultar Formulario" : "¡Reservar Ahora!"}
                      </Button>

                      {showBookingForm && (
                        <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-lg border border-[#0061A8]/20">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Número de personas
                            </label>
                            <select
                              value={guests}
                              onChange={(e) => setGuests(Number(e.target.value))}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0061A8] focus:border-transparent transition-all"
                            >
                              {[...Array(10)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {i + 1} persona{i + 1 > 1 ? 's' : ''}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Fecha de reserva
                            </label>
                            <input
                              type="date"
                              onChange={(e) => setSelectedDate(new Date(e.target.value))}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0061A8] focus:border-transparent transition-all"
                            />
                          </div>

                          <Button 
                            onClick={handleBooking}
                            disabled={isSubmitting || !selectedDate}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            {isSubmitting ? "Procesando..." : "Confirmar Reserva"}
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-gray-50/50 rounded-lg">
                      <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Servicio no disponible</p>
                    </div>
                  )}

                  {/* Contacto - Datos Reales */}
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-[#0061A8]" />
                      ¿Necesitas ayuda?
                    </h4>
                    <div className="text-sm space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-3 w-3 text-[#0061A8]" />
                        <span>+34 617 30 39 29</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-3 w-3 text-[#0061A8]" />
                        <span>Tenerifeparadisetoursandexcursions@hotmail.com</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-3 w-3 text-[#0061A8]" />
                        <span>Santa Cruz de Tenerife, Islas Canarias</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-3 w-3 text-[#0061A8]" />
                        <span>Lun - Dom: 8:00 - 20:00</span>
                      </div>
                      <div className="mt-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-xs text-orange-700 font-medium">
                          🚨 Atención 24/7 para emergencias
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción - Solo en sidebar */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleFavorite}
                      size="sm"
                      className={`flex-1 border-2 transition-all duration-300 ${isFavorite ? 'border-red-500 text-red-500 hover:bg-red-50' : 'border-[#0061A8] text-[#0061A8] hover:bg-[#0061A8]/5'}`}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${isFavorite ? 'fill-current' : ''}`} />
                      {isFavorite ? 'Favorito' : 'Favorito'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleShare}
                      size="sm"
                      className="flex-1 border-2 border-[#0061A8] text-[#0061A8] hover:bg-[#0061A8]/5 transition-all duration-300"
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Compartir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Botón flotante de reserva para móviles */}
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        {!user ? (
          <Button 
            onClick={() => router.push("/auth/login")}
            className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-full w-14 h-14 p-0"
          >
            <Shield className="h-5 w-5" />
          </Button>
        ) : (
          <Button 
            onClick={scrollToBooking}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 rounded-full w-16 h-16 p-0 animate-pulse"
          >
            <Calendar className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Footer independiente */}
      <footer className="relative z-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Información de contacto */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#F4C762]" />
                  <span>+34 617 30 39 29</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#F4C762]" />
                  <span>Tenerifeparadisetoursandexcursions@hotmail.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#F4C762]" />
                  <span>Santa Cruz de Tenerife, Islas Canarias</span>
                </div>
              </div>
            </div>

            {/* Horario */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Horario</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#F4C762]" />
                  <span>Lun - Dom: 8:00 - 20:00</span>
                </div>
                <p className="text-[#F4C762] font-medium">Atención 24/7 para emergencias</p>
              </div>
            </div>

            {/* Enlaces rápidos */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
              <div className="space-y-2 text-sm">
                <Link href="/" className="block text-gray-300 hover:text-[#F4C762] transition-colors">
                  Inicio
                </Link>
                <Link href="/services" className="block text-gray-300 hover:text-[#F4C762] transition-colors">
                  Todos los Servicios
                </Link>
                <Link href="/contact" className="block text-gray-300 hover:text-[#F4C762] transition-colors">
                  Contacto
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-6 text-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Tenerife Paradise Tours & Excursions. 
              Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Modal de Galería de Imágenes */}
      {showImageModal && service.images && service.images.length > 0 && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
            {/* Header del modal */}
            <div className="flex justify-between items-center text-white mb-4">
              <h3 className="text-xl font-semibold">{service.title}</h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Imagen principal */}
            <div className="relative flex-1 rounded-lg overflow-hidden">
              <Image
                src={normalizeImageUrl(service.images[currentImageIndex])}
                alt={`${service.title} - Imagen ${currentImageIndex + 1}`}
                fill
                className="object-contain"
              />
              
              {/* Navegación */}
              {service.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev => 
                      prev === 0 ? service.images.length - 1 : prev - 1
                    )}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                  >
                    <ChevronDown className="h-6 w-6 rotate-90" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => 
                      prev === service.images.length - 1 ? 0 : prev + 1
                    )}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                  >
                    <ChevronUp className="h-6 w-6 -rotate-90" />
                  </button>
                </>
              )}
            </div>

            {/* Indicador de imagen */}
            {service.images.length > 1 && (
              <div className="text-center text-white mt-4">
                <p className="text-lg font-medium">
                  {currentImageIndex + 1} de {service.images.length}
                </p>
              </div>
            )}

            {/* Miniaturas en el modal */}
            {service.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {service.images.map((image: string, index: number) => (
                  <div
                    key={index}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer flex-shrink-0 transition-all duration-300 ${
                      index === currentImageIndex 
                        ? 'ring-2 ring-[#F4C762] ring-offset-2' 
                        : 'hover:opacity-80'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <Image
                      src={normalizeImageUrl(image)}
                      alt={`${service.title} - Miniatura ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 