"use client"

import React, { useState, useEffect } from 'react'
import { Search, Menu, X, Bell, Settings, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AdminBreadcrumbs } from './admin-breadcrumbs'
import { AdminNotifications } from './admin-notifications'
import { AdminSettings } from './admin-settings'
import { useAuthContext } from '@/components/auth-provider'
import { cn } from '@/lib/utils'

interface AdminHeaderModernProps {
  className?: string
  onMenuToggle?: () => void
  isMenuOpen?: boolean
}

export function AdminHeaderModern({ className, onMenuToggle, isMenuOpen }: AdminHeaderModernProps) {
  const { profile } = useAuthContext()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Manejar búsqueda con teclado
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchQuery("")
      setIsSearchFocused(false)
      ;(e.target as HTMLInputElement).blur()
    }
  }

  return (
    <header className={cn("bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm", className)}>
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={isMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
            aria-expanded={isMenuOpen}
            aria-controls="navigation-menu"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </Button>

          {/* Breadcrumbs */}
          <AdminBreadcrumbs className="hidden sm:flex" />
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-4 lg:mx-6 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Buscar reservas, usuarios, servicios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={cn(
                "pl-10 bg-gray-50 border-gray-200",
                "focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "transition-all duration-200 placeholder:text-gray-500",
                "text-gray-900"
              )}
              aria-label="Búsqueda global"
              aria-describedby="search-help"
            />
            {isSearchFocused && (
              <div 
                id="search-help"
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                role="tooltip"
                aria-live="polite"
              >
                <div className="p-3 text-sm text-gray-500">
                  Presiona Enter para buscar o Escape para cancelar
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Abrir búsqueda"
          >
            <Search className="w-5 h-5 text-gray-700" />
          </Button>

          {/* Notifications */}
          <AdminNotifications />

          {/* Settings */}
          <AdminSettings />

          {/* User menu */}
          <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {profile?.full_name || 'Administrador'}
              </p>
              <p className="text-xs text-gray-500">
                {profile?.role || 'admin'}
              </p>
            </div>
            <div className="relative">
              <div 
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                role="button"
                tabIndex={0}
                aria-label={`Perfil de ${profile?.full_name || 'Administrador'}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    // Aquí podrías abrir un menú de usuario
                  }
                }}
              >
                <span className="text-sm font-semibold text-gray-700">
                  {profile?.full_name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" aria-label="Usuario en línea"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile breadcrumbs */}
      <div className="px-4 lg:px-6 pb-3 lg:pb-4 sm:hidden">
        <AdminBreadcrumbs />
      </div>
    </header>
  )
}
