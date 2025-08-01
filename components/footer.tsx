"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Facebook, Instagram, Mail, Phone, MapPin, Clock, Shield, Star, CheckCircle, ArrowUp } from "lucide-react"
import { CookieSettingsModal } from "@/components/cookie-settings-modal"
import { LegalModal } from "@/components/legal-modals"

export function Footer() {
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false)
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: 'privacy' | 'terms' | 'cookies' | null }>({
    isOpen: false,
    type: null
  })

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openLegalModal = (type: 'privacy' | 'terms' | 'cookies') => {
    setLegalModal({ isOpen: true, type })
  }

  const closeLegalModal = () => {
    setLegalModal({ isOpen: false, type: null })
  }

  return (
    <>
      <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="relative container mx-auto px-4 py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 relative">
                    <Image
                      src="/images/logo-tenerife.png"
                      alt="TenerifeParadiseTour&Excursions"
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Tenerife Paradise</h3>
                    <p className="text-[#F4C762] text-sm font-medium">Tours & Excursions</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Descubre la magia de Tenerife con nuestras experiencias únicas. Tours personalizados, 
                  aventuras inolvidables y el mejor servicio para hacer de tu visita una experiencia extraordinaria.
                </p>
              </div>
              
              {/* Social Media */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-400">Síguenos</p>
                <div className="flex space-x-4">
                  <Link 
                    href="https://www.facebook.com/share/16HZZK6eA1/?mibextid=wwXIfr" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-2 bg-gray-800 hover:bg-blue-600 rounded-full transition-all duration-300 transform hover:scale-110"
                  >
                    <Facebook className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                  </Link>
                  <Link 
                    href="https://www.instagram.com/tenerifeparadisetoursexcursion?igsh=MWs4em9zMHQ2OWps" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-2 bg-gray-800 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 rounded-full transition-all duration-300 transform hover:scale-110"
                  >
                    <Instagram className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                  </Link>
                  <Link 
                    href="https://www.tiktok.com/@tenerifeparadisetours?_t=ZN-8wjOzUGK0DG&_r=1" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-2 bg-gray-800 hover:bg-black rounded-full transition-all duration-300 transform hover:scale-110"
                  >
                    <svg className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white relative">
                Enlaces Rápidos
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-[#F4C762] to-[#FFD700]"></div>
              </h4>
              <ul className="space-y-3">
                {[
                  { href: "/", label: "Inicio" },
                  { href: "/services", label: "Nuestros Servicios" },
                  { href: "/about", label: "Sobre Nosotros" },
                  { href: "/contact", label: "Contacto" },
                  { href: "/reservations", label: "Mis Reservas" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-[#F4C762] transition-all duration-200 text-sm flex items-center group"
                    >
                      <span className="w-0 h-0.5 bg-[#F4C762] group-hover:w-4 transition-all duration-300 mr-2"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories from Database */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white relative">
                Nuestras Categorías
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-[#F4C762] to-[#FFD700]"></div>
              </h4>
              <ul className="space-y-3">
                {[
                  { href: "/services?category=activities", label: "Actividades & Aventuras", count: "26" },
                  { href: "/services?category=renting", label: "Alquiler de Vehículos", count: "16" },
                  { href: "/services?category=gastronomy", label: "Experiencias Gastronómicas", count: "13" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-[#F4C762] transition-all duration-200 text-sm flex items-center justify-between group"
                    >
                      <div className="flex items-center">
                        <span className="w-0 h-0.5 bg-[#F4C762] group-hover:w-4 transition-all duration-300 mr-2"></span>
                        {link.label}
                      </div>
                      <span className="text-xs text-gray-500 group-hover:text-[#F4C762] transition-colors">
                        {link.count}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white relative">
                Contacto
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-[#F4C762] to-[#FFD700]"></div>
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3 group">
                  <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gradient-to-r group-hover:from-[#F4C762] group-hover:to-[#FFD700] transition-all duration-300">
                    <Phone className="h-4 w-4 text-[#F4C762] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-medium">Teléfono</p>
                    <p className="text-gray-300 text-sm">+34 617 30 39 29</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 group">
                  <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gradient-to-r group-hover:from-[#F4C762] group-hover:to-[#FFD700] transition-all duration-300">
                    <Mail className="h-4 w-4 text-[#F4C762] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-medium">Email</p>
                    <p className="text-gray-300 text-sm">Tenerifeparadisetoursandexcursions@hotmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 group">
                  <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gradient-to-r group-hover:from-[#F4C762] group-hover:to-[#FFD700] transition-all duration-300">
                    <MapPin className="h-4 w-4 text-[#F4C762] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-medium">Ubicación</p>
                    <p className="text-gray-300 text-sm">Santa Cruz de Tenerife</p>
                    <p className="text-gray-300 text-sm">Islas Canarias, España</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 group">
                  <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gradient-to-r group-hover:from-[#F4C762] group-hover:to-[#FFD700] transition-all duration-300">
                    <Clock className="h-4 w-4 text-[#F4C762] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-medium">Horario</p>
                    <p className="text-gray-300 text-sm">Lun - Dom: 8:00 - 20:00</p>
                    <p className="text-gray-300 text-xs">Atención 24/7 para emergencias</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
              {/* Copyright with QuickAgence */}
              <div className="text-gray-400 text-sm">
                <span>© 2025 QuickAgence. Todos los derechos reservados. by QuickAgence</span>
              </div>
              
              {/* Legal Links with Cookie Settings */}
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <Link
                  href="/privacy-policy"
                  className="text-gray-400 hover:text-[#F4C762] transition-colors duration-200 hover:underline"
                >
                  Política de Privacidad
                </Link>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-[#F4C762] transition-colors duration-200 hover:underline"
                >
                  Términos y Condiciones
                </Link>
                <Link
                  href="/cookies-policy"
                  className="text-gray-400 hover:text-[#F4C762] transition-colors duration-200 hover:underline"
                >
                  Política de Cookies
                </Link>
                <span
                  onClick={() => setIsCookieModalOpen(true)}
                  className="text-gray-500 hover:text-gray-400 cursor-pointer transition-colors duration-200 hover:underline"
                >
                  Configuración
                </span>
              </div>
            </div>
            
            {/* Certifications */}
            <div className="flex flex-wrap justify-center gap-6 mt-6 pt-6 border-t border-gray-800">
              <div className="flex items-center space-x-2 text-green-400 text-xs">
                <CheckCircle className="h-4 w-4" />
                <span>Empresa Certificada</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-400 text-xs">
                <Shield className="h-4 w-4" />
                <span>Pagos Seguros</span>
              </div>
              <div className="flex items-center space-x-2 text-yellow-400 text-xs">
                <Star className="h-4 w-4" />
                <span>Calidad Garantizada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Single Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-gradient-to-r from-[#F4C762] to-[#FFD700] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50"
          aria-label="Volver arriba"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </footer>

      {/* Cookie Settings Modal */}
      <CookieSettingsModal 
        isOpen={isCookieModalOpen} 
        onClose={() => setIsCookieModalOpen(false)} 
      />

      {/* Legal Modals */}
      {legalModal.isOpen && legalModal.type && (
        <LegalModal 
          isOpen={legalModal.isOpen}
          type={legalModal.type}
          onClose={closeLegalModal}
        />
      )}
    </>
  )
}
