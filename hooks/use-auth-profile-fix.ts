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

export function useAuthProfileFix() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  
  // Refs para controlar el estado
  const mounted = useRef(true)
  const initialized = useRef(false)
  const authTimeout = useRef<NodeJS.Timeout | null>(null)
  const profileTimeout = useRef<NodeJS.Timeout | null>(null)
  const profileRetryCount = useRef(0)
  const maxProfileRetries = 3

  // Función para limpiar timeouts
  const clearTimeouts = useCallback(() => {
    if (authTimeout.current) {
      clearTimeout(authTimeout.current)
      authTimeout.current = null
    }
    if (profileTimeout.current) {
      clearTimeout(profileTimeout.current)
      profileTimeout.current = null
    }
  }, [])

  // Función para cargar perfil con retry y timeout
  const loadProfile = useCallback(async (userId: string, retryCount = 0) => {
    try {
      console.log(`🔄 Cargando perfil para usuario: ${userId} (intento ${retryCount + 1}/${maxProfileRetries})`)
      setProfileLoading(true)
      
      const client = getSupabaseClient()
      
      // Timeout de 8 segundos para cargar perfil
      const profilePromise = client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const timeoutPromise = new Promise((_, reject) => {
        profileTimeout.current = setTimeout(() => {
          reject(new Error('Timeout cargando perfil'))
        }, 8000)
      })

      const { data, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any

      clearTimeouts()

      if (!mounted.current) return

      if (profileError) {
        console.error('❌ Error cargando perfil:', profileError)
        
        // Si es un error de "no encontrado" y no hemos agotado los intentos, reintentar
        if (profileError.code === 'PGRST116' && retryCount < maxProfileRetries - 1) {
          console.log(`🔄 Reintentando carga de perfil en 2 segundos...`)
          setTimeout(() => {
            if (mounted.current) {
              loadProfile(userId, retryCount + 1)
            }
          }, 2000)
          return
        }
        
        // Si es otro tipo de error o agotamos intentos, continuar sin perfil
        console.log('⚠️ Continuando sin perfil debido a errores')
        setProfile(null)
        setProfileLoading(false)
        return
      }

      if (data) {
        console.log('✅ Perfil cargado exitosamente:', data.full_name)
        setProfile(data)
      } else {
        console.log('⚠️ No se encontró perfil para el usuario')
        setProfile(null)
      }
      
      setProfileLoading(false)
    } catch (err) {
      clearTimeouts()
      if (!mounted.current) return
      
      console.error('❌ Error cargando perfil:', err)
      
      // Reintentar si no hemos agotado los intentos
      if (retryCount < maxProfileRetries - 1) {
        console.log(`🔄 Reintentando carga de perfil en 2 segundos...`)
        setTimeout(() => {
          if (mounted.current) {
            loadProfile(userId, retryCount + 1)
          }
        }, 2000)
        return
      }
      
      // Si agotamos intentos, continuar sin perfil
      console.log('⚠️ Continuando sin perfil después de agotar intentos')
      setProfile(null)
      setProfileLoading(false)
    }
  }, [clearTimeouts])

  // Función para crear perfil automáticamente si no existe
  const createProfileIfNotExists = useCallback(async (userId: string, userEmail: string) => {
    try {
      console.log('🔧 Verificando si existe perfil para usuario:', userId)
      
      const client = getSupabaseClient()
      
      // Verificar si ya existe un perfil
      const { data: existingProfile } = await client
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle()

      if (existingProfile) {
        console.log('✅ Perfil ya existe, cargando...')
        await loadProfile(userId)
        return
      }

      // Crear perfil automáticamente
      console.log('📝 Creando perfil automáticamente...')
      const { data: newProfile, error: createError } = await client
        .from('profiles')
        .insert([
          {
            id: userId,
            email: userEmail,
            full_name: userEmail.split('@')[0], // Usar parte del email como nombre
            role: 'user'
          }
        ])
        .select()
        .single()

      if (createError) {
        console.error('❌ Error creando perfil:', createError)
        setProfile(null)
        return
      }

      console.log('✅ Perfil creado automáticamente:', newProfile.full_name)
      setProfile(newProfile)
    } catch (err) {
      console.error('❌ Error en createProfileIfNotExists:', err)
      setProfile(null)
    }
  }, [loadProfile])

  // Inicialización de autenticación
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const initAuth = async () => {
      try {
        console.log('🚀 Inicializando autenticación...')
        setLoading(true)
        setError(null)

        const client = getSupabaseClient()
        
        // Timeout de 12 segundos para la sesión
        const sessionPromise = client.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => {
          authTimeout.current = setTimeout(() => {
            reject(new Error('Timeout obteniendo sesión'))
          }, 12000)
        })

        const { data: { session } } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any

        clearTimeouts()

        if (!mounted.current) return

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          console.log('👤 Usuario autenticado:', currentUser.id)
          
          // Intentar cargar perfil, y si no existe, crearlo automáticamente
          await createProfileIfNotExists(currentUser.id, currentUser.email || '')
        } else {
          console.log('👤 No hay sesión activa')
        }
      } catch (err) {
        clearTimeouts()
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
          // Intentar cargar perfil, y si no existe, crearlo automáticamente
          await createProfileIfNotExists(currentUser.id, currentUser.email || '')
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
      clearTimeouts()
      subscription.unsubscribe()
    }
  }, [clearTimeouts, createProfileIfNotExists])

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
        
        // Intentar cargar perfil, y si no existe, crearlo automáticamente
        await createProfileIfNotExists(data.user.id, data.user.email || '')
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
  }, [createProfileIfNotExists])

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

      if (data?.user) {
        console.log('✅ Registro exitoso')
        
        // Crear perfil automáticamente
        const { error: profileError } = await client
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: email,
              full_name: fullName,
              role: 'user'
            }
          ])
        
        if (profileError) {
          console.error('⚠️ Error creando perfil:', profileError)
        } else {
          console.log('✅ Perfil creado automáticamente')
        }
        
        setUser(data.user)
      }

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

  // Función para forzar recarga de autenticación
  const refreshAuth = useCallback(async () => {
    try {
      console.log('🔄 Forzando recarga de autenticación...')
      setLoading(true)
      setError(null)
      
      const client = getSupabaseClient()
      const { data: { session } } = await client.auth.getSession()
      
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        await createProfileIfNotExists(currentUser.id, currentUser.email || '')
      } else {
        setProfile(null)
      }
      
      setLoading(false)
      console.log('✅ Recarga de autenticación completada')
    } catch (err) {
      console.error('❌ Error en recarga de autenticación:', err)
      setError(err instanceof Error ? err.message : 'Error en recarga')
      setLoading(false)
    }
  }, [createProfileIfNotExists])

  // Función para forzar recarga de perfil
  const refreshProfile = useCallback(async () => {
    if (!user) return
    
    try {
      console.log('🔄 Forzando recarga de perfil...')
      setProfileLoading(true)
      await loadProfile(user.id)
    } catch (err) {
      console.error('❌ Error recargando perfil:', err)
      setProfileLoading(false)
    }
  }, [user, loadProfile])

  return {
    user,
    profile,
    loading: loading || profileLoading,
    error,
    isAuthenticated: !!user,
    isAdmin: profile?.role === "admin",
    profileLoading,
    signIn,
    signUp,
    signOut,
    refreshAuth,
    refreshProfile,
  }
} 