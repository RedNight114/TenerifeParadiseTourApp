"use client"

import React, { useCallback, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Home, ArrowLeft } from 'lucide-react'

interface OptimizedNavigationProps {
  showBackButton?: boolean
  showHomeButton?: boolean
  customBackPath?: string
  className?: string
}

// Componente de navegación optimizado para evitar re-renders
export const OptimizedNavigation = React.memo(({
  showBackButton = true,
  showHomeButton = true,
  customBackPath,
  className = ""
}: OptimizedNavigationProps) => {
  const router = useRouter()
  const pathname = usePathname()

  // Memoizar si estamos en la página principal
  const isHomePage = useMemo(() => pathname === '/', [pathname])

  // Memoizar función de navegación hacia atrás
  const handleBack = useCallback(() => {
    if (customBackPath) {
      router.push(customBackPath)
    } else if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }, [router, customBackPath])

  // Memoizar función de navegación a home
  const handleHome = useCallback(() => {
    router.push('/')
  }, [router])

  // Memoizar el componente de botón de retroceso
  const backButton = useMemo(() => {
    if (!showBackButton || isHomePage) return null
    
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBack}
        className="flex items-center gap-2 hover:bg-gray-100"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Atrás</span>
      </Button>
    )
  }, [showBackButton, isHomePage, handleBack])

  // Memoizar el componente de botón de home
  const homeButton = useMemo(() => {
    if (!showHomeButton || isHomePage) return null
    
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleHome}
        className="flex items-center gap-2 hover:bg-gray-100"
      >
        <Home className="w-4 h-4" />
        <span>Inicio</span>
      </Button>
    )
  }, [showHomeButton, isHomePage, handleHome])

  // Si no hay botones que mostrar, no renderizar nada
  if (!backButton && !homeButton) {
    return null
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {backButton}
      {homeButton}
    </div>
  )
})

OptimizedNavigation.displayName = 'OptimizedNavigation'
