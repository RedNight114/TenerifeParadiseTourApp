"use client"

import React from 'react'

// Iconos minimalistas mejorados
const HotelIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2L2 7v15h20V7L12 2zM6 20V9l6-3.5L18 9v11H6z"/>
    <rect x="8" y="12" width="2" height="4" fill="white"/>
    <rect x="14" y="12" width="2" height="4" fill="white"/>
    <rect x="10" y="16" width="4" height="2" fill="white"/>
  </svg>
)

const ServiceIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="3" fill="currentColor"/>
  </svg>
)

interface PriceMarkerProps {
  type: 'hotel' | 'service'
  serviceType?: string
  price: number
  isClientHotel?: boolean
  onClick?: () => void
}

export function PriceMarker({ type, serviceType, price, isClientHotel, onClick }: PriceMarkerProps) {
  const getIcon = () => {
    if (type === 'hotel') {
      return <HotelIcon className="h-4 w-4" />
    }
    
    // Para servicios, usar el icono genérico minimalista
    return <ServiceIcon className="h-4 w-4" />
  }

  const getColors = () => {
    if (isClientHotel) {
      return {
        bg: 'bg-gradient-to-b from-blue-500 to-blue-600',
        shadow: 'shadow-lg shadow-blue-500/40',
        border: 'border-2 border-blue-400',
        pulse: 'animate-pulse',
        className: 'map-marker-hotel'
      }
    }
    
    if (type === 'hotel') {
      return {
        bg: 'bg-gradient-to-b from-blue-500 to-blue-600',
        shadow: 'shadow-lg shadow-blue-500/40',
        border: 'border-2 border-blue-400',
        pulse: '',
        className: 'map-marker-hotel'
      }
    }
    
    // Para servicios - colores vibrantes mejorados
    return {
      bg: 'bg-gradient-to-b from-emerald-500 to-emerald-600',
      shadow: 'shadow-lg shadow-emerald-500/40',
      border: 'border-2 border-emerald-400',
      pulse: '',
      className: 'map-marker-service'
    }
  }

  const colors = getColors()

  return (
    <div 
      className={`
        relative cursor-pointer transform transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-1
        ${colors.pulse}
      `}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={type === 'hotel' ? 'Hotel' : `Servicio - €${price}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.()
        }
      }}
    >
      {/* Sombra del marcador suavizada */}
      <div className={`
        absolute top-3 left-2 w-12 h-12 rounded-full blur-lg
        ${colors.shadow}
      `} />
      
      {/* Marcador principal minimalista */}
      <div className={`
        relative w-12 h-12 rounded-full flex items-center justify-center text-white
        ${colors.bg} ${colors.border}
        backdrop-blur-sm shadow-xl
        transform transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl
        group cursor-pointer
      `}>
        <div className="w-5 h-5 flex items-center justify-center transition-transform duration-300 ease-out group-hover:scale-110">
          {getIcon()}
        </div>
        
        {/* Efecto de brillo sutil */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50" />
        
        {/* Indicador de cliente mejorado */}
        {isClientHotel && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        )}
      </div>
      
      {/* Etiqueta de precio minimalista - Solo para servicios */}
      {type !== 'hotel' && (
        <div className={`
          absolute -bottom-10 left-1/2 transform -translate-x-1/2
          bg-white rounded-xl px-3 py-1.5 shadow-lg border border-gray-200
          text-sm font-semibold text-gray-800 whitespace-nowrap
          backdrop-blur-sm
          transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl
        `}>
          <div className="flex items-center gap-1">
            <span className="text-emerald-600">€</span>
            <span>{price}</span>
          </div>
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-l border-t border-gray-200"></div>
        </div>
      )}
      
      {/* Efecto de ondas suavizado para hotel del cliente */}
      {isClientHotel && (
        <>
          <div className="absolute inset-0 rounded-full border-2 border-amber-400 animate-ping opacity-60" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-0 rounded-full border border-amber-300 animate-pulse" style={{ animationDuration: '3s' }} />
        </>
      )}
    </div>
  )
}

export function UserLocationMarker() {
  return (
    <div className="relative">
      {/* Sombra */}
      <div className="absolute top-2 left-1 w-8 h-8 rounded-full blur-md bg-red-500/30" />
      
      {/* Marcador principal */}
      <div className="relative w-10 h-10 rounded-full flex items-center justify-center text-white bg-gradient-to-b from-red-500 to-red-700 border-2 border-red-300 shadow-xl">
        <div className="w-4 h-4 rounded-full bg-white" />
        
        {/* Efecto de brillo */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent opacity-60" />
      </div>
      
      {/* Efecto de ondas */}
      <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping" />
      <div className="absolute -inset-1 rounded-full bg-red-400/20 animate-ping" />
    </div>
  )
}