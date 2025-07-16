"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter, Shield } from 'lucide-react'

export function Footer() {
  const [logoError, setLogoError] = useState(false)

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Sección principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Logo y descripción */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 relative flex-shrink-0">
                {!logoError ? (
                  <Image
                    src="/images/logo-tenerife.png"
                    alt="Tenerife Paradise Tours & Excursions"
                    fill
                    className="object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-[#0061A8] to-[#F4C762] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">TP</span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Tenerife Paradise</h3>
                <p className="text-[#F4C762] font-medium text-center">Tours & Excursions</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Descubre la magia de Tenerife con nuestras experiencias únicas. 
              Tours personalizados, aventuras inolvidables y el mejor servicio 
              para hacer de tu visita una experiencia extraordinaria.
            </p>
            
            {/* Redes sociales */}
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com/tenerifeparadise" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors duration-200"
                aria-label="Síguenos en Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://instagram.com/tenerifeparadise" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-pink-600 hover:bg-pink-700 rounded-full flex items-center justify-center transition-colors duration-200"
                aria-label="Síguenos en Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com/tenerifeparadise" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-400 hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors duration-200"
                aria-label="Síguenos en Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Enlaces Rápidos</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/" 
                  className="text-gray-300 hover:text-[#F4C762] transition-colors duration-200 text-sm"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link 
                  href="/services" 
                  className="text-gray-300 hover:text-[#F4C762] transition-colors duration-200 text-sm"
                >
                  Nuestros Servicios
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-gray-300 hover:text-[#F4C762] transition-colors duration-200 text-sm"
                >
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-gray-300 hover:text-[#F4C762] transition-colors duration-200 text-sm"
                >
                  Contacto
                </Link>
              </li>
              <li>
                <Link 
                  href="/reservations" 
                  className="text-gray-300 hover:text-[#F4C762] transition-colors duration-200 text-sm"
                >
                  Mis Reservas
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/login" 
                  className="text-gray-400 hover:text-[#F4C762] transition-colors duration-200 text-xs flex items-center space-x-1"
                >
                  <Shield className="h-3 w-3" />
                  <span>Admin</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Servicios populares */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Servicios Populares</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/services?category=tours" 
                  className="text-gray-300 hover:text-[#F4C762] transition-colors duration-200 text-sm"
                >
                  Tours Guiados
                </Link>
              </li>
              <li>
                <Link 
                  href="/services?category=aventura" 
                  className="text-gray-300 hover:text-[#F4C762] transition-colors duration-200 text-sm"
                >
                  Aventuras Extremas
                </Link>
              </li>
              <li>
                <Link 
                  href="/services?category=naturaleza" 
                  className="text-gray-300 hover:text-[#F4C762] transition-colors duration-200 text-sm"
                >
                  Naturaleza y Senderismo
                </Link>
              </li>
              <li>
                <Link 
                  href="/services?category=gastronomia" 
                  className="text-gray-300 hover:text-[#F4C762] transition-colors duration-200 text-sm"
                >
                  Experiencias Gastronómicas
                </Link>
              </li>
              <li>
                <Link 
                  href="/services?category=cultura" 
                  className="text-gray-300 hover:text-[#F4C762] transition-colors duration-200 text-sm"
                >
                  Cultura Local
                </Link>
              </li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Contacto</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-[#F4C762] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-sm">Teléfono</p>
                  <a 
                    href="tel:+34617303929" 
                    className="text-white hover:text-[#F4C762] transition-colors duration-200 font-medium"
                  >
                    +34 617 30 39 29
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-[#F4C762] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-sm">Email</p>
                  <a 
                    href="mailto:info@tenerifeparadise.com" 
                    className="text-white hover:text-[#F4C762] transition-colors duration-200 font-medium"
                  >
                    info@tenerifeparadise.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-[#F4C762] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-sm">Ubicación</p>
                  <p className="text-white font-medium">Santa Cruz de Tenerife</p>
                  <p className="text-gray-300 text-sm">Islas Canarias, España</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-[#F4C762] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-sm">Horario</p>
                  <p className="text-white font-medium">Lun - Dom: 8:00 - 20:00</p>
                  <p className="text-gray-300 text-sm">Atención 24/7 para emergencias</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Línea divisoria */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} Tenerife Paradise Tours & Excursions. 
                Todos los derechos reservados.
              </p>
            </div>

            {/* Enlaces legales */}
            <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
              <Link 
                href="/privacy" 
                className="text-gray-400 hover:text-[#F4C762] transition-colors duration-200"
              >
                Política de Privacidad
              </Link>
              <Link 
                href="/terms" 
                className="text-gray-400 hover:text-[#F4C762] transition-colors duration-200"
              >
                Términos y Condiciones
              </Link>
              <Link 
                href="/cookies" 
                className="text-gray-400 hover:text-[#F4C762] transition-colors duration-200"
              >
                Política de Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Certificaciones y badges */}
      <div className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8 text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span>Empresa Certificada</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">🛡️</span>
              </div>
              <span>Pagos Seguros</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">⭐</span>
              </div>
              <span>Calidad Garantizada</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
