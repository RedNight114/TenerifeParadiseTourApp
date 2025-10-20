"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Hotel, 
  Star, 
  Euro, 
  TrendingUp,
  Eye
} from "lucide-react"

interface MapStatsProps {
  mapData: {
    hoteles: any[]
    servicios: any[]
  }
  filters: {
    showHotels: boolean
    showServices: boolean
    priceRange: [number, number]
    category: string
    stars: number[]
    searchTerm: string
  }
}

export function MapStats({ mapData, filters }: MapStatsProps) {
  // Calcular estadísticas filtradas
  const visibleHotels = mapData?.hoteles.filter(hotel => {
    if (!filters.showHotels || !hotel.visible_en_mapa) return false
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      if (!hotel.nombre.toLowerCase().includes(searchLower)) return false
    }
    if (filters.stars && filters.stars.length > 0) {
      if (!hotel.estrellas || !filters.stars.includes(hotel.estrellas)) return false
    }
    return true
  }) || []

  const visibleServices = mapData?.servicios.filter(service => {
    if (!filters.showServices || !service.visible_en_mapa) return false
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      if (!service.title.toLowerCase().includes(searchLower)) return false
    }
    if (filters.priceRange) {
      if (service.price < filters.priceRange[0] || service.price > filters.priceRange[1]) return false
    }
    if (filters.category && filters.category !== 'all') {
      if (service.category_id !== filters.category) return false
    }
    return true
  }) || []

  const avgPrice = visibleServices.length > 0 
    ? visibleServices.reduce((sum, service) => sum + service.price, 0) / visibleServices.length 
    : 0

  const avgStars = visibleHotels.length > 0 
    ? visibleHotels.reduce((sum, hotel) => sum + (hotel.estrellas || 0), 0) / visibleHotels.length 
    : 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Hoteles visibles */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hoteles</p>
              <p className="text-2xl font-bold text-blue-600">{visibleHotels.length}</p>
            </div>
            <Hotel className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              <Star className="h-3 w-3 mr-1" />
              {avgStars.toFixed(1)} ⭐ promedio
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Servicios visibles */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Servicios</p>
              <p className="text-2xl font-bold text-green-600">{visibleServices.length}</p>
            </div>
            <MapPin className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              <Euro className="h-3 w-3 mr-1" />
              €{avgPrice.toFixed(0)} promedio
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Rango de precios */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rango Precio</p>
              <p className="text-lg font-bold text-purple-600">
                €{filters.priceRange[0]} - €{filters.priceRange[1]}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              Filtro activo
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Búsqueda activa */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Búsqueda</p>
              <p className="text-lg font-bold text-orange-600">
                {filters.searchTerm ? 'Activa' : 'Inactiva'}
              </p>
            </div>
            <Eye className="h-8 w-8 text-orange-600" />
          </div>
          <div className="mt-2">
            {filters.searchTerm && (
              <Badge variant="secondary" className="text-xs">
                "{filters.searchTerm}"
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
