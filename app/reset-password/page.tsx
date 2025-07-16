"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [validToken, setValidToken] = useState<boolean | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if we have the required parameters
    const accessToken = searchParams.get("access_token")
    const refreshToken = searchParams.get("refresh_token")

    if (!accessToken || !refreshToken) {
      setValidToken(false)
      setError("Enlace de recuperación inválido o expirado")
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
          setError("Enlace de recuperación inválido o expirado")
        } else {
          setValidToken(true)
        }
      } catch (err) {
        setValidToken(false)
        setError("Error al validar el enlace de recuperación")
      }
    }

    setSession()
  }, [searchParams])

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres"
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "La contraseña debe contener al menos una letra minúscula"
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "La contraseña debe contener al menos una letra mayúscula"
    }
    if (!/(?=.*\d)/.test(password)) {
      return "La contraseña debe contener al menos un número"
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validations
    if (!password.trim() || !confirmPassword.trim()) {
      setError("Por favor completa todos los campos")
      setLoading(false)
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        if (error.message.includes("New password should be different")) {
          setError("La nueva contraseña debe ser diferente a la anterior")
        } else {
          setError("Error al actualizar la contraseña. Inténtalo de nuevo.")
        }
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push("/dashboard/client")
        }, 2000)
      }
    } catch (err) {
      setError("Error inesperado. Por favor inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  if (validToken === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0061A8] via-[#0061A8] to-[#F4C762] flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Validando enlace...</p>
        </div>
      </div>
    )
  }

  if (validToken === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0061A8] via-[#0061A8] to-[#F4C762] flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="text-center p-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Enlace inválido</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button
              onClick={() => router.push("/forgot-password")}
              className="bg-gradient-to-r from-[#0061A8] to-[#F4C762] hover:from-[#0061A8]/90 hover:to-[#F4C762]/90 text-white"
            >
              Solicitar nuevo enlace
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0061A8] via-[#0061A8] to-[#F4C762] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            {/* Logo */}
            <div className="mx-auto w-16 h-16 mb-4 relative">
              {!logoError ? (
                <Image
                  src="/images/logo-tenerife.png"
                  alt="Tenerife Paradise Tours & Excursions"
                  fill
                  className="object-contain drop-shadow-lg"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-[#0061A8] to-[#F4C762] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">TP</span>
                </div>
              )}
            </div>

            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Nueva contraseña</CardTitle>
            <CardDescription className="text-gray-600 leading-relaxed">
              Crea una contraseña segura para tu cuenta
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Messages */}
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm font-medium text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm font-medium text-green-800">
                  ¡Contraseña actualizada exitosamente! Redirigiendo...
                </AlertDescription>
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Nueva Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-12 border-2 border-gray-200 focus:border-[#F4C762] focus:ring-2 focus:ring-[#F4C762]/20 rounded-lg bg-gray-50 focus:bg-white transition-all duration-200"
                    disabled={loading || success}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    disabled={loading || success}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                  Confirmar Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-12 border-2 border-gray-200 focus:border-[#F4C762] focus:ring-2 focus:ring-[#F4C762]/20 rounded-lg bg-gray-50 focus:bg-white transition-all duration-200"
                    disabled={loading || success}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    disabled={loading || success}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Password requirements */}
              <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium mb-1">La contraseña debe contener:</p>
                <ul className="space-y-1">
                  <li className={password.length >= 8 ? "text-green-600" : ""}>• Al menos 8 caracteres</li>
                  <li className={/(?=.*[a-z])/.test(password) ? "text-green-600" : ""}>• Una letra minúscula</li>
                  <li className={/(?=.*[A-Z])/.test(password) ? "text-green-600" : ""}>• Una letra mayúscula</li>
                  <li className={/(?=.*\d)/.test(password) ? "text-green-600" : ""}>• Un número</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[#0061A8] to-[#F4C762] hover:from-[#0061A8]/90 hover:to-[#F4C762]/90 text-white font-bold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl rounded-lg disabled:transform-none disabled:opacity-50"
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Actualizando...
                  </>
                ) : success ? (
                  "¡Contraseña actualizada!"
                ) : (
                  "Actualizar contraseña"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
