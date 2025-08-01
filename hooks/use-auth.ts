"use client"

import { useEffect, useState, useRef, useCallback } from "react"
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
  
  const mounted = useRef(true)

  // Función para cargar perfil
  const loadProfile = useCallback(async (userId: string) => {
    try {
      console.log('🔄 Cargando perfil para usuario:', userId)
      
      const client = getSupabaseClient()
      const { data, error: profileError } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!mounted.current) return

      if (profileError) {
        console.error('❌ Error cargando perfil:', profileError)
        setProfile(null)
      } else {
        console.log('✅ Perfil cargado exitosamente:', data.full_name)
        setProfile(data)
      }
    } catch (err) {
      if (!mounted.current) return
      console.error('❌ Error cargando perfil:', err)
      setProfile(null)
    }
  }, [])

  // Inicialización de autenticación
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🚀 Inicializando autenticación...')
        setLoading(true)
        setError(null)

        const client = getSupabaseClient()
        const { data: { session } } = await client.auth.getSession()

        if (!mounted.current) return

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          console.log('👤 Usuario autenticado:', currentUser.id)
          await loadProfile(currentUser.id)
        } else {
          console.log('👤 No hay sesión activa')
        }
      } catch (err) {
        if (!mounted.current) return
        console.error('❌ Error inicializando auth:', err)
        setError(err instanceof Error ? err.message : 'Error de autenticación')
      } finally {
        if (mounted.current) {
          setLoading(false)
          console.log('✅ Inicialización completada')
        }
      }
    }

    initAuth()

    // Listener de cambios de autenticación
    const client = getSupabaseClient()
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted.current) return
        
        console.log('🔄 Cambio de autenticación:', event, session?.user?.id)
        
        const currentUser = session?.user ?? null
        setUser(currentUser)
        setError(null)

        if (currentUser) {
          await loadProfile(currentUser.id)
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
  }, [loadProfile])

  // Función de login
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      
      console.log('🔐 Intentando login:', email)
      
      const client = getSupabaseClient()
      const { data, error: signInError } = await client.auth.signInWithPassword({ 
        email, 
        password 
      })
      
      if (signInError) {
        console.error('❌ Error en login:', signInError)
        setError(signInError.message)
        setLoading(false)
        return { data: null, error: signInError }
      }

      if (data?.user) {
        console.log('✅ Login exitoso')
        setUser(data.user)
        await loadProfile(data.user.id)
      }

      setLoading(false)
      return { data, error: null }
    } catch (err) {
      console.error('❌ Error en login:', err)
      const message = err instanceof Error ? err.message : 'Error en el login'
      setError(message)
      setLoading(false)
      return { data: null, error: { message } }
    }
  }, [loadProfile])

  // Función de registro
  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      setError(null)
      setLoading(true)
      
      console.log('📝 Intentando registro:', email)
      
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
        console.error('❌ Error en registro:', signUpError)
        setError(signUpError.message)
        setLoading(false)
        return { data: null, error: signUpError }
      }

      console.log('✅ Registro exitoso')
      setLoading(false)
      return { data, error: null }
    } catch (err) {
      console.error('❌ Error en registro:', err)
      const message = err instanceof Error ? err.message : 'Error en el registro'
      setError(message)
      setLoading(false)
      return { data: null, error: { message } }
    }
  }, [])

  // Función de logout
  const signOut = useCallback(async () => {
    try {
      console.log('🚪 Cerrando sesión...')
      const client = getSupabaseClient()
      await client.auth.signOut()
      setUser(null)
      setProfile(null)
      setError(null)
      console.log('✅ Sesión cerrada')
    } catch (err) {
      console.error('❌ Error en logout:', err)
      setError(err instanceof Error ? err.message : 'Error al cerrar sesión')
    }
  }, [])

  return {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: profile?.role === "admin",
    signIn,
    signUp,
    signOut,
  }
} 