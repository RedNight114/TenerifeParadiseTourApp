"use client"

import { useEffect, useState, useRef } from "react"
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

        // Verificar si es admin
        if (profile.role !== "admin") {
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
  }, [user, profile, authLoading, router])

  // Mostrar loading mientras se verifica
  if (authLoading || isChecking) {
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
              <span>Comprobando permisos de administrador...</span>
            </div>
            <p className="text-sm text-gray-600">
              Por favor, espera mientras verificamos tu acceso al panel de administración.
            </p>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
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