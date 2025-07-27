"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase-optimized"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Inicialización simple
  useEffect(() => {
    const initAuth = async () => {
      try {
        const client = getSupabaseClient()
        const { data: { session } } = await client.auth.getSession()
        setUser(session?.user ?? null)
      } catch (err) {
        console.error("Error inicializando auth:", err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listener simple
    const client = getSupabaseClient()
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
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
      setLoading(false)
      return { data, error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error en el login'
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
    } catch (err) {
      console.error("Error en signOut:", err)
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signIn,
    signOut,
  }
} 