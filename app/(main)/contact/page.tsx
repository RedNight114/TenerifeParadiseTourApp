"use client"

import type React from "react"

import { useState } from "react"
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    date: "",
    guests: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Validación en tiempo real
    const newErrors = { ...errors }
    
    if (field === 'name') {
      if (value.trim().length < 2) {
        newErrors.name = 'El nombre debe tener al menos 2 caracteres'
      } else {
        delete newErrors.name
      }
    }
    
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        newErrors.email = 'Por favor, introduce un email válido'
      } else {
        delete newErrors.email
      }
    }
    
    if (field === 'message') {
      if (value.trim().length < 10) {
        newErrors.message = 'El mensaje debe tener al menos 10 caracteres'
      } else {
        delete newErrors.message
      }
    }
    
    setErrors(newErrors)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    // Validación adicional
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitStatus("error")
      setIsSubmitting(false)
      return
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus("error")
      setIsSubmitting(false)
      return
    }

    try {
      // Envío real del formulario
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          service: formData.service,
          date: formData.date,
          guests: formData.guests,
          message: formData.message.trim(),
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      })

      if (response.ok) {
        setSubmitStatus("success")
        setFormData({
          name: "",
          email: "",
          phone: "",
          service: "",
          date: "",
          guests: "",
          message: "",
        })
        
        // Limpiar el estado de éxito después de 5 segundos
        setTimeout(() => {
          setSubmitStatus("idle")
        }, 5000)
      } else {
        throw new Error('Error en el servidor')
      }
    } catch (error) {
setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: Phone,
      title: "Teléfono",
      content: "+34 617 30 39 29",
      description: "Disponible 24/7 para emergencias",
      action: "tel:+34617303929",
      actionText: "Llamar Ahora",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      content: "+34 617 30 39 29",
      description: "Respuesta inmediata",
      action: "https://wa.me/34617303929",
      actionText: "Enviar Mensaje",
    },
    {
      icon: Mail,
      title: "Email",
      content: "Tenerifeparadisetoursandexcursions@hotmail.com",
      description: "Respuesta en 24 horas",
      action: "mailto:Tenerifeparadisetoursandexcursions@hotmail.com",
      actionText: "Enviar Email",
    },
    {
      icon: MapPin,
      title: "Ubicación",
      content: "Santa Cruz de Tenerife",
      description: "Canarias, España",
      action: "#",
      actionText: "Ver Mapa",
    },
  ]

  const faqs = [
    {
      question: "¿Con cuánta antelación debo reservar?",
      answer:
        "Recomendamos reservar con al menos 48 horas de antelación, especialmente en temporada alta. Para servicios especiales o grupos grandes, es mejor contactar con más tiempo.",
    },
    {
      question: "¿Qué incluyen los precios?",
      answer:
        "Nuestros precios incluyen guía profesional, transporte (cuando aplique), y todos los elementos mencionados en cada servicio. Los extras como comidas o entradas a parques se especifican claramente.",
    },
    {
      question: "¿Qué pasa si llueve?",
      answer:
        "Tenerife tiene un clima privilegiado, pero si las condiciones meteorológicas no permiten la actividad, ofrecemos alternativas o reprogramación sin coste adicional.",
    },
    {
      question: "¿Hacen servicios personalizados?",
      answer:
        "¡Por supuesto! Nos especializamos en crear experiencias únicas adaptadas a tus intereses, tiempo disponible y presupuesto. Contáctanos para diseñar tu aventura perfecta.",
    },
  ]

  const businessHours = [
    { day: "Lunes - Viernes", hours: "8:00 - 20:00" },
    { day: "Sábados", hours: "9:00 - 18:00" },
    { day: "Domingos", hours: "10:00 - 16:00" },
    { day: "Emergencias", hours: "24/7" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/hero-contact.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0061A8]/85 via-[#0061A8]/70 to-[#F4C762]/50" />
        <div className="relative container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">Contáctanos</h1>
            <p className="text-xl md:text-2xl text-white/95 leading-relaxed drop-shadow-md">
              Estamos aquí para ayudarte a planificar tu aventura perfecta en Tenerife. ¡Hablemos!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">Múltiples Formas de Contactarnos</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Elige la forma que más te convenga. Estamos disponibles cuando nos necesites.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon
              return (
                <Card
                  key={index}
                  className="text-center p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-[#F4C762]/20"
                >
                  <CardContent className="p-0">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#0061A8] to-[#F4C762] rounded-full flex items-center justify-center mx-auto mb-6">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{info.title}</h3>
                    <p className="text-gray-700 font-medium mb-2 break-all">{info.content}</p>
                    <p className="text-sm text-gray-500 mb-4">{info.description}</p>
                    <Button asChild className="w-full bg-[#0061A8] hover:bg-[#0061A8]/90 text-white">
                      <a href={info.action} target={info.action.startsWith("http") ? "_blank" : undefined}>
                        {info.actionText}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="shadow-xl border-2 border-[#F4C762]/20">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center text-gradient">
                    Solicita Información o Reserva
                  </CardTitle>
                  <p className="text-center text-gray-600">
                    Completa el formulario y te contactaremos en menos de 2 horas
                  </p>
                </CardHeader>
                <CardContent>
                  {submitStatus === "success" && (
                    <Alert className="mb-6 border-green-200 bg-green-50">
                      <Star className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        ¡Mensaje enviado con éxito! Te contactaremos pronto.
                      </AlertDescription>
                    </Alert>
                  )}

                  {submitStatus === "error" && (
                    <Alert className="mb-6 border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">
                        Error al enviar el mensaje. Por favor, verifica que todos los campos requeridos estén completos y que el email sea válido. Si el problema persiste, contáctanos directamente por teléfono o WhatsApp.
                      </AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre Completo *
                        </label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Tu nombre"
                          required
                          className={`focus:border-[#F4C762] focus:ring-[#F4C762] ${
                            errors.name ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="tu@email.com"
                          required
                          className={`focus:border-[#F4C762] focus:ring-[#F4C762] ${
                            errors.email ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Teléfono
                        </label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="+34 600 000 000"
                          className="focus:border-[#F4C762] focus:ring-[#F4C762]"
                        />
                      </div>
                      <div>
                        <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                          Servicio de Interés
                        </label>
                        <Select value={formData.service} onValueChange={(value) => handleInputChange("service", value)}>
                          <SelectTrigger className="focus:border-[#F4C762] focus:ring-[#F4C762]">
                            <SelectValue placeholder="Selecciona un servicio" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="actividades">Actividades & Aventuras</SelectItem>
                            <SelectItem value="renting">Alquiler de Vehículos</SelectItem>
                            <SelectItem value="gastronomia">Experiencias Gastronómicas</SelectItem>
                            <SelectItem value="personalizado">Experiencia Personalizada</SelectItem>
                            <SelectItem value="consulta">Consulta General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha Preferida
                        </label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => handleInputChange("date", e.target.value)}
                          className="focus:border-[#F4C762] focus:ring-[#F4C762]"
                        />
                      </div>
                      <div>
                        <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
                          Número de Personas
                        </label>
                        <Select value={formData.guests} onValueChange={(value) => handleInputChange("guests", value)}>
                          <SelectTrigger className="focus:border-[#F4C762] focus:ring-[#F4C762]">
                            <SelectValue placeholder="¿Cuántos sois?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 persona</SelectItem>
                            <SelectItem value="2">2 personas</SelectItem>
                            <SelectItem value="3-4">3-4 personas</SelectItem>
                            <SelectItem value="5-8">5-8 personas</SelectItem>
                            <SelectItem value="9+">Más de 9 personas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Mensaje *
                      </label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        placeholder="Cuéntanos qué tipo de experiencia buscas, tus intereses, o cualquier pregunta que tengas..."
                        rows={4}
                        required
                        className={`focus:border-[#F4C762] focus:ring-[#F4C762] ${
                          errors.message ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.message && (
                        <p className="text-red-500 text-xs mt-1">{errors.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting || Object.keys(errors).length > 0 || !formData.name.trim() || !formData.email.trim() || !formData.message.trim()}
                      className="w-full bg-gradient-to-r from-[#0061A8] to-[#F4C762] hover:from-[#0061A8]/90 hover:to-[#F4C762]/90 text-white font-semibold py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Enviando...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="h-5 w-5" />
                          Enviar Mensaje
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Business Info */}
            <div className="space-y-8">
              {/* Business Hours */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Clock className="h-6 w-6 text-[#0061A8]" />
                    Horarios de Atención
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {businessHours.map((schedule, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <span className="font-medium text-gray-700">{schedule.day}</span>
                        <Badge
                          variant={schedule.day === "Emergencias" ? "default" : "secondary"}
                          className={schedule.day === "Emergencias" ? "bg-[#0061A8]" : ""}
                        >
                          {schedule.hours}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Preguntas Frecuentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Contact */}
              <Card className="shadow-lg bg-gradient-to-r from-[#0061A8] to-[#F4C762] text-white">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">¿Necesitas Ayuda Inmediata?</h3>
                  <p className="mb-6 opacity-90">
                    Para consultas urgentes o reservas de último momento, contáctanos directamente:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild className="bg-white text-[#0061A8] hover:bg-white/90 font-semibold">
                      <a href="tel:+34617303929">📞 Llamar Ahora</a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="border-2 border-white text-white hover:bg-white hover:text-[#0061A8] bg-transparent"
                    >
                      <a href="https://wa.me/34617303929" target="_blank" rel="noreferrer">
                        💬 WhatsApp
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">Nuestra Ubicación</h2>
            <p className="text-xl text-gray-600">Nos encontramos en el corazón de Santa Cruz de Tenerife</p>
          </div>

          <div className="bg-gray-200 rounded-2xl h-96 flex items-center justify-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0061A8]/10 to-[#F4C762]/10"></div>
            <div className="relative z-10 text-center text-gray-600">
              <MapPin className="h-16 w-16 mx-auto mb-4 text-[#0061A8]" />
              <p className="text-lg font-medium mb-2">Nuestra Ubicación</p>
              <p className="text-sm mb-4">Santa Cruz de Tenerife, Canarias, España</p>
              <div className="space-y-3">
                <Button 
                  asChild
                  className="bg-[#0061A8] hover:bg-[#0061A8]/90 text-white"
                >
                  <a 
                    href="https://maps.google.com/?q=Santa+Cruz+de+Tenerife,+Canarias,+España" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    📍 Ver en Google Maps
                  </a>
                </Button>
                <div className="text-xs text-gray-500">
                  <p>📍 Santa Cruz de Tenerife</p>
                  <p>🏝️ Islas Canarias, España</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

