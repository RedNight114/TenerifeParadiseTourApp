"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Loader2, Shield, LogIn, RefreshCw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, fallback, requireAuth = true }: AuthGuardProps) {
  const { user, profile, loading, error: authError, isAuthenticated } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    console.log('🔍 AuthGuard - Estado actual:', { 
      loading, 
      isAuthenticated,
      user: !!user, 
      profile: !!profile, 
      authError
    })

    // Si aún está cargando, esperar
    if (loading) {
      console.log('⏳ AuthGuard - Aún cargando, esperando...')
      return
    }

    // Si no requiere autenticación, permitir acceso
    if (!requireAuth) {
      console.log('✅ AuthGuard - No requiere autenticación')
      setIsChecking(false)
      return
    }

    // Si está autenticado, permitir acceso
    if (isAuthenticated && user) {
      console.log('✅ AuthGuard - Usuario autenticado')
      setIsChecking(false)
      return
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated && !loading) {
      console.log('🔒 AuthGuard - Usuario no autenticado, redirigiendo')
      router.push("/auth/login")
      return
    }

  }, [loading, isAuthenticated, user, requireAuth, router])

  // Mostrar loading mientras verifica
  if (isChecking || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verificando autenticación</h2>
          <p className="text-gray-600">Por favor, espera un momento...</p>
        </div>
      </div>
    )
  }

  // Mostrar error de autenticación
  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error de Conexión</h2>
            <Alert className="mb-6">
              <AlertDescription>
                {authError || 'Error de conexión con el servidor. Por favor, verifica tu conexión a internet.'}
              </AlertDescription>
            </Alert>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push("/")}
                className="w-full"
              >
                Volver al Inicio
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Si no requiere autenticación, mostrar contenido
  if (!requireAuth) {
    return <>{children}</>
  }

  // Si no hay usuario después de la verificación
  if (!isAuthenticated || !user) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Requerido</h2>
            <p className="text-gray-600 mb-6">
              Necesitas iniciar sesión para acceder a esta página
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push("/auth/login")}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push("/auth/register")}
                className="w-full"
              >
                Registrarse
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push("/")}
                className="w-full"
              >
                Volver al Inicio
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Usuario autenticado, mostrar contenido
  console.log('🎉 AuthGuard - Renderizando contenido protegido')
  return <>{children}</>
} 