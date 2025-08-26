"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

export function useSupabaseConnection() {
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [lastCheck, setLastCheck] = useState<Date>(new Date())

  const checkConnection = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!url || !key) {
        throw new Error("Variables de entorno de Supabase no configuradas")
      }
      
      const client = createClient(url, key)
      
      // Verificar conexión básica
      const { data, error: connectionError } = await client
        .from('profiles')
        .select('id')
        .limit(1)
      
      if (connectionError) {
        throw new Error(`Error de conexión: ${connectionError.message}`)
      }
      
      setIsConnected(true)
      setLastCheck(new Date())
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const retryConnection = useCallback(() => {
    checkConnection()
  }, [checkConnection])

  useEffect(() => {
    checkConnection()
    
    // Verificar conexión cada 30 segundos
    const interval = setInterval(checkConnection, 30000)
    
    return () => clearInterval(interval)
  }, [checkConnection])

  return {
    isConnected,
    isLoading,
    error,
    lastCheck,
    retryConnection,
    checkConnection
  }
} 