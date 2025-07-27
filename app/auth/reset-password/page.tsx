"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Loader2, Shield, Sparkles, Key, Check, X } from "lucide-react"
import { toast } from "sonner"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [validToken, setValidToken] = useState<boolean | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Validación de contraseña en tiempo real
  const passwordRequirements = {
    length: password.length >= 8,
    lowercase: /(?=.*[a-z])/.test(password),
    uppercase: /(?=.*[A-Z])/.test(password),
    number: /(?=.*\d)/.test(password),
    special: /(?=.*[!@#$%^&*])/.test(password),
  }

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean)

  useEffect(() => {
    // Check if we have the required parameters
    const accessToken = searchParams.get("access_token")
    const refreshToken = searchParams.get("refresh_token")

    if (!accessToken || !refreshToken) {
      setValidToken(false)
      toast.error("Enlace de recuperación inválido o expirado")
      return
    }

    // Set the session with the tokens
    const setSession = async () => {
      try {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (error) {
          setValidToken(false)
          toast.error("Enlace de recuperación inválido o expirado")
        } else {
          setValidToken(true)
        }
      } catch (err) {
        setValidToken(false)
        toast.error("Error al validar el enlace de recuperación")
      }
    }

    setSession()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validations
    if (!password.trim() || !confirmPassword.trim()) {
      toast.error("Por favor completa todos los campos")
      setLoading(false)
      return
    }

    if (!isPasswordValid) {
      toast.error("La contraseña no cumple con todos los requisitos de seguridad")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        toast.error("Error al cambiar la contraseña. Inténtalo de nuevo.")
      } else {
        toast.success("¡Contraseña cambiada exitosamente! Redirigiendo al login...")
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      }
    } catch (err) {
      toast.error("Error inesperado. Por favor inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  // Mostrar error si el token no es válido
  if (validToken === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0061A8] via-[#1E40AF] to-[#F4C762] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="w-full max-w-md relative z-10">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-3xl">
            <CardHeader className="text-center pb-8 pt-10">
              <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-3">Enlace Inválido</CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                El enlace de recuperación ha expirado o no es válido
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-8">
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  Por favor solicita un nuevo enlace de recuperación
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pb-10 px-8">
              <Button
                onClick={() => router.push("/auth/forgot-password")}
                className="w-full bg-gradient-to-r from-[#0061A8] to-[#1E40AF] hover:from-[#004A87] hover:to-[#1E3A8A] text-white font-bold py-3 rounded-xl"
              >
                Solicitar Nuevo Enlace
              </Button>
              <Link
                href="/auth/login"
                className="text-sm text-gray-500 hover:text-[#0061A8] transition-colors font-medium"
              >
                ← Volver al Login
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  // Mostrar loading mientras valida el token
  if (validToken === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0061A8] via-[#1E40AF] to-[#F4C762] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-3">Validando enlace</h2>
          <p className="text-lg opacity-90">Por favor, espera un momento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0061A8] via-[#1E40AF] to-[#F4C762] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] opacity-5"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#F4C762]/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-lg animate-pulse delay-500"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-[#F4C762]/15 rounded-full blur-md animate-pulse delay-1500"></div>

      <div className="w-full max-w-7xl relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* Lado izquierdo - Información */}
          <div className="text-white space-y-8 lg:space-y-10 xl:space-y-12 order-2 xl:order-1">
            {/* Logo y título */}
            <div className="space-y-6 lg:space-y-8">
              <div className="flex items-center space-x-4 lg:space-x-6">
                <div className="w-16 h-16 lg:w-20 lg:h-20 relative flex-shrink-0">
                  {!logoError ? (
                    <Image
                      src="/images/logo-tenerife.png"
                      alt="Tenerife Paradise Tours & Excursions"
                      fill
                      className="object-contain drop-shadow-xl"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#0061A8] to-[#F4C762] rounded-2xl flex items-center justify-center shadow-2xl relative">
                      <span className="text-white font-bold text-2xl lg:text-3xl">TP</span>
                      <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-[#F4C762] animate-pulse" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight">Tenerife Paradise</h2>
                  <p className="text-[#F4C762] font-medium text-lg lg:text-xl xl:text-2xl">Tours & Excursions</p>
                </div>
              </div>
              
              <div className="space-y-4 lg:space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight">
                  Cambiar Contraseña
                </h1>
                <p className="text-lg lg:text-xl xl:text-2xl leading-relaxed text-white/90 max-w-lg lg:max-w-xl xl:max-w-2xl">
                  Crea una nueva contraseña segura para proteger tu cuenta
                </p>
              </div>
            </div>

            {/* Requisitos de seguridad */}
            <div className="space-y-6 lg:space-y-8">
              <h3 className="text-xl lg:text-2xl xl:text-3xl font-bold text-[#F4C762]">Requisitos de Seguridad</h3>
              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-start space-x-4 lg:space-x-6">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <Key className="w-6 h-6 lg:w-7 lg:h-7 text-[#F4C762]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-lg lg:text-xl xl:text-2xl mb-1">Contraseña Fuerte</h4>
                    <p className="text-white/80 text-base lg:text-lg leading-relaxed">Mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 lg:space-x-6">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-6 h-6 lg:w-7 lg:h-7 text-[#F4C762]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-lg lg:text-xl xl:text-2xl mb-1">Protección Total</h4>
                    <p className="text-white/80 text-base lg:text-lg leading-relaxed">Tu cuenta estará protegida con los más altos estándares de seguridad</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 lg:space-x-6">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-6 h-6 lg:w-7 lg:h-7 text-[#F4C762]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-lg lg:text-xl xl:text-2xl mb-1">Acceso Inmediato</h4>
                    <p className="text-white/80 text-base lg:text-lg leading-relaxed">Podrás acceder a tu cuenta inmediatamente después del cambio</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lado derecho - Formulario */}
          <div className="flex justify-center order-1 xl:order-2">
            <Card className="w-full max-w-md lg:max-w-lg xl:max-w-xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-3xl">
              <CardHeader className="text-center pb-8 pt-10 px-6 lg:px-8">
                <div className="mx-auto mb-6 w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-[#F4C762] to-[#EAB308] rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
                </div>
                <CardTitle className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">Nueva Contraseña</CardTitle>
                <CardDescription className="text-gray-600 text-lg lg:text-xl leading-relaxed max-w-sm mx-auto">
                  Crea una contraseña segura para tu cuenta
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-8 px-6 lg:px-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-sm lg:text-base font-semibold text-gray-700">
                      Nueva Contraseña
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#F4C762] transition-colors" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 pr-12 h-14 lg:h-16 border-2 focus:border-[#F4C762] focus:ring-2 focus:ring-[#F4C762]/20 transition-all duration-300 text-lg lg:text-xl rounded-xl bg-white/50 backdrop-blur-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="confirmPassword" className="text-sm lg:text-base font-semibold text-gray-700">
                      Confirmar Contraseña
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#F4C762] transition-colors" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-12 pr-12 h-14 lg:h-16 border-2 focus:border-[#F4C762] focus:ring-2 focus:ring-[#F4C762]/20 transition-all duration-300 text-lg lg:text-xl rounded-xl bg-white/50 backdrop-blur-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Requisitos de contraseña */}
                  <div className="space-y-3">
                    <Label className="text-sm lg:text-base font-semibold text-gray-700">
                      Requisitos de la contraseña
                    </Label>
                    <div className="space-y-2 text-sm lg:text-base">
                      <div className={`flex items-center space-x-2 ${passwordRequirements.length ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordRequirements.length ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        <span>Mínimo 8 caracteres</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordRequirements.lowercase ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        <span>Al menos una letra minúscula</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordRequirements.uppercase ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        <span>Al menos una letra mayúscula</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${passwordRequirements.number ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordRequirements.number ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        <span>Al menos un número</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${passwordRequirements.special ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordRequirements.special ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        <span>Al menos un símbolo (!@#$%^&*)</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 lg:h-16 bg-gradient-to-r from-[#F4C762] to-[#EAB308] hover:from-[#EAB308] hover:to-[#CA8A04] text-white font-bold text-lg lg:text-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none rounded-xl group"
                    disabled={loading || !isPasswordValid || password !== confirmPassword}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                        Cambiando contraseña...
                      </>
                    ) : (
                      <>
                        Cambiar Contraseña
                        <Shield className="w-6 h-6 ml-3 transition-transform group-hover:scale-110" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="flex flex-col space-y-6 pb-10 px-6 lg:px-8">
                <div className="text-center">
                  <Link
                    href="/auth/login"
                    className="text-sm lg:text-base text-gray-500 hover:text-[#0061A8] transition-colors font-medium"
                  >
                    ← Volver al Login
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
