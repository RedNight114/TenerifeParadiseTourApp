"use client"

import { MapPin, Hotel, Compass, Mountain } from 'lucide-react'

export function MapLoading3D() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center relative overflow-hidden">
      {/* Fondo animado */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 animate-pulse" />
      
      {/* Contenido principal */}
      <div className="relative z-10 text-center space-y-6">
        {/* Logo animado */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-spin" />
          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
            <MapPin className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        {/* Texto de carga */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-800">Cargando Mapa Interactivo</h3>
          <p className="text-sm text-gray-600">Preparando la experiencia de Tenerife</p>
        </div>
        
        {/* Indicadores de progreso */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-200" />
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce animation-delay-400" />
        </div>
        
        {/* Iconos flotantes */}
        <div className="absolute top-4 left-4 animate-float">
          <Hotel className="h-6 w-6 text-blue-400 opacity-60" />
        </div>
        <div className="absolute top-8 right-8 animate-float animation-delay-1000">
          <Mountain className="h-6 w-6 text-green-400 opacity-60" />
        </div>
        <div className="absolute bottom-8 left-8 animate-float animation-delay-2000">
          <Compass className="h-6 w-6 text-purple-400 opacity-60" />
        </div>
        <div className="absolute bottom-4 right-4 animate-float animation-delay-3000">
          <MapPin className="h-6 w-6 text-pink-400 opacity-60" />
        </div>
      </div>
      
      {/* Efectos de partículas */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function MapError3D({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-red-50 to-orange-100 rounded-xl flex items-center justify-center relative overflow-hidden">
      {/* Fondo animado */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 via-orange-400/20 to-yellow-400/20 animate-pulse" />
      
      {/* Contenido principal */}
      <div className="relative z-10 text-center space-y-6 max-w-md mx-auto px-4">
        {/* Icono de error */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-600 rounded-full animate-pulse" />
          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
            <MapPin className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        {/* Texto de error */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-800">Error al Cargar el Mapa</h3>
          <p className="text-sm text-gray-600">
            No se pudo cargar el mapa interactivo. Verifica tu conexión a internet.
          </p>
        </div>
        
        {/* Botón de reintento */}
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Reintentar
        </button>
        
        {/* Información adicional */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Verifica tu conexión a internet</p>
          <p>• Comprueba que el servicio esté disponible</p>
          <p>• Si el problema persiste, contacta con soporte</p>
        </div>
      </div>
    </div>
  )
}
