"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  ArrowLeft,
  Home,
  Menu,
  X,
  Minimize2,
  Maximize2,
  Hotel,
  Eye,
  EyeOff
} from 'lucide-react'

interface ExternalMapNavbarProps {
  showSidebar: boolean
  onToggleSidebar: () => void
  showHotels: boolean
  onToggleHotels: () => void
  showServices: boolean
  onToggleServices: () => void
  hotelsCount: number
  servicesCount: number
}

export function ExternalMapNavbar({
  showSidebar,
  onToggleSidebar,
  showHotels,
  onToggleHotels,
  showServices,
  onToggleServices,
  hotelsCount,
  servicesCount
}: ExternalMapNavbarProps) {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleBackToMain = () => {
    router.push('/')
  }

  const handleGoToServices = () => {
    router.push('/services')
  }

  const handleGoToContact = () => {
    router.push('/contact')
  }

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
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
            <div className="h-8 w-8 bg-gradient-to-r from-[#0061A8] to-[#F4C762] rounded-full flex items-center justify-center">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Mapa Interactivo</h1>
          </div>

          {/* Navegación desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToMain}
              className="text-gray-700 hover:text-[#0061A8] transition-colors"
            >
              <Home className="h-4 w-4 mr-2" />
              Inicio
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoToServices}
              className="text-gray-700 hover:text-[#0061A8] transition-colors"
            >
              Servicios
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoToContact}
              className="text-gray-700 hover:text-[#0061A8] transition-colors"
            >
              Contacto
            </Button>
          </div>

          {/* Controles del mapa */}
          <div className="flex items-center gap-2">
            {/* Contador de elementos */}
            <div className="hidden sm:flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Hotel className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{hotelsCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-green-600" />
                <span className="font-medium">{servicesCount}</span>
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
            
            {/* Menú móvil */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
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
                <Home className="h-4 w-4 mr-2" />
                Inicio
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleGoToServices()
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
                  handleGoToContact()
                  setIsMobileMenuOpen(false)
                }}
                className="justify-start"
              >
                Contacto
              </Button>
            </div>

            {/* Controles móviles */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleHotels}
                  className="flex items-center gap-1 flex-1"
                >
                  <Hotel className="h-4 w-4" />
                  {showHotels ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleServices}
                  className="flex items-center gap-1 flex-1"
                >
                  <MapPin className="h-4 w-4" />
                  {showServices ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
