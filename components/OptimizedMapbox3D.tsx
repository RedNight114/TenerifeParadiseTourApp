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
import { MapPin, Hotel, Navigation, Layers, Eye, EyeOff, MapIcon, Compass, RotateCcw, Mountain, Waves, Camera, Utensils, Car, Plane } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@/styles/mapbox-3d.css'

// Configuración del mapa 3D optimizado
const TENERIFE_CENTER = {
  latitude: 28.2916,
  longitude: -16.6291,
  zoom: 10,
  pitch: 45,
  bearing: 0
}

// Estilos de Mapbox optimizados
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

interface OptimizedMapbox3DProps {
  className?: string
  initialViewState?: any
  filters?: any
  selectedServiceId?: string
  onServiceSelect?: (service: Service) => void
  onMarkerClick?: (marker: Hotel | Service) => void
}

// Función para obtener iconos específicos por tipo de servicio
const getServiceIcon = (category: string) => {
  const iconProps = { size: 20, className: "text-white" }
  
  switch (category.toLowerCase()) {
    case 'senderismo':
    case 'montaña':
      return <Mountain {...iconProps} />
    case 'playa':
    case 'buceo':
    case 'mar':
      return <Waves {...iconProps} />
    case 'fotografía':
    case 'foto':
      return <Camera {...iconProps} />
    case 'gastronomía':
    case 'restaurante':
      return <Utensils {...iconProps} />
    case 'transporte':
    case 'coche':
      return <Car {...iconProps} />
    case 'excursión':
    case 'excursiones':
      return <Plane {...iconProps} />
    default:
      return <MapPin {...iconProps} />
  }
}

// Componente de marcador optimizado con clustering
const OptimizedMarker = React.memo(({ 
  marker, 
  onClick, 
  isSelected = false,
  zoom = 10
}: { 
  marker: Hotel | Service
  onClick: () => void
  isSelected?: boolean
  zoom?: number
}) => {
  const isHotel = 'nombre' in marker
  const markerType = isHotel ? 'hotel' : 'service'
  
  // Calcular tamaño del marcador basado en zoom
  const markerSize = useMemo(() => {
    if (zoom < 8) return isSelected ? 32 : 28
    if (zoom < 12) return isSelected ? 40 : 36
    return isSelected ? 48 : 44
  }, [zoom, isSelected])
  
  const markerStyle = useMemo(() => ({
    background: isHotel 
      ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' 
      : 'linear-gradient(135deg, #10B981, #059669)',
    width: `${markerSize}px`,
    height: `${markerSize}px`,
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
  }), [isHotel, markerSize, isSelected])
  
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
          <Hotel size={markerSize * 0.5} className="text-white" />
        ) : (
          <div style={{ transform: `scale(${markerSize / 44})` }}>
            {getServiceIcon(marker.category)}
          </div>
        )}
        
        {/* Efecto de pulso para marcador seleccionado */}
        {isSelected && (
          <div 
            className="pulse-ring"
            style={{
              position: 'absolute',
              top: '-8px',
              left: '-8px',
              right: '-8px',
              bottom: '-8px',
              borderRadius: '50%',
              border: '2px solid rgba(59, 130, 246, 0.5)',
              animation: 'pulse 2s infinite'
            }}
          />
        )}
      </div>
    </Marker>
  )
})

// Componente de popup optimizado
const OptimizedPopup = React.memo(({ 
  marker, 
  onClose 
}: { 
  marker: Hotel | Service
  onClose: () => void
}) => {
  const isHotel = 'nombre' in marker
  
  const handleDetailsClick = useCallback(() => {
    if (isHotel) {
      window.open(`/hotels/${marker.id}`, '_blank')
    } else {
      window.open(`/services/${marker.id}`, '_blank')
    }
  }, [marker.id, isHotel])
  
  const handleRouteClick = useCallback(() => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${marker.lat},${marker.lng}`
    window.open(url, '_blank')
  }, [marker.lat, marker.lng])
  
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
              {isHotel ? 'Ver Detalles' : 'Reservar'}
            </Button>
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

export function OptimizedMapbox3D({ 
  className = "", 
  initialViewState = TENERIFE_CENTER,
  filters,
  selectedServiceId,
  onServiceSelect,
  onMarkerClick
}: OptimizedMapbox3DProps) {
  const mapRef = useRef<MapRef>(null)
  const [selectedMarker, setSelectedMarker] = useState<Hotel | Service | null>(null)
  const [showHotels, setShowHotels] = useState(filters?.showHotels ?? true)
  const [showServices, setShowServices] = useState(filters?.showServices ?? true)
  const [mapStyle, setMapStyle] = useState(MAP_STYLES.satelliteStreets)
  const [viewState, setViewState] = useState(initialViewState)
  const [is3DMode, setIs3DMode] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Cargar datos del mapa con optimizaciones avanzadas
  const { data: mapData, isLoading, error } = useQuery<MapData>({
    queryKey: ['optimized-map-data', showHotels, showServices],
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
    staleTime: 15 * 60 * 1000, // 15 minutos
    cacheTime: 60 * 60 * 1000, // 1 hora
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })

  const hotels = mapData?.hoteles || []
  const services = mapData?.servicios || []

  // Filtrar elementos visibles con memoización avanzada
  const visibleHotels = useMemo(() => {
    return hotels.filter(hotel => 
      hotel.visible_en_mapa && hotel.lat && hotel.lng && showHotels
    )
  }, [hotels, showHotels])
  
  const visibleServices = useMemo(() => {
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
  }, [services, showServices, filters])

  // Optimizar marcadores basado en zoom
  const visibleMarkers = useMemo(() => {
    const zoom = viewState.zoom
    const maxMarkers = zoom < 8 ? 20 : zoom < 12 ? 50 : 100
    
    return {
      hotels: visibleHotels.slice(0, maxMarkers),
      services: visibleServices.slice(0, maxMarkers)
    }
  }, [visibleHotels, visibleServices, viewState.zoom])

  // Manejar clic en marcador optimizado
  const handleMarkerClick = useCallback((marker: Hotel | Service) => {
    setSelectedMarker(marker)
    onMarkerClick?.(marker)
    
    // Centrar mapa en el marcador con animación suave
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [marker.lng, marker.lat],
        zoom: Math.max(viewState.zoom, 14),
        duration: 1000
      })
    }
  }, [onMarkerClick, viewState.zoom])

  // Alternar modo 3D/2D optimizado
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

  // Resetear vista optimizado
  const resetView = useCallback(() => {
    setViewState(initialViewState)
    setSelectedMarker(null)
  }, [initialViewState])

  // Cambiar estilo del mapa
  const changeMapStyle = useCallback((style: string) => {
    setMapStyle(style)
  }, [])

  // Obtener ubicación del usuario optimizado
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
          <p className="text-gray-600">Cargando mapa 3D optimizado...</p>
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
      {/* Controles del mapa optimizados */}
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

        {/* Selector de estilo compacto */}
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

        {/* Controles de capas optimizados */}
        <Card className="p-3 bg-white/90 backdrop-blur-sm shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="showHotels" className="text-sm font-medium">
                Hoteles ({visibleMarkers.hotels.length})
              </Label>
              <Switch
                id="showHotels"
                checked={showHotels}
                onCheckedChange={setShowHotels}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showServices" className="text-sm font-medium">
                Servicios ({visibleMarkers.services.length})
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

      {/* Mapa principal optimizado */}
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        terrain={{
          source: 'mapbox-dem',
          exaggeration: is3DMode ? 1.5 : 0
        }}
        fog={{
          color: 'rgb(186, 210, 235)',
          'high-color': 'rgb(36, 92, 223)',
          'horizon-blend': 0.02,
          'space-color': 'rgb(11, 11, 25)',
          'star-intensity': 0.6
        }}
        projection="globe"
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

        {/* Marcadores de hoteles optimizados */}
        {visibleMarkers.hotels.map((hotel) => (
          <OptimizedMarker
            key={`hotel-${hotel.id}`}
            marker={hotel}
            onClick={() => handleMarkerClick(hotel)}
            isSelected={selectedMarker?.id === hotel.id}
            zoom={viewState.zoom}
          />
        ))}

        {/* Marcadores de servicios optimizados */}
        {visibleMarkers.services.map((service) => (
          <OptimizedMarker
            key={`service-${service.id}`}
            marker={service}
            onClick={() => handleMarkerClick(service)}
            isSelected={selectedMarker?.id === service.id}
            zoom={viewState.zoom}
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
          <OptimizedPopup
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

      {/* Información de estado optimizada */}
      <div className="absolute bottom-4 left-4 z-10">
        <Card className="p-2 bg-white/90 backdrop-blur-sm shadow-lg">
          <div className="text-xs text-gray-600">
            <div>Zoom: {Math.round(viewState.zoom)}</div>
            <div>Pitch: {Math.round(viewState.pitch)}°</div>
            <div>Bearing: {Math.round(viewState.bearing)}°</div>
            <div className="mt-1 pt-1 border-t border-gray-200">
              <div>Hoteles: {visibleMarkers.hotels.length}</div>
              <div>Servicios: {visibleMarkers.services.length}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

