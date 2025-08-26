"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useAuthContext } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Loader2, Eye, EyeOff, Shield, ArrowLeft, AlertCircle, CheckCircle, Lock, Mail, ArrowRight, Sparkles, Users, Settings, Database, Activity } from 'lucide-react'
import { toast } from "sonner"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  const { signIn, user, profile, loading: authLoading } = useAuthContext()
  const router = useRouter()

  // Verificar si ya está autenticado y es admin
  useEffect(() => {
    if (!authLoading && user && profile) {
if (profile.role === "admin") {
setRedirecting(true)
        router.push("/admin/dashboard")
      } else {
toast.error("No tienes permisos de administrador")
        router.push("/")
      }
    }
  }, [user, profile, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
// Validaciones
    if (!email.trim() || !password.trim()) {
      toast.error("Por favor completa todos los campos")
      setLoading(false)
      return
    }

    if (!email.includes("@")) {
      toast.error("Por favor ingresa un email válido")
      setLoading(false)
      return
    }

    try {
const { error: signInError, data } = await signIn(email.trim(), password)

      if (signInError) {
        // Manejar error de login
        let errorMessage = "Error al iniciar sesión"
        
        if (signInError && typeof signInError === 'object' && 'message' in signInError) {
          const errorMsg = (signInError as any).message
          if (errorMsg?.includes("Invalid login credentials")) {
            errorMessage = "Email o contraseña incorrectos"
          } else if (errorMsg?.includes("Email not confirmed")) {
            errorMessage = "Por favor confirma tu email antes de iniciar sesión"
          } else if (errorMsg?.includes("Too many requests")) {
            errorMessage = "Demasiados intentos. Espera unos minutos"
          } else {
            errorMessage = errorMsg
          }
        }
        
        toast.error(errorMessage)
      } else {
toast.success("Verificando permisos de administrador...")
        
        // El perfil se cargará automáticamente en useAuthContext
        // Solo necesitamos esperar un momento para que se actualice
        setTimeout(() => {
          if (profile && profile.role === 'admin') {
toast.success("Acceso confirmado. Redirigiendo al dashboard...")
            setRedirecting(true)
            router.push("/admin/dashboard")
          } else if (profile && profile.role !== 'admin') {
toast.error("No tienes permisos de administrador")
            router.push("/")
          } else {
toast.error("Error al verificar permisos")
            router.push("/")
          }
        }, 1000)
      }
    } catch (err) {
toast.error("Error inesperado. Por favor inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  // Mostrar loading mientras se verifica la autenticación o se redirige
  if (authLoading || redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E3A8A] via-[#3B82F6] to-[#1E40AF] flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-3"></div>
          <h2 className="text-base font-bold mb-2">
              {redirecting ? 'Redirigiendo al dashboard...' : 'Verificando acceso...'}
          </h2>
          <p className="text-xs opacity-90">Por favor, espera un momento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3A8A] via-[#3B82F6] to-[#1E40AF] flex items-center justify-center p-2 sm:p-3 relative overflow-hidden font-sans">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] opacity-5"></div>

      {/* Floating Elements */}
      <div className="absolute top-12 left-12 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-12 right-12 w-28 h-28 bg-blue-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full blur-lg animate-pulse delay-500"></div>
      <div className="absolute top-1/3 right-1/4 w-10 h-10 bg-blue-400/15 rounded-full blur-md animate-pulse delay-1500"></div>

      <div className="w-full max-w-7xl relative z-10">
        {/* Sección de bienvenida - Siempre visible, encima del formulario en móviles/tablets */}
        <div className="xl:hidden text-white text-center mb-4 sm:mb-6 lg:mb-8 px-2 sm:px-3 md:px-4">
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
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
                  <div className="w-full h-full bg-gradient-to-r from-[#3B82F6] to-[#1E40AF] rounded-lg flex items-center justify-center shadow-2xl relative">
                    <span className="text-white font-bold text-base sm:text-lg lg:text-xl">TP</span>
                    <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-blue-300 animate-pulse" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold leading-tight">Tenerife Paradise</h2>
                <p className="text-blue-300 font-medium text-sm sm:text-base lg:text-lg xl:text-xl">Panel de Administración</p>
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-3 lg:space-y-4">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
                Panel de Control
              </h1>
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed text-white/90 max-w-lg lg:max-w-xl mx-auto">
                Acceso restringido para administradores. Gestiona tours, usuarios y configuraciones del sistema
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-3 lg:gap-4 xl:gap-6 items-center min-h-[350px] xl:min-h-[420px]">
          {/* Lado izquierdo - Información (solo en desktop) */}
          <div className="hidden xl:block text-white space-y-2 sm:space-y-3 lg:space-y-5 order-2 xl:order-1 px-2 sm:px-3">
            {/* Logo y título */}
            <div className="space-y-2 sm:space-y-3 lg:space-y-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-7 h-7 sm:w-9 sm:h-9 lg:w-11 lg:h-11 relative flex-shrink-0">
                  {!logoError ? (
                    <Image
                      src="/images/logo-tenerife.png"
                      alt="Tenerife Paradise Tours & Excursions"
                      fill
                      className="object-contain drop-shadow-xl"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#3B82F6] to-[#1E40AF] rounded-lg flex items-center justify-center shadow-2xl relative">
                      <span className="text-white font-bold text-xs sm:text-xs lg:text-sm">TP</span>
                      <Sparkles className="absolute -top-1 -right-1 w-2 h-2 text-blue-300 animate-pulse" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xs sm:text-sm lg:text-base xl:text-lg font-bold leading-tight">Tenerife Paradise</h2>
                  <p className="text-blue-300 font-medium text-xs sm:text-sm lg:text-base">Panel de Administración</p>
                </div>
              </div>
              
              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
                  Panel de Control
                </h1>
                <p className="text-xs sm:text-sm lg:text-base xl:text-lg leading-relaxed text-white/90 max-w-sm lg:max-w-md">
                  Acceso restringido para administradores. Gestiona tours, usuarios y configuraciones del sistema
                </p>
              </div>
            </div>

            {/* Características del panel */}
            <div className="space-y-2 sm:space-y-3 lg:space-y-4 pt-2 sm:pt-3 lg:pt-4">
              <h3 className="text-xs sm:text-sm lg:text-base xl:text-lg font-semibold text-blue-200">
                Funcionalidades Principales
              </h3>
              <div className="space-y-1 sm:space-y-2 lg:space-y-3">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-blue-500/20 rounded flex items-center justify-center flex-shrink-0">
                    <Users className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 text-blue-300" />
                  </div>
                  <span className="text-xs sm:text-sm lg:text-base text-white/90">Gestión de Reservas</span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-blue-500/20 rounded flex items-center justify-center flex-shrink-0">
                    <Database className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 text-blue-300" />
                  </div>
                  <span className="text-xs sm:text-sm lg:text-base text-white/90">Administración de Servicios</span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-blue-500/20 rounded flex items-center justify-center flex-shrink-0">
                    <Activity className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 text-blue-300" />
                  </div>
                  <span className="text-xs sm:text-sm lg:text-base text-white/90">Estadísticas y Reportes</span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-blue-500/20 rounded flex items-center justify-center flex-shrink-0">
                    <Settings className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 text-blue-300" />
                  </div>
                  <span className="text-xs sm:text-sm lg:text-base text-white/90">Configuración del Sistema</span>
                </div>
              </div>
            </div>

            {/* Información de seguridad */}
            <div className="pt-2 sm:pt-3 lg:pt-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4 border border-white/20">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-blue-300 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm lg:text-base font-semibold text-blue-200 mb-1">
                      Acceso Seguro
                    </h4>
                    <p className="text-xs sm:text-sm lg:text-base text-white/80 leading-relaxed">
                      Este panel está protegido con autenticación de dos factores y acceso restringido solo para administradores autorizados.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lado derecho - Formulario de login */}
          <div className="order-1 xl:order-2">
            <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-gradient-to-r from-[#3B82F6] to-[#1E40AF] rounded-lg flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Acceso Administrativo</CardTitle>
                <CardDescription className="text-gray-600">
                  Ingresa tus credenciales para acceder al panel de control
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Campo Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@tenerife.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-white/80 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  {/* Campo Contraseña */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 bg-white/80 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Botón de Login */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#3B82F6] to-[#1E40AF] hover:from-[#1E40AF] hover:to-[#1E3A8A] text-white font-medium py-2.5"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Acceder al Panel
                      </>
                    )}
                  </Button>
                </form>

                {/* Separador */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">O</span>
                  </div>
                </div>

                {/* Enlace de regreso */}
                <div className="text-center">
                  <Link
                    href="/"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver al sitio principal
                  </Link>
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <div className="w-full text-center">
                  <p className="text-xs text-gray-500">
                    ¿Problemas de acceso? Contacta al administrador del sistema
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

