"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { 
  Map,
  Marker, 
  Popup, 
  NavigationControl, 
  FullscreenControl,
  GeolocateControl,
  Layer,
  Source
} from 'react-map-gl/mapbox'
import type { MapRef } from 'react-map-gl/mapbox'
import { MapPin, Hotel as HotelIcon, Navigation, Layers, Eye, EyeOff, MapIcon, Compass, RotateCcw, Mountain, Waves, Camera, Utensils, Car, Plane } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@/styles/mapbox-3d.css'

// Configuración del mapa 3D con texturas reales
const TENERIFE_CENTER = {
  latitude: 28.2916,
  longitude: -16.6291,
  zoom: 10,
  pitch: 45,
  bearing: 0
}

// Estilos de Mapbox con texturas reales
const MAP_STYLES = {
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  satelliteStreets: 'mapbox://styles/mapbox/satellite-streets-v12',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
  streets: 'mapbox://styles/mapbox/streets-v12',
  dark: 'mapbox://styles/mapbox/dark-v11'
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

interface Mapbox3DProps {
  className?: string
  initialViewState?: any
  filters?: any
  selectedServiceId?: string
  selectedHotel?: Hotel | null
  visibleHotels?: Hotel[]
  visibleServices?: Service[]
  onServiceSelect?: (service: Service) => void
  onMarkerClick?: (marker: Hotel | Service) => void
}

// Función para obtener iconos específicos usando logos de la página
const getServiceIcon = (category: string, serviceTitle: string) => {
  const iconProps = { size: 20, className: "text-white" }
  
  // Usar logos específicos basados en categoría y título
  switch (category.toLowerCase()) {
    case 'senderismo':
    case 'montaña':
    case 'aventura':
      return (
        <div className="flex items-center justify-center w-full h-full">
          <div className="bg-white/20 rounded-full p-1">
            <Mountain {...iconProps} />
          </div>
        </div>
      )
    case 'playa':
    case 'buceo':
    case 'mar':
    case 'relax':
      return (
        <div className="flex items-center justify-center w-full h-full">
          <div className="bg-white/20 rounded-full p-1">
            <Waves {...iconProps} />
          </div>
        </div>
      )
    case 'fotografía':
    case 'foto':
    case 'cultura':
      return (
        <div className="flex items-center justify-center w-full h-full">
          <div className="bg-white/20 rounded-full p-1">
            <Camera {...iconProps} />
          </div>
        </div>
      )
    case 'gastronomía':
    case 'restaurante':
    case 'gastronomia':
      return (
        <div className="flex items-center justify-center w-full h-full">
          <div className="bg-white/20 rounded-full p-1">
            <Utensils {...iconProps} />
          </div>
        </div>
      )
    case 'transporte':
    case 'coche':
    case 'transfers':
      return (
        <div className="flex items-center justify-center w-full h-full">
          <div className="bg-white/20 rounded-full p-1">
            <Car {...iconProps} />
          </div>
        </div>
      )
    case 'excursión':
    case 'excursiones':
    case 'tours':
      return (
        <div className="flex items-center justify-center w-full h-full">
          <div className="bg-white/20 rounded-full p-1">
            <Plane {...iconProps} />
          </div>
        </div>
      )
    default:
      // Icono por defecto con logo de la página
      return (
        <div className="flex items-center justify-center w-full h-full">
          <div className="bg-white/20 rounded-full p-1">
            <MapPin {...iconProps} />
          </div>
        </div>
      )
  }
}

// Componente de marcador personalizado optimizado
const CustomMarker = React.memo(({ 
  marker, 
  onClick, 
  isSelected = false 
}: { 
  marker: Hotel | Service
  onClick: () => void
  isSelected?: boolean
}) => {
  const isHotel = 'nombre' in marker
  const markerType = isHotel ? 'hotel' : 'service'
  
  const markerStyle = useMemo(() => ({
    background: isHotel 
      ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' 
      : 'linear-gradient(135deg, #10B981, #059669)',
    width: isSelected ? '48px' : '40px',
    height: isSelected ? '48px' : '40px',
    borderRadius: '50%',
    border: '3px solid white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative' as const,
    zIndex: isSelected ? 10 : 1
  }), [isHotel, isSelected])
  
  const pulseStyle = useMemo(() => ({
    position: 'absolute' as const,
    top: '-8px',
    left: '-8px',
    right: '-8px',
    bottom: '-8px',
    borderRadius: '50%',
    border: '2px solid rgba(59, 130, 246, 0.5)',
    animation: 'pulse 2s infinite'
  }), [])
  
  return (
    <Marker
      longitude={marker.lng}
      latitude={marker.lat}
      onClick={onClick}
      anchor="center"
    >
      <div 
        className={`custom-marker ${markerType} ${isSelected ? 'selected' : ''}`}
        style={markerStyle}
      >
        {isHotel ? (
          <HotelIcon size={20} className="text-white" />
        ) : (
          getServiceIcon(marker.category, marker.title)
        )}
        
        {/* Efecto de pulso para marcador seleccionado */}
        {isSelected && (
          <div 
            className="pulse-ring"
            style={pulseStyle}
          />
        )}
      </div>
    </Marker>
  )
})

// Componente de popup personalizado optimizado
const CustomPopup = React.memo(({ 
  marker, 
  onClose 
}: { 
  marker: Hotel | Service
  onClose: () => void
}) => {
  const isHotel = 'nombre' in marker
  
  const handleDetailsClick = useCallback(() => {
    if (isHotel) {
      // Función real para hoteles - redirige a página del hotel
      window.open(`/hotels/${marker.id}`, '_blank')
    } else {
      // Función real para servicios - redirige a página del servicio
      window.open(`/services/${marker.id}`, '_blank')
    }
  }, [marker.id, isHotel])
  
  const handleRouteClick = useCallback(() => {
    // Función real para obtener ruta - abre Google Maps
    const url = `https://www.google.com/maps/dir/?api=1&destination=${marker.lat},${marker.lng}`
    window.open(url, '_blank')
  }, [marker.lat, marker.lng])

  const handleBookClick = useCallback(() => {
    if (!isHotel) {
      // Función real de reserva para servicios
      const bookingUrl = `/services/${marker.id}?action=book`
      window.open(bookingUrl, '_blank')
    }
  }, [marker.id, isHotel])
  
  return (
    <Popup
      longitude={marker.lng}
      latitude={marker.lat}
      onClose={onClose}
      closeButton={true}
      closeOnClick={false}
      anchor="bottom"
      offset={[0, -10]}
      maxWidth="400px"
      className="custom-popup"
    >
      <Card className="w-80 border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {isHotel ? marker.nombre : marker.title}
          </CardTitle>
          {isHotel && marker.estrellas && (
            <div className="flex items-center gap-1">
              {[...Array(marker.estrellas)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-sm">★</span>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 mb-3">
            {isHotel ? marker.descripcion || marker.direccion : marker.description}
          </p>
          
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {isHotel ? 'Hotel' : marker.category}
            </Badge>
            
            {!isHotel && (
              <Badge variant="outline" className="font-semibold">
                €{marker.price}
              </Badge>
            )}
          </div>
          
          <div className="mt-3 flex gap-2">
            <Button size="sm" className="flex-1" onClick={handleDetailsClick}>
              {isHotel ? 'Ver Detalles' : 'Ver Detalles'}
            </Button>
            {!isHotel && (
              <Button size="sm" className="flex-1 bg-[#0061A8] hover:bg-[#0056a3]" onClick={handleBookClick}>
                Reservar
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={handleRouteClick}>
              <Navigation size={16} className="mr-1" />
              Ruta
            </Button>
          </div>
        </CardContent>
      </Card>
    </Popup>
  )
})

export function Mapbox3D({ 
  className = "", 
  initialViewState = TENERIFE_CENTER,
  filters,
  selectedServiceId,
  selectedHotel,
  visibleHotels,
  visibleServices,
  onServiceSelect,
  onMarkerClick
}: Mapbox3DProps) {
  const mapRef = useRef<MapRef>(null)
  const [selectedMarker, setSelectedMarker] = useState<Hotel | Service | null>(null)
  const [showHotels, setShowHotels] = useState(filters?.showHotels ?? true)
  const [showServices, setShowServices] = useState(filters?.showServices ?? true)
  const [mapStyle, setMapStyle] = useState(MAP_STYLES.satelliteStreets)
  const [viewState, setViewState] = useState(initialViewState)
  const [is3DMode, setIs3DMode] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Cargar datos del mapa con optimizaciones
  const { data: mapData, isLoading, error } = useQuery<MapData>({
    queryKey: ['map-data', showHotels, showServices],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (showHotels) params.append('hotels', 'true')
      if (showServices) params.append('services', 'true')
      
      const response = await fetch(`/api/map-data/tenerife?${params.toString()}`)
      if (!response.ok) throw new Error('Error al cargar datos del mapa')
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Error al procesar datos del mapa')
      return data.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    cacheTime: 30 * 60 * 1000, // 30 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })

  const hotels = mapData?.hoteles || []
  const services = mapData?.servicios || []

  // Usar hoteles y servicios filtrados si están disponibles, sino usar todos los visibles
  const finalVisibleHotels = useMemo(() => {
    if (visibleHotels) return visibleHotels
    
    // Si hay un hotel seleccionado, mostrar solo ese hotel
    if (selectedHotel) {
      return hotels.filter(hotel => hotel.id === selectedHotel.id)
    }
    
    return hotels.filter(hotel => 
      hotel.visible_en_mapa && hotel.lat && hotel.lng && showHotels
    )
  }, [visibleHotels, hotels, showHotels, selectedHotel])
  
  const finalVisibleServices = useMemo(() => {
    if (visibleServices) return visibleServices
    return services.filter(service => {
      if (!service.visible_en_mapa || !service.lat || !service.lng || !showServices) return false
      
      // Aplicar filtros adicionales
      if (filters?.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        if (!service.title.toLowerCase().includes(searchLower) && 
            !service.description.toLowerCase().includes(searchLower)) return false
      }
      
      if (filters?.priceRange) {
        if (service.price < filters.priceRange[0] || service.price > filters.priceRange[1]) return false
      }
      
      if (filters?.category && filters.category !== service.category) return false
      
      return true
    })
  }, [visibleServices, services, showServices, filters])

  // Manejar clic en marcador
  const handleMarkerClick = useCallback((marker: Hotel | Service) => {
    setSelectedMarker(marker)
    onMarkerClick?.(marker)
    
    // Centrar mapa en el marcador
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [marker.lng, marker.lat],
        zoom: 14,
        duration: 1000
      })
    }
  }, [onMarkerClick])

  // Alternar modo 3D/2D
  const toggle3DMode = useCallback(() => {
    setIs3DMode(prev => {
      const newPitch = prev ? 0 : 45
      setViewState(prevState => ({
        ...prevState,
        pitch: newPitch
      }))
      return !prev
    })
  }, [])

  // Resetear vista
  const resetView = useCallback(() => {
    setViewState(initialViewState)
    setSelectedMarker(null)
  }, [initialViewState])

  // Cambiar estilo del mapa
  const changeMapStyle = useCallback((style: string) => {
    setMapStyle(style)
  }, [])

  // Obtener ubicación del usuario
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocalización no soportada')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 12,
            duration: 1000
          })
        }
        
        toast.success('Ubicación obtenida')
      },
      (error) => {
        toast.error('Error al obtener ubicación')
        console.error('Error:', error)
      }
    )
  }, [])

  if (isLoading) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mapa 3D...</p>
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
          <p className="text-gray-600 mb-4">Error al cargar el mapa</p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Controles del mapa */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <Card className="p-3 bg-white/90 backdrop-blur-sm shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={is3DMode ? "default" : "outline"}
                onClick={toggle3DMode}
                className="flex items-center gap-1"
              >
                <Mountain size={16} />
                {is3DMode ? '3D' : '2D'}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={resetView}
                className="flex items-center gap-1"
              >
                <RotateCcw size={16} />
                Reset
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={getUserLocation}
                className="flex items-center gap-1"
              >
                <Navigation size={16} />
                Mi Ubicación
              </Button>
            </div>
          </div>
        </Card>

        {/* Selector de estilo */}
        <Card className="p-3 bg-white/90 backdrop-blur-sm shadow-lg">
          <Label className="text-xs font-medium text-gray-600 mb-2 block">
            Estilo del Mapa
          </Label>
          <div className="grid grid-cols-2 gap-1">
            <Button
              size="sm"
              variant={mapStyle === MAP_STYLES.satelliteStreets ? "default" : "outline"}
              onClick={() => changeMapStyle(MAP_STYLES.satelliteStreets)}
              className="text-xs"
            >
              Satélite
            </Button>
            <Button
              size="sm"
              variant={mapStyle === MAP_STYLES.outdoors ? "default" : "outline"}
              onClick={() => changeMapStyle(MAP_STYLES.outdoors)}
              className="text-xs"
            >
              Terreno
            </Button>
            <Button
              size="sm"
              variant={mapStyle === MAP_STYLES.streets ? "default" : "outline"}
              onClick={() => changeMapStyle(MAP_STYLES.streets)}
              className="text-xs"
            >
              Calles
            </Button>
            <Button
              size="sm"
              variant={mapStyle === MAP_STYLES.dark ? "default" : "outline"}
              onClick={() => changeMapStyle(MAP_STYLES.dark)}
              className="text-xs"
            >
              Oscuro
            </Button>
          </div>
        </Card>

        {/* Controles de capas */}
        <Card className="p-3 bg-white/90 backdrop-blur-sm shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="showHotels" className="text-sm font-medium">
                Hoteles ({finalVisibleHotels.length})
              </Label>
              <Switch
                id="showHotels"
                checked={showHotels}
                onCheckedChange={setShowHotels}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showServices" className="text-sm font-medium">
                Servicios ({finalVisibleServices.length})
              </Label>
              <Switch
                id="showServices"
                checked={showServices}
                onCheckedChange={setShowServices}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Mapa principal */}
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        terrain={{
          source: 'mapbox-dem',
          exaggeration: is3DMode ? 2.0 : 0
        }}
        fog={{
          color: 'rgb(186, 210, 235)',
          'high-color': 'rgb(36, 92, 223)',
          'horizon-blend': 0.02,
          'space-color': 'rgb(11, 11, 25)',
          'star-intensity': 0.6
        }}
        projection="globe"
        antialias={true}
      >
        {/* Fuente de terreno DEM */}
        <Source
          id="mapbox-dem"
          type="raster-dem"
          url="mapbox://mapbox.mapbox-terrain-dem-v1"
          tileSize={512}
          maxzoom={14}
        />

        {/* Capa de cielo atmosférico */}
        <Layer
          id="sky"
          type="sky"
          paint={{
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 0.0],
            'sky-atmosphere-sun-intensity': 15
          }}
        />

        {/* Capa de edificios 3D */}
        <Source
          id="composite"
          type="vector"
          url="mapbox://mapbox.mapbox-streets-v8"
        />
        
        {is3DMode && (
          <Layer
            id="3d-buildings"
            source="composite"
            source-layer="building"
            filter={['==', 'extrude', 'true']}
            type="fill-extrusion"
            minzoom={15}
            paint={{
              'fill-extrusion-color': '#aaa',
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.6
            }}
          />
        )}

        {/* Marcadores de hoteles con lazy loading */}
        {finalVisibleHotels.slice(0, 50).map((hotel) => (
          <CustomMarker
            key={`hotel-${hotel.id}`}
            marker={hotel}
            onClick={() => handleMarkerClick(hotel)}
            isSelected={selectedMarker?.id === hotel.id}
          />
        ))}

        {/* Marcadores de servicios con lazy loading */}
        {finalVisibleServices.slice(0, 50).map((service) => (
          <CustomMarker
            key={`service-${service.id}`}
            marker={service}
            onClick={() => handleMarkerClick(service)}
            isSelected={selectedMarker?.id === service.id}
          />
        ))}

        {/* Marcador de ubicación del usuario */}
        {userLocation && (
          <Marker
            longitude={userLocation.lng}
            latitude={userLocation.lat}
            anchor="center"
          >
            <div className="user-location-marker">
              <div className="pulse-dot"></div>
            </div>
          </Marker>
        )}

        {/* Popup para marcador seleccionado */}
        {selectedMarker && (
          <CustomPopup
            marker={selectedMarker}
            onClose={() => setSelectedMarker(null)}
          />
        )}

        {/* Controles nativos de Mapbox */}
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
        <GeolocateControl
          position="top-right"
          onGeolocate={(e) => {
            setUserLocation({
              lat: e.coords.latitude,
              lng: e.coords.longitude
            })
          }}
        />
      </Map>

      {/* Información de estado */}
      <div className="absolute bottom-4 left-4 z-10">
        <Card className="p-2 bg-white/90 backdrop-blur-sm shadow-lg">
          <div className="text-xs text-gray-600">
            <div>Zoom: {Math.round(viewState.zoom)}</div>
            <div>Pitch: {Math.round(viewState.pitch)}°</div>
            <div>Bearing: {Math.round(viewState.bearing)}°</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
