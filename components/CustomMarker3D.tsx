"use client"

import React from 'react'

// Iconos SVG realistas y optimizados
const HotelIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2L2 7v15h20V7L12 2zM6 20V9l6-3.5L18 9v11H6z"/>
    <rect x="8" y="12" width="2" height="4" fill="currentColor"/>
    <rect x="14" y="12" width="2" height="4" fill="currentColor"/>
    <rect x="10" y="16" width="4" height="2" fill="currentColor"/>
  </svg>
)

const AdventureIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    <circle cx="12" cy="7" r="2" fill="currentColor"/>
    <path d="M8 12l4 2 4-2" stroke="currentColor" strokeWidth="1" fill="none"/>
  </svg>
)

const RelaxIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
  </svg>
)

const CultureIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    <circle cx="12" cy="12" r="3" fill="white"/>
  </svg>
)

const GastronomyIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 12l1.47-1.47z"/>
  </svg>
)

const TransportIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
  </svg>
)

const ExcursionIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    <circle cx="12" cy="12" r="2" fill="white"/>
  </svg>
)

const DefaultServiceIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
)

interface CustomMarkerProps {
  type: 'hotel' | 'service'
  serviceType?: string
  isClientHotel?: boolean
  onClick?: () => void
}

export function CustomMarker3D({ type, serviceType, isClientHotel, onClick }: CustomMarkerProps) {
  const getIcon = () => {
    if (type === 'hotel') {
      return <HotelIcon className="h-6 w-6" />
    }
    
    // Iconos específicos según tipo de servicio
    switch (serviceType?.toLowerCase()) {
      case 'aventura':
      case 'senderismo':
      case 'hiking':
      case 'montaña':
        return <AdventureIcon className="h-6 w-6" />
      case 'relax':
      case 'playa':
      case 'mar':
      case 'oceano':
      case 'buceo':
        return <RelaxIcon className="h-6 w-6" />
      case 'cultura':
      case 'fotografia':
      case 'foto':
        return <CultureIcon className="h-6 w-6" />
      case 'gastronomia':
      case 'comida':
        return <GastronomyIcon className="h-6 w-6" />
      case 'transporte':
      case 'coche':
        return <TransportIcon className="h-6 w-6" />
      case 'excursion':
      case 'tour':
        return <ExcursionIcon className="h-6 w-6" />
      default:
        return <DefaultServiceIcon className="h-6 w-6" />
    }
  }

  const getColors = () => {
    if (isClientHotel) {
      return {
        bg: 'bg-gradient-to-b from-blue-400 to-blue-600',
        shadow: 'shadow-lg shadow-blue-500/50',
        border: 'border-2 border-blue-300',
        pulse: 'animate-pulse'
      }
    }
    
    if (type === 'hotel') {
      // Hoteles como referencia - estilo neutro
      return {
        bg: 'bg-gradient-to-b from-gray-400 to-gray-600',
        shadow: 'shadow-lg shadow-gray-500/50',
        border: 'border-2 border-gray-300',
        pulse: ''
      }
    }
    
    // Servicios más llamativos para destacarlos
    switch (serviceType?.toLowerCase()) {
      case 'aventura':
      case 'senderismo':
      case 'hiking':
      case 'montaña':
        return {
          bg: 'bg-gradient-to-b from-orange-500 to-orange-700',
          shadow: 'shadow-lg shadow-orange-500/50',
          border: 'border-2 border-orange-300',
          pulse: ''
        }
      case 'relax':
      case 'playa':
      case 'mar':
      case 'oceano':
      case 'buceo':
        return {
          bg: 'bg-gradient-to-b from-purple-500 to-purple-700',
          shadow: 'shadow-lg shadow-purple-500/50',
          border: 'border-2 border-purple-300',
          pulse: ''
        }
      case 'cultura':
      case 'fotografia':
      case 'foto':
        return {
          bg: 'bg-gradient-to-b from-red-500 to-red-700',
          shadow: 'shadow-lg shadow-red-500/50',
          border: 'border-2 border-red-300',
          pulse: ''
        }
      case 'gastronomia':
      case 'comida':
        return {
          bg: 'bg-gradient-to-b from-yellow-500 to-yellow-700',
          shadow: 'shadow-lg shadow-yellow-500/50',
          border: 'border-2 border-yellow-300',
          pulse: ''
        }
      case 'transporte':
      case 'coche':
        return {
          bg: 'bg-gradient-to-b from-gray-500 to-gray-700',
          shadow: 'shadow-lg shadow-gray-500/50',
          border: 'border-2 border-gray-300',
          pulse: ''
        }
      case 'excursion':
      case 'tour':
        return {
          bg: 'bg-gradient-to-b from-indigo-500 to-indigo-700',
          shadow: 'shadow-lg shadow-indigo-500/50',
          border: 'border-2 border-indigo-300',
          pulse: ''
        }
      default:
        return {
          bg: 'bg-gradient-to-b from-green-500 to-green-700',
          shadow: 'shadow-lg shadow-green-500/50',
          border: 'border-2 border-green-300',
          pulse: ''
        }
    }
  }

  const getAriaLabel = () => {
    if (type === 'hotel') {
      return isClientHotel ? 'Tu hotel - Punto de referencia' : 'Hotel - Punto de referencia'
    }
    
    const serviceLabels: { [key: string]: string } = {
      'aventura': 'Servicio de aventura - Excursión activa',
      'senderismo': 'Servicio de senderismo - Ruta de montaña',
      'hiking': 'Servicio de senderismo - Ruta de montaña',
      'montaña': 'Servicio de montaña - Actividad de altura',
      'relax': 'Servicio de relax - Actividad relajante',
      'playa': 'Servicio de playa - Actividad costera',
      'mar': 'Servicio marítimo - Actividad acuática',
      'oceano': 'Servicio oceánico - Actividad marina',
      'buceo': 'Servicio de buceo - Actividad subacuática',
      'cultura': 'Servicio cultural - Actividad educativa',
      'fotografia': 'Servicio de fotografía - Tour fotográfico',
      'foto': 'Servicio de fotografía - Tour fotográfico',
      'gastronomia': 'Servicio gastronómico - Experiencia culinaria',
      'comida': 'Servicio gastronómico - Experiencia culinaria',
      'transporte': 'Servicio de transporte - Movilidad',
      'coche': 'Servicio de transporte - Vehículo',
      'excursion': 'Servicio de excursión - Tour guiado',
      'tour': 'Servicio de tour - Visita guiada'
    }
    
    const serviceTypeLower = serviceType?.toLowerCase() || ''
    return serviceLabels[serviceTypeLower] || 'Servicio turístico - Actividad disponible'
  }

  const colors = getColors()

  return (
    <div 
      className={`
        relative cursor-pointer transform transition-all duration-300 hover:scale-110 hover:-translate-y-1
        ${colors.pulse}
      `}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={getAriaLabel()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.()
        }
      }}
    >
      {/* Sombra del marcador */}
      <div className={`
        absolute top-2 left-1 w-8 h-8 rounded-full blur-sm
        ${colors.shadow}
      `} />
      
      {/* Marcador principal */}
      <div className={`
        relative w-10 h-10 rounded-full flex items-center justify-center text-white
        ${colors.bg} ${colors.border}
        backdrop-blur-sm
      `}>
        {getIcon()}
        
        {/* Efecto de brillo */}
        <div className="absolute inset-0 rounded-full bg-white/20 opacity-50" />
        
        {/* Indicador de cliente */}
        {isClientHotel && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        )}
      </div>
      
      {/* Efecto de ondas para hotel del cliente */}
      {isClientHotel && (
        <>
          <div className="absolute inset-0 rounded-full border-2 border-yellow-400 animate-ping" />
          <div className="absolute inset-0 rounded-full border-2 border-yellow-400 animate-ping animation-delay-1000" />
        </>
      )}
    </div>
  )
}

// Componente para marcador de ubicación del usuario
export function UserLocationMarker() {
  return (
    <div className="relative">
      {/* Sombra */}
      <div className="absolute top-1 left-1 w-6 h-6 bg-blue-600 rounded-full blur-sm opacity-50" />
      
      {/* Marcador principal */}
      <div className="relative w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg">
        <div className="w-3 h-3 bg-white rounded-full" />
      </div>
      
      {/* Efecto de pulso */}
      <div className="absolute inset-0 rounded-full border-2 border-blue-600 animate-ping" />
      <div className="absolute inset-0 rounded-full border-2 border-blue-600 animate-ping animation-delay-1000" />
    </div>
  )
}
