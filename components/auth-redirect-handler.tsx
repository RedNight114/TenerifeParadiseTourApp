"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface AuthRedirectHandlerProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  fallbackPath?: string
}

export function AuthRedirectHandler({ 
  children, 
  requireAuth = true, 
  requireAdmin = false,
  fallbackPath = "/"
}: AuthRedirectHandlerProps) {
  const { user, profile, loading, isAuthenticated } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Si aún está cargando, esperar
    if (loading) {
      console.log('⏳ Aún cargando autenticación...')
      return
    }

    // Si no requiere autenticación, mostrar contenido
    if (!requireAuth) {
      console.log('✅ No requiere autenticación')
      return
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      console.log('🔒 No autenticado, redirigiendo al login')
      setIsRedirecting(true)
      const redirectTo = searchParams.get("redirect") || window.location.pathname
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectTo)}`)
      return
    }

    // Si requiere admin y el usuario no es admin
    if (requireAdmin && profile && profile.role !== 'admin') {
      console.log('❌ Usuario no es admin, redirigiendo')
      setIsRedirecting(true)
      toast.error("No tienes permisos de administrador")
      router.push(fallbackPath)
      return
    }

    // Si todo está bien, mostrar contenido
    console.log('✅ Autenticación y permisos verificados')
    setIsRedirecting(false)
  }, [loading, isAuthenticated, requireAuth, requireAdmin, profile, router, searchParams, fallbackPath])

  // Mostrar loading mientras redirige
  if (isRedirecting || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
            {isRedirecting ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirigiendo...</h2>
                <p className="text-gray-600">Por favor, espera un momento</p>
              </>
            ) : (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Verificando autenticación</h2>
                <p className="text-gray-600">Cargando tu sesión...</p>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Mostrar contenido si todo está bien
  return <>{children}</>
}

// Hook para manejar redirecciones después del login
export function useAuthRedirect() {
  const { user, profile, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSuccessfulLogin = (isAdmin = false) => {
    console.log('🎉 Login exitoso, manejando redirección...')
    
    // Determinar la ruta de redirección
    let redirectPath = searchParams.get("redirect")
    
    if (!redirectPath) {
      if (isAdmin) {
        redirectPath = "/admin/dashboard"
      } else {
        redirectPath = "/profile"
      }
    }

    console.log('📍 Redirigiendo a:', redirectPath)
    
    // Redirección inmediata
    router.replace(redirectPath)
  }

  const handleLoginError = (error: any) => {
    console.error('❌ Error en login:', error)
    
    let errorMessage = "Error al iniciar sesión"
    
    if (error?.message?.includes("Invalid login credentials")) {
      errorMessage = "Email o contraseña incorrectos"
    } else if (error?.message?.includes("Email not confirmed")) {
      errorMessage = "Por favor confirma tu email antes de iniciar sesión"
    } else if (error?.message?.includes("Too many requests")) {
      errorMessage = "Demasiados intentos. Espera unos minutos"
    } else if (error?.message) {
      errorMessage = error.message
    }
    
    toast.error(errorMessage)
  }

  return {
    handleSuccessfulLogin,
    handleLoginError,
    isAuthenticated,
    loading,
    user,
    profile
  }
} 