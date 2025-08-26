"use client"

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/components/auth-provider'

interface AuthPageWrapperProps {
  children: React.ReactNode
  showLoading?: boolean
}

export function AuthPageWrapper({ children, showLoading = true }: AuthPageWrapperProps) {
  const [isClient, setIsClient] = useState(false)
  const { loading, isInitialized } = useAuthContext()

  // Asegurar que solo se ejecute en el cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Renderizar un placeholder durante SSR para evitar hidratación
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0061A8] via-[#1E40AF] to-[#F4C762] flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-3"></div>
          <h2 className="text-base font-bold mb-2">Cargando...</h2>
          <p className="text-xs opacity-90">Inicializando aplicación</p>
        </div>
      </div>
    )
  }

  // Mostrar loading si está configurado y el auth no está inicializado
  if (showLoading && (!isInitialized || loading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0061A8] via-[#1E40AF] to-[#F4C762] flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-3"></div>
          <h2 className="text-base font-bold mb-2">Verificando sesión</h2>
          <p className="text-xs opacity-90">Por favor, espera un momento...</p>
        </div>
      </div>
    )
  }

  // Renderizar el contenido real
  return <>{children}</>
} 