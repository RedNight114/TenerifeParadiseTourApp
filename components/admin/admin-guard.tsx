"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/components/auth-provider"
import { Loader2, Shield, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AdminGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const { user, profile, loading: authLoading } = useAuthContext()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [checkAttempts, setCheckAttempts] = useState(0)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      // Evitar múltiples verificaciones simultáneas
      if (redirecting) return

      // Esperar a que termine la carga de autenticación
      if (authLoading) {
        return
      }

      // Si no hay usuario, redirigir al login
      if (!user) {
        setRedirecting(true)
        router.push("/admin/login")
        return
      }

      // Si hay usuario pero no hay perfil, esperar con límite de intentos
      if (!profile) {
        if (checkAttempts < 5) {
          setCheckAttempts(prev => prev + 1)
          setTimeout(checkAuth, 1000)
          return
        } else {
          setRedirecting(true)
          router.push("/admin/login")
          return
        }
      }

      // Verificar si es admin
      if (profile.role !== "admin") {
        setRedirecting(true)
        router.push("/")
        return
      }

      // Usuario autorizado
      setIsAuthorized(true)
      setIsChecking(false)
    }

    checkAuth()
  }, [user, profile, authLoading, router, checkAttempts, redirecting])

  // Mostrar loading mientras se verifica
  if (authLoading || isChecking || redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E3A8A] via-[#3B82F6] to-[#1E40AF] flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-[#3B82F6] to-[#1E40AF] rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-xl">Verificando Acceso</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="w-6 h-6 animate-spin text-[#3B82F6] mr-2" />
              <span>
                {redirecting ? 'Redirigiendo...' : 'Comprobando permisos de administrador...'}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {redirecting 
                ? 'Te estamos redirigiendo a la página correspondiente.'
                : 'Por favor, espera mientras verificamos tu acceso al panel de administración.'
              }
            </p>
            {checkAttempts > 0 && !redirecting && (
              <p className="text-xs text-gray-500 mt-2">
                Intento {checkAttempts}/5
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mostrar fallback si no está autorizado
  if (!isAuthorized) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-[#1E3A8A] via-[#3B82F6] to-[#1E40AF] flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-xl text-red-600">Acceso Denegado</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              No tienes permisos para acceder a esta página.
            </p>
            <button
              onClick={() => router.push("/admin/login")}
              className="bg-[#3B82F6] text-white px-4 py-2 rounded-lg hover:bg-[#1E40AF] transition-colors"
            >
              Ir al Login
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Renderizar contenido si está autorizado
  return <>{children}</>
} 