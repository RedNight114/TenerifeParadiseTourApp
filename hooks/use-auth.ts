"use client"

import { useEffect, useState, useRef } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase, type Profile } from "@/lib/supabase"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const profileFetched = useRef<Set<string>>(new Set())

  // Función para obtener perfil - sin dependencias que causen bucle
  const fetchProfile = async (userId: string, userEmail?: string, userMetadata?: any) => {
    // Evitar peticiones duplicadas
    if (profileFetched.current.has(userId) || profileLoading) {
      console.log("Perfil ya obtenido o petición en curso para:", userId)
      return
    }

    setProfileLoading(true)
    profileFetched.current.add(userId)
    
    try {
      console.log("Obteniendo perfil para usuario:", userId)
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error("Error al obtener perfil:", error)
        profileFetched.current.delete(userId) // Permitir reintento
        return
      }

      if (!data) {
        console.log("Creando nuevo perfil para:", userId)
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            email: userEmail ?? "",
            full_name: userMetadata?.full_name ?? userEmail ?? "Usuario",
            role: "client",
          })
          .select("*")
          .maybeSingle()

        if (insertError) {
          console.error("Error al crear perfil:", insertError)
          profileFetched.current.delete(userId)
          return
        }
        
        console.log("Perfil creado:", newProfile)
        setProfile(newProfile)
      } else {
        console.log("Perfil encontrado:", data)
        setProfile(data)
      }
    } catch (error) {
      console.error("Error general al obtener perfil:", error)
      profileFetched.current.delete(userId)
    } finally {
      setProfileLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log("Inicializando autenticación...")
        
        // Obtener sesión inicial
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Error al obtener sesión:", error)
        }

        if (!mounted) return

        setUser(session?.user ?? null)

        if (session?.user) {
          console.log("Usuario autenticado:", session.user.id)
          await fetchProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata
          )
        } else {
          console.log("No hay sesión activa")
        }
      } catch (error) {
        console.error("Error en inicialización:", error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log("Cambio de autenticación:", event, session?.user?.id)
        
        setUser(session?.user ?? null)

        if (session?.user) {
          // Limpiar cache de perfiles para el nuevo usuario
          profileFetched.current.clear()
          await fetchProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata
          )
        } else {
          setProfile(null)
          profileFetched.current.clear()
        }
        
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // Sin dependencias para evitar re-ejecuciones

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (!error && data.user) {
      // Crear perfil
      await supabase.from("profiles").insert({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
        role: "client",
      })
    }

    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password })
  }

  const signOut = async () => {
    return await supabase.auth.signOut()
  }

  const isAdmin = profile?.role === "admin"

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin,
  }
}
