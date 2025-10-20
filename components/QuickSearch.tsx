"use client"

import { useState, useEffect } from 'react'
import { Search, MapPin, Hotel, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface QuickSearchProps {
  onSearch: (query: string) => void
  onLocationSelect: (location: { lat: number; lng: number; name: string }) => void
  mapData: {
    hoteles: any[]
    servicios: any[]
  }
}

export function QuickSearch({ onSearch, onLocationSelect, mapData }: QuickSearchProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Generar sugerencias basadas en los datos del mapa
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    const searchLower = query.toLowerCase()
    const allItems = [
      ...mapData.hoteles.map(hotel => ({
        ...hotel,
        type: 'hotel',
        searchText: `${hotel.nombre} ${hotel.direccion}`,
        icon: Hotel
      })),
      ...mapData.servicios.map(service => ({
        ...service,
        type: 'service',
        searchText: `${service.title} ${service.description}`,
        icon: MapPin
      }))
    ]

    const filtered = allItems
      .filter(item => item.searchText.toLowerCase().includes(searchLower))
      .slice(0, 8)

    setSuggestions(filtered)
  }, [query, mapData])

  const handleSearch = (searchQuery: string) => {
    onSearch(searchQuery)
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (item: any) => {
    setQuery(item.type === 'hotel' ? item.nombre : item.title)
    onLocationSelect({
      lat: item.lat,
      lng: item.lng,
      name: item.type === 'hotel' ? item.nombre : item.title
    })
    setShowSuggestions(false)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar hoteles, servicios o ubicaciones..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowSuggestions(true)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(query)
            }
          }}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('')
              onSearch('')
            }}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Sugerencias */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto">
          <CardContent className="p-0">
            {suggestions.map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={`${item.type}-${item.id}-${index}`}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSuggestionClick(item)}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium text-sm">
                        {item.type === 'hotel' ? item.nombre : item.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.type === 'hotel' ? item.direccion : item.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={item.type === 'hotel' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {item.type === 'hotel' ? 'Hotel' : 'Servicio'}
                    </Badge>
                    {item.type === 'hotel' && item.estrellas && (
                      <div className="flex">
                        {Array.from({ length: item.estrellas }).map((_, i) => (
                          <span key={i} className="text-yellow-400 text-xs">★</span>
                        ))}
                      </div>
                    )}
                    {item.type === 'service' && (
                      <span className="text-xs font-semibold text-green-600">
                        €{item.price}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
