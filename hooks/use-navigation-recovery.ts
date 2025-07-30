"use client"

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider-ultra-simple'

export function useNavigationRecovery() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const hasNavigated = useRef(false)
  const lastPath = useRef<string>('')

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return

    const currentPath = window.location.pathname

    // Detectar navegación con botón de atrás
    const handlePopState = () => {
      hasNavigated.current = true
      
      // Forzar re-evaluación del estado de autenticación
      setTimeout(() => {
        if (loading) {
          window.location.reload()
        }
      }, 1000)
    }

    // Detectar navegación programática
    const handleNavigation = () => {
      hasNavigated.current = true
    }

    // Agregar listeners
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('beforeunload', handleNavigation)

    // Actualizar path actual
    lastPath.current = currentPath

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleNavigation)
    }
  }, [user, loading])

  // Función para navegar de forma segura
  const safeNavigate = (path: string) => {
    hasNavigated.current = true
    router.push(path)
  }

  // Función para manejar el botón de atrás
  const handleBackButton = () => {
    if (loading) {
      return
    }

    if (window.history.length > 1) {
      window.history.back()
    } else {
      // Si no hay historial, ir a la página principal
      safeNavigate('/')
    }
  }

  return {
    safeNavigate,
    handleBackButton,
    hasNavigated: hasNavigated.current,
    isNavigationLoading: loading
  }
} 