"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, MessageCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ChatAuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ChatAuthGuard({ children, fallback }: ChatAuthGuardProps) {
  const { user, isInitialized, isSessionValid } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Asegurar que solo se ejecute en el cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const checkAuth = async () => {
      if (!isInitialized) {
        return
      }

      setIsChecking(false)

      // Si no hay usuario o la sesión no es válida, redirigir al login
      if (!user || !isSessionValid()) {
        router.push('/auth/login?redirect=/chat')
      }
    }

    checkAuth()
  }, [user, isInitialized, isSessionValid, router, isClient])

  // Renderizar un placeholder durante SSR para evitar hidratación
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0061A8] via-[#1E40AF] to-[#F4C762]">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-xl">Cargando chat...</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Inicializando aplicación...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mostrar loading mientras se inicializa
  if (!isInitialized || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0061A8] via-[#1E40AF] to-[#F4C762]">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-xl">Verificando acceso al chat</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Por favor, espera mientras verificamos tu sesión...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si no está autenticado, mostrar mensaje de error
  if (!user || !isSessionValid()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0061A8] via-[#1E40AF] to-[#F4C762]">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl">Acceso denegado</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Necesitas iniciar sesión para acceder al chat.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/auth/login?redirect=/chat')}
                className="w-full"
              >
                Iniciar Sesión
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/')}
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

  // Si está autenticado, mostrar el contenido del chat
  return <>{children}</>
}

// Hook para verificar si el usuario puede acceder al chat
export function useChatAuth() {
  const { user, isInitialized, isSessionValid } = useAuth()
  
  return {
    canAccessChat: isInitialized && !!user && isSessionValid(),
    isChecking: !isInitialized,
    user
  }
}
