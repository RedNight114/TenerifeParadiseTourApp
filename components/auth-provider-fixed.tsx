"use client"

import React, { createContext, useContext, useMemo } from 'react'
import { useAuthFixed } from '@/hooks/use-auth-fixed'

interface AuthContextType {
  user: any
  profile: any
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, fullName: string) => Promise<any>
  signOut: () => Promise<void>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProviderFixed({ children }: { children: React.ReactNode }) {
  const auth = useAuthFixed()

  // Memoizar el contexto para evitar re-renders innecesarios
  const contextValue = useMemo(() => ({
    user: auth.user,
    profile: auth.profile,
    loading: auth.loading,
    error: auth.error,
    isAuthenticated: auth.isAuthenticated,
    isAdmin: auth.isAdmin,
    signIn: auth.signIn,
    signUp: auth.signUp,
    signOut: auth.signOut,
    refreshAuth: auth.refreshAuth,
  }), [
    auth.user,
    auth.profile,
    auth.loading,
    auth.error,
    auth.isAuthenticated,
    auth.isAdmin,
    auth.signIn,
    auth.signUp,
    auth.signOut,
    auth.refreshAuth,
  ])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContextFixed() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContextFixed must be used within an AuthProviderFixed')
  }
  return context
} 