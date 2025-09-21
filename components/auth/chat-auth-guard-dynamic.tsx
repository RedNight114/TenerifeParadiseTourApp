"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ChatAuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ChatAuthGuardDynamic({ children, fallback }: ChatAuthGuardProps) {
  const { user, isInitialized, isSessionValid } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Asegurar que solo se ejecute en el cliente después de montar
  useEffect(() => {
    setMounted(true)
  }, [])

  // No renderizar nada hasta que esté montado en el cliente
  if (!mounted) {
    return null
  }

  // Mostrar loading mientras se inicializa
  if (!isInitialized) {
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
