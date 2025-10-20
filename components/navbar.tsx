"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { useProfileSync } from "@/hooks/use-profile-sync"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, X, User, Settings, LogOut, Calendar, MonitorSmartphone, LogIn, MessageCircle } from "lucide-react"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const { user, logout } = useAuth()
  
  // ✅ NUEVO: Usar el hook de sincronización de perfil
  const { profile, loading: profileLoading, error: profileError } = useProfileSync()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSignOut = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      // Error handled
    }
  }

  const getUserInitials = (rawName?: unknown) => {
    const name = typeof rawName === "string" && rawName.trim().length > 0 ? rawName : "Usuario"

    return name
      .trim()
      .split(/\s+/) // split on one or more whitespace characters
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // ✅ MEJORADO: Obtener la imagen de perfil del usuario con mejor manejo de errores
  const getUserAvatar = () => {
    const avatarUrl = profile?.avatar_url
    
    // Si hay avatar_url y es válido, usarlo
    if (avatarUrl && avatarUrl.trim() !== '') {
      return avatarUrl
    }
    
    // Si no hay avatar, usar placeholder
    return "/images/placeholder.svg"
  }

  const getUserName = () => {
    const rawName = profile?.full_name ?? user?.email ?? ""

    return typeof rawName === "string" && rawName.trim().length > 0 ? rawName : "Usuario"
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isScrolled ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-0.5 xs:px-1 sm:px-2 md:px-4 lg:px-6 xl:px-8">
        <div className="flex justify-between items-center h-16 xs:h-18 sm:h-20 md:h-22 lg:h-24 xl:h-26">
          {/* Left Navigation - Desktop */}
          <div className="hidden xl:flex items-center space-x-6 2xl:space-x-8 flex-1">
            <Link
              href="/"
              className={`font-medium text-sm lg:text-base transition-all duration-300 hover:scale-105 ${
                isScrolled ? "text-gray-700 hover:text-[#0061A8]" : "text-white hover:text-[#F4C762] drop-shadow-lg"
              }`}
            >
              Inicio
            </Link>
            <Link
              href="/services"
              className={`font-medium text-sm lg:text-base transition-all duration-300 hover:scale-105 ${
                isScrolled ? "text-gray-700 hover:text-[#0061A8]" : "text-white hover:text-[#F4C762] drop-shadow-lg"
              }`}
            >
              Servicios
            </Link>
            <Link
              href="/map"
              className={`font-medium text-sm lg:text-base transition-all duration-300 hover:scale-105 ${
                isScrolled ? "text-gray-700 hover:text-[#0061A8]" : "text-white hover:text-[#F4C762] drop-shadow-lg"
              }`}
            >
              Mapa
            </Link>
            <Link
              href="/contact"
              className={`font-medium text-sm lg:text-base transition-all duration-300 hover:scale-105 ${
                isScrolled ? "text-gray-700 hover:text-[#0061A8]" : "text-white hover:text-[#F4C762] drop-shadow-lg"
              }`}
            >
              Contacto
            </Link>
          </div>

          {/* Mobile Menu Button - Left - Optimizado para 320px */}
          <div className="xl:hidden flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className={`p-0.5 xs:p-1 sm:p-1.5 md:p-2 transition-all duration-300 min-w-[28px] min-h-[28px] xs:min-w-[32px] xs:min-h-[32px] ${
                isScrolled
                  ? "text-gray-700 hover:text-[#0061A8] hover:bg-gray-100"
                  : "text-white hover:text-[#F4C762] hover:bg-white/20 backdrop-blur-sm"
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
              ) : (
                <Menu className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
              )}
            </Button>
          </div>

          {/* Center Logo - Ultra optimizado para 320px */}
          <Link
            href="/"
            className="flex items-center space-x-1 xs:space-x-2 sm:space-x-3 md:space-x-4 absolute left-1/2 transform -translate-x-1/2 transition-all duration-300 hover:scale-105 max-w-[60%] xs:max-w-[70%] sm:max-w-[80%] md:max-w-none"
          >
            <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 xl:w-22 xl:h-22 relative flex-shrink-0">
              {!logoError ? (
                <Image
                  src="/images/logo-tenerife.png"
                  alt="TenerifeParadiseTour&Excursions"
                  fill
                  sizes="(max-width: 640px) 56px, (max-width: 768px) 64px, (max-width: 1024px) 72px, (max-width: 1280px) 80px, 88px"
                  className="object-contain drop-shadow-xl"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center border transition-all duration-300 ${
                    isScrolled
                      ? "bg-gradient-to-r from-[#0061A8] to-[#F4C762] border-transparent"
                      : "bg-white/20 backdrop-blur-sm border-white/50"
                  }`}
                >
                  <span
                    className={`font-bold text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl transition-colors duration-300 text-white`}
                  >
                    TP
                  </span>
                </div>
              )}
            </div>
            {/* Texto del logo - completamente oculto para evitar superposición */}
            <div className="hidden">
              <h1
                className={`font-bold text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl transition-all duration-300 leading-tight truncate ${
                  isScrolled ? "text-[#0061A8]" : "text-white drop-shadow-lg"
                }`}
              >
                Tenerife Paradise
              </h1>
              <p
                className={`text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium transition-all duration-300 leading-tight truncate ${
                  isScrolled ? "text-[#F4C762]" : "text-[#F4C762] drop-shadow-md"
                }`}
              >
                Tours & Excursions
              </p>
            </div>
          </Link>

          {/* Right Auth Section - Mejorado con mejor responsividad */}
          <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-5 flex-1 justify-end flex-shrink-0 pr-2 xs:pr-3 sm:pr-4 md:pr-6 lg:pr-8">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`relative h-6 w-6 xs:h-8 xs:w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 rounded-full p-1 xs:p-1.5 sm:p-2 transition-all duration-300 hover:scale-110 min-w-[24px] min-h-[24px] xs:min-w-[32px] xs:min-h-[32px] ${
                      isScrolled ? "hover:bg-gray-100" : "hover:bg-white/20 backdrop-blur-sm"
                    }`}
                  >
                    <Avatar className="h-5 w-5 xs:h-7 xs:w-7 sm:h-9 sm:w-9 md:h-11 md:w-11 lg:h-13 lg:w-13 ring-1 ring-white/30 shadow-lg">
                      <AvatarImage
                        src={getUserAvatar() || "/images/placeholder.svg"}
                        alt={getUserName()}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-r from-[#0061A8] to-[#F4C762] text-white text-xs xs:text-xs sm:text-xs md:text-sm lg:text-base font-bold">
                        {getUserInitials(getUserName())}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                  <div className="flex items-center justify-start gap-3 p-3 rounded-lg bg-gray-50">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage
                        src={getUserAvatar() || "/images/placeholder.svg"}
                        alt={getUserName()}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-r from-[#0061A8] to-[#F4C762] text-white text-sm font-bold">
                        {getUserInitials(getUserName())}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 leading-none min-w-0 flex-1">
                      <p className="font-semibold text-sm text-gray-900 truncate">{getUserName()}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="my-2" />
                  <div className="space-y-1">
                    <DropdownMenuItem asChild className="rounded-lg p-3 hover:bg-gray-100 transition-colors">
                      <Link href="/profile" className="flex items-center w-full">
                        <User className="mr-3 h-4 w-4 text-gray-600" />
                        <span className="font-medium">Mi Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg p-3 hover:bg-gray-100 transition-colors">
                      <Link href="/reservations" className="flex items-center w-full">
                        <Calendar className="mr-3 h-4 w-4 text-gray-600" />
                        <span className="font-medium">Mis Reservas</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg p-3 hover:bg-gray-100 transition-colors">
                      <Link href="/chat" className="flex items-center w-full">
                        <MessageCircle className="mr-3 h-4 w-4 text-gray-600" />
                        <span className="font-medium">Chat de Soporte</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-not-allowed opacity-60">
                      <div className="flex items-center w-full">
                        <Settings className="mr-3 h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-500">Configuración</span>
                        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          Próximamente
                        </span>
                      </div>
                    </DropdownMenuItem>
                    {profile?.role === 'admin' && (
                      <DropdownMenuItem asChild className="rounded-lg p-3 hover:bg-purple-50 transition-colors">
                        <Link href="/admin/dashboard" className="flex items-center w-full text-purple-600">
                          <MonitorSmartphone className="mr-3 h-4 w-4" />
                          <span className="font-medium">Panel Admin</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </div>
                  <DropdownMenuSeparator className="my-2" />

                  <DropdownMenuItem 
                    onClick={handleSignOut} 
                    className="rounded-lg p-3 hover:bg-red-50 transition-colors text-red-600"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="font-medium">Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                {/* Desktop Auth Button - Solo Iniciar Sesión */}
                <div className="hidden md:flex items-center">
                  <Button
                    variant="ghost"
                    asChild
                    className={`group transition-all duration-300 font-semibold px-6 py-3 text-base rounded-lg hover:scale-105 ${
                      isScrolled
                        ? "text-gray-700 hover:text-[#0061A8] hover:bg-gray-100/80"
                        : "text-white hover:text-[#F4C762] hover:bg-white/20 backdrop-blur-sm drop-shadow-lg"
                    }`}
                  >
                    <Link href="/auth/login" className="flex items-center space-x-2">
                      <LogIn className="w-5 h-5" />
                      <span>Iniciar Sesión</span>
                    </Link>
                  </Button>
                </div>

                {/* Tablet Auth Button - Solo Iniciar Sesión */}
                <div className="hidden sm:flex md:hidden items-center">
                  <Button
                    variant="ghost"
                    asChild
                    className={`group transition-all duration-300 font-semibold px-4 py-2.5 text-sm rounded-lg hover:scale-105 ${
                      isScrolled
                        ? "text-gray-700 hover:text-[#0061A8] hover:bg-gray-100/80"
                        : "text-white hover:text-[#F4C762] hover:bg-white/20 backdrop-blur-sm drop-shadow-lg"
                    }`}
                  >
                    <Link href="/auth/login" className="flex items-center space-x-2">
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                    </Link>
                  </Button>
                </div>

                {/* Mobile Auth Button - Solo Iniciar Sesión */}
                <div className="sm:hidden flex items-center">
                  <Button
                    variant="ghost"
                    asChild
                    className={`group transition-all duration-300 font-semibold px-3 py-2 text-sm rounded-lg hover:scale-105 min-w-[40px] min-h-[40px] ${
                      isScrolled
                        ? "text-gray-700 hover:text-[#0061A8] hover:bg-gray-100/80"
                        : "text-white hover:text-[#F4C762] hover:bg-white/20 backdrop-blur-sm drop-shadow-lg"
                    }`}
                  >
                    <Link href="/auth/login" className="flex items-center justify-center">
                      <LogIn className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu - Optimizado para pantallas pequeñas */}
        {isMobileMenuOpen && (
          <div className="xl:hidden">
            <div className="px-4 xs:px-6 sm:px-8 pt-4 pb-6 space-y-3 bg-white/95 backdrop-blur-lg rounded-xl mt-2 sm:mt-4 shadow-xl border border-gray-100">
              <Link
                href="/"
                className="block px-4 xs:px-6 sm:px-8 py-4 sm:py-5 text-gray-700 hover:text-[#0061A8] hover:bg-gray-100 rounded-lg font-medium transition-colors text-sm sm:text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/services"
                className="block px-4 xs:px-6 sm:px-8 py-4 sm:py-5 text-gray-700 hover:text-[#0061A8] hover:bg-gray-100 rounded-lg font-medium transition-colors text-sm sm:text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Servicios
              </Link>
              <Link
                href="/map"
                className="block px-4 xs:px-6 sm:px-8 py-4 sm:py-5 text-gray-700 hover:text-[#0061A8] hover:bg-gray-100 rounded-lg font-medium transition-colors text-sm sm:text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Mapa
              </Link>
              <Link
                href="/contact"
                className="block px-4 xs:px-6 sm:px-8 py-4 sm:py-5 text-gray-700 hover:text-[#0061A8] hover:bg-gray-100 rounded-lg font-medium transition-colors text-sm sm:text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contacto
              </Link>
              <Link
                href="/chat"
                className="block px-4 xs:px-6 sm:px-8 py-4 sm:py-5 text-gray-700 hover:text-[#0061A8] hover:bg-gray-100 rounded-lg font-medium transition-colors text-sm sm:text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Chat
              </Link>

              {user ? (
                <>
                  <div className="border-t border-gray-200 pt-5 sm:pt-6 mt-5 sm:mt-6">
                    <div className="flex items-center px-4 xs:px-6 sm:px-8 py-4 sm:py-5 bg-gray-50 rounded-lg">
                      <Avatar className="h-12 w-12 sm:h-14 sm:w-14 mr-4 sm:mr-5 flex-shrink-0">
                        <AvatarImage
                          src={getUserAvatar() || "/images/placeholder.svg"}
                          alt={getUserName()}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-r from-[#0061A8] to-[#F4C762] text-white text-base sm:text-lg font-bold">
                          {getUserInitials(getUserName())}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">{getUserName()}</p>
                        <p className="text-sm sm:text-base text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-4 mt-5 sm:mt-6">
                      <Link
                        href="/profile"
                        className="block px-6 xs:px-8 sm:px-10 py-5 sm:py-6 text-gray-700 hover:text-[#0061A8] hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Mi Perfil
                      </Link>
                                             <Link
                         href="/reservations"
                         className="block px-6 xs:px-8 sm:px-10 py-5 sm:py-6 text-gray-700 hover:text-[#0061A8] hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base font-medium"
                         onClick={() => setIsMobileMenuOpen(false)}
                       >
                         Mis Reservas
                       </Link>
                       <Link
                         href="/chat"
                         className="block px-6 xs:px-8 sm:px-10 py-5 sm:py-6 text-gray-700 hover:text-[#0061A8] hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base font-medium"
                         onClick={() => setIsMobileMenuOpen(false)}
                       >
                         Chat de Soporte
                       </Link>
                      {profile?.role === 'admin' && (
                        <Link
                          href="/admin/dashboard"
                          className="block px-6 xs:px-8 sm:px-10 py-5 sm:py-6 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors text-sm sm:text-base font-medium"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Panel Administrativo
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleSignOut()
                          setIsMobileMenuOpen(false)
                        }}
                        className="block w-full text-left px-6 xs:px-8 sm:px-10 py-5 sm:py-6 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm sm:text-base font-medium"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-200 pt-5 sm:pt-6 mt-5 sm:mt-6">
                  <Button
                    variant="ghost"
                    asChild
                    className="w-full justify-start text-gray-700 hover:text-[#0061A8] hover:bg-gray-100 text-sm sm:text-base font-medium py-4 sm:py-5 px-4 xs:px-6 sm:px-8"
                  >
                    <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <LogIn className="mr-3 w-4 h-4" />
                      Iniciar Sesión
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


