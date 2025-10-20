"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapModuleDynamic as MapModule } from '@/components/MapModuleDynamic'
import { Navbar } from '@/components/navbar'
import { CompactServicesSidebar } from '@/components/CompactServicesSidebar'
import { MapLoadingSpinner, MapErrorScreen } from '@/components/MapLoadingSpinner'
import { DebugInfo } from '@/components/DebugInfo'
import { Button } from '@/components/ui/button'
import { Menu, X, MapPin, Compass, Star } from 'lucide-react'
import '@/styles/leaflet-custom.css'

interface Service {
  id: string
  title: string
  description: string
  price: number
  lat?: number
  lng?: number
  visible_en_mapa?: boolean
  location?: string
  images?: string[]
  category_id?: string
  subcategory_id?: string
  available: boolean
  featured: boolean
  duration?: string
  max_participants?: number
  rating?: number
  created_at: string
  updated_at: string
}

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
  created_at: string
  updated_at: string
}

export default function ExternalMapPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showHotels, setShowHotels] = useState(true)
  const [showServices, setShowServices] = useState(true)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [error, setError] = useState<string | null>(null)

  // Cargar datos directamente sin hook personalizado
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('Cargando datos reales del mapa...')

        // Cargar datos del mapa usando la API unificada
        const mapDataResponse = await fetch('/api/map-data/tenerife?hotels=true&services=true')
        
        if (!mapDataResponse.ok) {
          throw new Error('Error al cargar datos del mapa')
        }

        const mapData = await mapDataResponse.json()
        
        if (!mapData.success) {
          throw new Error(mapData.error || 'Error al procesar datos del mapa')
        }

        console.log('Servicios cargados:', mapData.data.servicios.length)
        console.log('Hoteles cargados:', mapData.data.hoteles.length)

        setServices(mapData.data.servicios)
        setHotels(mapData.data.hoteles)

        console.log('Datos cargados exitosamente')
      } catch (err) {
        console.error('Error cargando datos:', err)
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar datos'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Filtrar servicios visibles y agrupar por coordenadas
  const visibleServices = services.filter(service => 
    service.visible_en_mapa && service.lat && service.lng
  )

  // Agrupar servicios por coordenadas
  const groupServicesByCoordinates = (services: Service[]) => {
    const groups = new Map<string, Service[]>()
    
    services.forEach(service => {
      if (service.lat && service.lng) {
        // Redondear coordenadas para agrupar servicios cercanos (aproximadamente 30m de diferencia)
        const roundedLat = Math.round(service.lat * 2000) / 2000
        const roundedLng = Math.round(service.lng * 2000) / 2000
        const key = `${roundedLat},${roundedLng}`
        
        if (!groups.has(key)) {
          groups.set(key, [])
        }
        groups.get(key)!.push(service)
      }
    })
    
    return groups
  }

  const serviceGroups = groupServicesByCoordinates(visibleServices)

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
  }

  const handleMarkerClick = (marker: any) => {
    if ('title' in marker) {
      setSelectedService(marker)
    }
  }

  const handleHotelSelect = (hotel: Hotel | null) => {
    setSelectedHotel(hotel)
  }

  const handleRetry = () => {
    setError(null)
    setLoading(true)
    
    const loadData = async () => {
      try {
        console.log('Reintentando carga de datos...')

        // Cargar datos del mapa usando la API unificada
        const mapDataResponse = await fetch('/api/map-data/tenerife?hotels=true&services=true')
        
        if (!mapDataResponse.ok) {
          throw new Error('Error al cargar datos del mapa')
        }

        const mapData = await mapDataResponse.json()
        
        if (!mapData.success) {
          throw new Error(mapData.error || 'Error al procesar datos del mapa')
        }

        console.log('Servicios cargados:', mapData.data.servicios.length)
        console.log('Hoteles cargados:', mapData.data.hoteles.length)

        setServices(mapData.data.servicios)
        setHotels(mapData.data.hoteles)

        console.log('Datos cargados exitosamente')
      } catch (err) {
        console.error('Error cargando datos:', err)
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar datos'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }

  // Mostrar spinner de carga
  if (loading) {
    return <MapLoadingSpinner />
  }

  // Mostrar error si hay algún problema
  if (error) {
    return <MapErrorScreen error={error} onRetry={handleRetry} />
  }

  return (
    <div className="h-screen map-container flex flex-col">
      {/* Contenido principal con layout sticky */}
      <div className="flex-1 flex overflow-hidden">
          {/* Sidebar de servicios con scroll interno - responsive */}
        {showSidebar && (
            <div className="w-96 lg:w-96 md:w-80 sm:w-full bg-white border-r border-gray-200 shadow-lg z-10 flex flex-col h-full">
          <CompactServicesSidebar
            services={visibleServices}
            hotels={hotels}
            showHotels={showHotels}
            showServices={showServices}
            onToggleHotels={() => setShowHotels(!showHotels)}
            onToggleServices={() => setShowServices(!showServices)}
            onServiceSelect={handleServiceSelect}
            selectedServiceId={selectedService?.id}
            onHotelSelect={handleHotelSelect}
          />
          </div>
        )}

        {/* Mapa principal con altura fija */}
        <div className="flex-1 relative map-container h-full">
            {/* Header del mapa sticky - responsive */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                  <div className="bg-white border border-gray-300 rounded-full p-1.5 sm:p-2 shadow-sm flex-shrink-0">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                      Mapa Interactivo de Tenerife
                    </h1>
                    <p className="text-gray-600 text-xs sm:text-sm truncate">
                      Descubre servicios y hoteles en la isla
                    </p>
                  </div>
                </div>
                
                  <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 flex-shrink-0">
                    {/* Estadísticas - ocultas en móvil muy pequeño */}
                    <div className="hidden sm:flex items-center gap-2 text-gray-600">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{visibleServices.length}</span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-gray-600">
                      <Compass className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">{hotels.length}</span>
                    </div>
                  
                    {/* Botón para controlar sidebar - responsive */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSidebar(!showSidebar)}
                      className="flex items-center gap-1 sm:gap-2 bg-white border-gray-300 hover:bg-gray-50 text-gray-700 px-2 sm:px-3"
                    >
                    {showSidebar ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    <span className="hidden lg:inline text-sm">
                      {showSidebar ? 'Ocultar' : 'Mostrar'} Lista
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Mapa ocupando toda la altura disponible */}
          <div className="flex-1 h-[calc(100vh-88px)]">
          <MapModule
            className="w-full h-full"
            filters={{
              showHotels,
              showServices,
              priceRange: [0, 1000],
              category: 'all',
              stars: [],
              searchTerm: ''
            }}
            selectedServiceId={selectedService?.id}
            selectedHotel={selectedHotel}
            serviceGroups={serviceGroups}
            onServiceSelect={handleServiceSelect}
            onMarkerClick={handleMarkerClick}
          />
          </div>
        </div>
      </div>

      {/* Debug info */}
      <DebugInfo
        loading={loading}
        error={error}
        servicesCount={visibleServices.length}
        hotelsCount={hotels.length}
      />
    </div>
  )
}