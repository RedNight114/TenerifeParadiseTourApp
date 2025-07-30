"use client"

import React, { useEffect, useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider-ultra-simple"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean
}

// Memoizar el componente para evitar re-renders innecesarios
export const AuthGuard = React.memo(({ children, fallback, requireAuth = true }: AuthGuardProps) => {
  const { user, profile, loading, authError, isAuthenticated } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Si aún está cargando, esperar
    if (loading) {
      return
    }

    // Si no requiere autenticación, mostrar contenido
    if (!requireAuth) {
      return
    }

    // Si está autenticado, mostrar contenido
    if (isAuthenticated) {
      return
    }

    // Si no está autenticado, redirigir al login
    router.push("/auth/login")
  }, [loading, isAuthenticated, requireAuth, router])

  // Memoizar el loading component
  const loadingComponent = useMemo(() => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Cargando...</h2>
        <p className="text-gray-600">Por favor, espera un momento...</p>
      </div>
    </div>
  ), [])

  // Memoizar el error component
  const errorComponent = useMemo(() => (
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
  ), [authError, router])

  // Mostrar loading mientras verifica
  if (isChecking || loading) {
    return loadingComponent
  }

  // Mostrar error de autenticación
  if (authError) {
    return errorComponent
  }

  // Si no requiere autenticación, mostrar contenido
  if (!requireAuth) {
    return <>{children}</>
  }

  // Si no hay usuario después de la verificación
  if (!user) {
    if (fallback) {
      return <>{fallback}</>
    }

    return loadingComponent
  }

  // Usuario autenticado, mostrar contenido
  return <>{children}</>
})

AuthGuard.displayName = 'AuthGuard'
