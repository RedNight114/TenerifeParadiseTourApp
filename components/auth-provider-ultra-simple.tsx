"use client"

import { createContext, useContext, ReactNode } from 'react'
import { useAuthUltraSimple } from '@/hooks/use-auth-ultra-simple'

// Crear contexto de autenticación
const AuthContext = createContext<ReturnType<typeof useAuthUltraSimple> | undefined>(undefined)

// Hook para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProviderUltraSimple')
  }
  return context
}

// Props del provider
interface AuthProviderUltraSimpleProps {
  children: ReactNode
}

// Provider principal
export function AuthProviderUltraSimple({ children }: AuthProviderUltraSimpleProps) {
  const auth = useAuthUltraSimple()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
} 