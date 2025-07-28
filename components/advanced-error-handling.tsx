"use client"

import { useState, useEffect } from 'react'
import { AlertTriangle, X, RefreshCw, Home, ArrowLeft, Bug, Wifi, Server } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ErrorDetails {
  code?: string
  message: string
  type: 'network' | 'server' | 'auth' | 'validation' | 'unknown'
  timestamp: Date
  retryCount: number
  userAction?: string
}

interface AdvancedErrorProps {
  error: ErrorDetails | null
  onRetry?: () => void
  onDismiss?: () => void
  showDetails?: boolean
  className?: string
  variant?: 'inline' | 'modal' | 'toast' | 'fullscreen'
}

// Funciones de utilidad para errores
const getErrorIcon = (type: ErrorDetails['type']) => {
  switch (type) {
    case 'network':
      return <Wifi className="w-5 h-5" />
    case 'server':
      return <Server className="w-5 h-5" />
    case 'auth':
      return <AlertTriangle className="w-5 h-5" />
    case 'validation':
      return <AlertTriangle className="w-5 h-5" />
    default:
      return <Bug className="w-5 h-5" />
  }
}

const getErrorTitle = (type: ErrorDetails['type']) => {
  switch (type) {
    case 'network':
      return 'Error de Conexión'
    case 'server':
      return 'Error del Servidor'
    case 'auth':
      return 'Error de Autenticación'
    case 'validation':
      return 'Error de Validación'
    default:
      return 'Error Inesperado'
  }
}

const getErrorDescription = (type: ErrorDetails['type']) => {
  switch (type) {
    case 'network':
      return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
    case 'server':
      return 'El servidor está experimentando problemas. Inténtalo de nuevo más tarde.'
    case 'auth':
      return 'Tu sesión ha expirado o no tienes permisos para esta acción.'
    case 'validation':
      return 'Los datos proporcionados no son válidos. Revisa la información.'
    default:
      return 'Ha ocurrido un error inesperado. Inténtalo de nuevo.'
  }
}

export function AdvancedError({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  className,
  variant = 'inline'
}: AdvancedErrorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [autoRetryCount, setAutoRetryCount] = useState(0)

  // Auto-retry para errores de red
  useEffect(() => {
    if (error?.type === 'network' && autoRetryCount < 3) {
      const timer = setTimeout(() => {
        setAutoRetryCount(prev => prev + 1)
        onRetry?.()
      }, 2000 * (autoRetryCount + 1)) // Retry cada 2s, 4s, 6s

      return () => clearTimeout(timer)
    }
  }, [error, autoRetryCount, onRetry])

  if (!error) return null

  const getSuggestedActions = () => {
    switch (error.type) {
      case 'network':
        return [
          { label: 'Verificar conexión', action: () => window.location.reload() },
          { label: 'Reintentar', action: onRetry },
          { label: 'Ir al inicio', action: () => window.location.href = '/' }
        ]
      case 'server':
        return [
          { label: 'Reintentar', action: onRetry },
          { label: 'Contactar soporte', action: () => window.location.href = '/contact' },
          { label: 'Ir al inicio', action: () => window.location.href = '/' }
        ]
      case 'auth':
        return [
          { label: 'Iniciar sesión', action: () => window.location.href = '/auth/login' },
          { label: 'Ir al inicio', action: () => window.location.href = '/' }
        ]
      case 'validation':
        return [
          { label: 'Reintentar', action: onRetry },
          { label: 'Volver', action: () => window.history.back() }
        ]
      default:
        return [
          { label: 'Reintentar', action: onRetry },
          { label: 'Ir al inicio', action: () => window.location.href = '/' }
        ]
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'modal':
        return 'fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50'
      case 'toast':
        return 'fixed top-4 right-4 z-50 max-w-sm'
      case 'fullscreen':
        return 'fixed inset-0 bg-background flex items-center justify-center z-50'
      default:
        return 'w-full'
    }
  }

  const actions = getSuggestedActions()

  return (
    <div className={cn(getVariantClasses(), className)}>
      <Alert className={cn(
        "border-destructive/50 bg-destructive/5",
        variant === 'modal' && "max-w-md",
        variant === 'toast' && "shadow-lg"
      )}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 text-destructive">
            {getErrorIcon(error.type)}
          </div>
          
          <div className="flex-1 space-y-2">
            <AlertTitle className="text-destructive">
              {getErrorTitle(error.type)}
            </AlertTitle>
            
            <AlertDescription className="text-sm">
              {getErrorDescription(error.type)}
              
              {/* Auto-retry info */}
              {error.type === 'network' && autoRetryCount > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Reintentando automáticamente... ({autoRetryCount}/3)
                </p>
              )}
              
              {/* Error details */}
              {showDetails && (
                <div className="mt-3 space-y-2">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isExpanded ? 'Ocultar detalles' : 'Mostrar detalles'}
                  </button>
                  
                  {isExpanded && (
                    <div className="text-xs space-y-1 bg-muted/50 p-2 rounded">
                      <p><strong>Código:</strong> {error.code || 'N/A'}</p>
                      <p><strong>Mensaje:</strong> {error.message}</p>
                      <p><strong>Hora:</strong> {error.timestamp.toLocaleTimeString()}</p>
                      <p><strong>Reintentos:</strong> {error.retryCount}</p>
                      {error.userAction && (
                        <p><strong>Acción:</strong> {error.userAction}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </AlertDescription>
            
            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={index === 0 ? "default" : "outline"}
                  size="sm"
                  onClick={action.action}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Dismiss button */}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </Alert>
    </div>
  )
}

// Hook para manejo de errores
export function useErrorHandler() {
  const [errors, setErrors] = useState<ErrorDetails[]>([])
  const [currentError, setCurrentError] = useState<ErrorDetails | null>(null)

  const addError = (error: Omit<ErrorDetails, 'timestamp' | 'retryCount'>) => {
    const newError: ErrorDetails = {
      ...error,
      timestamp: new Date(),
      retryCount: 0
    }
    
    setErrors(prev => [...prev, newError])
    setCurrentError(newError)
  }

  const retryError = (errorId?: string) => {
    const targetError = errorId 
      ? errors.find(e => e.code === errorId) 
      : currentError
    
    if (targetError) {
      const updatedError: ErrorDetails = {
        ...targetError,
        retryCount: targetError.retryCount + 1
      }
      
      setErrors(prev => 
        prev.map(e => e.code === targetError.code ? updatedError : e)
      )
      setCurrentError(updatedError)
      
      return updatedError
    }
  }

  const dismissError = (errorId?: string) => {
    if (errorId) {
      setErrors(prev => prev.filter(e => e.code !== errorId))
      if (currentError?.code === errorId) {
        setCurrentError(null)
      }
    } else {
      setCurrentError(null)
    }
  }

  const clearErrors = () => {
    setErrors([])
    setCurrentError(null)
  }

  return {
    errors,
    currentError,
    addError,
    retryError,
    dismissError,
    clearErrors
  }
}

// Componente de error para formularios
export function FormError({ 
  error,
  field 
}: { 
  error?: string
  field?: string 
}) {
  if (!error) return null

  return (
    <div className="flex items-center space-x-2 text-sm text-destructive mt-1">
      <AlertTriangle className="w-4 h-4" />
      <span>
        {field && <strong>{field}:</strong>} {error}
      </span>
    </div>
  )
}

// Componente de error para validación
export function ValidationError({ 
  errors,
  className 
}: { 
  errors: Record<string, string>
  className?: string 
}) {
  if (Object.keys(errors).length === 0) return null

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="w-4 h-4" />
      <AlertTitle>Errores de Validación</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 space-y-1">
          {Object.entries(errors).map(([field, message]) => (
            <li key={field} className="text-sm">
              <strong>{field}:</strong> {message}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}

// Componente de error para páginas
export function PageError({ 
  error,
  onRetry 
}: { 
  error: ErrorDetails
  onRetry?: () => void 
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl text-destructive">
          {getErrorIcon(error.type)}
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-destructive">
            {getErrorTitle(error.type)}
          </h1>
          <p className="text-muted-foreground">
            {getErrorDescription(error.type)}
          </p>
        </div>
        
        <div className="flex flex-col space-y-2">
          {onRetry && (
            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Ir al Inicio
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    </div>
  )
} 