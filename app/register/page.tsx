"use client"

import { useState } from "react"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useAuthModals } from "@/hooks/use-auth-modals"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { Loader2 } from "lucide-react"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptMarketing, setAcceptMarketing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  })

  const { signUp, user, loading } = useAuth()
  const { openRegister } = useAuthModals()
  const router = useRouter()

  // Animación de entrada
  useEffect(() => {
    setIsAnimating(true)
  }, [])

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Si ya está autenticado, redirigir al dashboard
        router.replace("/dashboard/client")
      } else {
        // Si no está autenticado, abrir modal y redirigir al home
        openRegister()
        router.replace("/?register=true")
      }
    }
  }, [user, loading, router, openRegister])

  // Validación de contraseña en tiempo real
  useEffect(() => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    setPasswordChecks(checks)

    const strength = Object.values(checks).filter(Boolean).length
    setPasswordStrength((strength / 5) * 100)
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validaciones del cliente
    if (!fullName.trim()) {
      setError("Por favor ingresa tu nombre completo")
      return
    }

    if (!email || !email.includes("@")) {
      setError("Por favor ingresa un email válido")
      return
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (!acceptTerms) {
      setError("Debes aceptar los términos y condiciones para continuar")
      return
    }

    // Validar fortaleza de contraseña
    if (passwordStrength < 60) {
      setError("La contraseña debe ser más segura. Incluye mayúsculas, números y símbolos.")
      return
    }

    try {
      const { error: signUpError } = await signUp(email, password, fullName.trim())

      if (signUpError) {
        // Mensajes de error más amigables
        if (signUpError.message.includes("User already registered")) {
          setError("Este email ya está registrado. ¿Quieres iniciar sesión en su lugar?")
        } else if (signUpError.message.includes("Password should be at least")) {
          setError("La contraseña debe tener al menos 6 caracteres")
        } else if (signUpError.message.includes("Invalid email")) {
          setError("Por favor ingresa un email válido")
        } else {
          setError(signUpError.message)
        }
      } else {
        setSuccess(true)
        // Redirigir después de mostrar el mensaje de éxito
        setTimeout(() => {
          router.push("/login?message=registration-success")
        }, 3000)
      }
    } catch (err) {
      setError("Error inesperado. Por favor inténtalo de nuevo.")
    }
  }

  const handleSocialRegister = async (provider: "google" | "facebook") => {
    try {
      setError("")
      // Aquí implementarías la lógica de OAuth
      setError(`Registro con ${provider} próximamente disponible`)
    } catch (error) {
      setError("Error en el registro social")
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500"
    if (passwordStrength < 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return "Débil"
    if (passwordStrength < 70) return "Media"
    return "Fuerte"
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0061A8]/10 via-white to-[#F4C762]/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md shadow-2xl border-0 animate-in zoom-in-50 duration-500">
          <CardContent className="pt-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Registro Exitoso!</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Hemos enviado un enlace de confirmación a <strong>{email}</strong>
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Próximos pasos:</h3>
                <ol className="text-sm text-blue-800 space-y-1 text-left">
                  <li>1. Revisa tu bandeja de entrada</li>
                  <li>2. Haz clic en el enlace de confirmación</li>
                  <li>3. ¡Inicia sesión y comienza tu aventura!</li>
                </ol>
              </div>
              <p className="text-sm">Serás redirigido al login en unos segundos...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0061A8] to-[#F4C762]">
      <div className="text-center text-white">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-lg font-medium">Redirigiendo...</p>
      </div>
    </div>
  )
}
