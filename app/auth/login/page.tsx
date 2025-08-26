"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuthContext } from "@/components/auth-provider"
import { AuthPageWrapper } from "@/components/auth/auth-page-wrapper"
import { EmailVerificationNotice } from "@/components/auth/email-verification-notice"
import { LegalModal } from "@/components/legal-modals"
import { LoginRedirect } from "@/components/auth/login-redirect"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle, AlertCircle, Chrome, Facebook, RefreshCw, Shield, Sparkles, Star, MapPin, Clock, Phone } from "lucide-react"
import { toast } from "sonner"

function LoginPageContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [showRedirect, setShowRedirect] = useState(false)
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: 'privacy' | 'terms' | 'cookies' | null }>({
    isOpen: false,
    type: null
  })

  const { signIn, signOut, user, profile, loading, error } = useAuthContext()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Mostrar opción de cerrar sesión si ya está autenticado
  useEffect(() => {
    if (user && profile && !loading) {
setShowRedirect(true)
    }
  }, [user, profile, loading])

  // Mensaje de éxito si viene del registro
  useEffect(() => {
    const message = searchParams.get("message")
    if (message === "registration-success") {
      toast.success("¡Registro exitoso!", {
        description: "Ahora puedes iniciar sesión con tu cuenta verificada.",
        duration: 5000,
        icon: "🎉"
      })
    } else if (message === "email-verified") {
      toast.success("¡Email verificado!", {
        description: "Tu cuenta ha sido confirmada exitosamente. Ya puedes iniciar sesión.",
        duration: 5000,
        icon: "✅"
      })
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
setIsSubmitting(true)

    // Validaciones del cliente
    if (!email || !password) {
toast.error("Campos incompletos", {
        description: "Por favor completa todos los campos requeridos.",
        duration: 4000,
        icon: "⚠️"
      })
      setIsSubmitting(false)
      return
    }

    if (!email.includes("@")) {
toast.error("Email inválido", {
        description: "Por favor ingresa un formato de email válido.",
        duration: 4000,
        icon: "📧"
      })
      setIsSubmitting(false)
      return
    }
try {
const result = await signIn(email, password)
if (result.error) {
// Manejar error de login
        let errorMessage = "Error al iniciar sesión"
        
        if (result.error && typeof result.error === 'object' && 'message' in result.error) {
          const errorMsg = (result.error as any).message
          if (errorMsg?.includes("Invalid login credentials")) {
            errorMessage = "Credenciales incorrectas"
          } else if (errorMsg?.includes("Email not confirmed")) {
            errorMessage = "Email no confirmado"
          } else if (errorMsg?.includes("Too many requests")) {
            errorMessage = "Demasiados intentos"
          } else {
            errorMessage = errorMsg
          }
        }
toast.error("Error de autenticación", {
          description: errorMessage,
          duration: 5000,
          icon: "🔐"
        })
      } else {
setShowRedirect(true)
      }
    } catch (error) {
toast.error("Error al iniciar sesión. Por favor intenta de nuevo.")
    } finally {
setIsSubmitting(false)
    }
  }

  const openLegalModal = (type: 'privacy' | 'terms' | 'cookies') => {
    setLegalModal({ isOpen: true, type })
  }

  const closeLegalModal = () => {
    setLegalModal({ isOpen: false, type: null })
  }

  // Mostrar error de conexión
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0061A8] via-[#1E40AF] to-[#F4C762] flex items-center justify-center p-4">
        <div className="text-center max-w-xs mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl p-4 border border-white/20">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900 mb-3">Error de Conexión</h2>
            <Alert className="mb-3 bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">
                {error || 'Error de conexión con el servidor. Por favor, verifica tu conexión a internet.'}
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
                ¡Bienvenido de vuelta!
              </h1>
              <p className="text-base sm:text-lg leading-relaxed text-white/90 max-w-lg mx-auto">
                Inicia sesión para continuar tu aventura en Tenerife y descubrir experiencias únicas
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

          {/* Lado derecho - Formulario de login */}
          <div className="order-1 lg:order-2">
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
                {/* Notificación de verificación de email */}
                <EmailVerificationNotice />
                
                {/* Aviso si ya está autenticado */}
                {user && profile && !loading && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      Ya estás autenticado como <strong>{user.email}</strong> ({profile.role})
                    </AlertDescription>
                    <div className="mt-3 space-y-2">
                      <Button
                        onClick={async () => {
await signOut()
                          toast.success("Sesión cerrada. Puedes iniciar sesión nuevamente.")
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        Cerrar Sesión
                      </Button>
                      <Button
                        onClick={() => {
                          const redirectPath = profile.role === 'admin' ? '/admin/dashboard' : '/profile'
                          window.location.href = redirectPath
                        }}
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Ir a {profile.role === 'admin' ? 'Dashboard' : 'Perfil'}
                      </Button>
                    </div>
                  </Alert>
                )}
                
                <form onSubmit={handleSubmit} className={`space-y-4 ${user && profile ? 'opacity-50 pointer-events-none' : ''}`}>
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
                
                <div className="text-center text-sm text-gray-500 py-2">
                  Los inicios de sesión social estarán disponibles próximamente
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
      
      {/* Componente de redirección post-login */}
      {showRedirect && user && profile && (
        <LoginRedirect 
          user={user} 
          profile={profile} 
          redirectPath={searchParams.get("redirect") || undefined}
        />
      )}

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

export default function LoginPage() {
  return (
    <AuthPageWrapper>
      <LoginPageContent />
    </AuthPageWrapper>
  )
}

