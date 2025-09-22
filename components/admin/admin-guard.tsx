"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Shield, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AdminGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const { user, isLoading: authLoading, isInitialized } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasCheckedRef = useRef(false)

  useEffect(() => {
    // Evitar múltiples verificaciones simultáneas
    if (hasCheckedRef.current) return

    const checkAuth = async () => {
      try {
        setIsChecking(true)
        setError(null)

        // Esperar a que termine la carga de autenticación
        if (authLoading || !isInitialized) {
          console.log('AdminGuard: Esperando inicialización de auth...')
          return
        }

        // Si no hay usuario, redirigir al login
        if (!user) {
          console.log('AdminGuard: No hay usuario, redirigiendo al login')
          router.push("/auth/login")
          return
        }

        // Si llegamos aquí, el middleware ya verificó que es admin
        // Solo necesitamos verificar que hay un usuario autenticado
        console.log('AdminGuard: Usuario autenticado, middleware ya verificó admin')
        setIsAuthorized(true)
        hasCheckedRef.current = true
        
      } catch (err) {
        console.error('AdminGuard: Error en verificación:', err)
        setError('Error al verificar permisos')
        router.push("/auth/login")
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [user, authLoading, isInitialized, router])

  // Mostrar loading mientras se verifica
  if (isChecking || authLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0061A8] via-[#1E40AF] to-[#F4C762] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-[#0061A8]" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">
              Verificando Acceso
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Verificando permisos de administrador...
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Shield className="h-4 w-4" />
              <span>Validando credenciales</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mostrar error si hay uno
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0061A8] via-[#1E40AF] to-[#F4C762] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">
              Acceso Denegado
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push("/auth/login")}
              className="w-full bg-[#0061A8] text-white py-2 px-4 rounded-lg hover:bg-[#0056a3] transition-colors"
            >
              Ir al Login
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mostrar contenido si está autorizado
  if (isAuthorized) {
    return <>{children}</>
  }

  // Fallback por defecto
  return fallback || (
    <div className="min-h-screen bg-gradient-to-br from-[#0061A8] via-[#1E40AF] to-[#F4C762] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="text-center py-8">
          <p className="text-gray-600">Redirigiendo...</p>
        </CardContent>
      </Card>
    </div>
  )
}