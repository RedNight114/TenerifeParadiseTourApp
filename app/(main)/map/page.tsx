"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MapPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir al mapa externo
    router.replace('/map-external')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0061A8] mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo al mapa...</p>
      </div>
    </div>
  )
}