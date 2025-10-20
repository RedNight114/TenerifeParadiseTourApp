"use client"

import { useState, useEffect, useRef } from 'react'
import { CompactServicesList } from '@/components/CompactServiceCards'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  MapPin, 
  Hotel,
  Euro,
  Star,
  Filter,
  Search,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  X,
  Building2,
  Check
} from 'lucide-react'

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
  images?: string[]
}

interface CompactServicesSidebarProps {
  services: Service[]
  hotels: Hotel[]
  showHotels: boolean
  showServices: boolean
  onToggleHotels: () => void
  onToggleServices: () => void
  onServiceSelect: (service: Service) => void
  selectedServiceId?: string
  onHotelSelect?: (hotel: Hotel | null) => void
}

export function CompactServicesSidebar({
  services,
  hotels,
  showHotels,
  showServices,
  onToggleHotels,
  onToggleServices,
  onServiceSelect,
  selectedServiceId,
  onHotelSelect
}: CompactServicesSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [showHotelDropdown, setShowHotelDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowHotelDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Filtrar servicios
  const filteredServices = services.filter(service => {
    if (!showServices || !service.visible_en_mapa || !service.lat || !service.lng) return false
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      if (!service.title.toLowerCase().includes(searchLower) && 
          !service.description.toLowerCase().includes(searchLower)) return false
    }
    
    if (service.price < priceRange[0] || service.price > priceRange[1]) return false
    
    if (selectedCategory !== 'all' && service.category_id !== selectedCategory) return false
    
    return true
  })

  const avgPrice = filteredServices.length > 0
    ? filteredServices.reduce((sum, service) => sum + service.price, 0) / filteredServices.length
    : 0

  const avgStars = hotels.length > 0
    ? hotels.reduce((sum, hotel) => sum + (hotel.estrellas || 0), 0) / hotels.length
    : 0

  const categories = Array.from(new Set(services.map(s => s.category_id).filter(Boolean)))

  const handleServiceBook = (service: Service) => {
    // Función real de reserva - redirige a la página de reserva
    const bookingUrl = `/services/${service.id}?action=book`
    window.open(bookingUrl, '_blank')
  }

  const handleServiceViewDetails = (service: Service) => {
    // Función real para ver detalles - redirige a la página del servicio
    const serviceUrl = `/services/${service.id}`
    window.open(serviceUrl, '_blank')
  }

  const handleHotelSelect = (hotel: Hotel) => {
    // Función real para seleccionar hotel
    setSelectedHotel(hotel)
    setShowHotelDropdown(false)
    
    // Notificar al componente padre sobre la selección del hotel
    onHotelSelect?.(hotel)
    
    // Opcional: Centrar mapa en el hotel seleccionado
    if (window.mapRef && window.mapRef.current) {
      window.mapRef.current.flyTo({
        center: [hotel.lng, hotel.lat],
        zoom: 15,
        duration: 1000
      })
    }
  }

  const handleClearHotelSelection = () => {
    setSelectedHotel(null)
    setShowHotelDropdown(false)
    onHotelSelect?.(null)
  }

  return (
    <div className="w-full bg-white flex flex-col h-full">
      {/* Header mejorado */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-[#0061A8] to-[#F4C762] rounded-lg p-2">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Servicios</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleServices}
              className={`h-8 px-3 ${showServices ? 'bg-green-50 text-green-700 border-green-300' : 'border-gray-300'}`}
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Selector de hotel compacto */}
        <div className="mb-4">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowHotelDropdown(!showHotelDropdown)}
              className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-[#0061A8] to-[#F4C762] rounded-lg p-2">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {selectedHotel ? selectedHotel.nombre : 'Seleccionar Hotel'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedHotel ? selectedHotel.direccion : '¿Dónde te hospedas?'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedHotel && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleClearHotelSelection()
                    }}
                    className="p-1 hover:bg-red-100 rounded-full transition-colors"
                    title="Limpiar selección"
                  >
                    <X className="h-3 w-3 text-red-500" />
                  </button>
                )}
                {selectedHotel ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </button>

            {/* Dropdown de hoteles */}
            {showHotelDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2 px-2">Hoteles disponibles</div>
                  {hotels.length > 0 ? (
                    hotels.map((hotel) => (
                      <button
                        key={hotel.id}
                        onClick={() => handleHotelSelect(hotel)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="bg-blue-100 rounded-lg p-1.5">
                          <Hotel className="h-3 w-3 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {hotel.nombre}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {hotel.direccion}
                          </div>
                          {hotel.estrellas && (
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(hotel.estrellas)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          )}
                        </div>
                        {selectedHotel?.id === hotel.id && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <Hotel className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <div className="text-sm">No hay hoteles disponibles</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Búsqueda mejorada con sugerencias */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar servicios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0061A8] focus:border-transparent bg-white shadow-sm transition-all duration-200"
            autoComplete="off"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {/* Sugerencias de búsqueda */}
          {searchTerm && searchTerm.length > 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              {services
                .filter(service => 
                  service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  service.description.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .slice(0, 5)
                .map(service => (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSearchTerm(service.title)
                      onServiceSelect(service)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{service.title}</div>
                    <div className="text-xs text-gray-500 truncate">{service.description}</div>
                  </button>
                ))
              }
            </div>
          )}
        </div>

        {/* Filtros mejorados */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 h-9 px-4 w-full justify-start"
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filtros avanzados</span>
            {showFilters ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
          </Button>
          
          {showFilters && (
            <div className="mt-3 p-4 bg-gray-50 rounded-xl text-sm space-y-4">
              {/* Rango de precios mejorado */}
              <div>
                <label className="text-gray-700 font-medium block mb-2">
                  Precio: €{priceRange[0]} - €{priceRange[1]}
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>€0</span>
                  <span>€1000</span>
                </div>
              </div>

              {/* Categorías mejoradas */}
              <div>
                <label className="text-gray-700 font-medium block mb-2">Categoría:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0061A8]"
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Filtros rápidos */}
              <div>
                <label className="text-gray-700 font-medium block mb-2">Filtros rápidos:</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setPriceRange([0, 100])}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      priceRange[1] <= 100 
                        ? 'bg-[#0061A8] text-white border-[#0061A8]' 
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    €0-100
                  </button>
                  <button
                    onClick={() => setPriceRange([100, 250])}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      priceRange[0] >= 100 && priceRange[1] <= 250 
                        ? 'bg-[#0061A8] text-white border-[#0061A8]' 
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    €100-250
                  </button>
                  <button
                    onClick={() => setPriceRange([250, 500])}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      priceRange[0] >= 250 && priceRange[1] <= 500 
                        ? 'bg-[#0061A8] text-white border-[#0061A8]' 
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    €250-500
                  </button>
                </div>
              </div>

              {/* Botón de reset */}
              <div className="pt-2 border-t border-gray-200">
                <button
                  onClick={() => {
                    setPriceRange([0, 500])
                    setSelectedCategory('all')
                    setSearchTerm('')
                  }}
                  className="w-full text-xs text-[#0061A8] hover:text-[#0056a0] font-medium py-1"
                >
                  Limpiar todos los filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Contador de resultados mejorado */}
        <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg mb-4">
          <span className="font-medium">
            {filteredServices.length} de {services.length} servicios
          </span>
          <div className="flex items-center gap-2">
            {filteredServices.length !== services.length && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setPriceRange([0, 500])
                  setSelectedCategory('all')
                }}
                className="text-xs text-[#0061A8] hover:text-[#0056a0] px-2 py-1"
              >
                Limpiar filtros
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowServices(!showServices)}
              className={`text-xs px-2 py-1 ${showServices ? 'text-green-600 bg-green-50' : 'text-gray-600'}`}
            >
              {showServices ? 'Ocultar en mapa' : 'Mostrar en mapa'}
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de servicios mejorada */}
      <div className="flex-1 overflow-y-auto sidebar-content">
        <CompactServicesList
          services={filteredServices}
          onServiceSelect={onServiceSelect}
          selectedServiceId={selectedServiceId}
          onServiceBook={handleServiceBook}
          onServiceViewDetails={handleServiceViewDetails}
        />
      </div>
    </div>
  )
}