"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [logoError, setLogoError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    if (!email.trim()) {
      setError("Por favor ingresa tu correo electrónico")
      setLoading(false)
      return
    }

    if (!email.includes("@")) {
      setError("Por favor ingresa un correo electrónico válido")
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        if (error.message.includes("Email rate limit exceeded")) {
          setError("Has solicitado demasiados resets. Espera unos minutos e inténtalo de nuevo.")
        } else {
          setError("Error al enviar el correo de recuperación. Inténtalo de nuevo.")
        }
      } else {
        setMessage(
          "Te hemos enviado un correo con las instrucciones para restablecer tu contraseña. Revisa tu bandeja de entrada y spam.",
        )
        setEmail("")
      }
    } catch (err) {
      setError("Error inesperado. Por favor inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
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

            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">¿Olvidaste tu contraseña?</CardTitle>
            <CardDescription className="text-gray-600 leading-relaxed">
              No te preocupes, te ayudamos a recuperar el acceso a tu cuenta
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

            {message && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm font-medium text-green-800">{message}</AlertDescription>
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="pl-10 h-12 border-2 border-gray-200 focus:border-[#F4C762] focus:ring-2 focus:ring-[#F4C762]/20 rounded-lg bg-gray-50 focus:bg-white transition-all duration-200"
                    disabled={loading}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[#0061A8] to-[#F4C762] hover:from-[#0061A8]/90 hover:to-[#F4C762]/90 text-white font-bold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl rounded-lg disabled:transform-none disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar instrucciones"
                )}
              </Button>
            </form>

            {/* Back to login */}
            <div className="text-center pt-4 border-t">
              <Link
                href="/"
                className="inline-flex items-center text-sm font-medium text-[#0061A8] hover:text-[#0061A8]/80 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
