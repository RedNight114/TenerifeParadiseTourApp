"use client"

import { useEffect, useState, useRef } from "react"
import type { User } from "@supabase/supabase-js"
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
        console.log("🚀 Inicializando autenticación...")
        
        const client = getSupabaseClient()
        const { data: { session } } = await client.auth.getSession()
        
        if (!mounted.current) return

        setUser(session?.user ?? null)

        if (session?.user) {
          console.log("👤 Usuario autenticado:", session.user.id)
          
          // Obtener perfil
          const { data: profileData } = await client
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle()
          
          if (profileData && mounted.current) {
            setProfile(profileData)
            console.log("✅ Perfil cargado:", profileData.full_name)
          }
        } else {
          console.log("👤 No hay sesión activa")
        }
      } catch (error) {
        console.error("❌ Error en inicialización:", error)
      } finally {
        if (mounted.current) {
          setLoading(false)
          console.log("✅ Estados de carga establecidos en false")
        }
      }
    }

    initAuth()

    // Listener de cambios de auth
    const client = getSupabaseClient()
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted.current) return
        
        console.log("🔄 Cambio de autenticación:", event, session?.user?.id)
        
        setUser(session?.user ?? null)
        setAuthError(null)

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
        } else {
          setProfile(null)
        }
        
        if (mounted.current) {
          setLoading(false)
          console.log("✅ Estados de carga establecidos en false desde onAuthStateChange")
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
      setLoading(true)
      
      console.log("🔐 Intentando login con:", email)
      
      const client = getSupabaseClient()
      const { data, error } = await client.auth.signInWithPassword({ email, password })
      
      if (error) {
        console.error("Error en signIn:", error)
        setAuthError(error.message)
        setLoading(false)
        return { data: null, error }
      }

      if (data?.user) {
        console.log("✅ Login exitoso")
        setUser(data.user)
        
        // Obtener perfil
        const { data: profileData } = await client
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle()
        
        if (profileData && mounted.current) {
          setProfile(profileData)
        }
        
        setLoading(false)
      }

      return { data, error: null }
    } catch (error) {
      console.error("Error en signIn:", error)
      setAuthError(error instanceof Error ? error.message : 'Error en el inicio de sesión')
      setLoading(false)
      throw error
    }
  }

  const signInWithProvider = async (provider: 'google' | 'facebook') => {
    try {
      setAuthError(null)
      setLoading(true)
      
      console.log(`🔐 Intentando login con ${provider}...`)
      
      const client = getSupabaseClient()
      const { data, error } = await client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })
      
      if (error) {
        console.error(`Error en signInWith${provider}:`, error)
        setAuthError(error.message)
        setLoading(false)
        return { data: null, error }
      }

      console.log(`✅ Login con ${provider} iniciado`)
      return { data, error: null }
    } catch (error) {
      console.error(`Error en signInWith${provider}:`, error)
      setAuthError(error instanceof Error ? error.message : `Error al iniciar sesión con ${provider}`)
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setAuthError(null)
      setLoading(true)
      
      console.log("📝 Intentando registro con:", email)
      
      const client = getSupabaseClient()
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })
      
      if (error) {
        console.error("Error en signUp:", error)
        setAuthError(error.message)
        setLoading(false)
        return { data: null, error }
      }

      if (data?.user) {
        console.log("✅ Registro exitoso")
        
        // Crear perfil automáticamente
        const { error: profileError } = await client
          .from("profiles")
          .insert([
            {
              id: data.user.id,
              full_name: fullName,
              email: email,
              role: 'user'
            }
          ])
        
        if (profileError) {
          console.error("Error creando perfil:", profileError)
        }
        
        setUser(data.user)
        setLoading(false)
      }

      return { data, error: null }
    } catch (error) {
      console.error("Error en signUp:", error)
      setAuthError(error instanceof Error ? error.message : 'Error en el registro')
      setLoading(false)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setAuthError(null)
      setLoading(true)
      
      console.log("🔑 Intentando reset de contraseña para:", email)
      
      const client = getSupabaseClient()
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) {
        console.error("Error en resetPassword:", error)
        setAuthError(error.message)
        setLoading(false)
        return { error }
      }

      console.log("✅ Email de reset enviado")
      setLoading(false)
      return { error: null }
    } catch (error) {
      console.error("Error en resetPassword:", error)
      setAuthError(error instanceof Error ? error.message : 'Error al enviar email de reset')
      setLoading(false)
      throw error
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setAuthError(null)
      setLoading(true)
      
      if (!user) {
        throw new Error('No hay usuario autenticado')
      }
      
      console.log("📝 Actualizando perfil...")
      
      const client = getSupabaseClient()
      const { data, error } = await client
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single()
      
      if (error) {
        console.error("Error en updateProfile:", error)
        setAuthError(error.message)
        setLoading(false)
        return { data: null, error }
      }

      if (data && mounted.current) {
        setProfile(data)
        console.log("✅ Perfil actualizado")
      }
      
      setLoading(false)
      return { data, error: null }
    } catch (error) {
      console.error("Error en updateProfile:", error)
      setAuthError(error instanceof Error ? error.message : 'Error al actualizar perfil')
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    try {
      setAuthError(null)
      const client = getSupabaseClient()
      await client.auth.signOut()
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error("Error en signOut:", error)
      setAuthError(error instanceof Error ? error.message : 'Error al cerrar sesión')
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
    signInWithProvider,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  }
} 