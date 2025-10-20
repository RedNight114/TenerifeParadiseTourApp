"use client"

import React, { useState, useRef } from 'react'
import { MapModule } from '@/components/MapModule'
import { ServicesList } from '@/components/ServicesList'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  List, 
  Maximize2, 
  Minimize2,
  Filter,
  Eye,
  EyeOff,
  Hotel,
  Euro,
  Star
} from 'lucide-react'

interface Service {
  id: string
  title: string
  description: string
  price: number
  category_id?: string
  featured?: boolean
  images?: string[]
  lat: number
  lng: number
  visible_en_mapa?: boolean
  duration?: string
  maxPeople?: number
  rating?: number
}

interface MapWithSidebarProps {
  services: Service[]
  className?: string
}

export function MapWithSidebar({ services, className }: MapWithSidebarProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>()
  const [showSidebar, setShowSidebar] = useState(true)
  const [showHotels, setShowHotels] = useState(true)
  const [showServices, setShowServices] = useState(true)
  const mapRef = useRef<any>(null)

  const handleServiceSelect = (service: Service) => {
    setSelectedServiceId(service.id)
    
    // Centrar el mapa en el servicio seleccionado
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [service.lng, service.lat],
        zoom: 15,
        duration: 1000
      })
    }
  }

  const handleServiceView = (serviceId: string) => {
    // Aquí podrías abrir un modal o navegar a la página del servicio
    console.log('Ver servicio:', serviceId)
  }

  const handleMarkerClick = (marker: any) => {
    if ('title' in marker) {
      const service = services.find(s => s.id === marker.id)
      if (service) {
        setSelectedServiceId(service.id)
      }
    }
  }

  return (
    <div className={`relative h-full ${className}`}>
      {/* Controles superiores */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSidebar(!showSidebar)}
          className="bg-white/90 backdrop-blur-sm shadow-lg"
        >
          <List className="h-4 w-4 mr-1" />
          {showSidebar ? 'Ocultar lista' : 'Mostrar lista'}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHotels(!showHotels)}
          className={`bg-white/90 backdrop-blur-sm shadow-lg ${showHotels ? 'bg-blue-50' : ''}`}
        >
          {showHotels ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
          Hoteles
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowServices(!showServices)}
          className={`bg-white/90 backdrop-blur-sm shadow-lg ${showServices ? 'bg-green-50' : ''}`}
        >
          {showServices ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
          Servicios
        </Button>
      </div>

      {/* Estadísticas compactas en el mapa */}
      <div className="absolute top-16 left-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Hotel className="h-4 w-4 text-blue-600" />
              <div>
                <div className="font-semibold text-gray-900">20</div>
                <div className="text-xs text-gray-600">Hoteles</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <div>
                <div className="font-semibold text-gray-900">{services.length}</div>
                <div className="text-xs text-gray-600">Servicios</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-purple-600" />
              <div>
                <div className="font-semibold text-gray-900">€154</div>
                <div className="text-xs text-gray-600">Promedio</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-600" />
              <div>
                <div className="font-semibold text-gray-900">4.0</div>
                <div className="text-xs text-gray-600">Promedio</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layout principal */}
      <div className="flex h-full">
        {/* Sidebar de servicios */}
        {showSidebar && (
          <div className="w-96 border-r border-gray-200 bg-white">
            <ServicesList
              services={services}
              selectedServiceId={selectedServiceId}
              onServiceSelect={handleServiceSelect}
              onServiceView={handleServiceView}
              className="h-full"
            />
          </div>
        )}

        {/* Mapa principal */}
        <div className={`${showSidebar ? 'flex-1' : 'w-full'} relative`}>
          <MapModule
            ref={mapRef}
            className="w-full h-full"
            filters={{
              showHotels,
              showServices,
              priceRange: [0, 500],
              category: 'all',
              stars: [],
              searchTerm: ''
            }}
            selectedServiceId={selectedServiceId}
            onServiceSelect={handleServiceSelect}
            onMarkerClick={handleMarkerClick}
          />
          
          {/* Botón para expandir mapa */}
          {showSidebar && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSidebar(false)}
              className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm shadow-lg"
            >
              <Maximize2 className="h-4 w-4 mr-1" />
              Pantalla completa
            </Button>
          )}
        </div>
      </div>

      {/* Botón para mostrar sidebar cuando está oculto */}
      {!showSidebar && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSidebar(true)}
          className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm shadow-lg"
        >
          <List className="h-4 w-4 mr-1" />
          Mostrar lista
        </Button>
      )}
    </div>
  )
}
