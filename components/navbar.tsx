"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"
import { useAuthModals } from "@/hooks/use-auth-modals"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, X, User, Settings, LogOut, Calendar } from "lucide-react"
import { AuthModals } from "@/components/auth/auth-modals"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const { user, profile, signOut } = useAuth()
  const { isLoginOpen, isRegisterOpen, openLogin, closeLogin, openRegister, closeRegister } = useAuthModals()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
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

  // Obtener la imagen de perfil del usuario
  const getUserAvatar = () => {
    return profile?.avatar_url || user?.user_metadata?.avatar_url || "/placeholder.svg"
  }

  const getUserName = () => {
    const rawName = profile?.full_name ?? user?.user_metadata?.full_name ?? user?.email ?? ""

    return typeof rawName === "string" && rawName.trim().length > 0 ? rawName : "Usuario"
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          isScrolled ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-1 xs:px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 xs:h-14 sm:h-16 md:h-18 lg:h-20">
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
                href="/about"
                className={`font-medium text-sm lg:text-base transition-all duration-300 hover:scale-105 ${
                  isScrolled ? "text-gray-700 hover:text-[#0061A8]" : "text-white hover:text-[#F4C762] drop-shadow-lg"
                }`}
              >
                Nosotros
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
                className={`p-0.5 xs:p-1 sm:p-1.5 md:p-2 transition-all duration-300 min-w-[32px] min-h-[32px] xs:min-w-[36px] xs:min-h-[36px] ${
                  isScrolled
                    ? "text-gray-700 hover:text-[#0061A8] hover:bg-gray-100"
                    : "text-white hover:text-[#F4C762] hover:bg-white/20 backdrop-blur-sm"
                }`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                ) : (
                  <Menu className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                )}
              </Button>
            </div>

            {/* Center Logo - Ultra optimizado para 320px */}
            <Link
              href="/"
              className="flex items-center space-x-0.5 xs:space-x-1 sm:space-x-2 md:space-x-3 absolute left-1/2 transform -translate-x-1/2 transition-all duration-300 hover:scale-105 max-w-[55%] xs:max-w-[65%] sm:max-w-[75%] md:max-w-none"
            >
              <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 relative flex-shrink-0">
                {!logoError ? (
                  <Image
                    src="/images/logo-tenerife.png"
                    alt="Tenerife Paradise Tours & Excursions"
                    fill
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
                      className={`font-bold text-xs xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl transition-colors duration-300 text-white`}
                    >
                      TP
                    </span>
                  </div>
                )}
              </div>
              <div className="text-center min-w-0 flex-shrink overflow-hidden">
                <h1
                  className={`font-bold text-xs xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl transition-all duration-300 leading-tight truncate ${
                    isScrolled ? "text-[#0061A8]" : "text-white drop-shadow-lg"
                  }`}
                >
                  <span className="hidden sm:inline">Tenerife Paradise</span>
                  <span className="sm:hidden">Tenerife</span>
                </h1>
                <p
                  className={`text-xs xs:text-xs sm:text-xs md:text-sm lg:text-base font-medium transition-all duration-300 leading-tight truncate ${
                    isScrolled ? "text-[#F4C762]" : "text-[#F4C762] drop-shadow-md"
                  }`}
                >
                  <span className="hidden sm:inline">Tours & Excursions</span>
                  <span className="sm:hidden">Tours</span>
                </p>
              </div>
            </Link>

            {/* Right Auth Section - Ultra optimizado para 320px */}
            <div className="flex items-center space-x-0.5 xs:space-x-1 sm:space-x-2 md:space-x-3 lg:space-x-4 flex-1 justify-end flex-shrink-0">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`relative h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 rounded-full p-0 transition-all duration-300 hover:scale-110 min-w-[24px] min-h-[24px] ${
                        isScrolled ? "hover:bg-gray-100" : "hover:bg-white/20 backdrop-blur-sm"
                      }`}
                    >
                      <Avatar className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 ring-1 ring-white/30 shadow-lg">
                        <AvatarImage
                          src={getUserAvatar() || "/placeholder.svg"}
                          alt={getUserName()}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-r from-[#0061A8] to-[#F4C762] text-white text-xs xs:text-xs sm:text-xs md:text-sm lg:text-base font-bold">
                          {getUserInitials(getUserName())}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-sm">{getUserName()}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Mi Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/reservations" className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Mis Reservas
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Configuración
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  {/* Desktop Auth Buttons */}
                  <div className="hidden sm:flex items-center space-x-2 md:space-x-4">
                    <Button
                      variant="ghost"
                      onClick={openLogin}
                      className={`transition-all duration-300 font-medium px-3 sm:px-4 md:px-6 py-2 text-xs sm:text-sm md:text-base ${
                        isScrolled
                          ? "text-gray-700 hover:text-[#0061A8] hover:bg-gray-100"
                          : "text-white hover:text-[#F4C762] hover:bg-white/20 backdrop-blur-sm drop-shadow-lg"
                      }`}
                    >
                      Iniciar Sesión
                    </Button>
                    <Button
                      onClick={openRegister}
                      className={`transition-all duration-300 font-semibold px-3 sm:px-4 md:px-6 lg:px-8 py-2 md:py-3 rounded-lg md:rounded-xl shadow-lg hover:shadow-xl hover:scale-105 text-xs sm:text-sm md:text-base ${
                        isScrolled
                          ? "bg-gradient-to-r from-[#0061A8] to-[#F4C762] hover:from-[#0061A8]/90 hover:to-[#F4C762]/90 text-white"
                          : "bg-[#F4C762] hover:bg-[#F4C762]/90 text-[#0061A8] border-2 border-[#F4C762]"
                      }`}
                    >
                      <span className="hidden md:inline">Reservar Ahora</span>
                      <span className="md:hidden">Reservar</span>
                    </Button>
                  </div>

                  {/* Mobile Auth Buttons - Ultra optimizado para 320px */}
                  <div className="sm:hidden flex items-center space-x-0.5">
                    <Button
                      variant="ghost"
                      onClick={openLogin}
                      className={`transition-all duration-300 font-medium px-1 xs:px-1.5 py-0.5 xs:py-1 text-xs min-w-[28px] min-h-[28px] xs:min-w-[32px] xs:min-h-[32px] ${
                        isScrolled
                          ? "text-gray-700 hover:text-[#0061A8] hover:bg-gray-100"
                          : "text-white hover:text-[#F4C762] hover:bg-white/20 backdrop-blur-sm drop-shadow-lg"
                      }`}
                    >
                      <span className="hidden xs:inline">Login</span>
                      <span className="xs:hidden">In</span>
                    </Button>
                    <Button
                      onClick={openRegister}
                      className={`transition-all duration-300 font-semibold px-1 xs:px-1.5 py-0.5 xs:py-1 rounded-md shadow-lg hover:shadow-xl text-xs min-w-[32px] min-h-[28px] xs:min-w-[40px] xs:min-h-[32px] ${
                        isScrolled
                          ? "bg-gradient-to-r from-[#0061A8] to-[#F4C762] hover:from-[#0061A8]/90 hover:to-[#F4C762]/90 text-white"
                          : "bg-[#F4C762] hover:bg-[#F4C762]/90 text-[#0061A8] border border-[#F4C762]"
                      }`}
                    >
                      <span className="hidden xs:inline">Reservar</span>
                      <span className="xs:hidden">Re</span>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu - Optimizado para pantallas pequeñas */}
          {isMobileMenuOpen && (
            <div className="xl:hidden">
              <div className="px-2 xs:px-3 sm:px-4 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-lg rounded-xl mt-2 sm:mt-4 shadow-xl border border-gray-100">
                <Link
                  href="/"
                  className="block px-2 xs:px-3 sm:px-4 py-2 sm:py-3 text-gray-700 hover:text-[#0061A8] hover:bg-gray-100 rounded-lg font-medium transition-colors text-sm sm:text-base"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Inicio
                </Link>
                <Link
                  href="/services"
                  className="block px-2 xs:px-3 sm:px-4 py-2 sm:py-3 text-gray-700 hover:text-[#0061A8] hover:bg-gray-100 rounded-lg font-medium transition-colors text-sm sm:text-base"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Servicios
                </Link>
                <Link
                  href="/about"
                  className="block px-2 xs:px-3 sm:px-4 py-2 sm:py-3 text-gray-700 hover:text-[#0061A8] hover:bg-gray-100 rounded-lg font-medium transition-colors text-sm sm:text-base"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Nosotros
                </Link>
                <Link
                  href="/contact"
                  className="block px-2 xs:px-3 sm:px-4 py-2 sm:py-3 text-gray-700 hover:text-[#0061A8] hover:bg-gray-100 rounded-lg font-medium transition-colors text-sm sm:text-base"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contacto
                </Link>

                {user ? (
                  <>
                    <div className="border-t border-gray-200 pt-3 sm:pt-4 mt-3 sm:mt-4">
                      <div className="flex items-center px-2 xs:px-3 sm:px-4 py-2 sm:py-3">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-3 flex-shrink-0">
                          <AvatarImage
                            src={getUserAvatar() || "/placeholder.svg"}
                            alt={getUserName()}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-gradient-to-r from-[#0061A8] to-[#F4C762] text-white text-xs sm:text-sm">
                            {getUserInitials(getUserName())}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{getUserName()}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-2 xs:px-3 sm:px-4 py-2 sm:py-3 text-gray-700 hover:text-[#0061A8] hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Mi Perfil
                      </Link>
                      <Link
                        href="/reservations"
                        className="block px-2 xs:px-3 sm:px-4 py-2 sm:py-3 text-gray-700 hover:text-[#0061A8] hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Mis Reservas
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut()
                          setIsMobileMenuOpen(false)
                        }}
                        className="block w-full text-left px-2 xs:px-3 sm:px-4 py-2 sm:py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm sm:text-base"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-gray-200 pt-3 sm:pt-4 mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        openLogin()
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full justify-start text-gray-700 hover:text-[#0061A8] hover:bg-gray-100 text-sm sm:text-base"
                    >
                      Iniciar Sesión
                    </Button>
                    <Button
                      onClick={() => {
                        openRegister()
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full bg-gradient-to-r from-[#0061A8] to-[#F4C762] hover:from-[#0061A8]/90 hover:to-[#F4C762]/90 text-white text-sm sm:text-base"
                    >
                      Reservar Ahora
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModals />
    </>
  )
}
