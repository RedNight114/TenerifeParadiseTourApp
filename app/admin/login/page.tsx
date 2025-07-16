"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, Shield, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [logoError, setLogoError] = useState(false)

  const { signIn, user, profile, loading: authLoading } = useAuth()
  const router = useRouter()

  // Verificar si ya está autenticado y es admin
  useEffect(() => {
    if (!authLoading && user && profile) {
      if (profile.role === "admin") {
        router.replace("/admin/dashboard")
      } else {
        setError("No tienes permisos de administrador")
      }
    }
  }, [user, profile, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    // Validaciones
    if (!email.trim() || !password.trim()) {
      setError("Por favor completa todos los campos")
      setLoading(false)
      return
    }

    if (!email.includes("@")) {
      setError("Por favor ingresa un email válido")
      setLoading(false)
      return
    }

    try {
      const { error: signInError } = await signIn(email.trim(), password)

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Credenciales incorrectas. Verifica tu email y contraseña.")
        } else if (signInError.message.includes("Email not confirmed")) {
          setError("Por favor confirma tu email antes de iniciar sesión.")
        } else if (signInError.message.includes("Too many requests")) {
          setError("Demasiados intentos. Espera unos minutos e inténtalo de nuevo.")
        } else {
          setError("Error al iniciar sesión. Inténtalo de nuevo.")
        }
      } else {
        setSuccess("Verificando permisos de administrador...")
        // La redirección se maneja en el useEffect
      }
    } catch (err) {
      setError("Error inesperado. Por favor inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] opacity-5"></div>

      <div className="relative w-full max-w-md">
        {/* Botón de regreso */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Volver al sitio</span>
          </Link>
        </div>

        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 mb-4 relative">
            {!logoError ? (
              <Image
                src="/images/logo-tenerife.png"
                alt="Tenerife Paradise Tours & Excursions"
                fill
                className="object-contain drop-shadow-xl"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center border-2 border-white/30 shadow-xl">
                <span className="text-white font-bold text-2xl">TP</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Shield className="h-6 w-6 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
          </div>
          <p className="text-blue-200">Acceso restringido para administradores</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales de administrador para acceder al panel de control
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Mensajes de estado */}
              {error && (
                <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 animate-in slide-in-from-top-2 duration-300">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              {/* Campo de email */}
              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-sm font-medium text-gray-700">
                  Email de Administrador
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@tenerifeparadise.com"
                  className="h-12 border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              {/* Campo de contraseña */}
              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-12 pr-10 border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Información de seguridad */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">Acceso Seguro</h4>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Este panel está protegido con autenticación de dos factores y monitoreo de seguridad. 
                      Solo usuarios autorizados pueden acceder.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verificando acceso...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Acceder al Panel
                  </>
                )}
              </Button>
            </CardContent>
          </form>
        </Card>

        {/* Información adicional */}
        <div className="mt-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <h3 className="font-semibold text-white mb-2">🔐 Acceso Restringido</h3>
            <p className="text-sm text-blue-200 leading-relaxed">
              Si no tienes credenciales de administrador, contacta al equipo técnico. 
              Todos los intentos de acceso son registrados por seguridad.
            </p>
          </div>
        </div>

        {/* Contacto de soporte */}
        <div className="mt-4 text-center">
          <p className="text-xs text-blue-300">
            ¿Problemas de acceso?{" "}
            <a href="mailto:tecnicos@tenerifeparadise.com" className="text-blue-400 hover:text-white hover:underline font-medium">
              Contactar Soporte Técnico
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
