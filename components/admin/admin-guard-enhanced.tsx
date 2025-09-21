"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Shield, AlertTriangle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AdminGuardEnhancedProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireRole?: string
}

export function AdminGuardEnhanced({ 
  children, 
  fallback, 
  requireRole = "admin" 
}: AdminGuardEnhancedProps) {
  const { user, profile, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasCheckedRef = useRef(false)

  useEffect(() => {
    // Evitar múltiples verificaciones
    if (hasCheckedRef.current) return

    const checkAuth = async () => {
      try {
        setIsChecking(true)
        setError(null)

        // Esperar a que termine la carga de autenticación
        if (authLoading) {
          return
        }

        // Si no hay usuario, redirigir al login
        if (!user) {
          router.push("/admin/login")
          return
        }

        // Si hay usuario pero no hay perfil, esperar un poco más
        if (!profile) {
          // Timeout de 3 segundos para cargar el perfil
          checkTimeoutRef.current = setTimeout(() => {
            if (!profile) {
              router.push("/admin/login")
            }
          }, 3000)
          
          return
        }

        // Verificar rol requerido
        if (profile.role !== requireRole) {
          router.push("/")
          return
        }

        // Usuario autorizado
        setIsAuthorized(true)
        setIsChecking(false)
        hasCheckedRef.current = true

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        setIsChecking(false)
      }
    }

    checkAuth()

    // Cleanup
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current)
      }
    }
  }, [user, profile, authLoading, router, requireRole])

  // Mostrar loading mientras se verifica
  if (authLoading || isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Verificando Acceso
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-3" />
              <span className="text-gray-700 font-medium">
                Comprobando permisos de administrador...
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Por favor, espera mientras verificamos tu acceso al panel de administración.
            </p>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-600">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Error de verificación</span>
                </div>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mostrar fallback si no está autorizado
  if (!isAuthorized) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl font-semibold text-red-600">
              Acceso Denegado
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-700 leading-relaxed">
              No tienes permisos para acceder a esta página. 
              Se requiere rol de <strong>{requireRole}</strong>.
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => router.push("/admin/login")}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Ir al Login
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full"
              >
                Volver al Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Renderizar contenido si está autorizado
  return <>{children}</>
}
