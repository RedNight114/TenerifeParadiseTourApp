"use client"

import { useState, useEffect } from 'react'

interface DebugInfoProps {
  loading: boolean
  error: string | null
  servicesCount: number
  hotelsCount: number
}

export function DebugInfo({ loading, error, servicesCount, hotelsCount }: DebugInfoProps) {
  const [showDebug, setShowDebug] = useState(false)

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-black text-white px-3 py-2 rounded text-xs"
      >
        Debug
      </button>
      
      {showDebug && (
        <div className="absolute bottom-12 right-0 bg-black text-white p-3 rounded text-xs min-w-[200px]">
          <div><strong>Loading:</strong> {loading ? 'Sí' : 'No'}</div>
          <div><strong>Error:</strong> {error || 'Ninguno'}</div>
          <div><strong>Servicios:</strong> {servicesCount}</div>
          <div><strong>Hoteles:</strong> {hotelsCount}</div>
          <div><strong>Timestamp:</strong> {new Date().toLocaleTimeString()}</div>
        </div>
      )}
    </div>
  )
}
