"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth-final"
import { useAuthRedirect } from "@/components/auth-redirect-handler"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle, AlertCircle, Chrome, Facebook, RefreshCw, Shield, Sparkles, Star, MapPin, Clock, Phone } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoError, setLogoError] = useState(false)

  const { signIn, signInWithProvider, authError, user, profile, loading } = useAuth()
  const { handleSuccessfulLogin, handleLoginError } = useAuthRedirect()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Redirección si ya está autenticado (solo para usuarios normales)
  useEffect(() => {
    if (user && profile && profile.role === 'user' && !loading) {
      const redirectTo = searchParams.get("redirect") || "/profile"
      console.log('🔄 Usuario ya autenticado, redirigiendo a:', redirectTo)
      router.replace(redirectTo)
    }
  }, [user, profile, loading, router, searchParams])

  // Mensaje de éxito si viene del registro
  useEffect(() => {
    const message = searchParams.get("message")
    if (message === "registration-success") {
      toast.success("¡Registro exitoso! Ahora puedes iniciar sesión.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validaciones del cliente
    if (!email || !password) {
      toast.error("Por favor completa todos los campos")
      setIsSubmitting(false)
      return
    }

    if (!email.includes("@")) {
      toast.error("Por favor ingresa un email válido")
      setIsSubmitting(false)
      return
    }

    try {
      const { error } = await signIn(email, password)

      if (error) {
        handleLoginError(error)
      } else {
        toast.success("¡Inicio de sesión exitoso! Redirigiendo...")
        handleSuccessfulLogin(false) // false = no es admin
      }
    } catch (error) {
      console.error("Error en login:", error)
      handleLoginError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    try {
      console.log(`Iniciando login con ${provider}...`)
      toast.info(`Iniciando sesión con ${provider}...`)
      
      const { error } = await signInWithProvider(provider)
      
      if (error) {
        toast.error(`Error al iniciar sesión con ${provider}: ${error}`)
      } else {
        toast.success(`Redirigiendo a ${provider}...`)
      }
    } catch (error) {
      console.error(`Error en login con ${provider}:`, error)
      toast.error(`Error al iniciar sesión con ${provider}`)
    }
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

      <div className="w-full max-w-4xl relative z-10">
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
                  <div className="w-full h-full bg-gradient-to-r from-[#0061A8] to-[#F4C762] rounded-lg flex items-center justify-center shadow-2xl relative">
                    <span className="text-white font-bold text-base sm:text-lg lg:text-xl">TP</span>
                    <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-[#F4C762] animate-pulse" />
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
                ¡Bienvenido de vuelta!
              </h1>
              <p className="text-base sm:text-lg lg:text-xl xl:text-2xl leading-relaxed text-white/90 max-w-lg lg:max-w-xl mx-auto">
                Inicia sesión para continuar tu aventura en Tenerife y descubrir experiencias únicas
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
                  ¡Bienvenido de vuelta!
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-white/90 max-w-lg lg:max-w-xl">
                  Inicia sesión para continuar tu aventura en Tenerife y descubrir experiencias únicas
                </p>
              </div>
            </div>

            {/* Características destacadas */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#F4C762]">
                ¿Por qué elegirnos?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-start space-x-3">
                  <Star className="w-5 h-5 text-[#F4C762] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base">Experiencias Únicas</h4>
                    <p className="text-white/80 text-xs sm:text-sm">Descubre Tenerife como nunca antes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-[#F4C762] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base">Seguridad Garantizada</h4>
                    <p className="text-white/80 text-xs sm:text-sm">Tu seguridad es nuestra prioridad</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-[#F4C762] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base">Destinos Exclusivos</h4>
                    <p className="text-white/80 text-xs sm:text-sm">Lugares que solo nosotros conocemos</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-[#F4C762] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base">Horarios Flexibles</h4>
                    <p className="text-white/80 text-xs sm:text-sm">Adaptamos nuestros tours a ti</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-[#F4C762]" />
                <span className="text-sm sm:text-base">+34 922 123 456</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-[#F4C762]" />
                <span className="text-sm sm:text-base">info@tenerifeparadise.com</span>
              </div>
            </div>
          </div>

          {/* Lado derecho - Formulario de login */}
          <div className="order-1 xl:order-2">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Iniciar Sesión
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Accede a tu cuenta para continuar
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
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
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <Label htmlFor="remember" className="text-sm text-gray-600">
                        Recordarme
                      </Label>
                    </div>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-[#0061A8] hover:text-[#004A87] font-medium"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#0061A8] to-[#1E40AF] hover:from-[#004A87] hover:to-[#1E3A8A] text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        Iniciar Sesión
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
                    <span className="bg-white/95 px-2 text-gray-500">O continúa con</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSocialLogin("google")}
                    className="bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
                  >
                    <Chrome className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialLogin("facebook")}
                    className="bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
                  >
                    <Facebook className="mr-2 h-4 w-4" />
                    Facebook
                  </Button>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-3">
                <div className="text-center text-sm text-gray-600">
                  ¿No tienes una cuenta?{" "}
                  <Link
                    href="/auth/register"
                    className="text-[#0061A8] hover:text-[#004A87] font-medium"
                  >
                    Regístrate aquí
                  </Link>
                </div>
                <div className="text-center text-xs text-gray-500">
                  Al continuar, aceptas nuestros{" "}
                  <Link href="/terms" className="text-[#0061A8] hover:underline">
                    Términos de Servicio
                  </Link>{" "}
                  y{" "}
                  <Link href="/privacy" className="text-[#0061A8] hover:underline">
                    Política de Privacidad
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
