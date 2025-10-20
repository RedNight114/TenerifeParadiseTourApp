"use client"

import { Mapbox3D } from './Mapbox3D'
import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Hotel, Navigation, Layers, Eye, EyeOff, MapIcon, Compass, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useQuery } from '@tanstack/react-query'
import '@/styles/mapbox-3d.css'
import '@/styles/map-cards.css'

// Configuración del mapa 3D
const TENERIFE_CENTER = {
  latitude: 28.2916,  // Centro de Tenerife
  longitude: -16.6291, // Centro de Tenerife
  zoom: 10,
  pitch: 45,
  bearing: 0
}

// Interfaces para el mapa
interface Hotel {
  id: string
  nombre: string
  direccion: string
  lat: number
  lng: number
  visible_en_mapa: boolean
  estrellas?: number
  telefono?: string
  descripcion?: string
  images?: string[]
}

interface Service {
  id: string
  title: string
  description: string
  lat: number
  lng: number
  visible_en_mapa: boolean
  price: number
  category: string
  images?: string[]
}

interface MapData {
  hoteles: Hotel[]
  servicios: Service[]
}

interface MapModuleProps {
  className?: string
  initialViewState?: any
  filters?: {
    showHotels?: boolean
    showServices?: boolean
    searchTerm?: string
    priceRange?: [number, number]
    category?: string
  }
  selectedServiceId?: string
  selectedHotel?: Hotel | null
  serviceGroups?: any
  onServiceSelect?: (service: Service) => void
  onMarkerClick?: (marker: Hotel | Service) => void
}

export function MapModule({ 
  className = "", 
  initialViewState = TENERIFE_CENTER,
  filters,
  selectedServiceId,
  selectedHotel,
  serviceGroups,
  onServiceSelect,
  onMarkerClick
}: MapModuleProps) {
  const [selectedMarker, setSelectedMarker] = useState<Hotel | Service | null>(null)

  // Cargar datos del mapa
  const { data: mapData, isLoading, error } = useQuery<MapData>({
    queryKey: ['map-data'],
    queryFn: async () => {
      const response = await fetch('/api/map-data/tenerife?hotels=true&services=true')
      if (!response.ok) throw new Error('Error al cargar datos del mapa')
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Error al procesar datos del mapa')
      return data.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3
  })

  const hotels = mapData?.hoteles || []
  const services = mapData?.servicios || []

  // Filtrar elementos visibles - mostrar solo hotel seleccionado si hay uno
  const visibleHotels = selectedHotel 
    ? hotels.filter(hotel => hotel.id === selectedHotel.id)
    : hotels.filter(hotel => hotel.visible_en_mapa && hotel.lat && hotel.lng)

  const visibleServices = services.filter(service => 
    service.visible_en_mapa && service.lat && service.lng
  )

  // Manejar clic en marcador
  const handleMarkerClick = useCallback((marker: Hotel | Service) => {
    setSelectedMarker(marker)
    onMarkerClick?.(marker)
  }, [onMarkerClick])

  // Manejar selección de servicio
  const handleServiceSelect = useCallback((service: Service) => {
    onServiceSelect?.(service)
  }, [onServiceSelect])

  if (isLoading) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mapa 3D con texturas reales...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <MapIcon size={48} className="mx-auto" />
          </div>
          <p className="text-gray-600 mb-4">Error al cargar el mapa 3D</p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`mapbox-3d-container ${className}`}>
      <Mapbox3D
        className="w-full h-full"
        initialViewState={initialViewState}
        filters={filters}
        selectedServiceId={selectedServiceId}
        selectedHotel={selectedHotel}
        visibleHotels={visibleHotels}
        visibleServices={visibleServices}
        onServiceSelect={handleServiceSelect}
        onMarkerClick={handleMarkerClick}
      />
      
    </div>
  )
}