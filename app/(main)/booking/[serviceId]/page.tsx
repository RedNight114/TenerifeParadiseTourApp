"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useServices } from "@/hooks/use-services"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, Clock, Users, MapPin, CreditCard, Shield, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ServiceGallery } from "@/components/service-gallery"



export default function BookingPage() {
  const { serviceId } = useParams()
  const { user, profile, loading: authLoading } = useAuth()
  const { services, loading: servicesLoading, fetchServices } = useServices()
  const router = useRouter()

  const [service, setService] = useState<any>(null)
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
  const [errors, setErrors] = useState<any>({})
  const [invalidPriceAlert, setInvalidPriceAlert] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    console.log("🔄 useEffect - Verificando servicios:", {
      servicesLength: services.length,
      serviceId: serviceId,
      authLoading: authLoading,
      user: !!user
    })
    
    if (services.length === 0) {
      console.log("📡 Llamando fetchServices...")
      fetchServices()
    }
  }, [services, fetchServices, serviceId, authLoading, user])

  useEffect(() => {
    if (services.length > 0 && serviceId) {
      const foundService = services.find((s) => s.id === serviceId)
      setService(foundService)

      if (foundService && user) {
        setFormData((prev) => ({
          ...prev,
          contact_name: profile?.full_name || user.user_metadata?.full_name || "",
          contact_email: user.email || "",
        }))
      }

      // Verificar si el precio del servicio es inválido
      if (foundService && (!foundService.price || foundService.price <= 0)) {
        setInvalidPriceAlert(true)
        console.error("⚠️ Servicio con precio inválido detectado:", {
          serviceId: foundService.id,
          title: foundService.title,
          price: foundService.price
        })
      } else {
        setInvalidPriceAlert(false)
      }

      // Debug: Mostrar información del servicio
      if (foundService) {
        console.log("🔍 SERVICIO SELECCIONADO:", {
          id: foundService.id,
          title: foundService.title,
          price: foundService.price,
          priceType: typeof foundService.price,
          max_group_size: foundService.max_group_size
        })
      }
    }
  }, [services, serviceId, user, profile])



  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      setFormData((prev) => ({
        ...prev,
        reservation_date: format(date, "yyyy-MM-dd"),
      }))
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.reservation_date) {
      newErrors.reservation_date = "La fecha es obligatoria"
    }

    if (!formData.contact_name.trim()) {
      newErrors.contact_name = "El nombre es obligatorio"
    }

    if (!formData.contact_email.trim()) {
      newErrors.contact_email = "El email es obligatorio"
    } else if (!/\S+@\S+\.\S+/.test(formData.contact_email)) {
      newErrors.contact_email = "Email inválido"
    }

    if (!formData.contact_phone.trim()) {
      newErrors.contact_phone = "El teléfono es obligatorio"
    }

    if (formData.guests < 1) {
      newErrors.guests = "Debe haber al menos 1 huésped"
    }

    if (service?.max_group_size && formData.guests > service.max_group_size) {
      newErrors.guests = `Máximo ${service.max_group_size} huéspedes`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculateTotal = () => {
    if (!service) {
      console.error("❌ No hay servicio seleccionado")
      return 0
    }
    
    console.log("🔍 CALCULANDO TOTAL - Datos del servicio:", {
      serviceId: service.id,
      serviceTitle: service.title,
      price: service.price,
      priceType: typeof service.price,
      guests: formData.guests
    })
    
    // Validar que el precio del servicio sea válido
    if (!service.price || service.price <= 0) {
      console.error("❌ Precio del servicio inválido:", {
        serviceId: service.id,
        serviceTitle: service.title,
        price: service.price,
        priceType: typeof service.price
      })
      return 0
    }
    
    const total = service.price * formData.guests
    console.log("✅ Cálculo de total exitoso:", {
      servicePrice: service.price,
      guests: formData.guests,
      total: total,
      calculation: `${service.price} * ${formData.guests} = ${total}`
    })
    
    return total
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Iniciando proceso de reserva...")

    if (!validateForm() || !service || !user) {
      console.log("Validación fallida o datos faltantes")
      return
    }

    // Validar que el total sea válido antes de proceder
    const total = calculateTotal()
    if (!total || total <= 0) {
      console.error("❌ Total inválido para la reserva:", {
        serviceId: service.id,
        serviceTitle: service.title,
        servicePrice: service.price,
        guests: formData.guests,
        calculatedTotal: total
      })
      alert("Error: El precio del servicio no es válido. Por favor, contacta con soporte.")
      return
    }

    setIsSubmitting(true)
    console.log("Estado de envío establecido a true")

    try {
      // Obtener el token de sesión y verificar que esté activa
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error("No hay sesión activa")
      }

      console.log("🔐 Sesión verificada:", {
        userId: session.user?.id,
        hasToken: !!session.access_token,
        tokenLength: session.access_token?.length || 0
      })

      // Crear la reserva en estado "pendiente"
      const reservationData = {
        user_id: user.id,
        service_id: service.id,
        reservation_date: formData.reservation_date,
        reservation_time: formData.reservation_time || "12:00", // Valor por defecto si no se selecciona
        guests: formData.guests,
        total_amount: total,
        status: "pendiente",
        payment_status: "pendiente",
        special_requests: formData.special_requests || null,
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
      }

      console.log("Información del servicio:", {
        id: service.id,
        title: service.title,
        price: service.price,
        guests: formData.guests,
        calculatedTotal: total
      })
      console.log("📤 Enviando datos de reserva a la API...")
      console.log("Datos de reserva a enviar:", JSON.stringify(reservationData, null, 2))

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(reservationData),
      })

      console.log("📥 Respuesta de reserva recibida, status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error en respuesta de reserva:", errorData)
        throw new Error(errorData.error || "Error al crear la reserva")
      }

      const reservation = await response.json()
      console.log("✅ Reserva creada exitosamente:", reservation.id)

      // Verificar sesión después de crear reserva
      const sessionAfterReservation = await supabase.auth.getSession()
      if (!sessionAfterReservation.data.session?.access_token) {
        throw new Error("Sesión perdida después de crear reserva")
      }
      console.log("🔐 Sesión verificada después de reserva")

      // Redirigir a la pasarela de pago de Redsys
      console.log("💳 Iniciando proceso de pago...")
      const paymentResponse = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          reservationId: reservation.id,
          amount: total,
          description: `Reserva: ${service.title}`,
        }),
      })

      console.log("📥 Respuesta de pago recibida, status:", paymentResponse.status)

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json().catch(() => ({}))
        console.error("❌ Error en respuesta de pago:", errorData)
        throw new Error(errorData.error || "Error al crear el pago")
      }

      console.log("✅ Respuesta de pago exitosa, procesando datos...")

      const paymentData = await paymentResponse.json()
      
      console.log("✅ Datos de pago recibidos:", paymentData)
      console.log("🔍 Verificando estructura de datos...")

      // Verificar que paymentData tenga la estructura correcta
      if (!paymentData.redsysUrl) {
        throw new Error("URL de Redsys no encontrada en la respuesta")
      }

      if (!paymentData.formData) {
        throw new Error("Datos del formulario no encontrados en la respuesta")
      }

      console.log("✅ Estructura de datos válida")

      // Crear formulario para enviar a Redsys
      const form = document.createElement("form")
      form.method = "POST"
      form.action = paymentData.redsysUrl

      console.log("🌐 URL de Redsys:", paymentData.redsysUrl)

      // Validar que todos los campos requeridos estén presentes
      const requiredFields = ['Ds_SignatureVersion', 'Ds_MerchantParameters', 'Ds_Signature']
      const missingFields = requiredFields.filter(field => !paymentData.formData[field])
      
      if (missingFields.length > 0) {
        console.error("❌ Campos faltantes:", missingFields)
        throw new Error(`Campos de pago faltantes: ${missingFields.join(', ')}`)
      }

      console.log("✅ Todos los campos requeridos están presentes")

      // Agregar campos al formulario
      Object.entries(paymentData.formData).forEach(([key, value]) => {
        const input = document.createElement("input")
        input.type = "hidden"
        input.name = key
        input.value = value as string
        form.appendChild(input)
        console.log(`📝 Campo ${key}:`, value)
      })

      // Agregar campo adicional para debugging
      const debugInput = document.createElement("input")
      debugInput.type = "hidden"
      debugInput.name = "debug_info"
      debugInput.value = JSON.stringify({
        orderNumber: paymentData.orderNumber,
        amount: paymentData.amount,
        reservationId: paymentData.reservationId,
        timestamp: new Date().toISOString()
      })
      form.appendChild(debugInput)

      console.log("📋 Formulario creado con", form.elements.length, "campos")
      console.log("🔗 Agregando formulario al DOM...")
      
      // Verificación final de sesión antes del envío
      const finalSessionCheck = await supabase.auth.getSession()
      if (!finalSessionCheck.data.session?.access_token) {
        throw new Error("Sesión perdida antes del envío del formulario")
      }
      console.log("🔐 Sesión verificada antes del envío")
      
      document.body.appendChild(form)
      
      console.log("🚀 Enviando formulario a Redsys...")
      console.log("📍 URL destino:", form.action)
      console.log("📊 Método:", form.method)
      
      // Intentar enviar el formulario
      try {
        form.submit()
        console.log("✅ Formulario enviado exitosamente")
      } catch (submitError) {
        console.error("❌ Error al enviar formulario:", submitError)
        console.log("🔄 Intentando redirección alternativa...")
        
        // Redirección alternativa usando window.location
        const formData = new URLSearchParams()
        Object.entries(paymentData.formData).forEach(([key, value]) => {
          formData.append(key, value as string)
        })
        
        console.log("🌐 Redirigiendo a:", paymentData.redsysUrl)
        window.location.href = `${paymentData.redsysUrl}?${formData.toString()}`
      }
    } catch (error) {
      console.error("Error en el proceso de reserva:", error)
      alert(`Error al procesar la reserva: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || servicesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0061A8] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-[#0061A8]">Acceso Requerido</CardTitle>
            <CardDescription>Necesitas iniciar sesión para hacer una reserva</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/auth/login">
              <Button className="w-full bg-[#0061A8] hover:bg-[#0061A8]/90">Iniciar Sesión</Button>
            </Link>
            <Link href="/services">
              <Button variant="outline" className="w-full bg-transparent">
                Volver a Servicios
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/services" className="text-[#0061A8] hover:underline mb-4 inline-block">
              ← Volver a Servicios
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reservar Servicio</h1>
            <p className="text-gray-600">Completa los datos para proceder con tu reserva</p>
          </div>

          {/* Alerta de precio inválido */}
          {invalidPriceAlert && (
            <div className="mb-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Precio del servicio no disponible</AlertTitle>
                <AlertDescription>
                  Este servicio no tiene un precio válido configurado. Por favor, contacta con soporte para más información.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Service Info */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader className="p-0">
                  <ServiceGallery 
                    images={service.images || []} 
                    serviceTitle={service.title}
                    className="rounded-t-lg"
                  />
                </CardHeader>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>

                  <div className="space-y-3 text-sm">
                    {service.duration && (
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {Math.floor(service.duration / 60)}h {service.duration % 60}min
                        </span>
                      </div>
                    )}

                    {service.location && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{service.location}</span>
                      </div>
                    )}

                    {service.min_group_size && (
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span>
                          {service.min_group_size === service.max_group_size
                            ? `${service.min_group_size} personas`
                            : `${service.min_group_size}-${service.max_group_size || "∞"} personas`}
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Precio por persona:</span>
                    <span className="text-2xl font-bold text-[#0061A8]">
                      {new Intl.NumberFormat("es-ES", {
                        style: "currency",
                        currency: "EUR",
                      }).format(service.price)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Datos de la Reserva
                  </CardTitle>
                  <CardDescription>Completa la información necesaria para tu reserva</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Información de Contacto</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contact_name">Nombre Completo *</Label>
                          <Input
                            id="contact_name"
                            value={formData.contact_name}
                            onChange={(e) => handleInputChange("contact_name", e.target.value)}
                            className={errors.contact_name ? "border-red-500" : ""}
                          />
                          {errors.contact_name && <p className="text-red-500 text-sm mt-1">{errors.contact_name}</p>}
                        </div>

                        <div>
                          <Label htmlFor="contact_phone">Teléfono *</Label>
                          <Input
                            id="contact_phone"
                            type="tel"
                            value={formData.contact_phone}
                            onChange={(e) => handleInputChange("contact_phone", e.target.value)}
                            className={errors.contact_phone ? "border-red-500" : ""}
                          />
                          {errors.contact_phone && <p className="text-red-500 text-sm mt-1">{errors.contact_phone}</p>}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="contact_email">Email *</Label>
                        <Input
                          id="contact_email"
                          type="email"
                          value={formData.contact_email}
                          onChange={(e) => handleInputChange("contact_email", e.target.value)}
                          className={errors.contact_email ? "border-red-500" : ""}
                        />
                        {errors.contact_email && <p className="text-red-500 text-sm mt-1">{errors.contact_email}</p>}
                      </div>
                    </div>

                    <Separator />

                    {/* Reservation Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Detalles de la Reserva</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Fecha de la Reserva *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={`w-full justify-start text-left font-normal ${
                                  !selectedDate ? "text-muted-foreground" : ""
                                } ${errors.reservation_date ? "border-red-500" : ""}`}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? (
                                  format(selectedDate, "PPP", { locale: es })
                                ) : (
                                  <span>Selecciona una fecha</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          {errors.reservation_date && (
                            <p className="text-red-500 text-sm mt-1">{errors.reservation_date}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="reservation_time">Hora Preferida</Label>
                          <Select
                            value={formData.reservation_time}
                            onValueChange={(value) => handleInputChange("reservation_time", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una hora" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="09:00">09:00</SelectItem>
                              <SelectItem value="10:00">10:00</SelectItem>
                              <SelectItem value="11:00">11:00</SelectItem>
                              <SelectItem value="12:00">12:00</SelectItem>
                              <SelectItem value="13:00">13:00</SelectItem>
                              <SelectItem value="14:00">14:00</SelectItem>
                              <SelectItem value="15:00">15:00</SelectItem>
                              <SelectItem value="16:00">16:00</SelectItem>
                              <SelectItem value="17:00">17:00</SelectItem>
                              <SelectItem value="18:00">18:00</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="guests">Número de Huéspedes *</Label>
                        <Select
                          value={formData.guests.toString()}
                          onValueChange={(value) => handleInputChange("guests", Number.parseInt(value))}
                        >
                          <SelectTrigger className={errors.guests ? "border-red-500" : ""}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: service.max_group_size || 10 }, (_, i) => i + 1).map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? "persona" : "personas"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.guests && <p className="text-red-500 text-sm mt-1">{errors.guests}</p>}
                      </div>

                      <div>
                        <Label htmlFor="special_requests">Solicitudes Especiales</Label>
                        <Textarea
                          id="special_requests"
                          placeholder="¿Tienes alguna solicitud especial? (opcional)"
                          value={formData.special_requests}
                          onChange={(e) => handleInputChange("special_requests", e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Price Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">Resumen del Precio</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Precio por persona:</span>
                          <span>
                            {new Intl.NumberFormat("es-ES", {
                              style: "currency",
                              currency: "EUR",
                            }).format(service.price)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Número de huéspedes:</span>
                          <span>{formData.guests}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-semibold">
                          <span>Total:</span>
                          <span className="text-[#0061A8]">
                            {new Intl.NumberFormat("es-ES", {
                              style: "currency",
                              currency: "EUR",
                            }).format(calculateTotal())}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-900">Proceso de Pago Seguro</h4>
                          <p className="text-blue-800 text-sm mt-1">
                            Tu pago se procesará de forma segura a través de Redsys. El cargo se realizará únicamente
                            cuando confirmemos la disponibilidad de tu reserva.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full bg-[#0061A8] hover:bg-[#0061A8]/90 h-12 text-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5 mr-2" />
                          Proceder al Pago
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
