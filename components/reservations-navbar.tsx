"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Home, 
  Calendar, 
  User, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  Star,
  Phone,
  MessageCircle,
  Menu,
  X
} from "lucide-react"

export function ReservationsNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      // Error handled
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Volver</span>
            </Button>
            
            <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
            
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200">
              <div className="w-8 h-8 relative">
                <Image
                  src="/images/logo-tenerife.png"
                  alt="Tenerife Paradise Tour"
                  fill
                  sizes="32px"
                  className="object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-gray-900 text-lg">Tenerife Paradise</span>
                <p className="text-xs text-gray-500 -mt-1">Tours & Excursions</p>
              </div>
            </Link>
          </div>

          {/* Center Navigation - Desktop */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              <Home className="w-4 h-4" />
              <span>Inicio</span>
            </Link>
            <Link
              href="/services"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              <Star className="w-4 h-4" />
              <span>Servicios</span>
            </Link>
            <Link
              href="/contact"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              <Phone className="w-4 h-4" />
              <span>Contacto</span>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            
            {/* Search Button */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
            >
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-red-500 hover:bg-red-600 animate-pulse">
                3
              </Badge>
            </Button>

            {/* Chat Support */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/profile"
                  className="hidden sm:flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                >
                  <User className="w-4 h-4" />
                  <span>Perfil</span>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-red-600 hover:border-red-300 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Salir</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  asChild
                  className="text-gray-600 hover:text-blue-600 transition-all duration-200"
                >
                  <Link href="/auth/login">
                    <span className="hidden sm:inline">Iniciar Sesión</span>
                    <span className="sm:hidden">Login</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Link href="/services">
                    <Star className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Reservar</span>
                    <span className="sm:hidden">+</span>
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              <Link
                href="/"
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Inicio</span>
              </Link>
              <Link
                href="/services"
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Star className="w-5 h-5" />
                <span className="font-medium">Servicios</span>
              </Link>
              <Link
                href="/contact"
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Phone className="w-5 h-5" />
                <span className="font-medium">Contacto</span>
              </Link>
              <Link
                href="/chat"
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">Chat de Soporte</span>
              </Link>

              {user ? (
                <>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">Mi Perfil</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex items-center space-x-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Cerrar Sesión</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                  <Button
                    variant="ghost"
                    asChild
                    className="w-full justify-start text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium"
                  >
                    <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <LogOut className="mr-3 w-4 h-4" />
                      Iniciar Sesión
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white"
                  >
                    <Link href="/services" onClick={() => setIsMobileMenuOpen(false)}>
                      <Star className="mr-3 w-4 h-4" />
                      Reservar Ahora
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
