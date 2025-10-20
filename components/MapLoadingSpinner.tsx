"use client"

import { MapPin, Loader2 } from 'lucide-react'

interface MapLoadingSpinnerProps {
  message?: string
  submessage?: string
}

export function MapLoadingSpinner({ 
  message = "Cargando Mapa de Tenerife", 
  submessage = "Preparando tu experiencia interactiva..." 
}: MapLoadingSpinnerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0061A8] to-[#F4C762] flex items-center justify-center">
      <div className="text-center">
        {/* Spinner principal simplificado */}
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="h-8 w-8 text-white animate-pulse" />
          </div>
        </div>

        {/* Texto de carga */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">
            {message}
          </h2>
          <p className="text-white/90 text-lg max-w-md mx-auto leading-relaxed">
            {submessage}
          </p>
        </div>

        {/* Barra de progreso simplificada */}
        <div className="mt-6 w-64 bg-white/20 rounded-full h-2 mx-auto overflow-hidden">
          <div className="bg-white h-2 rounded-full animate-pulse"></div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 text-white/70 text-sm">
          <p>📍 Cargando ubicaciones de Tenerife</p>
          <p>🏨 Preparando hoteles y servicios</p>
          <p>🗺️ Configurando mapa interactivo</p>
        </div>
      </div>
    </div>
  )
}

interface MapErrorScreenProps {
  error: string
  onRetry: () => void
}

export function MapErrorScreen({ error, onRetry }: MapErrorScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Icono de error */}
        <div className="text-white text-8xl mb-6">⚠️</div>
        
        {/* Mensaje de error */}
        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Error al cargar el mapa
        </h2>
        <p className="text-white/90 text-lg mb-8 leading-relaxed">
          {error}
        </p>

        {/* Botón de reintentar */}
        <button
          onClick={onRetry}
          className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          <Loader2 className="h-5 w-5 mr-2 inline animate-spin" />
          Reintentar
        </button>

        {/* Información adicional */}
        <div className="mt-8 text-white/70 text-sm">
          <p>Si el problema persiste, verifica tu conexión a internet</p>
        </div>
      </div>
    </div>
  )
}
