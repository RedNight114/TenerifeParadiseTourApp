"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from './auth-provider'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  redirectTo?: string
}

export function AuthGuard({ 
  children, 
  requireAuth = false, 
  requireAdmin = false, 
  redirectTo = '/auth/login' 
}: AuthGuardProps) {
  const { user, profile, loading, isInitialized, isAuthenticated, isAdmin } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    // No hacer nada si aún no se ha inicializado
    if (!isInitialized || loading) {
      return
    }

    // Si requiere autenticación y no está autenticado
    if (requireAuth && !isAuthenticated) {
router.push(redirectTo)
      return
    }

    // Si requiere admin y no es admin
    if (requireAdmin && !isAdmin) {
router.push('/')
      return
    }

    // Si está autenticado y está en la página de login, redirigir al dashboard
    if (isAuthenticated && redirectTo === '/auth/login') {
router.push('/dashboard')
      return
    }
  }, [isInitialized, loading, isAuthenticated, isAdmin, requireAuth, requireAdmin, redirectTo, router])

  // Si requiere autenticación y no está autenticado, mostrar contenido de carga
  if (requireAuth && !isAuthenticated && isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verificando acceso</h2>
          <p className="text-gray-600">Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  // Si requiere admin y no es admin, mostrar contenido de carga
  if (requireAdmin && !isAdmin && isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a esta página</p>
        </div>
      </div>
    )
  }

  // Mostrar loading mientras se inicializa
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verificando permisos</h2>
          <p className="text-gray-600">Validando acceso...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

