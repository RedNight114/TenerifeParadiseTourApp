"use client"

import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'

interface AuthContextType {
  user: any
  profile: any
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isInitialized: boolean
  signIn: (email: string, password: string) => Promise<{ data: any; error: string | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error: string | null }>
  signOut: () => Promise<{ success: boolean; error: string | null }>
  signInWithProvider?: (provider: 'google' | 'github') => Promise<void>
  resendVerificationEmail?: () => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Componente de carga sutil que no bloquea el renderizado
function AuthLoadingIndicator() {
  return (
    <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      <span className="text-sm font-medium">Inicializando...</span>
    </div>
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)
  const auth = useAuth()

  // Asegurar que solo se ejecute en el cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Memoizar el contexto
  const contextValue = useMemo(() => ({
    user: auth.user,
    profile: auth.profile,
    loading: auth.isLoading,
    error: auth.error,
    isAuthenticated: !!auth.user,
    isAdmin: auth.profile?.role === 'admin',
    isInitialized: auth.isInitialized,
    signIn: auth.login,
    signUp: auth.register,
    signOut: auth.logout,
    signInWithProvider: auth.loginWithProvider,
    resendVerificationEmail: auth.resendVerificationEmail,
  }), [
    auth.user,
    auth.profile,
    auth.isLoading,
    auth.error,
    auth.isInitialized,
    auth.login,
    auth.register,
    auth.logout,
    auth.loginWithProvider,
    auth.resendVerificationEmail,
  ])

  // Renderizar un placeholder durante SSR para evitar hidratación
  if (!isClient) {
    return (
      <AuthContext.Provider value={contextValue}>
        <div className="min-h-screen bg-gradient-to-br from-[#0061A8] via-[#1E40AF] to-[#F4C762] flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-3"></div>
            <h2 className="text-base font-bold mb-2">Cargando...</h2>
            <p className="text-xs opacity-90">Inicializando aplicación</p>
          </div>
        </div>
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {/* Mostrar indicador de carga sutil si no está inicializado */}
      {!auth.isInitialized && <AuthLoadingIndicator />}
      
      {/* Siempre renderizar el contenido principal */}
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext debe ser usado dentro de un AuthProvider')
  }
  return context
} 