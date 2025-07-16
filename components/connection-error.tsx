"use client"

import { useSupabaseConnection } from "@/hooks/use-supabase-connection"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ConnectionError() {
  const { isConnected, error, isLoading, retryConnection } = useSupabaseConnection()

  // Solo mostrar si hay un error de conexión
  if (isConnected || isLoading) {
    return null
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md mx-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error de conexión</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>No se puede conectar con la base de datos. Esto puede deberse a:</p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Problemas de red</li>
            <li>Configuración incorrecta de Supabase</li>
            <li>Servicio temporalmente no disponible</li>
          </ul>
          {error && (
            <p className="text-xs bg-red-50 p-2 rounded mt-2">
              <strong>Error técnico:</strong> {error}
            </p>
          )}
          <Button 
            onClick={retryConnection} 
            disabled={isLoading}
            size="sm"
            className="mt-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Reconectando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar conexión
              </>
            )}
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
} 