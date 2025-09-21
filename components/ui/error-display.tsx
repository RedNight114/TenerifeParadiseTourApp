"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw, Wifi, Database, Clock, AlertTriangle } from "lucide-react"

interface ErrorDisplayProps {
  error: string | null
  onRetry?: () => void
  title?: string
  showDetails?: boolean
  className?: string
}

export function ErrorDisplay({ 
  error, 
  onRetry, 
  title = "Error al cargar datos",
  showDetails = false,
  className = ""
}: ErrorDisplayProps) {
  const [showFullError, setShowFullError] = useState(false)

  if (!error) return null

  // Determinar el tipo de error y el icono apropiado
  const getErrorInfo = (errorMessage: string) => {
    const lowerError = errorMessage.toLowerCase()
    
    if (lowerError.includes('timeout') || lowerError.includes('tardó demasiado')) {
      return {
        icon: <Clock className="h-5 w-5 text-orange-500" />,
        color: "border-orange-200 bg-orange-50",
        title: "Timeout de carga",
        description: "La operación tardó más tiempo del esperado",
        suggestion: "Esto puede deberse a una conexión lenta o alta carga del servidor"
      }
    }
    
    if (lowerError.includes('conexión') || lowerError.includes('network') || lowerError.includes('fetch')) {
      return {
        icon: <Wifi className="h-5 w-5 text-red-500" />,
        color: "border-red-200 bg-red-50",
        title: "Error de conexión",
        description: "No se pudo establecer conexión con el servidor",
        suggestion: "Verifica tu conexión a internet e intenta de nuevo"
      }
    }
    
    if (lowerError.includes('supabase') || lowerError.includes('base de datos') || lowerError.includes('database')) {
      return {
        icon: <Database className="h-5 w-5 text-blue-500" />,
        color: "border-blue-200 bg-blue-50",
        title: "Error de base de datos",
        description: "Problema al conectar con la base de datos",
        suggestion: "El servidor puede estar experimentando problemas temporales"
      }
    }
    
    // Error genérico
    return {
      icon: <AlertTriangle className="h-5 w-5 text-gray-500" />,
      color: "border-gray-200 bg-gray-50",
      title: "Error inesperado",
      description: "Ocurrió un error inesperado",
      suggestion: "Por favor, intenta de nuevo o contacta al soporte si persiste"
    }
  }

  const errorInfo = getErrorInfo(error)

  return (
    <Card className={`${errorInfo.color} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {errorInfo.icon}
          <CardTitle className="text-lg font-semibold text-gray-800">
            {errorInfo.title}
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-700">
          {errorInfo.description}
        </p>
        
        <div className="bg-white/50 rounded-lg p-3 border border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>Sugerencia:</strong> {errorInfo.suggestion}
          </p>
        </div>

        {showDetails && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullError(!showFullError)}
              className="text-xs text-gray-600 hover:text-gray-800"
            >
              {showFullError ? "Ocultar detalles" : "Mostrar detalles técnicos"}
            </Button>
            
            {showFullError && (
              <div className="bg-gray-100 rounded p-3 text-xs font-mono text-gray-700 break-all">
                {error}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {onRetry && (
            <Button 
              onClick={onRetry}
              className="flex items-center gap-2"
              variant="default"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          )}
          
          <Button 
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Recargar página
          </Button>
        </div>

        <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
          <p>Si el problema persiste, contacta al soporte técnico.</p>
          <p>Error ID: {Date.now().toString(36)}</p>
        </div>
      </CardContent>
    </Card>
  )
}

















