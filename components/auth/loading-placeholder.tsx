"use client"

import { useEffect, useState } from 'react'

interface LoadingPlaceholderProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function LoadingPlaceholder({ children, fallback }: LoadingPlaceholderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0061A8] via-[#1E40AF] to-[#F4C762]">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-3"></div>
          <h2 className="text-base font-bold mb-2">Cargando...</h2>
          <p className="text-xs opacity-90">Inicializando aplicación</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
