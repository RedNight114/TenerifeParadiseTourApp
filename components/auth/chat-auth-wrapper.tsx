"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/auth-provider'
import { LoadingPlaceholder } from './loading-placeholder'

interface ChatAuthWrapperProps {
  children: React.ReactNode
}

export function ChatAuthWrapper({ children }: ChatAuthWrapperProps) {
  const { user, isAuthenticated, isInitialized } = useAuthContext()
  const router = useRouter()

  // Redirigir si no está autenticado
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/auth/login?redirect=/chat')
    }
  }, [isInitialized, isAuthenticated, router])

  return (
    <LoadingPlaceholder>
      {/* Si no está inicializado, mostrar loading */}
      {!isInitialized ? (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0061A8] via-[#1E40AF] to-[#F4C762]">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-3"></div>
            <h2 className="text-base font-bold mb-2">Verificando sesión</h2>
            <p className="text-xs opacity-90">Por favor, espera un momento...</p>
          </div>
        </div>
      ) : !isAuthenticated ? (
        // Si no está autenticado, mostrar mensaje de error
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0061A8] via-[#1E40AF] to-[#F4C762]">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Acceso denegado
            </h2>
            <p className="text-gray-600 mb-6">
              Necesitas iniciar sesión para acceder al chat.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/auth/login?redirect=/chat')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Iniciar Sesión
              </button>
              <button 
                onClick={() => router.push('/')}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Si está autenticado, mostrar el contenido del chat
        children
      )}
    </LoadingPlaceholder>
  )
}
