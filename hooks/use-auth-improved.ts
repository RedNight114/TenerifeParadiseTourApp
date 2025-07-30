"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase-optimized"
import type { Profile } from "@/lib/supabase"

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  authError: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isInitialized: boolean
}

export function useAuthImproved() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    authError: null,
    isAuthenticated: false,
    isAdmin: false,
    isInitialized: false
  })
  
  const mounted = useRef(true)
  const initTimeout = useRef<NodeJS.Timeout | null>(null)
  const authTimeout = useRef<NodeJS.Timeout | null>(null)
  const retryCount = useRef(0)
  const maxRetries = 3

  // Función para limpiar timeouts
  const clearTimeouts = useCallback(() => {
    if (initTimeout.current) {
      clearTimeout(initTimeout.current)
      initTimeout.current = null
    }
    if (authTimeout.current) {
      clearTimeout(authTimeout.current)
      authTimeout.current = null
    }
  }, [])

  // Función para actualizar estado de forma segura
  const updateState = useCallback((updates: Partial<AuthState>) => {
    if (mounted.current) {
      setState(prev => ({
        ...prev,
        ...updates,
        isAuthenticated: !!updates.user || (updates.user === null ? false : prev.isAuthenticated),
        isAdmin: updates.profile?.role === "admin" || (updates.profile === null ? false : prev.isAdmin)
      }))
    }
  }, [])

  // Función para manejar errores de autenticación
  const handleAuthError = useCallback((error: any, context: string) => {
    console.error(`❌ Error de autenticación en ${context}:`, error)
    const errorMessage = error instanceof Error ? error.message : 'Error de autenticación'
    
    updateState({
      authError: errorMessage,
      loading: false,
      isInitialized: true
    })
  }, [updateState])

  // Función para cargar perfil
  const loadProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const client = getSupabaseClient()
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle()
      
      if (error) {
        console.warn("⚠️ Error cargando perfil:", error)
        return null
      }
      
      return data
    } catch (error) {
      console.warn("⚠️ Error cargando perfil:", error)
      return null
    }
  }, [])

  // Función para inicializar autenticación
  const initializeAuth = useCallback(async () => {
    if (!mounted.current) return

    console.log("🚀 Inicializando autenticación...")
    updateState({ loading: true, authError: null })

    try {
      const client = getSupabaseClient()
      
      // Timeout para getSession
      const sessionPromise = client.auth.getSession()
      const timeoutPromise = new Promise((_, reject) => {
        initTimeout.current = setTimeout(() => {
          reject(new Error('Timeout al obtener sesión'))
        }, 10000)
      })

      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any
      
      if (!mounted.current) return

      if (session?.user) {
        console.log("👤 Usuario autenticado:", session.user.id)
        updateState({ user: session.user })
        
        // Cargar perfil con timeout
        try {
          const profilePromise = loadProfile(session.user.id)
          const profileTimeoutPromise = new Promise((_, reject) => {
            authTimeout.current = setTimeout(() => {
              reject(new Error('Timeout al cargar perfil'))
            }, 8000)
          })

          const profile = await Promise.race([profilePromise, profileTimeoutPromise]) as Profile | null
          
          if (mounted.current) {
            updateState({ 
              profile, 
              loading: false, 
              isInitialized: true,
              authError: null 
            })
            console.log("✅ Autenticación inicializada correctamente")
          }
        } catch (profileError) {
          console.warn("⚠️ Error cargando perfil, continuando sin perfil")
          if (mounted.current) {
            updateState({ 
              profile: null, 
              loading: false, 
              isInitialized: true,
              authError: null 
            })
          }
        }
      } else {
        console.log("👤 No hay sesión activa")
        if (mounted.current) {
          updateState({ 
            user: null, 
            profile: null, 
            loading: false, 
            isInitialized: true,
            authError: null 
          })
        }
      }
    } catch (error) {
      handleAuthError(error, 'inicialización')
    } finally {
      clearTimeouts()
    }
  }, [updateState, loadProfile, handleAuthError, clearTimeouts])

  // Inicialización única
  useEffect(() => {
    initializeAuth()

    // Listener de cambios de auth
    const client = getSupabaseClient()
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted.current) return
        
        console.log("🔄 Cambio de autenticación:", event, session?.user?.id)
        
        // Limpiar timeouts anteriores
        clearTimeouts()
        
        // Resetear contador de reintentos
        retryCount.current = 0
        
        if (session?.user) {
          updateState({ user: session.user, authError: null })
          
          // Cargar perfil
          try {
            const profile = await loadProfile(session.user.id)
            if (mounted.current) {
              updateState({ 
                profile, 
                loading: false,
                authError: null 
              })
            }
          } catch (error) {
            console.warn("⚠️ Error cargando perfil en cambio de estado:", error)
            if (mounted.current) {
              updateState({ 
                profile: null, 
                loading: false,
                authError: null 
              })
            }
          }
        } else {
          updateState({ 
            user: null, 
            profile: null, 
            loading: false,
            authError: null 
          })
        }
      }
    )

    return () => {
      mounted.current = false
      clearTimeouts()
      subscription.unsubscribe()
    }
  }, [initializeAuth, updateState, loadProfile, clearTimeouts])

  // Función para forzar reinicialización
  const forceReinitialize = useCallback(async () => {
    console.log("🔄 Forzando reinicialización de autenticación...")
    retryCount.current = 0
    await initializeAuth()
  }, [initializeAuth])

  // Función para resetear estado
  const resetAuthState = useCallback(() => {
    console.log("🔄 Reseteando estado de autenticación...")
    updateState({
      user: null,
      profile: null,
      loading: false,
      authError: null,
      isAuthenticated: false,
      isAdmin: false,
      isInitialized: true
    })
  }, [updateState])

  const signIn = async (email: string, password: string) => {
    try {
      updateState({ authError: null, loading: true })
      
      console.log("🔐 Intentando login con:", email)
      
      const client = getSupabaseClient()
      const { data, error } = await client.auth.signInWithPassword({ email, password })
      
      if (error) {
        console.error("Error en signIn:", error)
        updateState({ authError: error.message, loading: false })
        return { data: null, error }
      }

      if (data?.user) {
        console.log("✅ Login exitoso")
        updateState({ user: data.user, loading: false })
        
        // El perfil se cargará automáticamente en onAuthStateChange
      }

      return { data, error: null }
    } catch (error) {
      handleAuthError(error, 'signIn')
      throw error
    }
  }

  const signOut = async () => {
    try {
      updateState({ authError: null })
      const client = getSupabaseClient()
      await client.auth.signOut()
      updateState({ user: null, profile: null })
    } catch (error) {
      handleAuthError(error, 'signOut')
    }
  }

  return {
    ...state,
    signIn,
    signOut,
    forceReinitialize,
    resetAuthState,
  }
} 