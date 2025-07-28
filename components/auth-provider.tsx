"use client"

import React, { createContext, useContext, useMemo, useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'

interface AuthContextType {
  user: any
  profile: any
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, fullName: string) => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()

  // Memoizar el contexto para evitar re-renders innecesarios
  const contextValue = useMemo(() => ({
    user: auth.user,
    profile: auth.profile,
    loading: auth.loading,
    error: auth.error,
    isAuthenticated: auth.isAuthenticated,
    signIn: auth.signIn,
    signUp: auth.signUp,
    signOut: auth.signOut,
  }), [
    auth.user,
    auth.profile,
    auth.loading,
    auth.error,
    auth.isAuthenticated,
    auth.signIn,
    auth.signUp,
    auth.signOut,
  ])

  // Memoizar el componente para evitar re-renders
  const memoizedChildren = useMemo(() => children, [children])

  return (
    <AuthContext.Provider value={contextValue}>
      {memoizedChildren}
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
