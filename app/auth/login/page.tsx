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

function LoginPageMain() {
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
      showToast('success', "¡Registro exitoso!", {
        description: "Ahora puedes iniciar sesión con tu cuenta verificada.",
        duration: 5000,
        icon: "🎉"
      })
    } else if (message === "email-verified") {
      showToast('success', "¡Email verificado!", {
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
        showToast('error', "Error de autenticación", {
          description: errorMessage,
          duration: 5000,
          icon: "🔐"
        })
      } else {
        setShowRedirect(true)
      }
    } catch (error) {
      showToast('error', "Error al iniciar sesión. Por favor intenta de nuevo.")
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
          <div className="flex justify-center mb-4">
            {logoError ? (
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">TP</span>
              </div>
            ) : (
              <Image
                src="/images/logo-white.svg"
                alt="Tenerife Paradise Tour"
                width={64}
                height={64}
                className="w-16 h-16"
                onError={() => setLogoError(true)}
              />
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">¡Bienvenido de vuelta!</h1>
          <p className="text-white/90 text-sm sm:text-base">Inicia sesión para continuar tu aventura</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Panel izquierdo - Solo visible en desktop */}
          <div className="hidden lg:block text-white">
            <div className="max-w-md">
              <div className="flex justify-center mb-8">
                {logoError ? (
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">TP</span>
                  </div>
                ) : (
                  <Image
                    src="/images/logo-white.svg"
                    alt="Tenerife Paradise Tour"
                    width={80}
                    height={80}
                    className="w-20 h-20"
                    onError={() => setLogoError(true)}
                  />
                )}
              </div>
              
              <h1 className="text-4xl font-bold mb-6 leading-tight">
                ¡Bienvenido de vuelta!
              </h1>
              
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Inicia sesión para continuar explorando las maravillas de Tenerife
              </p>

              {/* Características destacadas */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90">Acceso seguro y protegido</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90">Experiencias únicas</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90">Reservas prioritarias</span>
                </div>
              </div>
            </div>
          </div>

          {/* Panel derecho - Formulario de login */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold text-center text-gray-900">
                  Iniciar Sesión
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  Ingresa tus credenciales para acceder a tu cuenta
                </CardDescription>
              </CardHeader>
              
              <CardContent>
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
                        className="pl-10 border-gray-300 focus:border-[#0061A8] focus:ring-[#0061A8]"
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
                        placeholder="Tu contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 border-gray-300 focus:border-[#0061A8] focus:ring-[#0061A8]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
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
                      className="text-sm text-[#0061A8] hover:text-[#0056A3] font-medium"
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
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        Iniciar Sesión
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">O continúa con</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="w-full border-gray-300 hover:bg-gray-50"
                    >
                      <Chrome className="w-4 h-4 mr-2" />
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-gray-300 hover:bg-gray-50"
                    >
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook
                    </Button>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <div className="text-center text-sm text-gray-600">
                  ¿No tienes una cuenta?{" "}
                  <Link
                    href="/auth/register"
                    className="text-[#0061A8] hover:text-[#0056A3] font-medium"
                  >
                    Regístrate aquí
                  </Link>
                </div>

                <div className="text-center text-xs text-gray-500">
                  Al continuar, aceptas nuestros{" "}
                  <button
                    onClick={() => openLegalModal('terms')}
                    className="text-[#0061A8] hover:text-[#0056A3] underline"
                  >
                    Términos de Servicio
                  </button>{" "}
                  y{" "}
                  <button
                    onClick={() => openLegalModal('privacy')}
                    className="text-[#0061A8] hover:text-[#0056A3] underline"
                  >
                    Política de Privacidad
                  </button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal legal */}
      {legalModal.isOpen && legalModal.type && (
        <LegalModal
          type={legalModal.type}
          isOpen={legalModal.isOpen}
          onClose={closeLegalModal}
        />
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <AuthPageWrapper>
      <LoginPageMain />
    </AuthPageWrapper>
  )
}