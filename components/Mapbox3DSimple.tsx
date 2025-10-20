"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Hotel as HotelIcon, Navigation, Layers, Eye, EyeOff, MapIcon, Compass, RotateCcw, Mountain, Waves, Camera, Utensils, Car, Plane } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import mapboxgl from 'mapbox-gl'
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

interface Mapbox3DSimpleProps {
  className?: string
  initialViewState?: any
  filters?: any
  selectedServiceId?: string
  visibleHotels?: Hotel[]
  visibleServices?: Service[]
  onServiceSelect?: (service: Service) => void
  onMarkerClick?: (marker: Hotel | Service) => void
}

// Función para obtener iconos específicos por tipo de servicio
const getServiceIcon = (category?: string) => {
  const iconProps = { size: 20, className: "text-white" }
  
  if (!category) return <MapPin {...iconProps} />
  
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

export function Mapbox3DSimple({ 
  className = "", 
  initialViewState = TENERIFE_CENTER,
  filters,
  selectedServiceId,
  visibleHotels,
  visibleServices,
  onServiceSelect,
  onMarkerClick
}: Mapbox3DSimpleProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  const popup = useRef<mapboxgl.Popup | null>(null)
  
  const [selectedMarker, setSelectedMarker] = useState<Hotel | Service | null>(null)
  const [mapStyle, setMapStyle] = useState(MAP_STYLES.satelliteStreets)
  const [mapLoaded, setMapLoaded] = useState(false)

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
    staleTime: 5 * 60 * 1000,
    retry: 3
  })

  const hotels = mapData?.hoteles || []
  const services = mapData?.servicios || []

  // Usar hoteles y servicios filtrados si están disponibles, sino usar todos los visibles
  const finalVisibleHotels = visibleHotels || hotels.filter(hotel => 
    hotel.visible_en_mapa && hotel.lat && hotel.lng
  )
  
  const finalVisibleServices = visibleServices || services.filter(service => 
    service.visible_en_mapa && service.lat && service.lng
  )

  // Debug: Log de datos recibidos
  useEffect(() => {
    if (mapData) {
      console.log('Datos del mapa cargados:', mapData)
      console.log('Hoteles:', finalVisibleHotels.length)
      console.log('Servicios:', finalVisibleServices.length)
    }
  }, [mapData, finalVisibleHotels, finalVisibleServices])

  // Debug: Log de elementos visibles
  useEffect(() => {
    console.log('Hoteles visibles:', finalVisibleHotels.length)
    console.log('Servicios visibles:', finalVisibleServices.length)
    if (finalVisibleServices.length > 0) {
      console.log('Primer servicio:', finalVisibleServices[0])
    }
    if (finalVisibleHotels.length > 0) {
      console.log('Primer hotel:', finalVisibleHotels[0])
    }
  }, [finalVisibleHotels, finalVisibleServices])

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!mapboxToken) {
      console.error('Token de Mapbox no configurado')
      toast.error('Token de Mapbox no configurado')
      return
    }

    mapboxgl.accessToken = mapboxToken

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [initialViewState.longitude, initialViewState.latitude],
      zoom: initialViewState.zoom,
      pitch: initialViewState.pitch,
      bearing: initialViewState.bearing,
      projection: 'globe'
    })

    // Añadir solo control de navegación básico
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Configurar efectos atmosféricos
    map.current.on('style.load', () => {
      if (map.current) {
        map.current.setFog({
          color: 'rgb(186, 210, 235)',
          'high-color': 'rgb(36, 92, 223)',
          'horizon-blend': 0.02,
          'space-color': 'rgb(11, 11, 25)',
          'star-intensity': 0.6
        })
      }
    })

    // Evento de carga
    map.current.on('load', () => {
      setMapLoaded(true)
      toast.success('Mapa 3D cargado con texturas reales')
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [mapStyle, initialViewState])

  // Añadir marcadores
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    console.log('Creando marcadores...')
    console.log('Hoteles a mostrar:', finalVisibleHotels.length)
    console.log('Servicios a mostrar:', finalVisibleServices.length)

    // Limpiar marcadores existentes
    markers.current.forEach(marker => marker.remove())
    markers.current = []

    // Añadir marcadores de hoteles
    finalVisibleHotels.forEach((hotel, index) => {
      console.log(`Creando marcador de hotel ${index + 1}:`, hotel.nombre, hotel.lat, hotel.lng)
      
      const markerElement = document.createElement('div')
      markerElement.style.cssText = `
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #3B82F6, #1D4ED8);
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
      `
      markerElement.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M7 14c1.66 0 3-1.34 3-3S8.66 8 7 8s-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm12.71-9.71L12 2h-1v7c0 .55-.45 1-1 1s-1-.45-1-1V2H9l-7.71 1.29c-.39.39-.39 1.02 0 1.41L9 6v12c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V6l7.71-1.29c.39-.39.39-1.02 0-1.41z"/>
        </svg>
      `

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([hotel.lng, hotel.lat])
        .addTo(map.current)

      markerElement.addEventListener('click', () => {
        setSelectedMarker(hotel)
        onMarkerClick?.(hotel)
        
        // Crear popup
        const popupContent = `
          <div style="padding: 16px; max-width: 300px;">
            <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">${hotel.nombre}</h3>
            ${hotel.estrellas ? `<div style="margin-bottom: 8px;">${'★'.repeat(hotel.estrellas)}</div>` : ''}
            <p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">${hotel.descripcion || hotel.direccion}</p>
            <div style="display: flex; gap: 8px;">
              <button onclick="window.open('/hotels/${hotel.id}', '_blank')" style="
                background: #3B82F6; color: white; border: none; padding: 8px 16px; 
                border-radius: 6px; cursor: pointer; font-size: 14px;
              ">Ver Detalles</button>
              <button onclick="navigator.clipboard.writeText('${hotel.lat}, ${hotel.lng}')" style="
                background: #10B981; color: white; border: none; padding: 8px 16px; 
                border-radius: 6px; cursor: pointer; font-size: 14px;
              ">Copiar Coordenadas</button>
            </div>
          </div>
        `
        
        if (popup.current) popup.current.remove()
        popup.current = new mapboxgl.Popup({ closeOnClick: false })
          .setLngLat([hotel.lng, hotel.lat])
          .setHTML(popupContent)
          .addTo(map.current)
      })

      markers.current.push(marker)
    })

    // Añadir marcadores de servicios
    finalVisibleServices.forEach((service, index) => {
      console.log(`Creando marcador de servicio ${index + 1}:`, service.title, service.lat, service.lng)
      
      const markerElement = document.createElement('div')
      markerElement.style.cssText = `
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #10B981, #059669);
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
      `
      markerElement.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      `

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([service.lng, service.lat])
        .addTo(map.current)

      markerElement.addEventListener('click', () => {
        setSelectedMarker(service)
        onMarkerClick?.(service)
        
        // Crear popup
        const popupContent = `
          <div style="padding: 16px; max-width: 300px;">
            <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">${service.title}</h3>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${service.category || 'Servicio'}</p>
            <p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">${service.description}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="background: #10B981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${service.category || 'Servicio'}</span>
              <span style="font-weight: 600; color: #059669;">€${service.price}</span>
            </div>
            <div style="display: flex; gap: 8px;">
              <button onclick="window.open('/services/${service.id}', '_blank')" style="
                background: #10B981; color: white; border: none; padding: 8px 16px; 
                border-radius: 6px; cursor: pointer; font-size: 14px;
              ">Reservar</button>
              <button onclick="navigator.clipboard.writeText('${service.lat}, ${service.lng}')" style="
                background: #3B82F6; color: white; border: none; padding: 8px 16px; 
                border-radius: 6px; cursor: pointer; font-size: 14px;
              ">Coordenadas</button>
            </div>
          </div>
        `
        
        if (popup.current) popup.current.remove()
        popup.current = new mapboxgl.Popup({ closeOnClick: false })
          .setLngLat([service.lng, service.lat])
          .setHTML(popupContent)
          .addTo(map.current)
      })

      markers.current.push(marker)
    })

  }, [mapLoaded, finalVisibleHotels, finalVisibleServices, onMarkerClick])


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
    <div className={`relative w-full h-full ${className}`}>
      {/* Contenedor del mapa */}
      <div ref={mapContainer} className="w-full h-full" />

    </div>
  )
}
