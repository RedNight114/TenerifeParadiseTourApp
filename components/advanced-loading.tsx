"use client"

import { useState, useEffect } from 'react'
import { Loader2, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingState {
  type: 'initial' | 'fetching' | 'processing' | 'success' | 'error' | 'timeout'
  message: string
  progress?: number
  retryCount?: number
}

interface AdvancedLoadingProps {
  isLoading: boolean
  error?: string | null
  onRetry?: () => void
  timeout?: number
  showProgress?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'minimal' | 'fullscreen' | 'toast'
  message?: string
}

export function AdvancedLoading({
  isLoading,
  error,
  onRetry,
  timeout = 30000,
  showProgress = false,
  className,
  size = 'md',
  variant = 'default',
  message
}: AdvancedLoadingProps) {
  const [state, setState] = useState<LoadingState>({
    type: 'initial',
    message: 'Iniciando...',
    progress: 0,
    retryCount: 0
  })

  const [progress, setProgress] = useState(0)

  // Simular progreso
  useEffect(() => {
    if (isLoading && showProgress) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 200)

      return () => clearInterval(interval)
    } else if (!isLoading) {
      setProgress(100)
    }
  }, [isLoading, showProgress])

  // Manejar timeout
  useEffect(() => {
    if (isLoading && timeout) {
      const timer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          type: 'timeout',
          message: 'La operación está tardando más de lo esperado...'
        }))
      }, timeout)

      return () => clearTimeout(timer)
    }
  }, [isLoading, timeout])

  // Actualizar estado basado en props
  useEffect(() => {
    if (error) {
      setState(prev => ({
        ...prev,
        type: 'error',
        message: error
      }))
    } else if (isLoading) {
      setState(prev => ({
        ...prev,
        type: 'fetching',
        message: message || 'Cargando datos...'
      }))
    } else {
      setState(prev => ({
        ...prev,
        type: 'success',
        message: '¡Completado!'
      }))
    }
  }, [isLoading, error, message])

  const handleRetry = () => {
    setState(prev => ({
      ...prev,
      type: 'fetching',
      message: 'Reintentando...',
      retryCount: (prev.retryCount || 0) + 1
    }))
    setProgress(0)
    onRetry?.()
  }

  const getIcon = () => {
    switch (state.type) {
      case 'fetching':
      case 'processing':
        return <Loader2 className="animate-spin" />
      case 'success':
        return <CheckCircle className="text-green-500" />
      case 'error':
        return <AlertCircle className="text-red-500" />
      case 'timeout':
        return <Clock className="text-orange-500" />
      default:
        return <RefreshCw className="animate-spin" />
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4'
      case 'lg':
        return 'w-8 h-8'
      default:
        return 'w-6 h-6'
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'p-2'
      case 'fullscreen':
        return 'fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50'
      case 'toast':
        return 'fixed bottom-4 right-4 z-50 max-w-sm'
      default:
        return 'p-4 rounded-lg border bg-card'
    }
  }

  if (!isLoading && !error && state.type === 'success') {
    return null
  }

  return (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-4',
      getVariantClasses(),
      className
    )}>
      {/* Icono principal */}
      <div className={cn('flex items-center justify-center', getSizeClasses())}>
        {getIcon()}
      </div>

      {/* Mensaje */}
      <div className="text-center space-y-2">
        <p className="text-sm font-medium">
          {state.message}
        </p>
        
        {/* Contador de reintentos */}
        {state.retryCount && state.retryCount > 0 && (
          <p className="text-xs text-muted-foreground">
            Reintento {state.retryCount}
          </p>
        )}
      </div>

      {/* Barra de progreso */}
      {showProgress && progress > 0 && (
        <div className="w-full max-w-xs space-y-2">
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground">
            {Math.round(progress)}%
          </p>
        </div>
      )}

      {/* Botones de acción */}
      {(state.type === 'error' || state.type === 'timeout') && onRetry && (
        <div className="flex space-x-2">
          <button
            onClick={handleRetry}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Reintentar
          </button>
          {state.type === 'timeout' && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              Recargar página
            </button>
          )}
        </div>
      )}

      {/* Información adicional para timeout */}
      {state.type === 'timeout' && (
        <div className="text-xs text-muted-foreground text-center max-w-xs">
          <p>Si el problema persiste, intenta:</p>
          <ul className="mt-1 space-y-1">
            <li>• Verificar tu conexión a internet</li>
            <li>• Limpiar el caché del navegador</li>
            <li>• Probar en ventana de incógnito</li>
          </ul>
        </div>
      )}
    </div>
  )
}

// Componente de loading para secciones específicas
export function SectionLoading({ 
  message = "Cargando...",
  className 
}: { 
  message?: string
  className?: string 
}) {
  return (
    <div className={cn(
      "flex items-center justify-center p-8",
      className
    )}>
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

// Componente de loading para botones
export function ButtonLoading({ 
  children,
  loading,
  className 
}: { 
  children: React.ReactNode
  loading: boolean
  className?: string 
}) {
  return (
    <button
      disabled={loading}
      className={cn(
        "flex items-center justify-center space-x-2",
        className
      )}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      <span>{children}</span>
    </button>
  )
}

// Componente de loading para tablas
export function TableLoading({ 
  columns = 5,
  rows = 3 
}: { 
  columns?: number
  rows?: number 
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-4 bg-muted rounded animate-pulse"
              style={{ 
                width: `${Math.random() * 100 + 50}px`,
                animationDelay: `${(rowIndex + colIndex) * 0.1}s`
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
} 