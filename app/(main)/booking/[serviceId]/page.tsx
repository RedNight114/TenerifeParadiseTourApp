"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useUnifiedData } from "@/hooks/use-unified-data"
import { OptimizedServiceGallery } from "@/components/optimized-service-gallery"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  CalendarIcon, Clock, Users, MapPin, CreditCard, Shield, AlertTriangle, 
  ArrowLeft, CheckCircle, Info, Star, Euro, Phone, Mail, User, 
  Loader2, AlertCircle, Check, X, LogOut, Settings, Calendar as CalendarIcon2, MonitorSmartphone, LogIn, ChevronLeft, ChevronRight
} from "lucide-react"
import { format, addDays, isBefore, startOfDay } from "date-fns"
import { es } from "date-fns/locale"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Importación dinámica de sonner para evitar problemas de SSR
let toast: any = null
if (typeof window !== 'undefined') {
  import('sonner').then(({ toast: toastImport }) => {
    toast = toastImport
  })
}

// Función helper para manejar toasts de manera segura
const showToast = (type: 'success' | 'error' | 'info', message: string, options?: any) => {
  if (typeof window !== 'undefined' && toast) {
    toast[type](message, options)
  } else {
    // Fallback para SSR - solo log en consola
    console.log(`[${type.toUpperCase()}]: ${message}`)
  }
}
import ServiceGallery from "@/components/service-gallery"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getSupabaseClient } from "@/lib/supabase-unified"
import { useServices } from "@/hooks/use-unified-cache"
import type { Service, Profile } from "@/lib/supabase"

export default function BookingPage() {
  const { serviceId } = useParams()
  const { user, isLoading: authLoading, logout } = useAuth()
  const { data: services, isLoading: servicesLoading, refetch: refreshServices } = useServices()
  const router = useRouter()

  const [service, setService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    reservation_date: "",
    reservation_time: "",
    guests: 1,
    special_requests: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
  })
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [invalidPriceAlert, setInvalidPriceAlert] = useState(false)
  // Estado para manejo de pagos (a implementar con nueva librería)
  const [formProgress, setFormProgress] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [priceType, setPriceType] = useState<'per_person' | 'total' | 'age_ranges'>('per_person')

  // Validar acceso del usuario
  useEffect(() => {
    if (!authLoading && !user) {
      showToast('error', "Necesitas iniciar sesión para hacer una reserva")
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  // Cargar servicios
  useEffect(() => {
    if (services && services.length === 0) {
      refreshServices()
    }
  }, [services, refreshServices])

  // Cargar perfil cuando el usuario esté disponible
  useEffect(() => {
    if (user?.id) {
      loadProfile()
    }
  }, [user?.id])

  const loadProfile = async () => {
    if (!user?.id) return

    try {
      const client = await getSupabaseClient()
      if (!client) {
        return
      }
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

      if (error) {
        return
      }

      if (data) {
        setUserProfile(data)
      }
    } catch (error) {
      }
  }

  const handleSignOut = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      showToast('error', "Error al cerrar sesión")
    }
  }

  const getUserInitials = (rawName?: unknown) => {
    const name = typeof rawName === "string" && rawName.trim().length > 0 ? rawName : "Usuario"

    return name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getUserAvatar = () => {
    return userProfile?.avatar_url || "/placeholder.svg"
  }

  const getUserName = () => {
    const rawName = userProfile?.full_name ?? user?.email ?? ""
    return typeof rawName === "string" && rawName.trim().length > 0 ? rawName : "Usuario"
  }

  // Configurar servicio y datos del usuario
  useEffect(() => {
    if (services && services.length > 0 && serviceId) {
      const foundService = services.find((s) => s.id === serviceId)     
      setService(foundService || null)

      if (foundService && user) {
        setFormData((prev) => ({
          ...prev,
          contact_name: userProfile?.full_name || user.user_metadata?.full_name || "",
          contact_email: user.email || "",
        }))
      }

      // Verificar precio del servicio
      if (foundService && (!foundService.price || foundService.price <= 0)) {
        setInvalidPriceAlert(true)
        showToast('error', "Este servicio no tiene un precio válido configurado")
      } else {
        setInvalidPriceAlert(false)
      }

      // Detectar automáticamente el tipo de precio basado en el servicio
      if (foundService) {
        // Usar el tipo de precio del servicio desde la base de datos
        if (foundService.price_type) {
          setPriceType(foundService.price_type)
        } else {
          // Fallback: asumir precio por persona si no está especificado
          setPriceType('per_person')
        }
      }
    }
  }, [services, serviceId, user, userProfile])

  // Calcular progreso del formulario
  useEffect(() => {
    const requiredFields = ['contact_name', 'contact_email', 'contact_phone', 'reservation_date']
    const completedFields = requiredFields.filter(field => 
      formData[field as keyof typeof formData] && 
      formData[field as keyof typeof formData].toString().trim() !== ''
    ).length
    setFormProgress((completedFields / requiredFields.length) * 100)
  }, [formData])

  // Mostrar información sobre el tipo de precio cuando se detecte
  useEffect(() => {
    if (service && priceType) {
      const priceInfo = priceType === 'per_person' 
        ? `Este servicio tiene precio por persona (€${service.price} por persona)`
        : `Este servicio tiene precio total fijo (€${service.price} total)`
      
      // Solo mostrar el toast si el usuario está viendo la página por primera vez
      if (service.id && !localStorage.getItem(`price_info_${service.id}`)) {
        showToast('info', priceInfo, {
          duration: 4000,
          description: priceType === 'per_person' 
            ? "El precio se calculará multiplicando por el número de personas"
            : "El precio es fijo independientemente del número de personas"
        })
        localStorage.setItem(`price_info_${service.id}`, 'shown')
      }
    }
  }, [service, priceType])

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      setFormData((prev) => ({
        ...prev,
        reservation_date: format(date, "yyyy-MM-dd"),
      }))
      // Limpiar error de fecha
      if (errors.reservation_date) {
        setErrors((prev: Record<string, string>) => ({ ...prev, reservation_date: "" }))
      }
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Limpiar error cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validar fecha
    if (!formData.reservation_date) {
      newErrors.reservation_date = "La fecha es obligatoria"
    } else if (selectedDate && isBefore(startOfDay(selectedDate), startOfDay(new Date()))) {
      newErrors.reservation_date = "La fecha no puede ser anterior a hoy"
    }

    // Validar nombre
    if (!formData.contact_name.trim()) {
      newErrors.contact_name = "El nombre es obligatorio"
    } else if (formData.contact_name.trim().length < 2) {
      newErrors.contact_name = "El nombre debe tener al menos 2 caracteres"
    }

    // Validar email
    if (!formData.contact_email.trim()) {
      newErrors.contact_email = "El email es obligatorio"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = "Email inválido"
    }

    // Validar teléfono
    if (!formData.contact_phone.trim()) {
      newErrors.contact_phone = "El teléfono es obligatorio"
    } else if (!/^[\+]?[0-9\s\-\(\)]{9,}$/.test(formData.contact_phone.replace(/\s/g, ''))) {
      newErrors.contact_phone = "Teléfono inválido"
    }

    // Validar huéspedes según el tipo de precio
    if (priceType === 'per_person') {
      // Para precio por persona, validar número de huéspedes
    if (formData.guests < 1) {
      newErrors.guests = "Debe haber al menos 1 huésped"
      } else if (service?.max_group_size && formData.guests > service.max_group_size) {
        newErrors.guests = `Máximo ${service.max_group_size} huéspedes`
      } else if (service?.min_group_size && formData.guests < service.min_group_size) {
        newErrors.guests = `Mínimo ${service.min_group_size} huéspedes`
      }
    } else {
      // Para precio total, el número de huéspedes es informativo pero no afecta el precio
      if (formData.guests < 1) {
        newErrors.guests = "Debe haber al menos 1 huésped"
      } else if (service?.max_group_size && formData.guests > service.max_group_size) {
      newErrors.guests = `Máximo ${service.max_group_size} huéspedes`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculateTotal = () => {
    if (!service || !service.price || service.price <= 0) {
      return 0
    }
    
    // Si el precio es por persona, multiplicar por el número de huéspedes
    if (priceType === 'per_person') {
      return service.price * formData.guests
    }
    
    // Si el precio es total, devolver el precio directamente
    return service.price
  }

  const getPriceDisplay = () => {
    if (!service || !service.price || service.price <= 0) {
      return { amount: 0, label: "Precio no disponible" }
    }
    
    if (priceType === 'per_person') {
      return { 
        amount: service.price, 
        label: "por persona" 
      }
    }
    
    return { 
      amount: service.price, 
      label: "precio total del servicio" 
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      showToast('error', "Por favor, corrige los errores en el formulario")
      return
    }

    if (!service || !user) {
      showToast('error', "Error: Datos del servicio o usuario no disponibles")
      return
    }

    const total = calculateTotal()
    if (!total || total <= 0) {
      showToast('error', "Error: El precio del servicio no es válido")
      return
    }

    setIsSubmitting(true)
            // TODO: Limpiar estado de pagos cuando se implemente nueva librería

    try {
      const client = await getSupabaseClient()
      if (!client) {
        throw new Error("No se pudo obtener el cliente de Supabase")
      }
      const { data: { session } } = await client.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error("No hay sesión activa")
      }

      // Crear datos de reserva
      const reservationData = {
        user_id: user.id,
        service_id: service.id,
        reservation_date: formData.reservation_date,
        reservation_time: formData.reservation_time || "12:00",
        guests: formData.guests,
        total_amount: total,
        status: "pendiente",
        payment_status: "pendiente",
        special_requests: formData.special_requests || null,
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
      }

      toast.loading("Creando reserva...")

      // Enviar a la API
      const response = await fetch("/api/reservas/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(reservationData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Error al crear la reserva")
      }

      toast.dismiss()
      showToast('success', "¡Reserva creada exitosamente!")

      // TODO: Implementar redirección a pasarela de pago
      // Por ahora, mostrar mensaje de confirmación
      showToast('info', "Reserva creada. El pago se procesará próximamente.")

    } catch (error: unknown) {
      toast.dismiss()
      const errorMessage = error instanceof Error ? error.message : "Error al procesar la reserva"
      showToast('error', errorMessage)
      setErrors({ submit: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Estados de carga
  if (authLoading || servicesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#0061A8] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Cargando formulario de reserva...</p>
        </div>
      </div>
    )
  }

  // Usuario no autenticado
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-[#0061A8] mx-auto mb-4" />
            <CardTitle className="text-2xl text-[#0061A8]">Acceso Requerido</CardTitle>
            <CardDescription>Necesitas iniciar sesión para hacer una reserva</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/auth/login">
              <Button className="w-full bg-[#0061A8] hover:bg-[#0061A8]/90">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="outline" className="w-full">
                Volver a Servicios
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Servicio no encontrado
  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <X className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <CardTitle className="text-2xl text-red-600">Servicio No Encontrado</CardTitle>
            <CardDescription>El servicio que buscas no existe o no está disponible</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/services">
              <Button className="w-full bg-[#0061A8] hover:bg-[#0061A8]/90">
                Ver Todos los Servicios
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar específico para reservas */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link 
                href="/services" 
                className="flex items-center gap-3 text-[#0061A8] hover:text-[#0061A8]/80 transition-colors font-medium text-base"
              >
                <ArrowLeft className="h-5 w-5" />
                Volver a Servicios
            </Link>
              <div className="hidden md:flex items-center gap-6 text-gray-600 text-base">
                <Link href="/" className="hover:text-[#0061A8] transition-colors font-medium">Inicio</Link>
                <Link href="/services" className="hover:text-[#0061A8] transition-colors font-medium">Servicios</Link>
                <Link href="/about" className="hover:text-[#0061A8] transition-colors font-medium">Nosotros</Link>
                <Link href="/contact" className="hover:text-[#0061A8] transition-colors font-medium">Contacto</Link>
              </div>
          </div>

            <div className="flex items-center gap-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full p-1.5 transition-all duration-300 hover:scale-110 hover:bg-gray-100"
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-gray-200 shadow-md">
                        <AvatarImage
                          src={getUserAvatar()}
                          alt={getUserName()}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-r from-[#0061A8] to-[#F4C762] text-white text-sm font-bold">
                          {getUserInitials(getUserName())}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-3" align="end" forceMount>
                    <div className="flex items-center justify-start gap-4 p-4 rounded-lg bg-gray-50">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage
                          src={getUserAvatar()}
                          alt={getUserName()}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-r from-[#0061A8] to-[#F4C762] text-white text-base font-bold">
                          {getUserInitials(getUserName())}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1 leading-none min-w-0 flex-1">
                        <p className="font-semibold text-base text-gray-900 truncate">{getUserName()}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
                    </div>
                    <DropdownMenuSeparator className="my-3" />
                    <div className="space-y-2">
                      <DropdownMenuItem asChild className="rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <Link href="/profile" className="flex items-center w-full">
                          <User className="mr-4 h-5 w-5 text-gray-600" />
                          <span className="font-medium text-base">Mi Perfil</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <Link href="/reservations" className="flex items-center w-full">
                          <CalendarIcon2 className="mr-4 h-5 w-5 text-gray-600" />
                          <span className="font-medium text-base">Mis Reservas</span>
                        </Link>
                      </DropdownMenuItem>
                      {userProfile?.role === 'admin' && (
                        <DropdownMenuItem asChild className="rounded-lg p-4 hover:bg-purple-50 transition-colors">
                          <Link href="/admin/dashboard" className="flex items-center w-full text-purple-600">
                            <MonitorSmartphone className="mr-4 h-5 w-5" />
                            <span className="font-medium text-base">Panel Admin</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </div>
                    <DropdownMenuSeparator className="my-3" />
                    <DropdownMenuItem 
                      onClick={handleSignOut} 
                      className="rounded-lg p-4 hover:bg-red-50 transition-colors text-red-600"
                    >
                      <LogOut className="mr-4 h-5 w-5" />
                      <span className="font-medium text-base">Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  asChild
                  className="group transition-all duration-300 font-semibold px-5 py-3 text-base rounded-lg hover:scale-105 text-gray-700 hover:text-[#0061A8] hover:bg-gray-100"
                >
                  <Link href="/auth/login" className="flex items-center space-x-3">
                    <LogIn className="w-5 h-5" />
                    <span>Iniciar Sesión</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Escala aumentada */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Reservar Servicio
            </h1>
            <p className="text-gray-600 text-base md:text-lg mb-6">
              Completa los datos para proceder con tu reserva
            </p>
            
            {/* Progress Bar - Escala aumentada */}
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <span>Progreso del formulario</span>
                <span className="font-medium">{Math.round(formProgress)}%</span>
                      </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-[#0061A8] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${formProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Service Info & Gallery */}
          <div className="space-y-6">
            {/* Service Info Card - Escala aumentada */}
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <div className="flex items-start gap-6">
                {/* Image Gallery - Escala aumentada */}
                <div className="flex-1">
                  <OptimizedServiceGallery
                    images={service?.images || []}
                    serviceTitle={service?.title || 'Servicio'}
                    priority={true}
                    className="h-56 md:h-64"
                  />
                </div>

                {/* Service Info - Escala aumentada */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {service?.title}
                  </h2>
                  <p className="text-base text-gray-600 line-clamp-3 mb-4">
                    {service?.description}
                  </p>
                  
                  {/* Quick Info - Escala aumentada */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-base text-gray-600">
                      <MapPin className="h-4 w-4 text-[#0061A8] flex-shrink-0" />
                      <span className="break-words">{service?.location || "Ubicación no especificada"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-base text-gray-600">
                      <Clock className="h-4 w-4 text-[#0061A8] flex-shrink-0" />
                      <span>{service?.duration || "Duración no especificada"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-base text-gray-600">
                      <Users className="h-4 w-4 text-[#0061A8] flex-shrink-0" />
                      <span>Máx. {service?.max_group_size || "N/A"} personas</span>
                    </div>
                  </div>
                  
                  {/* Price - Escala aumentada */}
                  <div className="mt-4 text-center">
                    <div className="text-3xl font-bold text-[#0061A8]">
                      €{getPriceDisplay().amount || 0}
                    </div>
                    <div className="text-sm text-gray-500">{getPriceDisplay().label}</div>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        priceType === 'per_person' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {priceType === 'per_person' ? 'Precio por persona' : 'Precio total'}
                    </span>
                  </div>
            </div>

                  {/* Badges - Escala aumentada */}
                  <div className="flex gap-3 mt-4 justify-center">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-4 w-4 mr-1.5" />
                      Disponible
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <Shield className="h-4 w-4 mr-1.5" />
                      Pago Seguro
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="space-y-6">
            {/* Form Card - Escala aumentada */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-[#0061A8] to-[#0061A8]/90 text-white p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Datos de la Reserva</h2>
                    <p className="text-base text-white/90">Completa la información necesaria para tu reserva</p>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Contact Information - Escala aumentada */}
                    <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <User className="h-4 w-4 text-[#0061A8]" />
                    Información de Contacto
                  </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                            value={formData.contact_name}
                            onChange={(e) => handleInputChange("contact_name", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#0061A8] ${
                          errors.contact_name ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Tu nombre completo"
                      />
                      {errors.contact_name && (
                        <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.contact_name}
                        </p>
                      )}
                        </div>

                        <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                            type="tel"
                            value={formData.contact_phone}
                            onChange={(e) => handleInputChange("contact_phone", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#0061A8] ${
                          errors.contact_phone ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="+34 600 000 000"
                      />
                      {errors.contact_phone && (
                        <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.contact_phone}
                        </p>
                      )}
                        </div>
                      </div>

                      <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                          type="email"
                          value={formData.contact_email}
                          onChange={(e) => handleInputChange("contact_email", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#0061A8] ${
                        errors.contact_email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="tu@email.com"
                    />
                    {errors.contact_email && (
                      <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.contact_email}
                      </p>
                    )}
                      </div>
                    </div>

                {/* Reservation Details - Escala aumentada */}
                    <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-[#0061A8]" />
                    Detalles de la Reserva
                  </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de la Reserva *
                      </label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                            className={`w-full justify-start text-left font-normal text-base px-4 py-3 h-auto ${
                              errors.reservation_date ? "border-red-500" : ""
                            }`}
                          >
                            <CalendarIcon className="mr-3 h-4 w-4" />
                            {formData.reservation_date ? (
                              format(selectedDate!, "PPP", { locale: es })
                            ) : (
                              <span className="text-gray-500">Selecciona una fecha</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                            disabled={(date) => isBefore(date, startOfDay(new Date()))}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          {errors.reservation_date && (
                        <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.reservation_date}
                        </p>
                          )}
                        </div>

                        <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora Preferida
                      </label>
                      <select
                            value={formData.reservation_time}
                        onChange={(e) => handleInputChange("reservation_time", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#0061A8]"
                      >
                        <option value="">Selecciona una hora</option>
                        <option value="09:00">09:00</option>
                        <option value="10:00">10:00</option>
                        <option value="11:00">11:00</option>
                        <option value="12:00">12:00</option>
                        <option value="13:00">13:00</option>
                        <option value="14:00">14:00</option>
                        <option value="15:00">15:00</option>
                        <option value="16:00">16:00</option>
                        <option value="17:00">17:00</option>
                      </select>
                        </div>
                      </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Huéspedes {priceType === 'per_person' ? '*' : ''}
                        {priceType === 'total' && (
                          <span className="text-xs text-gray-500 ml-1">(informativo)</span>
                        )}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={service?.max_group_size || 10}
                        value={formData.guests}
                        onChange={(e) => handleInputChange("guests", parseInt(e.target.value))}
                        className={`w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#0061A8] ${
                          errors.guests ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder={priceType === 'per_person' ? "Número de personas" : "Número de participantes"}
                      />
                      {errors.guests && (
                        <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.guests}
                        </p>
                      )}
                      {priceType === 'total' && (
                        <p className="text-xs text-gray-500 mt-1">
                          El precio es fijo independientemente del número de personas
                        </p>
                      )}
                    </div>
                      </div>

                      <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Solicitudes Especiales
                    </label>
                    <textarea
                          value={formData.special_requests}
                          onChange={(e) => handleInputChange("special_requests", e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#0061A8] resize-none"
                      placeholder="Alergias, necesidades especiales, etc."
                        />
                      </div>
                    </div>

                {/* Price Summary - Escala aumentada */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Euro className="h-5 w-5 text-[#0061A8]" />
                      <span className="font-medium text-base">Total a pagar:</span>
                        </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#0061A8]">
                        €{calculateTotal().toFixed(2)}
                        </div>
                      <div className="text-sm text-gray-500">
                        {priceType === 'per_person' ? (
                          <>
                            {formData.guests} {formData.guests === 1 ? 'persona' : 'personas'} × €{service?.price || 0} por persona
                          </>
                        ) : (
                          <>
                            Precio total del servicio
                          </>
                        )}
                      </div>
                        </div>
                      </div>
                    </div>

                {/* Payment Info - Escala aumentada */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-base">
                      <p className="font-medium text-green-800">Pago Seguro</p>
                      <p className="text-green-700 text-sm">Tu información está protegida con encriptación SSL</p>
                        </div>
                      </div>
                    </div>

                {/* Submit Button - Escala aumentada */}
                    <Button
                      type="submit"
                  disabled={isSubmitting || invalidPriceAlert}
                  className="w-full h-12 text-base font-semibold bg-[#0061A8] hover:bg-[#0061A8]/90 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                      <CreditCard className="mr-3 h-5 w-5" />
                          Proceder al Pago
                        </>
                      )}
                    </Button>

                {/* Submit Error */}
                {errors.submit && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{errors.submit}</AlertDescription>
                  </Alert>
                )}
                  </form>
            </div>
          </div>
        </div>
      </div>

      {/* TODO: Implementar formulario de pago con nueva librería */}
    </div>
  )
}
