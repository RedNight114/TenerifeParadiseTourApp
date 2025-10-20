"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { 
  Filter, 
  Search, 
  Hotel, 
  MapPin, 
  Eye, 
  EyeOff, 
  Star,
  X,
  Menu
} from 'lucide-react'

interface FilterOptions {
  showHotels: boolean
  showServices: boolean
  priceRange: [number, number]
  category: string
  stars: number[]
  searchTerm: string
}

interface ExternalFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  mapData: {
    hoteles: any[]
    servicios: any[]
  } | null
  className?: string
}

export function ExternalFilters({ 
  filters, 
  onFiltersChange, 
  mapData,
  className = ""
}: ExternalFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'aventura', label: 'Aventura' },
    { value: 'relax', label: 'Relax' },
    { value: 'cultura', label: 'Cultura' },
    { value: 'gastronomia', label: 'Gastronomía' },
    { value: 'naturaleza', label: 'Naturaleza' }
  ]

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const resetFilters = () => {
    onFiltersChange({
      showHotels: true,
      showServices: true,
      priceRange: [0, 500],
      category: 'all',
      stars: [],
      searchTerm: ''
    })
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Buscar</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar hoteles o servicios..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="pl-10 h-11"
            aria-label="Buscar hoteles o servicios"
          />
        </div>
      </div>

      {/* Layers */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-gray-700">Capas</label>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Hotel className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">Hoteles (Referencia)</span>
            <Badge variant="secondary" className="text-xs">
              {mapData?.hoteles?.length || 0}
            </Badge>
          </div>
          <Switch
            checked={filters.showHotels}
            onCheckedChange={(checked) => handleFilterChange('showHotels', checked)}
            aria-label="Mostrar/ocultar hoteles"
          />
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">Servicios</span>
            <Badge variant="secondary" className="text-xs">
              {mapData?.servicios?.length || 0}
            </Badge>
          </div>
          <Switch
            checked={filters.showServices}
            onCheckedChange={(checked) => handleFilterChange('showServices', checked)}
            aria-label="Mostrar/ocultar servicios"
          />
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Filtros Avanzados</label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
            aria-label={isExpanded ? "Contraer filtros" : "Expandir filtros"}
          >
            {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            {/* Price Range */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Rango de precios: €{filters.priceRange[0]} - €{filters.priceRange[1]}
              </label>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => handleFilterChange('priceRange', value)}
                max={500}
                min={0}
                step={10}
                className="w-full"
              />
            </div>

            {/* Category */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Categoría</label>
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stars */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Estrellas mínimas</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant={filters.stars.includes(star) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const newStars = filters.stars.includes(star)
                        ? filters.stars.filter(s => s !== star)
                        : [...filters.stars, star]
                      handleFilterChange('stars', newStars)
                    }}
                    className="h-10 w-10 p-0"
                    aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reset Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={resetFilters}
        className="w-full h-11"
        aria-label="Limpiar todos los filtros"
      >
        Limpiar Filtros
      </Button>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden lg:block ${className}`}>
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#0061A8]" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <FilterContent />
          </CardContent>
        </Card>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden fixed top-20 right-4 z-50">
        <Button
          onClick={() => setIsMobileOpen(true)}
          className="h-12 w-12 rounded-full bg-[#0061A8] hover:bg-[#0056a3] text-white shadow-lg"
          aria-label="Abrir filtros"
        >
          <Filter className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Filter Modal */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileOpen(false)}
                  className="h-8 w-8 p-0"
                  aria-label="Cerrar filtros"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-80px)]">
              <FilterContent />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
