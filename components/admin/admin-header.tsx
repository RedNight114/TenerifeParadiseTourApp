"use client"

import React from 'react'
import { Search, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AdminBreadcrumbs } from './admin-breadcrumbs'
import { AdminNotifications } from './admin-notifications'
import { useAuthContext } from '@/components/auth-provider'

interface AdminHeaderProps {
  className?: string
  onMenuToggle?: () => void
  isMenuOpen?: boolean
}

export function AdminHeader({ className, onMenuToggle, isMenuOpen }: AdminHeaderProps) {
  const { profile } = useAuthContext()

  return (
    <header className={`bg-white border-b border-gray-200 sticky top-0 z-30 ${className}`}>
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>

          {/* Breadcrumbs */}
          <AdminBreadcrumbs className="hidden sm:flex" />
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar en el panel..."
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Notifications */}
          <AdminNotifications />

          {/* User info */}
          <div className="flex items-center space-x-2">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {profile?.full_name || 'Administrador'}
              </p>
              <p className="text-xs text-gray-500">
                {profile?.role || 'admin'}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {profile?.full_name?.charAt(0) || 'A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile breadcrumbs */}
      <div className="px-4 pb-3 sm:hidden">
        <AdminBreadcrumbs />
      </div>
    </header>
  )
}
