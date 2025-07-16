"use client"

import { useEffect, useState } from "react"
import { useSupabaseConnection } from "@/hooks/use-supabase-connection"

export function SupabaseDebug() {
  const { isConnected, error, isLoading, retryConnection } = useSupabaseConnection()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const info = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
        `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10)}...` : 
        'No configurado',
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      connectionStatus: {
        isConnected,
        error,
        isLoading
      }
    }

    setDebugInfo(info)
  }, [isConnected, error, isLoading])

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  const getStatusColor = () => {
    if (isLoading) return 'bg-yellow-100 border-yellow-400 text-yellow-700'
    if (isConnected) return 'bg-green-100 border-green-400 text-green-700'
    return 'bg-red-100 border-red-400 text-red-700'
  }

  return (
    <div className={`fixed bottom-4 right-4 border px-4 py-3 rounded z-50 max-w-md ${getStatusColor()}`}>
      <h3 className="font-bold mb-2">Debug Supabase</h3>
      <div className="mb-2">
        <span className="font-semibold">Estado: </span>
        {isLoading ? '🔄 Verificando...' : isConnected ? '✅ Conectado' : '❌ Desconectado'}
      </div>
      {error && (
        <div className="mb-2">
          <span className="font-semibold">Error: </span>
          <span className="text-xs">{error}</span>
        </div>
      )}
      <button 
        onClick={retryConnection}
        className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
      >
        Reintentar
      </button>
      <details className="mt-2">
        <summary className="cursor-pointer text-xs">Ver detalles</summary>
        <pre className="text-xs overflow-auto mt-1">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </details>
    </div>
  )
} 