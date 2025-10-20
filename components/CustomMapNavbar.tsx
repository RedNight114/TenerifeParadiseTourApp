"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft,
  User,
  LogIn,
  Minimize2,
  Maximize2
} from 'lucide-react'
import Image from 'next/image'

interface CustomMapNavbarProps {
  showSidebar: boolean
  onToggleSidebar: () => void
  showHotels: boolean
  onToggleHotels: () => void
  showServices: boolean
  onToggleServices: () => void
  hotelsCount: number
  servicesCount: number
}

export function CustomMapNavbar({
  showSidebar,
  onToggleSidebar,
  showHotels,
  onToggleHotels,
  showServices,
  onToggleServices,
  hotelsCount,
  servicesCount
}: CustomMapNavbarProps) {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleBackToMain = () => {
    router.push('/')
  }

  const handleGoToLogin = () => {
    router.push('/auth/login')
  }

  const handleGoToProfile = () => {
    router.push('/profile')
  }

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo y título */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToMain}
              className="flex items-center gap-2 text-gray-700 hover:text-[#0061A8] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            
            {/* Logo de la página */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-r from-[#0061A8] to-[#F4C762] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <h1 className="text-lg font-bold text-gray-900">Tenerife Paradise Tour</h1>
            </div>
          </div>

          {/* Navegación desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToMain}
              className="text-gray-700 hover:text-[#0061A8] transition-colors"
            >
              Inicio
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/services')}
              className="text-gray-700 hover:text-[#0061A8] transition-colors"
            >
              Servicios
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/contact')}
              className="text-gray-700 hover:text-[#0061A8] transition-colors"
            >
              Contacto
            </Button>
          </div>

          {/* Controles del mapa y login */}
          <div className="flex items-center gap-3">
            {/* Contador de elementos */}
            <div className="hidden sm:flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <span className="font-medium text-blue-600">{hotelsCount}</span>
                <span className="text-gray-500">Hoteles</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-green-600">{servicesCount}</span>
                <span className="text-gray-500">Servicios</span>
              </div>
            </div>

            {/* Botón de sidebar */}
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleSidebar}
              className="flex items-center gap-1"
            >
              {showSidebar ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              <span className="hidden sm:inline">{showSidebar ? 'Ocultar' : 'Mostrar'} Lista</span>
            </Button>

            {/* Login/Perfil */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoToLogin}
                className="text-gray-700 hover:text-[#0061A8] transition-colors"
              >
                <LogIn className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Login</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoToProfile}
                className="text-gray-700 hover:text-[#0061A8] transition-colors"
              >
                <User className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Perfil</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleBackToMain()
                  setIsMobileMenuOpen(false)
                }}
                className="justify-start"
              >
                Inicio
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  router.push('/services')
                  setIsMobileMenuOpen(false)
                }}
                className="justify-start"
              >
                Servicios
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  router.push('/contact')
                  setIsMobileMenuOpen(false)
                }}
                className="justify-start"
              >
                Contacto
              </Button>
              <div className="flex gap-2 pt-2 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleHotels}
                  className="flex-1"
                >
                  Hoteles ({hotelsCount})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleServices}
                  className="flex-1"
                >
                  Servicios ({servicesCount})
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
