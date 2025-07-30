"use client"

import React, { createContext, useContext, useMemo } from 'react'
import { useAuthImproved } from '@/hooks/use-auth-improved'

interface AuthContextType {
  user: any
  profile: any
  loading: boolean
  authError: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isInitialized: boolean
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  forceReinitialize: () => Promise<void>
  resetAuthState: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProviderImproved({ children }: { children: React.ReactNode }) {
  const auth = useAuthImproved()

  // Memoizar el contexto para evitar re-renders innecesarios
  const contextValue = useMemo(() => ({
    user: auth.user,
    profile: auth.profile,
    loading: auth.loading,
    authError: auth.authError,
    isAuthenticated: auth.isAuthenticated,
    isAdmin: auth.isAdmin,
    isInitialized: auth.isInitialized,
    signIn: auth.signIn,
    signOut: auth.signOut,
    forceReinitialize: auth.forceReinitialize,
    resetAuthState: auth.resetAuthState,
  }), [
    auth.user,
    auth.profile,
    auth.loading,
    auth.authError,
    auth.isAuthenticated,
    auth.isAdmin,
    auth.isInitialized,
    auth.signIn,
    auth.signOut,
    auth.forceReinitialize,
    auth.resetAuthState,
  ])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContextImproved() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContextImproved must be used within an AuthProviderImproved')
  }
  return context
} 