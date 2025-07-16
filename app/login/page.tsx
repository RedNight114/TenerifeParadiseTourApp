"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useAuthModals } from "@/hooks/use-auth-modals"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle, AlertCircle, Chrome, Facebook } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)
  const [loading, setLoading] = useState(false) // Declare the setLoading variable

  const { signIn, user } = useAuth()
  const { openLogin } = useAuthModals()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Animación de entrada
  useEffect(() => {
    setIsAnimating(true)
  }, [])

  // Redirección si ya está autenticado
  useEffect(() => {
    if (!loading) {
      if (user) {
        // Si ya está autenticado, redirigir al dashboard
        router.replace("/dashboard/client")
      } else {
        // Si no está autenticado, abrir modal y redirigir al home
        openLogin()
        router.replace("/?login=true")
      }
    }
  }, [user, loading, router, openLogin])

  // Mensaje de éxito si viene del registro
  useEffect(() => {
    const message = searchParams.get("message")
    if (message === "registration-success") {
      setSuccess("¡Registro exitoso! Ahora puedes iniciar sesión.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    // Validaciones del cliente
    if (!email || !password) {
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
      const { error: signInError } = await signIn(email, password)

      if (signInError) {
        // Mensajes de error más amigables
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Email o contraseña incorrectos. Por favor verifica tus datos.")
        } else if (signInError.message.includes("Email not confirmed")) {
          setError("Por favor confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada.")
        } else if (signInError.message.includes("Too many requests")) {
          setError("Demasiados intentos. Por favor espera unos minutos antes de intentar de nuevo.")
        } else {
          setError(signInError.message)
        }
      } else {
        setSuccess("¡Inicio de sesión exitoso! Redirigiendo...")

        // Pequeño delay para mostrar el mensaje de éxito
        setTimeout(() => {
          const redirectTo = searchParams.get("redirect") || "/dashboard/client"
          router.push(redirectTo)
        }, 1500)
      }
    } catch (err) {
      setError("Error inesperado. Por favor inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: "google" | "facebook" | "github") => {
    try {
      setError("")
      // Aquí implementarías la lógica de OAuth
      // Por ahora mostramos un mensaje
      setError(`Inicio de sesión con ${provider} próximamente disponible`)
    } catch (error) {
      setError("Error en el inicio de sesión social")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0061A8]/10 via-white to-[#F4C762]/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] opacity-5"></div>

      <div className="relative w-full max-w-md">
        {/* Logo y título animado */}
        <div
          className={`text-center mb-8 transform transition-all duration-1000 ${
            isAnimating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-[#0061A8] to-[#F4C762] rounded-full flex items-center justify-center mb-4 shadow-lg">
            <span className="text-white font-bold text-xl">TP</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Bienvenido de vuelta!</h1>
          <p className="text-gray-600">Inicia sesión para continuar tu aventura en Tenerife</p>
        </div>

        {loading ? (
          <div className="text-center text-white">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium">Redirigiendo...</p>
          </div>
        ) : (
          <Card
            className={`shadow-2xl border-0 transform transition-all duration-1000 delay-200 ${
              isAnimating ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">Iniciar Sesión</CardTitle>
              <CardDescription>
                Accede a tu cuenta para gestionar tus reservas y descubrir nuevas experiencias
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

                {/* Botones de inicio de sesión social */}
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-2 hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02] bg-transparent"
                    onClick={() => handleSocialLogin("google")}
                  >
                    <Chrome className="mr-3 h-5 w-5 text-blue-500" />
                    Continuar con Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-2 hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02] bg-transparent"
                    onClick={() => handleSocialLogin("facebook")}
                  >
                    <Facebook className="mr-3 h-5 w-5 text-blue-600" />
                    Continuar con Facebook
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-gray-500 font-medium">O continúa con email</span>
                  </div>
                </div>

                {/* Campo de email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Correo Electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="tu@email.com"
                      className="pl-10 h-12 border-2 focus:border-[#F4C762] focus:ring-2 focus:ring-[#F4C762]/20 transition-all duration-200"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Campo de contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-12 border-2 focus:border-[#F4C762] focus:ring-2 focus:ring-[#F4C762]/20 transition-all duration-200"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Opciones adicionales */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={value => setRememberMe(value === true)}
                      className="border-2 data-[state=checked]:bg-[#0061A8] data-[state=checked]:border-[#0061A8]"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                      Recordarme
                    </Label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-[#0061A8] hover:text-[#0061A8]/80 font-medium transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-[#0061A8] to-[#F4C762] hover:from-[#0061A8]/90 hover:to-[#F4C762]/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      Iniciar Sesión
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    ¿No tienes cuenta?{" "}
                    <Link
                      href="/register"
                      className="text-[#0061A8] hover:text-[#0061A8]/80 font-semibold transition-colors hover:underline"
                    >
                      Regístrate aquí
                    </Link>
                  </p>
                </div>

                {/* Enlaces adicionales */}
                <div className="flex justify-center space-x-6 text-xs text-gray-500">
                  <Link href="/help" className="hover:text-[#0061A8] transition-colors">
                    Ayuda
                  </Link>
                  <Link href="/privacy" className="hover:text-[#0061A8] transition-colors">
                    Privacidad
                  </Link>
                  <Link href="/terms" className="hover:text-[#0061A8] transition-colors">
                    Términos
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* Información adicional */}
        <div
          className={`mt-8 text-center transform transition-all duration-1000 delay-500 ${
            isAnimating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">🎯 ¿Por qué elegir Tenerife Paradise?</h3>
            <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
              <div className="flex items-center justify-center space-x-2">
                <span>✅ Experiencias auténticas</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>🛡️ Reservas seguras</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>📞 Soporte 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contacto de emergencia */}
        <div
          className={`mt-4 text-center transform transition-all duration-1000 delay-700 ${
            isAnimating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <p className="text-xs text-gray-500">
            ¿Problemas para acceder?{" "}
            <a href="tel:+34617303929" className="text-[#0061A8] hover:underline font-medium">
              Llámanos: +34 617 30 39 29
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
