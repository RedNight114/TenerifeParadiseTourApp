"use client"

import { useState, useEffect } from "react"

interface HydrationSafeProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
  suppressHydrationWarning?: boolean
}

/**
 * Componente wrapper que previene errores de hidratación
 * Renderiza un fallback en el servidor y el contenido real en el cliente
 */
export function HydrationSafe({ 
  children, 
  fallback = null,
  className,
  suppressHydrationWarning = false
}: HydrationSafeProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return fallback ? (
      <div className={className} suppressHydrationWarning={suppressHydrationWarning}>
        {fallback}
      </div>
    ) : null
  }

  return (
    <div className={className} suppressHydrationWarning={suppressHydrationWarning}>
      {children}
    </div>
  )
}

/**
 * Hook para detectar si el componente está hidratado
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}

/**
 * Componente que solo se renderiza en el cliente
 */
export function ClientOnly({ 
  children, 
  fallback = null,
  suppressHydrationWarning = false
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode
  suppressHydrationWarning?: boolean
}) {
  const isHydrated = useHydration()

  if (!isHydrated) {
    return fallback ? (
      <div suppressHydrationWarning={suppressHydrationWarning}>
        {fallback}
      </div>
    ) : null
  }

  return (
    <div suppressHydrationWarning={suppressHydrationWarning}>
      {children}
    </div>
  )
}

/**
 * Componente que renderiza contenido diferente en servidor vs cliente
 */
export function ServerClientRender({ 
  serverContent, 
  clientContent,
  suppressHydrationWarning = false
}: { 
  serverContent: React.ReactNode
  clientContent: React.ReactNode
  suppressHydrationWarning?: boolean
}) {
  const isHydrated = useHydration()

  return (
    <div suppressHydrationWarning={suppressHydrationWarning}>
      {isHydrated ? clientContent : serverContent}
    </div>
  )
}

/**
 * Componente que suprime advertencias de hidratación
 */
export function SuppressHydrationWarning({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <div suppressHydrationWarning={true}>
      {children}
    </div>
  )
}

/**
 * Hook para renderizado condicional basado en hidratación
 */
export function useClientOnly() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

/**
 * Componente que renderiza contenido solo después de la hidratación
 */
export function AfterHydration({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  const isClient = useClientOnly()

  if (!isClient) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
} 