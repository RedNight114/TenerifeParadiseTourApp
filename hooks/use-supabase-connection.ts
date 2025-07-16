"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export function useSupabaseConnection() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Intentar una consulta simple para verificar la conexión
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1)
          .single()

        if (error) {
          // Si es un error de autenticación, la conexión está bien
          if (error.code === 'PGRST116' || error.code === '42501') {
            setIsConnected(true)
            setError(null)
          } else {
            setIsConnected(false)
            setError(error.message)
          }
        } else {
          setIsConnected(true)
          setError(null)
        }
      } catch (err) {
        setIsConnected(false)
        setError(err instanceof Error ? err.message : 'Error de conexión desconocido')
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()

    // Verificar conexión periódicamente
    const interval = setInterval(checkConnection, 30000) // Cada 30 segundos

    return () => clearInterval(interval)
  }, [])

  const retryConnection = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116' && error.code !== '42501') {
        throw error
      }
      
      setIsConnected(true)
      setError(null)
    } catch (err) {
      setIsConnected(false)
      setError(err instanceof Error ? err.message : 'Error de conexión desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isConnected,
    error,
    isLoading,
    retryConnection
  }
} 