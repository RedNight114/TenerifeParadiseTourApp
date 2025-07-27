"use client"

import { useEffect, useState, useRef } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase-optimized"
import type { Profile } from "@/lib/supabase"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const mounted = useRef(true)
  const initialized = useRef(false)

  // Inicialización única
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const initAuth = async () => {
      try {
        const client = getSupabaseClient()
        const { data: { session } } = await client.auth.getSession()
        
        if (mounted.current) {
          setUser(session?.user ?? null)
          
          if (session?.user) {
            // Obtener perfil
            const { data: profileData } = await client
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .maybeSingle()
            
            if (profileData && mounted.current) {
              setProfile(profileData)
            }
          }
          
          setLoading(false)
        }
      } catch (error) {
        console.error("Error inicializando auth:", error)
        if (mounted.current) {
          setLoading(false)
        }
      }
    }

    initAuth()

    // Listener de cambios de auth
    const client = getSupabaseClient()
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted.current) return
        
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const { data: profileData } = await client
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle()
          
          if (profileData && mounted.current) {
            setProfile(profileData)
          }
        } else {
          setProfile(null)
        }
        
        if (mounted.current) {
          setLoading(false)
        }
      }
    )

    return () => {
      mounted.current = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setAuthError(null)
      const client = getSupabaseClient()
      const { data, error } = await client.auth.signInWithPassword({ email, password })
      
      if (error) {
        setAuthError(error.message)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error en el login'
      setAuthError(message)
      return { data: null, error: { message } }
    }
  }

  const signOut = async () => {
    try {
      const client = getSupabaseClient()
      await client.auth.signOut()
    } catch (error) {
      console.error("Error en signOut:", error)
    }
  }

  const isAuthenticated = !!user
  const isAdmin = profile?.role === "admin"

  return {
    user,
    profile,
    loading,
    authError,
    isAuthenticated,
    isAdmin,
    signIn,
    signOut,
  }
} 