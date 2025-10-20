"use client"

import React from 'react'

// Iconos minimalistas mejorados
export const AirportIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2L8 6h8l-4-4zM4 8h16v2H4V8zM6 12h12v2H6v-2zM8 16h8v2H8v-2z"/>
  </svg>
)

export const TeideIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2L2 22h20L12 2zM12 6l6 14H6l6-14z"/>
  </svg>
)

export const HotelIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2L2 7v15h20V7L12 2zM6 20V9l6-3.5L18 9v11H6z"/>
    <rect x="8" y="12" width="2" height="4" fill="white"/>
    <rect x="14" y="12" width="2" height="4" fill="white"/>
    <rect x="10" y="16" width="4" height="2" fill="white"/>
  </svg>
)

export const ServiceIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="3" fill="currentColor"/>
  </svg>
)

// Componente para marcadores de aeropuerto
export function AirportMarker({ onClick }: { onClick?: () => void }) {
  return (
    <div 
      className="relative cursor-pointer transform transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-1"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label="Aeropuerto"
    >
      {/* Sombra suavizada */}
      <div className="absolute top-2 left-1 w-10 h-10 rounded-full blur-md bg-blue-500/20" />
      
      {/* Marcador principal minimalista */}
      <div className="relative w-12 h-12 rounded-full flex items-center justify-center text-white bg-gradient-to-b from-blue-500 to-blue-600 border-2 border-blue-400 shadow-lg minimalist-marker">
        <div className="w-5 h-5 flex items-center justify-center">
          <AirportIcon className="w-5 h-5" />
        </div>
        
        {/* Efecto de brillo sutil */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-50" />
      </div>
    </div>
  )
}

// Componente para marcadores del Teide
export function TeideMarker({ onClick }: { onClick?: () => void }) {
  return (
    <div 
      className="relative cursor-pointer transform transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-1"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label="Parque Nacional del Teide"
    >
      {/* Sombra suavizada */}
      <div className="absolute top-2 left-1 w-10 h-10 rounded-full blur-md bg-orange-500/20" />
      
      {/* Marcador principal minimalista */}
      <div className="relative w-12 h-12 rounded-full flex items-center justify-center text-white bg-gradient-to-b from-orange-500 to-orange-600 border-2 border-orange-400 shadow-lg minimalist-marker">
        <div className="w-5 h-5 flex items-center justify-center">
          <TeideIcon className="w-5 h-5" />
        </div>
        
        {/* Efecto de brillo sutil */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-50" />
      </div>
    </div>
  )
}
