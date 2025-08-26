'use client'

import React from 'react'
import { Button } from './button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
// Aquí podrías enviar el error a un servicio de logging
    // logErrorToService(error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

// Componente de fallback por defecto
function DefaultErrorFallback({ 
  error, 
  resetError 
}: { 
  error?: Error
  resetError: () => void 
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="mb-4">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Algo salió mal
          </h2>
          <p className="text-gray-600 mb-4">
            Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Ver detalles del error (solo desarrollo)
            </summary>
            <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-red-600 overflow-auto">
              <div className="mb-2">
                <strong>Error:</strong> {error.message}
              </div>
              {error.stack && (
                <div>
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap">{error.stack}</pre>
                </div>
              )}
            </div>
          </details>
        )}

        <div className="space-y-3">
          <Button 
            onClick={resetError}
            className="w-full bg-[#0061A8] hover:bg-[#0061A8]/90"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Intentar de nuevo
          </Button>
          
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="w-full"
          >
            Recargar página
          </Button>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Si el problema persiste, contacta con soporte técnico.
        </div>
      </div>
    </div>
  )
}

// Hook para usar error boundaries en componentes funcionales
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((error: Error) => {
setError(error)
  }, [])

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  return { error, handleError, resetError }
}

// Componente de error para secciones específicas
export function ErrorFallback({ 
  error, 
  resetError 
}: { 
  error?: Error
  resetError: () => void 
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
        <h3 className="text-sm font-medium text-red-800">
          Error en esta sección
        </h3>
      </div>
      
      <p className="text-sm text-red-700 mb-3">
        Ha ocurrido un error al cargar esta sección.
      </p>
      
      <Button 
        onClick={resetError}
        size="sm"
        variant="outline"
        className="text-red-700 border-red-300 hover:bg-red-100"
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Reintentar
      </Button>
    </div>
  )
}

export { ErrorBoundary }
export default ErrorBoundary 
