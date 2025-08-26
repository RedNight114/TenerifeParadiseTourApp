"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Loader2, Shield, Sparkles, Phone, HelpCircle } from "lucide-react"
import { toast } from "sonner"
import { getSupabaseClient } from "@/lib/supabase-optimized"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!email.trim()) {
      toast.error("Por favor ingresa tu correo electrónico")
      setLoading(false)
      return
    }

    if (!email.includes("@")) {
      toast.error("Por favor ingresa un correo electrónico válido")
      setLoading(false)
      return
    }

    try {
      const supabaseClient = getSupabaseClient()
      const client = await supabaseClient.getClient()
      if (!client) {
        toast.error("No se pudo obtener el cliente de Supabase")
        setLoading(false)
        return
      }
      const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        if (error.message && error.message.includes("Email rate limit exceeded")) {
          toast.error("Has solicitado demasiados resets. Espera unos minutos e inténtalo de nuevo.")
        } else {
          toast.error("Error al enviar el correo de recuperación. Inténtalo de nuevo.")
        }
      } else {
        toast.success("¡Correo enviado! Revisa tu bandeja de entrada y spam.")
        setEmail("")
      }
    } catch (err: any) {
      toast.error(err.message || "Error inesperado. Por favor inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
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
                  ¿Olvidaste tu contraseña?
                </h1>
                <p className="text-lg lg:text-xl xl:text-2xl leading-relaxed text-white/90 max-w-lg lg:max-w-xl xl:max-w-2xl">
                  No te preocupes, te ayudamos a recuperar el acceso a tu cuenta de forma segura
                </p>
              </div>
            </div>

            {/* Información de ayuda */}
            <div className="space-y-6 lg:space-y-8">
              <h3 className="text-xl lg:text-2xl xl:text-3xl font-bold text-[#F4C762]">¿Cómo funciona?</h3>
              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-start space-x-4 lg:space-x-6">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <Mail className="w-6 h-6 lg:w-7 lg:h-7 text-[#F4C762]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-lg lg:text-xl xl:text-2xl mb-1">1. Ingresa tu email</h4>
                    <p className="text-white/80 text-base lg:text-lg leading-relaxed">Proporciona el email con el que te registraste</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 lg:space-x-6">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-6 h-6 lg:w-7 lg:h-7 text-[#F4C762]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-lg lg:text-xl xl:text-2xl mb-1">2. Recibe el enlace</h4>
                    <p className="text-white/80 text-base lg:text-lg leading-relaxed">Te enviaremos un enlace seguro por email</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 lg:space-x-6">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-6 h-6 lg:w-7 lg:h-7 text-[#F4C762]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-lg lg:text-xl xl:text-2xl mb-1">3. Cambia tu contraseña</h4>
                    <p className="text-white/80 text-base lg:text-lg leading-relaxed">Crea una nueva contraseña segura</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-3 mb-3">
                <HelpCircle className="w-5 h-5 text-[#F4C762] flex-shrink-0" />
                <span className="font-semibold text-lg lg:text-xl">¿Necesitas ayuda?</span>
              </div>
              <p className="text-white/80 text-sm lg:text-base mb-3 leading-relaxed">
                Si tienes problemas para recuperar tu contraseña, contacta con nuestro equipo
              </p>
              <a 
                href="tel:+34617303929" 
                className="text-[#F4C762] font-bold hover:underline transition-colors text-lg lg:text-xl"
              >
                +34 617 30 39 29
              </a>
            </div>
          </div>

          {/* Lado derecho - Formulario */}
          <div className="flex justify-center order-1 xl:order-2">
            <Card className="w-full max-w-md lg:max-w-lg xl:max-w-xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-3xl">
              <CardHeader className="text-center pb-8 pt-10 px-6 lg:px-8">
                <div className="mx-auto mb-6 w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-[#0061A8] to-[#1E40AF] rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
                </div>
                <CardTitle className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">Recuperar Contraseña</CardTitle>
                <CardDescription className="text-gray-600 text-lg lg:text-xl leading-relaxed max-w-sm mx-auto">
                  Te enviaremos un enlace seguro para restablecer tu contraseña
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-8 px-6 lg:px-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm lg:text-base font-semibold text-gray-700">
                      Correo Electrónico
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#0061A8] transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-14 lg:h-16 border-2 focus:border-[#0061A8] focus:ring-2 focus:ring-[#0061A8]/20 transition-all duration-300 text-lg lg:text-xl rounded-xl bg-white/50 backdrop-blur-sm"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 lg:h-16 bg-gradient-to-r from-[#0061A8] to-[#1E40AF] hover:from-[#004A87] hover:to-[#1E3A8A] text-white font-bold text-lg lg:text-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none rounded-xl group"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar Enlace de Recuperación
                        <Mail className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="flex flex-col space-y-6 pb-10 px-6 lg:px-8">
                <div className="text-center">
                  <p className="text-base lg:text-lg text-gray-600">
                    ¿Recordaste tu contraseña?{" "}
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
                    className="text-sm lg:text-base text-gray-500 hover:text-[#0061A8] transition-colors font-medium"
                  >
                    ← Volver al Inicio
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
