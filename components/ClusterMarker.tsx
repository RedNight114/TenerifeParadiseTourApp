"use client"

import React from 'react'

interface ClusterMarkerProps {
  count: number
  onClick?: () => void
  isSelected?: boolean
}

export function ClusterMarker({ count, onClick, isSelected }: ClusterMarkerProps) {
  const getSize = () => {
    if (count <= 5) return 'w-12 h-12'
    if (count <= 10) return 'w-14 h-14'
    if (count <= 20) return 'w-16 h-16'
    return 'w-18 h-18'
  }

  const getTextSize = () => {
    if (count <= 5) return 'text-sm'
    if (count <= 10) return 'text-base'
    if (count <= 20) return 'text-lg'
    return 'text-xl'
  }

  const getColor = () => {
    if (isSelected) {
      return 'bg-gradient-to-b from-blue-500 to-blue-600 border-blue-400 map-marker-cluster-small'
    }
    if (count <= 5) {
      return 'bg-gradient-to-b from-emerald-500 to-emerald-600 border-emerald-400 map-marker-cluster-small'
    }
    if (count <= 10) {
      return 'bg-gradient-to-b from-orange-500 to-orange-600 border-orange-400 map-marker-cluster-medium'
    }
    return 'bg-gradient-to-b from-red-500 to-red-600 border-red-400 map-marker-cluster-large'
  }

  return (
    <div 
      className={`
        relative cursor-pointer transform transition-all duration-500 ease-out hover:scale-110 hover:-translate-y-1
        ${isSelected ? 'animate-pulse' : ''}
      `}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${count} servicios en esta ubicación`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.()
        }
      }}
    >
      {/* Sombra del marcador */}
      <div className={`
        absolute top-3 left-2 ${getSize()} rounded-full blur-lg
        ${isSelected ? 'bg-blue-500/40' : 'bg-emerald-500/40'}
      `} />
      
      {/* Marcador principal */}
      <div className={`
        relative ${getSize()} rounded-full flex items-center justify-center text-white
        ${getColor()} border-2
        backdrop-blur-sm shadow-xl
        transform transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl
        group cursor-pointer
      `}>
        <div className={`${getTextSize()} font-bold transition-transform duration-300 ease-out group-hover:scale-110`}>
          {count}
        </div>
        
        {/* Efecto de brillo sutil */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50" />
        
        {/* Indicador de selección */}
        {isSelected && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        )}
      </div>
      
      {/* Efecto de ondas para clusters grandes */}
      {count > 10 && (
        <>
          <div className="absolute inset-0 rounded-full border-2 border-orange-400 animate-ping opacity-60" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-0 rounded-full border border-orange-300 animate-pulse" style={{ animationDuration: '3s' }} />
        </>
      )}
    </div>
  )
}
