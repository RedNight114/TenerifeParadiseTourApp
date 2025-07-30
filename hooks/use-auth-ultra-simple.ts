"use client"

import { useEffect, useState, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase-optimized"

interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  phone?: string
  role: "user" | "admin"
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isInitialized: boolean
}

export function useAuthUltraSimple() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
    isAuthenticated: false,
    isAdmin: false,
    isInitialized: false
  })

  // Función para actualizar estado de forma segura
  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => ({
      ...prev,
      ...updates,
      isAuthenticated: !!updates.user || (updates.user === null ? false : prev.isAuthenticated),
      isAdmin: updates.profile?.role === "admin" || (updates.profile === null ? false : prev.isAdmin)
    }))
  }, [])

  // Función para cargar perfil con timeout
  const loadProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      // Cargando perfil para usuario
      
      const client = getSupabaseClient()
      
      // Timeout de 5 segundos para cargar perfil
      const profilePromise = client
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle()
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout cargando perfil')), 5000)
      })

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any
      
      if (error) {
        // Error cargando perfil
        return null
      }
      
      // Perfil cargado exitosamente
      return data
    } catch (error) {
      // Error cargando perfil (timeout o error)
      return null
    }
  }, [])

  // Inicialización simple y rápida
  useEffect(() => {
    let mounted = true
    let initTimeout: NodeJS.Timeout

    const initializeAuth = async () => {
      try {
        // Inicializando autenticación ultra simple
        
        const client = getSupabaseClient()
        
        // Timeout de 8 segundos para getSession
        const sessionPromise = client.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => {
          initTimeout = setTimeout(() => reject(new Error('Timeout obteniendo sesión')), 8000)
        })

        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any
        
        if (!mounted) return

        if (session?.user) {
          // Usuario autenticado encontrado
          updateState({ user: session.user })
          
          // Intentar cargar perfil pero no bloquear si falla
          try {
            const profile = await loadProfile(session.user.id)
            if (mounted) {
              updateState({ 
                profile, 
                loading: false, 
                isInitialized: true,
                error: null 
              })
            }
          } catch (profileError) {
            // Perfil no se pudo cargar, continuando sin perfil
            if (mounted) {
              updateState({ 
                profile: null, 
                loading: false, 
                isInitialized: true,
                error: null 
              })
            }
          }
        } else {
          // No hay sesión activa
          if (mounted) {
            updateState({ 
              user: null, 
              profile: null, 
              loading: false, 
              isInitialized: true,
              error: null 
            })
          }
        }
      } catch (error) {
        // Error en inicialización
        if (mounted) {
          updateState({ 
            loading: false, 
            isInitialized: true,
            error: 'Error de conexión' 
          })
        }
      } finally {
        if (initTimeout) clearTimeout(initTimeout)
      }
    }

    initializeAuth()

    // Listener de cambios de auth (simplificado)
    const client = getSupabaseClient()
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        // Cambio de autenticación detectado
        
        if (session?.user) {
          updateState({ user: session.user, error: null })
          
          // Cargar perfil en background
          try {
            const profile = await loadProfile(session.user.id)
            if (mounted) {
              updateState({ profile, loading: false })
            }
          } catch (error) {
            // Error cargando perfil en cambio de estado
            if (mounted) {
              updateState({ profile: null, loading: false })
            }
          }
        } else {
          updateState({ 
            user: null, 
            profile: null, 
            loading: false,
            error: null 
          })
        }
      }
    )

    return () => {
      mounted = false
      if (initTimeout) clearTimeout(initTimeout)
      subscription.unsubscribe()
    }
  }, [updateState, loadProfile])

  // Funciones de autenticación
  const signIn = async (email: string, password: string) => {
    try {
      updateState({ error: null, loading: true })
      
      // Intentando login
      
      const client = getSupabaseClient()
      const { data, error } = await client.auth.signInWithPassword({ email, password })
      
      if (error) {
        // Error en signIn
        updateState({ error: error.message, loading: false })
        return { data: null, error }
      }

      if (data?.user) {
        // Login exitoso
        updateState({ user: data.user, loading: false })
        // El perfil se cargará automáticamente en onAuthStateChange
      }

      return { data, error: null }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error en el login'
      updateState({ error: message, loading: false })
      return { data: null, error: { message } }
    }
  }

  const signOut = async () => {
    try {
      updateState({ error: null })
      const client = getSupabaseClient()
      await client.auth.signOut()
      updateState({ user: null, profile: null })
    } catch (error) {
      // Error en signOut
    }
  }

  const forceReinitialize = async () => {
    // Forzando reinicialización
    updateState({ loading: true, error: null })
    
    try {
      const client = getSupabaseClient()
      const { data: { session } } = await client.auth.getSession()
      
      if (session?.user) {
        updateState({ user: session.user })
        const profile = await loadProfile(session.user.id)
        updateState({ profile, loading: false, isInitialized: true })
      } else {
        updateState({ 
          user: null, 
          profile: null, 
          loading: false, 
          isInitialized: true 
        })
      }
    } catch (error) {
      // Error en reinicialización
      updateState({ 
        loading: false, 
        isInitialized: true,
        error: 'Error de reinicialización' 
      })
    }
  }

  const resetAuthState = () => {
    // Reseteando estado de autenticación
    updateState({
      user: null,
      profile: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      isAdmin: false,
      isInitialized: true
    })
  }

  return {
    ...state,
    signIn,
    signOut,
    forceReinitialize,
    resetAuthState,
  }
} 