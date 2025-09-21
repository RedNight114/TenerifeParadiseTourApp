"use client"

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface AdminLayoutFinalProps {
  children: React.ReactNode
  className?: string
}

export function AdminLayoutFinal({ children, className }: AdminLayoutFinalProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Cerrar sidebar al hacer clic fuera en móvil
  useEffect(() => {
    if (isSidebarOpen && isMobile) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element
        if (!target.closest('[data-sidebar]')) {
          setIsSidebarOpen(false)
        }
      }

      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isSidebarOpen, isMobile])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Contenido principal */}
      <div className="lg:pl-64">
        {/* Header simplificado */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isSidebarOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Panel de Administración</h1>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className={cn("p-4 lg:p-6", className)}>
          {children}
        </main>
      </div>
    </div>
  )
}
