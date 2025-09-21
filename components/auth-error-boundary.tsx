"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  isAuthError: boolean
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      isAuthError: false
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // Verificar si es un error de autenticación
    const isAuthError = error.message.includes('Invalid Refresh Token') ||
                       error.message.includes('Refresh Token Not Found') ||
                       error.message.includes('Invalid access token') ||
                       error.message.includes('Access token expired')

    return {
      hasError: true,
      error,
      isAuthError
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AuthErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    // Limpiar localStorage y recargar la página
    if (typeof window !== 'undefined') {
      // Limpiar tokens de Supabase
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
          localStorage.removeItem(key)
        }
      })
      
      // Recargar la página
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      // Si hay un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Si es un error de autenticación, mostrar UI específica
      if (this.state.isAuthError) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Sesión Expirada
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Tu sesión ha expirado. Por favor, inicia sesión nuevamente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reiniciar Sesión
                </Button>
                <Button 
                  onClick={() => window.location.href = '/auth/login'}
                  className="w-full"
                  variant="outline"
                >
                  Ir a Login
                </Button>
              </CardContent>
            </Card>
          </div>
        )
      }

      // Error general
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Algo salió mal
              </CardTitle>
              <CardDescription className="text-gray-600">
                Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={this.handleRetry}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Recargar Página
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook para usar el error boundary en componentes funcionales
export function useAuthErrorHandler() {
  const handleAuthError = (error: Error) => {
    if (error.message.includes('Invalid Refresh Token') ||
        error.message.includes('Refresh Token Not Found')) {
      // Limpiar tokens y redirigir
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.includes('supabase') || key.includes('sb-')) {
            localStorage.removeItem(key)
          }
        })
        window.location.href = '/auth/login'
      }
    }
  }

  return { handleAuthError }
}
