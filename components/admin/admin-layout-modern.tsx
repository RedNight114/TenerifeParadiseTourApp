"use client"

import React, { useState, useEffect } from 'react'
import { AdminSidebarModern } from './admin-sidebar-modern'
import { AdminHeaderModern } from './admin-header-modern'
import { AdminSkipLinks } from './skip-link'
import { cn } from '@/lib/utils'

interface AdminLayoutModernProps {
  children: React.ReactNode
  className?: string
}

export function AdminLayoutModern({ children, className }: AdminLayoutModernProps) {
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
      {/* Skip Links para accesibilidad */}
      <AdminSkipLinks />
      
      <div className="flex">
        {/* Sidebar */}
        <aside 
          id="navigation"
          className={cn(
            "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out",
            "lg:translate-x-0 lg:static lg:inset-auto lg:z-auto",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
          data-sidebar
          role="navigation"
          aria-label="Panel de navegación principal"
        >
          <AdminSidebarModern />
        </aside>

        {/* Overlay para móvil */}
        {isSidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Contenido principal */}
        <div className="flex-1 lg:ml-0">
          {/* Header */}
          <header>
            <AdminHeaderModern 
              onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
              isMenuOpen={isSidebarOpen}
            />
          </header>

          {/* Contenido principal */}
          <main 
            id="main-content"
            className={cn(
              "min-h-[calc(100vh-4rem)]",
              "px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4",
              className
            )}
            role="main"
            tabIndex={-1}
          >
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
