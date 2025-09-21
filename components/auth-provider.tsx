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
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, fullName: string) => Promise<any>
  signOut: () => Promise<any>
  signInWithProvider: (provider: 'google' | 'github') => Promise<any>
  resendVerificationEmail: () => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  const [isClient, setIsClient] = useState(false)

  // Evitar problemas de hidratación
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

  // Renderizar contenido solo en el cliente para evitar problemas de hidratación
  if (!isClient) {
    return (
      <AuthContext.Provider value={contextValue}>
        <div suppressHydrationWarning>
          {children}
        </div>
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}