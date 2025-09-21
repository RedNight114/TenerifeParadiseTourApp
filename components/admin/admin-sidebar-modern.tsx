"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard, 
  Calendar, 
  Package, 
  MessageSquare, 
  Shield, 
  Users, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  FileText,
  Image,
  Home
} from 'lucide-react'
import { useAuthContext } from '@/components/auth-provider'

interface SidebarProps {
  className?: string
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  children?: NavItem[]
}

const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Reservas',
    href: '/admin/reservations',
    icon: Calendar,
    badge: 3 // Ejemplo de notificaciones pendientes
  },
  {
    title: 'Servicios',
    href: '/admin/services',
    icon: Package
  },
  {
    title: 'Chat',
    href: '/admin/chat',
    icon: MessageSquare,
    badge: 2
  },
  {
    title: 'Usuarios',
    href: '/admin/users',
    icon: Users
  },
  {
    title: 'Imágenes',
    href: '/admin/image-management',
    icon: Image
  },
  {
    title: 'Estadísticas',
    href: '/admin/statistics',
    icon: BarChart3
  },
  {
    title: 'Reportes',
    href: '/admin/reports',
    icon: FileText
  },
  {
    title: 'Auditoría',
    href: '/admin/audit',
    icon: Shield
  }
]

export function AdminSidebarModern({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { profile, signOut } = useAuthContext()

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      }
  }

  return (
    <div className={cn(
      "flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 shadow-sm sticky top-0 z-50",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header con logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-500">Tenerife Paradise</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          aria-label={isCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-700">
                  {profile?.full_name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {profile?.full_name || 'Administrador'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {profile?.role || 'admin'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto" role="navigation" aria-label="Menú principal">
        {/* Home link */}
        <Link href="/" className="block">
          <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-100">
            <Home className="w-5 h-5" />
            {!isCollapsed && <span>Volver al Sitio</span>}
          </div>
        </Link>

        {/* Navigation items */}
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                  "hover:bg-gray-100 hover:text-gray-900",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-100",
                  isActive 
                    ? "bg-gray-100 text-gray-900 border-r-2 border-gray-900" 
                    : "text-gray-600"
                )}
                role="menuitem"
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={cn("w-5 h-5 transition-transform duration-200", isCollapsed && "mx-auto", isActive && "scale-110")} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.title}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge variant="destructive" className="ml-auto bg-red-500 hover:bg-red-600 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
                {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" aria-label={`${item.badge} notificaciones`}></div>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer - Fixed at bottom */}
      <div className="mt-auto border-t border-gray-200 bg-white">
        {!isCollapsed && (
          <div className="p-4 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Configuración del sistema"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        )}
        {isCollapsed && (
          <div className="p-2 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Configuración del sistema"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full p-2 text-red-600 hover:text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
