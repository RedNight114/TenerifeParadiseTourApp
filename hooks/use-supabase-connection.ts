"use client"

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient, isSupabaseReady } from '@/lib/supabase-unified'

export function useSupabaseConnection() {
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [lastCheck, setLastCheck] = useState<Date>(new Date())

  const checkConnection = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Verificar si el cliente unificado está listo
      if (isSupabaseReady()) {
        setIsConnected(true)
        setLastCheck(new Date())
        setIsLoading(false)
        return
      }
      
      // Si no está listo, obtener el cliente
      const client = await getSupabaseClient()
      
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