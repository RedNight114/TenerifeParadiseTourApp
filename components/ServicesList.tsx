"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { 
  Search, 
  Filter, 
  MapPin, 
  Euro, 
  Star, 
  Clock, 
  Users, 
  Heart,
  Eye,
  ChevronDown,
  SortAsc,
  SortDesc
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

interface ServicesListProps {
  services: Service[]
  selectedServiceId?: string
  onServiceSelect: (service: Service) => void
  onServiceView: (serviceId: string) => void
  className?: string
}

export function ServicesList({ 
  services, 
  selectedServiceId, 
  onServiceSelect, 
  onServiceView,
  className 
}: ServicesListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'price' | 'name' | 'rating'>('price')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false)

  // Filtrar y ordenar servicios
  const filteredServices = services
    .filter(service => {
      if (searchTerm && !service.title.toLowerCase().includes(searchTerm.toLowerCase())) return false
      if (selectedCategory !== 'all' && service.category_id !== selectedCategory) return false
      if (showOnlyFeatured && !service.featured) return false
      if (service.price < priceRange[0] || service.price > priceRange[1]) return false
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'price':
          comparison = a.price - b.price
          break
        case 'name':
          comparison = a.title.localeCompare(b.title)
          break
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0)
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const getCategoryIcon = (categoryId?: string) => {
    switch (categoryId) {
      case 'aventura': return '🏔️'
      case 'relax': return '🏖️'
      case 'cultura': return '🏛️'
      case 'gastronomia': return '🍽️'
      case 'transporte': return '🚗'
      case 'excursion': return '✈️'
      default: return '📍'
    }
  }

  const getCategoryColor = (categoryId?: string) => {
    switch (categoryId) {
      case 'aventura': return 'bg-orange-100 text-orange-700'
      case 'relax': return 'bg-purple-100 text-purple-700'
      case 'cultura': return 'bg-red-100 text-red-700'
      case 'gastronomia': return 'bg-yellow-100 text-yellow-700'
      case 'transporte': return 'bg-gray-100 text-gray-700'
      case 'excursion': return 'bg-indigo-100 text-indigo-700'
      default: return 'bg-green-100 text-green-700'
    }
  }

  return (
    <div className={`bg-white h-full flex flex-col ${className}`}>
      {/* Header con búsqueda y filtros */}
      <div className="p-4 border-b border-gray-200">
        <div className="space-y-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Filtros</span>
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            </div>

            {/* Rango de precios */}
            <div className="space-y-2">
              <label className="text-xs text-gray-600">
                Precio: €{priceRange[0]} - €{priceRange[1]}
              </label>
              <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                max={500}
                min={0}
                step={10}
                className="w-full"
              />
            </div>

            {/* Categoría */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="aventura">Aventura</SelectItem>
                <SelectItem value="relax">Relax</SelectItem>
                <SelectItem value="cultura">Cultura</SelectItem>
                <SelectItem value="gastronomia">Gastronomía</SelectItem>
                <SelectItem value="transporte">Transporte</SelectItem>
                <SelectItem value="excursion">Excursión</SelectItem>
              </SelectContent>
            </Select>

            {/* Ordenar */}
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="h-8 flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Precio</SelectItem>
                  <SelectItem value="name">Nombre</SelectItem>
                  <SelectItem value="rating">Valoración</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="h-8 w-8 p-0"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {filteredServices.length} de {services.length} servicios
          </span>
          <Button variant="ghost" size="sm" className="text-xs">
            <Eye className="h-3 w-3 mr-1" />
            Ver en mapa
          </Button>
        </div>
      </div>

      {/* Lista de servicios */}
      <div className="flex-1 overflow-y-auto">
        {filteredServices.length > 0 ? (
          <div className="p-4 space-y-4">
            {filteredServices.map((service) => (
              <Card 
                key={service.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedServiceId === service.id 
                    ? 'ring-2 ring-[#0061A8] shadow-lg' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => onServiceSelect(service)}
              >
                <CardContent className="p-0">
                  {/* Imagen principal */}
                  <div className="relative h-32 w-full overflow-hidden rounded-t-lg">
                    {service.images && service.images.length > 0 ? (
                      <Image
                        src={service.images[0]}
                        alt={service.title}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gray-100">
                        <MapPin className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Badges superpuestos */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      <Badge className={`text-xs ${getCategoryColor(service.category_id)}`}>
                        {getCategoryIcon(service.category_id)} {service.category_id}
                      </Badge>
                      {service.featured && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Destacado
                        </Badge>
                      )}
                    </div>

                    {/* Precio */}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-[#0061A8] text-white text-sm font-semibold">
                        €{service.price}
                      </Badge>
                    </div>

                    {/* Botón de favoritos */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute bottom-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                    >
                      <Heart className="h-4 w-4 text-gray-600" />
                    </Button>
                  </div>

                  {/* Información del servicio */}
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {service.description}
                    </p>
                    
                    {/* Detalles adicionales */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      {service.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {service.duration}
                        </div>
                      )}
                      {service.maxPeople && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {service.maxPeople} pers.
                        </div>
                      )}
                      {service.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {service.rating}
                        </div>
                      )}
                    </div>

                    {/* Botón de acción */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          onServiceView(service.id)
                        }}
                      >
                        Ver detalles
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 text-xs bg-[#0061A8] hover:bg-[#0056a3]"
                        onClick={(e) => {
                          e.stopPropagation()
                          onServiceView(service.id)
                        }}
                      >
                        Reservar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No se encontraron servicios</h3>
            <p className="text-sm text-gray-500">Ajusta tus filtros para ver más resultados.</p>
          </div>
        )}
      </div>
    </div>
  )
}
