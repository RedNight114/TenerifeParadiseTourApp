"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/components/auth-provider-ultra-simple"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle, AlertCircle, Chrome, Facebook, RefreshCw, Shield, Sparkles, Gift, Award, Users, Clock } from "lucide-react"
import { toast } from "sonner"

export default function RegisterPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoError, setLogoError] = useState(false)

  const { signUp, signInWithProvider, isAuthenticated, loading, authError } = useAuth()
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
      toast.error("Por favor completa todos los campos")
      setIsSubmitting(false)
      return
    }

    if (!email.includes("@")) {
      toast.error("Por favor ingresa un email válido")
      setIsSubmitting(false)
      return
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      setIsSubmitting(false)
      return
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      setIsSubmitting(false)
      return
    }

    if (!acceptTerms) {
      toast.error("Debes aceptar los términos y condiciones")
      setIsSubmitting(false)
      return
    }

    try {
      const { data, error } = await signUp(email, password, fullName)

      if (error) {
        // Mensajes de error más amigables
        let errorMessage = "Error en el registro"
        const errorMsg = error instanceof Error ? error.message : String(error)
        
        if (errorMsg.includes("User already registered")) {
          errorMessage = "Este email ya está registrado. Por favor inicia sesión."
        } else if (errorMsg.includes("Password should be at least")) {
          errorMessage = "La contraseña debe tener al menos 6 caracteres."
        } else if (errorMsg.includes("Invalid email")) {
          errorMessage = "Por favor ingresa un email válido."
        } else if (errorMsg.includes("Too many requests")) {
          errorMessage = "Demasiados intentos. Por favor espera unos minutos antes de intentar de nuevo."
        } else {
          errorMessage = errorMsg
        }
        
        toast.error(errorMessage)
      } else {
        toast.success("¡Registro exitoso! Por favor verifica tu email para confirmar tu cuenta.")
        
        // Redirigir al login con mensaje de éxito
        setTimeout(() => {
          router.push("/auth/login?message=registration-success")
        }, 2000)
      }
    } catch (error) {
      console.error("Error en registro:", error)
      toast.error("Error inesperado. Por favor intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSocialRegister = async (provider: "google" | "facebook") => {
    try {
      console.log(`Registrándote con ${provider}...`)
      toast.info(`Registrándote con ${provider}...`)
      
      const { error } = await signInWithProvider(provider)
      
      if (error) {
        toast.error(`Error al registrarse con ${provider}: ${error}`)
      } else {
        toast.success(`Redirigiendo a ${provider}...`)
      }
    } catch (error) {
      console.error(`Error en registro con ${provider}:`, error)
      toast.error(`Error al registrarse con ${provider}`)
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0061A8] via-[#1E40AF] to-[#F4C762] flex items-center justify-center p-3 sm:p-4 md:p-6 relative overflow-hidden font-sans">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] opacity-5"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-12 left-12 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-12 right-12 w-28 h-28 bg-[#F4C762]/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full blur-lg animate-pulse delay-500"></div>
      <div className="absolute top-1/3 right-1/4 w-10 h-10 bg-[#F4C762]/15 rounded-full blur-md animate-pulse delay-1500"></div>

      <div className="w-full max-w-7xl relative z-10">
        {/* Sección de bienvenida - Siempre visible, encima del formulario en móviles/tablets */}
        <div className="xl:hidden text-white text-center mb-6 sm:mb-8 lg:mb-10 px-3 sm:px-4 md:px-6">
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            <div className="flex items-center justify-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 relative flex-shrink-0">
                {!logoError ? (
                  <Image
                    src="/images/logo-tenerife.png"
                    alt="Tenerife Paradise Tours & Excursions"
                    fill
                    className="object-contain drop-shadow-xl"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-[#F4C762] to-[#EAB308] rounded-lg flex items-center justify-center shadow-2xl relative">
                    <span className="text-white font-bold text-base sm:text-lg lg:text-xl">TP</span>
                    <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-[#0061A8] animate-pulse" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold leading-tight">Tenerife Paradise</h2>
                <p className="text-[#F4C762] font-medium text-sm sm:text-base lg:text-lg xl:text-xl">Tours & Excursions</p>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight">
                ¡Únete a la aventura!
              </h1>
              <p className="text-base sm:text-lg lg:text-xl xl:text-2xl leading-relaxed text-white/90 max-w-lg lg:max-w-xl mx-auto">
                Crea tu cuenta y descubre increíbles experiencias en Tenerife que te cambiarán la vida
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-10 items-center min-h-[400px] xl:min-h-[500px]">
          {/* Lado izquierdo - Información (solo en desktop) */}
          <div className="hidden xl:block text-white space-y-4 sm:space-y-6 lg:space-y-8 order-2 xl:order-1 px-3 sm:px-4 md:px-6">
            {/* Logo y título - Solo en desktop */}
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 relative flex-shrink-0">
                  {!logoError ? (
                    <Image
                      src="/images/logo-tenerife.png"
                      alt="Tenerife Paradise Tours & Excursions"
                      fill
                      className="object-contain drop-shadow-xl"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#F4C762] to-[#EAB308] rounded-lg flex items-center justify-center shadow-2xl relative">
                      <span className="text-white font-bold text-sm sm:text-base lg:text-lg">TP</span>
                      <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-[#0061A8] animate-pulse" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold leading-tight">Tenerife Paradise</h2>
                  <p className="text-[#F4C762] font-medium text-xs sm:text-sm lg:text-base xl:text-lg">Tours & Excursions</p>
                </div>
              </div>
              
              <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
                  ¡Únete a la aventura!
                </h1>
                <p className="text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed text-white/90 max-w-lg lg:max-w-xl">
                  Crea tu cuenta y descubre increíbles experiencias en Tenerife que te cambiarán la vida
                </p>
              </div>
            </div>

            {/* Beneficios destacados - Solo en desktop */}
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-[#F4C762]">Beneficios exclusivos</h3>
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="flex items-start space-x-3 sm:space-x-4 lg:space-x-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Gift className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#F4C762]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm sm:text-base lg:text-lg xl:text-xl mb-2">Ofertas Exclusivas</h4>
                    <p className="text-white/80 text-sm sm:text-base lg:text-lg leading-relaxed">Descuentos especiales solo para miembros</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 sm:space-x-4 lg:space-x-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#F4C762]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm sm:text-base lg:text-lg xl:text-xl mb-2">Experiencias Premium</h4>
                    <p className="text-white/80 text-sm sm:text-base lg:text-lg leading-relaxed">Acceso a tours y actividades exclusivas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 sm:space-x-4 lg:space-x-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#F4C762]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm sm:text-base lg:text-lg xl:text-xl mb-2">Comunidad Activa</h4>
                    <p className="text-white/80 text-sm sm:text-base lg:text-lg leading-relaxed">Conecta con otros viajeros</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 sm:space-x-4 lg:space-x-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#F4C762]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm sm:text-base lg:text-lg xl:text-xl mb-2">Soporte Prioritario</h4>
                    <p className="text-white/80 text-sm sm:text-base lg:text-lg leading-relaxed">Atención personalizada 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contacto - Solo en desktop */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#F4C762] flex-shrink-0" />
                <span className="font-semibold text-sm sm:text-base lg:text-lg">¿Tienes preguntas?</span>
              </div>
              <p className="text-white/80 text-sm sm:text-base lg:text-lg mb-3 sm:mb-4 leading-relaxed">
                Nuestro equipo está aquí para ayudarte con el proceso de registro
              </p>
              <a 
                href="tel:+34617303929" 
                className="text-[#F4C762] font-bold hover:underline transition-colors text-sm sm:text-base lg:text-lg"
              >
                +34 617 30 39 29
              </a>
            </div>
          </div>

          {/* Formulario - Centrado en móviles/tablets, lado derecho en desktop */}
          <div className="flex justify-center xl:order-2 px-3 sm:px-4 md:px-6">
            <Card className="w-full max-w-md sm:max-w-lg lg:max-w-xl xl:w-[1400px] shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-xl">
              <CardHeader className="text-center pb-3 sm:pb-4 pt-4 sm:pt-6 px-4 sm:px-6">
                <div className="mx-auto mb-3 sm:mb-4 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-[#F4C762] to-[#EAB308] rounded-lg flex items-center justify-center shadow-lg">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                <CardTitle className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">Crear Cuenta</CardTitle>
                <CardDescription className="text-gray-600 text-xs sm:text-sm lg:text-base leading-relaxed max-w-sm mx-auto">
                  Únete a Tenerife Paradise y descubre increíbles experiencias
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="fullName" className="text-sm sm:text-base lg:text-lg font-semibold text-gray-700">
                      Nombre Completo
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 group-focus-within:text-[#F4C762] transition-colors" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Tu nombre completo"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-12 h-10 sm:h-12 lg:h-14 border-2 focus:border-[#F4C762] focus:ring-2 focus:ring-[#F4C762]/20 transition-all duration-300 text-sm sm:text-base lg:text-lg rounded-lg bg-white/50 backdrop-blur-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="email" className="text-sm sm:text-base lg:text-lg font-semibold text-gray-700">
                      Correo Electrónico
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 group-focus-within:text-[#F4C762] transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-10 sm:h-12 lg:h-14 border-2 focus:border-[#F4C762] focus:ring-2 focus:ring-[#F4C762]/20 transition-all duration-300 text-sm sm:text-base lg:text-lg rounded-lg bg-white/50 backdrop-blur-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="password" className="text-sm sm:text-base lg:text-lg font-semibold text-gray-700">
                      Contraseña
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 group-focus-within:text-[#F4C762] transition-colors" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 pr-12 h-10 sm:h-12 lg:h-14 border-2 focus:border-[#F4C762] focus:ring-2 focus:ring-[#F4C762]/20 transition-all duration-300 text-sm sm:text-base lg:text-lg rounded-lg bg-white/50 backdrop-blur-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="confirmPassword" className="text-sm sm:text-base lg:text-lg font-semibold text-gray-700">
                      Confirmar Contraseña
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 group-focus-within:text-[#F4C762] transition-colors" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-12 pr-12 h-10 sm:h-12 lg:h-14 border-2 focus:border-[#F4C762] focus:ring-2 focus:ring-[#F4C762]/20 transition-all duration-300 text-sm sm:text-base lg:text-lg rounded-lg bg-white/50 backdrop-blur-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                      className="border-2 data-[state=checked]:bg-[#F4C762] data-[state=checked]:border-[#F4C762] w-4 h-4 sm:w-5 sm:h-5 mt-1"
                      required
                    />
                    <Label htmlFor="terms" className="text-sm sm:text-base lg:text-lg text-gray-600 cursor-pointer leading-relaxed">
                      Acepto los{" "}
                      <Link href="/terms" className="text-[#0061A8] hover:text-[#0061A8]/80 underline font-semibold">
                        términos y condiciones
                      </Link>{" "}
                      y la{" "}
                      <Link href="/privacy" className="text-[#0061A8] hover:text-[#0061A8]/80 underline font-semibold">
                        política de privacidad
                      </Link>
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10 sm:h-12 lg:h-14 bg-gradient-to-r from-[#F4C762] to-[#EAB308] hover:from-[#EAB308] hover:to-[#CA8A04] text-white font-bold text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none rounded-lg group"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-3 animate-spin" />
                        Creando cuenta...
                      </>
                    ) : (
                      <>
                        Crear Cuenta
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-3 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-sm sm:text-base lg:text-lg uppercase">
                    <span className="bg-white px-4 sm:px-6 text-gray-500 font-semibold">O regístrate con</span>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <Button
                    variant="outline"
                    onClick={() => handleSocialRegister("google")}
                    className="w-full h-10 sm:h-12 lg:h-14 border-2 hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02] bg-transparent rounded-lg font-medium group"
                  >
                    <Chrome className="mr-3 h-4 w-4 sm:h-5 sm:w-5 text-blue-500 group-hover:scale-110 transition-transform" />
                    Continuar con Google
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialRegister("facebook")}
                    className="w-full h-10 sm:h-12 lg:h-14 border-2 hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02] bg-transparent rounded-lg font-medium group"
                  >
                    <Facebook className="mr-3 h-4 w-4 sm:h-5 sm:w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                    Continuar con Facebook
                  </Button>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 sm:space-y-6 pb-6 sm:pb-8 px-4 sm:px-6">
                <div className="text-center">
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                    ¿Ya tienes una cuenta?{" "}
                    <Link
                      href="/auth/login"
                      className="text-[#0061A8] hover:text-[#0061A8]/80 font-bold transition-colors hover:underline"
                    >
                      Inicia sesión aquí
                    </Link>
                  </p>
                </div>
                <div className="text-center">
                  <Link
                    href="/"
                    className="text-sm sm:text-base lg:text-lg text-gray-500 hover:text-[#0061A8] transition-colors font-medium"
                  >
                    ← Volver al Inicio
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Sección de beneficios y contacto para móviles y tablets */}
        <div className="xl:hidden mt-8 sm:mt-12 lg:mt-16 px-3 sm:px-4 md:px-6">
          <div className="text-white space-y-6 sm:space-y-8 lg:space-y-10">
            {/* Beneficios destacados */}
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#F4C762] text-center">Beneficios exclusivos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 rounded-lg flex items-center justify-center">
                    <Gift className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-[#F4C762]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base sm:text-lg lg:text-xl mb-2">Ofertas Exclusivas</h4>
                    <p className="text-white/80 text-sm sm:text-base lg:text-lg leading-relaxed">Descuentos especiales solo para miembros</p>
                  </div>
                </div>
                <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-[#F4C762]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base sm:text-lg lg:text-xl mb-2">Experiencias Premium</h4>
                    <p className="text-white/80 text-sm sm:text-base lg:text-lg leading-relaxed">Acceso a tours y actividades exclusivas</p>
                  </div>
                </div>
                <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-[#F4C762]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base sm:text-lg lg:text-xl mb-2">Comunidad Activa</h4>
                    <p className="text-white/80 text-sm sm:text-base lg:text-lg leading-relaxed">Conecta con otros viajeros</p>
                  </div>
                </div>
                <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-[#F4C762]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base sm:text-lg lg:text-xl mb-2">Soporte Prioritario</h4>
                    <p className="text-white/80 text-sm sm:text-base lg:text-lg leading-relaxed">Atención personalizada 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 lg:p-8 border border-white/20 text-center">
              <div className="flex items-center justify-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[#F4C762] flex-shrink-0" />
                <span className="font-semibold text-base sm:text-lg lg:text-xl">¿Tienes preguntas?</span>
              </div>
              <p className="text-white/80 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 leading-relaxed max-w-md mx-auto">
                Nuestro equipo está aquí para ayudarte con el proceso de registro
              </p>
              <a 
                href="tel:+34617303929" 
                className="text-[#F4C762] font-bold hover:underline transition-colors text-base sm:text-lg lg:text-xl"
              >
                +34 617 30 39 29
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
