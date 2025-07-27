"use client"

import { useEffect, useState } from "react"
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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar perfil del usuario
  const loadProfile = async (userId: string) => {
    try {
      const client = getSupabaseClient()
      const { data, error: profileError } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('Error cargando perfil:', profileError)
        setProfile(null)
      } else {
        console.log('✅ Perfil cargado:', data)
        setProfile(data)
      }
    } catch (err) {
      console.error('Error cargando perfil:', err)
      setProfile(null)
    }
  }

  // Inicialización con carga de perfil
  useEffect(() => {
    const initAuth = async () => {
      try {
        const client = getSupabaseClient()
        const { data: { session } } = await client.auth.getSession()
        const currentUser = session?.user ?? null
        setUser(currentUser)

        // Cargar perfil si hay usuario
        if (currentUser) {
          await loadProfile(currentUser.id)
        }
      } catch (err) {
        console.error("Error inicializando auth:", err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listener con carga de perfil
    const client = getSupabaseClient()
    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        await loadProfile(currentUser.id)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      
      const client = getSupabaseClient()
      const { data, error: signInError } = await client.auth.signInWithPassword({ email, password })
      
      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return { data: null, error: signInError }
      }

      setUser(data.user)

      // Cargar perfil después del login
      if (data.user) {
        await loadProfile(data.user.id)
      }

      setLoading(false)
      return { data, error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error en el login'
      setError(message)
      setLoading(false)
      return { data: null, error: { message } }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setError(null)
      setLoading(true)
      
      const client = getSupabaseClient()
      const { data, error: signUpError } = await client.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })
      
      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return { data: null, error: signUpError }
      }

      setLoading(false)
      return { data, error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error en el registro'
      setError(message)
      setLoading(false)
      return { data: null, error: { message } }
    }
  }

  const signOut = async () => {
    try {
      const client = getSupabaseClient()
      await client.auth.signOut()
      setUser(null)
      setProfile(null)
    } catch (err) {
      console.error("Error en signOut:", err)
    }
  }

  return {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
  }
} 