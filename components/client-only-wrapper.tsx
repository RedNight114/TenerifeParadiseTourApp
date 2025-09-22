"use client"

import { useEffect, useState } from 'react'

interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Componente que solo renderiza sus hijos en el cliente
 * Evita errores de SSR cuando se accede a window, document, etc.
 */
export function ClientOnlyWrapper({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Hook para verificar si estamos en el cliente
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

/**
 * Hook para acceso seguro a window
 */
export function useWindow() {
  const [window, setWindow] = useState<Window | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindow(window)
    }
  }, [])

  return window
}

/**
 * Hook para acceso seguro a location
 */
export function useLocation() {
  const [location, setLocation] = useState<Location | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location) {
      setLocation(window.location)
    }
  }, [])

  return location
}