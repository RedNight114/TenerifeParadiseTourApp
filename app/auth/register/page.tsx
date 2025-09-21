"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"
import { AuthPageWrapper } from "@/components/auth/auth-page-wrapper"
import { LegalModal } from "@/components/legal-modals"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle, AlertCircle, Chrome, Facebook, RefreshCw, Shield, Sparkles, Star, MapPin, Clock, Phone, Send, ExternalLink } from "lucide-react"
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

function RegisterPageContent() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: 'privacy' | 'terms' | 'cookies' | null }>({
    isOpen: false,
    type: null
  })

  const { user, register: signUp, loginWithProvider: signInWithProvider, resendVerificationEmail, isLoading: loading, error: authError } = useAuth()
  const isAuthenticated = !!user
  const router = useRouter()
  const searchParams = useSearchParams()

  // Redirección si ya está autenticado
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const redirectTo = searchParams.get("redirect") || "/dashboard"
      router.replace(redirectTo)
    }
  }, [isAuthenticated, loading, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

setIsSubmitting(true)

    // Validaciones del cliente
    if (!fullName || !email || !password || !confirmPassword) {
showToast('error', "Campos incompletos", {
        description: "Por favor completa todos los campos requeridos.",
        duration: 4000,
        icon: "⚠️"
      })
      setIsSubmitting(false)
      return
    }

    if (!email.includes("@")) {
showToast('error', "Email inválido", {
        description: "Por favor ingresa un formato de email válido.",
        duration: 4000,
        icon: "📧"
      })
      setIsSubmitting(false)
      return
    }

    if (password.length < 6) {
showToast('error', "Contraseña muy corta", {
        description: "La contraseña debe tener al menos 6 caracteres.",
        duration: 4000,
        icon: "🔒"
      })
      setIsSubmitting(false)
      return
    }

    if (password !== confirmPassword) {
showToast('error', "Contraseñas no coinciden", {
        description: "Asegúrate de que ambas contraseñas sean iguales.",
        duration: 4000,
        icon: "🔐"
      })
      setIsSubmitting(false)
      return
    }

    if (!acceptTerms) {
showToast('error', "Términos no aceptados", {
        description: "Debes aceptar los términos y condiciones para continuar.",
        duration: 4000,
        icon: "📋"
      })
      setIsSubmitting(false)
      return
    }
try {
const result = await signUp(email, password, fullName)
if (result.error) {
// Mensajes de error más amigables
        let errorMessage = "Error en el registro"
        const errorMsg = result.error || "Error desconocido"
if (errorMsg.includes("User already registered")) {
          errorMessage = "Este email ya está registrado. Por favor inicia sesión."
        } else if (errorMsg.includes("Password should be at least")) {
          errorMessage = "La contraseña debe tener al menos 6 caracteres."
        } else if (errorMsg.includes("Invalid email")) {
          errorMessage = "Por favor ingresa un email válido."
        } else if (errorMsg.includes("Too many requests")) {
          errorMessage = "Demasiados intentos. Por favor espera unos minutos antes de intentar de nuevo."
        } else if (errorMsg.includes("Unable to validate email address")) {
          errorMessage = "El formato del email no es válido."
        } else if (errorMsg.includes("Signup disabled")) {
          errorMessage = "El registro está temporalmente deshabilitado. Por favor intenta más tarde."
        } else {
          errorMessage = errorMsg
        }
showToast('error', "Error en el registro", {
          description: errorMessage,
          duration: 5000,
          icon: "❌"
        })
      } else {
// Registro exitoso - mostrar pantalla de verificación
        setRegistrationSuccess(true)
        setRegisteredEmail(email)
        showToast('success', "¡Cuenta creada exitosamente!", {
          description: "Hemos enviado un email de confirmación. Por favor revisa tu bandeja de entrada y confirma tu cuenta para poder iniciar sesión.",
          duration: 8000,
          icon: "📧"
        })
      }
    } catch (error) {
const errorMessage = error instanceof Error ? error.message : "Error inesperado"
      showToast('error', "Error inesperado", {
        description: `${errorMessage}. Por favor intenta de nuevo.`,
        duration: 5000,
        icon: "💥"
      })
    } finally {
setIsSubmitting(false)
    }
  }

  const handleSocialRegister = async (provider: "google" | "github") => {
    try {
showToast('info', `Conectando con ${provider}...`, {
        description: `Preparando la autenticación con ${provider}.`,
        duration: 3000,
        icon: "🔗"
      })
      
      if (signInWithProvider) {
        try {
          await signInWithProvider(provider)
          showToast('success', `Redirigiendo...`, {
            description: `Conectando con ${provider} para completar el registro.`,
            duration: 3000,
            icon: "🔄"
          })
        } catch (error) {
          showToast('error', `Error con ${provider}`, {
            description: `No se pudo conectar con ${provider}. Intenta de nuevo.`,
            duration: 5000,
            icon: "❌"
          })
        }
      } else {
        showToast('error', "Servicio no disponible", {
          description: "No se puede iniciar sesión con proveedor en este momento.",
          duration: 5000,
          icon: "⚠️"
        })
      }
    } catch (error) {
showToast('error', `Error con ${provider}`, {
        description: `Error al registrarse con ${provider}. Intenta de nuevo.`,
        duration: 5000,
        icon: "💥"
      })
    }
  }

  const handleResendVerification = async () => {
    try {
      showToast('info', "Enviando email de verificación...", {
        description: "Preparando el envío del email de confirmación.",
        duration: 3000,
        icon: "📤"
      })
      if (resendVerificationEmail) {
        const { error } = await resendVerificationEmail()
        if (!error) {
          showToast('success', "Email enviado", {
            description: "El email de verificación ha sido enviado. Revisa tu bandeja de entrada.",
            duration: 5000,
            icon: "✅"
          })
        } else {
          showToast('error', "Error al enviar email", {
            description: error || "No se pudo enviar el email de verificación.",
            duration: 5000,
            icon: "❌"
          })
        }
      } else {
        showToast('error', "Servicio no disponible", {
          description: "No se puede reenviar el email de verificación en este momento.",
          duration: 5000,
          icon: "⚠️"
        })
      }
    } catch (error) {
      showToast('error', "Error inesperado", {
        description: "Error al enviar el email de verificación. Intenta de nuevo.",
        duration: 5000,
        icon: "💥"
      })
    }
  }

  const openGmail = () => {
    window.open("https://mail.google.com", "_blank")
  }

  const openLegalModal = (type: 'privacy' | 'terms' | 'cookies') => {
    setLegalModal({ isOpen: true, type })
  }

  const closeLegalModal = () => {
    setLegalModal({ isOpen: false, type: null })
  }

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0061A8] via-[#1E40AF] to-[#F4C762] flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-3"></div>
          <h2 className="text-base font-bold mb-2">Verificando sesión</h2>
          <p className="text-xs opacity-90">Por favor, espera un momento...</p>
        </div>
      </div>
    )
  }

  // Si ya está autenticado, mostrar loading de redirección
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0061A8] via-[#1E40AF] to-[#F4C762] flex items-center justify-center p-4">
        <div className="text-center text-white">
          <CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-300" />
          <h2 className="text-base font-bold mb-2">¡Ya estás registrado!</h2>
          <p className="text-xs opacity-90">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  // Mostrar error de conexión
  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0061A8] via-[#1E40AF] to-[#F4C762] flex items-center justify-center p-4">
        <div className="text-center max-w-xs mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl p-4 border border-white/20">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900 mb-3">Error de Conexión</h2>
            <Alert className="mb-3 bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">
                {authError || 'Error de conexión con el servidor. Por favor, verifica tu conexión a internet.'}
              </AlertDescription>
            </Alert>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-[#0061A8] to-[#1E40AF] hover:from-[#004A87] hover:to-[#1E3A8A] text-white font-semibold py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <RefreshCw className="w-3 h-3 mr-2" />
                Reintentar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push("/")}
                className="w-full border-2 border-[#F4C762] text-[#F4C762] hover:bg-[#F4C762] hover:text-white font-semibold py-2 rounded-lg transition-all duration-300"
              >
                Volver al Inicio
              </Button>
            </div>
                  </div>
      </div>
    </div>
  )
}

  // Pantalla de verificación de email
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0061A8] via-[#1E40AF] to-[#F4C762] flex items-center justify-center p-3 sm:p-4 md:p-6 relative overflow-hidden font-sans">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] opacity-5"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-12 left-12 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-12 right-12 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/8 rounded-full blur-xl animate-pulse delay-500"></div>
        
        <div className="relative z-10 w-full max-w-md">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                ¡Registro Exitoso!
              </CardTitle>
              <CardDescription className="text-gray-600">
                Hemos enviado un email de verificación a tu cuenta
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Email de verificación enviado a:</p>
                <p className="font-semibold text-gray-900">{registeredEmail}</p>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Mail className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Pasos para completar tu registro:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                    <li>Revisa tu bandeja de entrada de Gmail</li>
                    <li>Busca el email de "TenerifeParadiseTour&Excursions"</li>
                    <li>Haz clic en el enlace de verificación</li>
                    <li>Regresa aquí e inicia sesión</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Button 
                  onClick={openGmail}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir Gmail
                </Button>
                
                <Button 
                  onClick={handleResendVerification}
                  variant="outline"
                  className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-lg transition-all duration-300"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Reenviar Email
                </Button>
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600 mb-3">
                  ¿Ya verificaste tu email?
                </p>
                <Button 
                  onClick={() => router.push("/auth/login")}
                  className="w-full bg-gradient-to-r from-[#0061A8] to-[#1E40AF] hover:from-[#004A87] hover:to-[#1E3A8A] text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Ir al Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0061A8] via-[#1E40AF] to-[#F4C762] flex items-center justify-center p-3 sm:p-4 md:p-6 relative overflow-hidden font-sans">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] opacity-5"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-12 left-12 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-12 right-12 w-28 h-28 bg-[#F4C762]/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full blur-lg animate-pulse delay-500"></div>
      <div className="absolute top-1/3 right-1/4 w-10 h-10 bg-[#F4C762]/15 rounded-full blur-md animate-pulse delay-1500"></div>

      <div className="w-full max-w-6xl relative z-10">
        {/* Sección de bienvenida - Siempre visible, encima del formulario en móviles/tablets */}
        <div className="lg:hidden text-white text-center mb-6 sm:mb-8 px-3 sm:px-4">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 relative flex-shrink-0">
                {!logoError ? (
                  <Image
                    src="/images/logo-tenerife.png"
                    alt="TenerifeParadiseTour&Excursions"
                    fill
                    className="object-contain drop-shadow-xl"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-[#0061A8] to-[#F4C762] rounded-lg flex items-center justify-center shadow-2xl relative">
                    <span className="text-white font-bold text-base sm:text-lg">TP</span>
                    <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-[#F4C762] animate-pulse" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 text-center">
                <h2 className="text-base sm:text-lg font-bold leading-tight">Tenerife Paradise</h2>
                <p className="text-[#F4C762] font-medium text-sm sm:text-base">Tours & Excursions</p>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-tight">
                ¡Únete a la aventura!
              </h1>
              <p className="text-base sm:text-lg leading-relaxed text-white/90 max-w-lg mx-auto">
                Crea tu cuenta y descubre increíbles experiencias en Tenerife que te cambiarán la vida
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-12 items-center">
          {/* Lado izquierdo - Información (solo en desktop) */}
          <div className="hidden lg:block text-white space-y-6 lg:space-y-8 order-2 lg:order-1 px-3 sm:px-4">
            {/* Logo y título - Solo en desktop */}
            <div className="space-y-6 lg:space-y-8">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 relative flex-shrink-0">
                  {!logoError ? (
                    <Image
                      src="/images/logo-tenerife.png"
                      alt="TenerifeParadiseTour&Excursions"
                      fill
                      className="object-contain drop-shadow-xl"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#0061A8] to-[#F4C762] rounded-lg flex items-center justify-center shadow-2xl relative">
                      <span className="text-white font-bold text-sm sm:text-base lg:text-lg">TP</span>
                      <Sparkles className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 text-[#F4C762] animate-pulse" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold leading-tight">Tenerife Paradise</h2>
                  <p className="text-[#F4C762] font-medium text-base sm:text-lg lg:text-xl">Tours & Excursions</p>
                </div>
              </div>
              
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                  ¡Únete a la aventura!
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-white/90 max-w-lg lg:max-w-xl">
                  Crea tu cuenta y descubre increíbles experiencias en Tenerife que te cambiarán la vida
                </p>
              </div>
            </div>

            {/* Características destacadas */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#F4C762]">
                Beneficios exclusivos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-start space-x-3">
                  <Star className="w-5 h-5 text-[#F4C762] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base">Ofertas Exclusivas</h4>
                    <p className="text-white/80 text-xs sm:text-sm">Descuentos especiales solo para miembros</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-[#F4C762] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base">Experiencias Premium</h4>
                    <p className="text-white/80 text-xs sm:text-sm">Acceso a tours y actividades exclusivas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-[#F4C762] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base">Comunidad Activa</h4>
                    <p className="text-white/80 text-xs sm:text-sm">Conecta con otros viajeros</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-[#F4C762] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base">Soporte Prioritario</h4>
                    <p className="text-white/80 text-xs sm:text-sm">Atención personalizada 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-[#F4C762]" />
                <span className="text-sm sm:text-base">+34 617 30 39 29</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-[#F4C762]" />
                <span className="text-sm sm:text-base break-all">Tenerifeparadisetoursandexcursions@hotmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-[#F4C762]" />
                <span className="text-sm sm:text-base">Santa Cruz de Tenerife, Islas Canarias</span>
              </div>
            </div>
          </div>

          {/* Lado derecho - Formulario de registro */}
          <div className="order-1 lg:order-2">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Crear Cuenta
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Únete a Tenerife Paradise y descubre increíbles experiencias
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                      Nombre Completo
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Tu nombre completo"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 bg-white/80 border-gray-300 focus:border-[#0061A8] focus:ring-[#0061A8]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-white/80 border-gray-300 focus:border-[#0061A8] focus:ring-[#0061A8]"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 bg-white/80 border-gray-300 focus:border-[#0061A8] focus:ring-[#0061A8]"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirmar Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10 bg-white/80 border-gray-300 focus:border-[#0061A8] focus:ring-[#0061A8]"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                      className="mt-1"
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                      Acepto los{" "}
                      <button
                        type="button"
                        onClick={() => openLegalModal('terms')}
                        className="text-[#0061A8] hover:text-[#0061A8]/80 underline font-semibold"
                      >
                        términos y condiciones
                      </button>{" "}
                      y la{" "}
                      <button
                        type="button"
                        onClick={() => openLegalModal('privacy')}
                        className="text-[#0061A8] hover:text-[#0061A8]/80 underline font-semibold"
                      >
                        política de privacidad
                      </button>
                    </Label>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#0061A8] to-[#1E40AF] hover:from-[#004A87] hover:to-[#1E3A8A] text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando cuenta...
                      </>
                    ) : (
                      <>
                        Crear Cuenta
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/95 px-2 text-gray-500">O regístrate con (Próximamente)</span>
                  </div>
                </div>
                
                <div className="text-center text-sm text-gray-500 py-2">
                  Los registros sociales estarán disponibles próximamente
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-3">
                <div className="text-center text-sm text-gray-600">
                  ¿Ya tienes una cuenta?{" "}
                  <Link
                    href="/auth/login"
                    className="text-[#0061A8] hover:text-[#004A87] font-medium"
                  >
                    Inicia sesión aquí
                  </Link>
                </div>
                <div className="text-center text-xs text-gray-500">
                  Al continuar, aceptas nuestros{" "}
                  <button
                    onClick={() => openLegalModal('terms')}
                    className="text-[#0061A8] hover:underline"
                  >
                    Términos de Servicio
                  </button>{" "}
                  y{" "}
                  <button
                    onClick={() => openLegalModal('privacy')}
                    className="text-[#0061A8] hover:underline"
                  >
                    Política de Privacidad
                  </button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Legal Modals */}
      {legalModal.isOpen && legalModal.type && (
        <LegalModal 
          isOpen={legalModal.isOpen}
          type={legalModal.type}
          onClose={closeLegalModal}
        />
      )}
    </div>
  )
}

export default function RegisterPage() {
  return (
    <AuthPageWrapper>
      <RegisterPageContent />
    </AuthPageWrapper>
  )
}

