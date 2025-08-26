"use client"

import { useEffect, useState } from "react"
import { useAuthContext } from "@/components/auth-provider"
import { getSupabaseClient } from "@/lib/supabase-optimized"

interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  role: string
  created_at: string
  updated_at: string
}

export function useProfileSync() {
  const { user } = useAuthContext()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ Sincronizar perfil cuando cambie el usuario
  useEffect(() => {
    if (user?.id) {
      syncProfile()
    } else {
      setProfile(null)
      setError(null)
    }
  }, [user?.id])

  // ✅ NUEVO: Sincronización automática cada 30 segundos para mantener datos frescos
  useEffect(() => {
    if (!user?.id) return

    const interval = setInterval(() => {
      syncProfile()
    }, 30000) // 30 segundos

    return () => clearInterval(interval)
  }, [user?.id])

  const syncProfile = async () => {
    if (!user?.id) return

    setLoading(true)
    setError(null)

    try {
      // Sincronizando perfil para usuario
      
      const supabaseClient = getSupabaseClient()
      const client = await supabaseClient.getClient()
      
      if (!client) {
        throw new Error('No se pudo obtener el cliente de Supabase')
      }

      // ✅ PASO 1: Intentar cargar perfil existente
      let { data: existingProfile, error: loadError } = await client
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

      if (loadError) {
throw loadError
      }

      // ✅ PASO 2: Si no hay perfil, crearlo automáticamente
      if (!existingProfile) {
        // Creando perfil nuevo
        
        const { data: newProfile, error: createError } = await client
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || '',
            avatar_url: null,
            role: 'client',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) {
throw createError
        }

        // Perfil creado exitosamente
        existingProfile = newProfile
      } else {
        // Perfil existente cargado
      }

      // ✅ NUEVO: Solo actualizar si los datos han cambiado
      setProfile(prevProfile => {
        if (JSON.stringify(prevProfile) !== JSON.stringify(existingProfile)) {
          // Perfil actualizado con nuevos datos
          return existingProfile
        }
        return prevProfile
      })
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Función para actualizar perfil manualmente
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id || !profile) return

    setLoading(true)
    setError(null)

    try {
      const supabaseClient = getSupabaseClient()
      const client = await supabaseClient.getClient()
      
      if (!client) {
        throw new Error('No se pudo obtener el cliente de Supabase')
      }

      // ✅ NUEVO: Actualizar estado local inmediatamente para UI responsiva
      const optimisticProfile = { ...profile, ...updates, updated_at: new Date().toISOString() }
      setProfile(optimisticProfile)

      const { data: updatedProfile, error: updateError } = await client
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id)
        .select()
        .single()

      if (updateError) {
        // ✅ NUEVO: Revertir cambios si hay error
        setProfile(profile)
        throw updateError
      }
// ✅ NUEVO: Sincronizar inmediatamente después de la actualización
      setTimeout(() => {
        syncProfile()
      }, 100)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Función para refrescar perfil
  const refreshProfile = () => {
    if (user?.id) {
      // Refresco manual solicitado
      syncProfile()
    }
  }

  // ✅ NUEVO: Función para sincronización forzada
  const forceSync = () => {
    if (user?.id) {
      // Sincronización forzada solicitada
      setLoading(true)
      syncProfile()
    }
  }

  // ✅ NUEVO: Función para limpiar errores
  const clearError = () => {
    setError(null)
  }

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile,
    syncProfile,
    forceSync,
    clearError
  }
}

