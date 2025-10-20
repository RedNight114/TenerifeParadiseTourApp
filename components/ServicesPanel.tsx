"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Euro, Clock, Users, Star, Eye, ArrowRight } from 'lucide-react'
import Image from 'next/image'

interface Service {
  id: string
  title: string
  description: string
  price: number
  lat: number
  lng: number
  visible_en_mapa: boolean
  location?: string
  images?: string[]
  category_id?: string
  subcategory_id?: string
  available: boolean
  featured: boolean
  duration?: string
  max_participants?: number
  rating?: number
}

interface ServicesPanelProps {
  services: Service[]
  selectedServiceId?: string
  onServiceSelect: (service: Service) => void
  onServiceView: (serviceId: string) => void
  className?: string
}

export function ServicesPanel({ 
  services, 
  selectedServiceId, 
  onServiceSelect, 
  onServiceView,
  className = ""
}: ServicesPanelProps) {
  const [expandedService, setExpandedService] = useState<string | null>(null)

  const handleServiceClick = (service: Service) => {
    onServiceSelect(service)
    setExpandedService(expandedService === service.id ? null : service.id)
  }

  const handleViewMore = (serviceId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    onServiceView(serviceId)
  }

  const getCategoryColor = (categoryId?: string) => {
    switch (categoryId) {
      case 'aventura': return 'bg-orange-100 text-orange-800'
      case 'relax': return 'bg-purple-100 text-purple-800'
      case 'cultura': return 'bg-red-100 text-red-800'
      case 'gastronomia': return 'bg-yellow-100 text-yellow-800'
      case 'naturaleza': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (categoryId?: string) => {
    switch (categoryId) {
      case 'aventura': return '🏔️'
      case 'relax': return '🏖️'
      case 'cultura': return '🏛️'
      case 'gastronomia': return '🍽️'
      case 'naturaleza': return '🌿'
      default: return '📍'
    }
  }

  if (services.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6 text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay servicios disponibles</h3>
          <p className="text-gray-500 text-sm">
            Ajusta los filtros para ver más servicios en el mapa.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Servicios Disponibles</h2>
          <Badge variant="secondary" className="text-sm">
            {services.length} servicio{services.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Services List */}
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        {services.map((service) => (
          <Card 
            key={service.id}
            className={`m-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedServiceId === service.id 
                ? 'ring-2 ring-[#0061A8] bg-blue-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => handleServiceClick(service)}
          >
            <CardContent className="p-3">
              {/* Service Image */}
              <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden bg-gray-100">
                {service.images && service.images.length > 0 ? (
                  <Image
                    src={service.images[0]}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <span className="text-4xl">{getCategoryIcon(service.category_id)}</span>
                  </div>
                )}
                
                {/* Featured Badge */}
                {service.featured && (
                  <Badge className="absolute top-2 left-2 bg-[#F4C762] text-white text-xs">
                    Destacado
                  </Badge>
                )}
                
                {/* Price Badge */}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                  <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                    <Euro className="h-3 w-3" />
                    {service.price}
                  </div>
                </div>
              </div>

              {/* Service Info */}
              <div className="space-y-2">
                {/* Title and Category */}
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight flex-1">
                    {service.title}
                  </h3>
                  {service.category_id && (
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ml-2 ${getCategoryColor(service.category_id)}`}
                    >
                      {service.category_id}
                    </Badge>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                  {service.description}
                </p>

                {/* Service Details */}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {service.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{service.duration}</span>
                    </div>
                  )}
                  {service.max_participants && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>Max {service.max_participants}</span>
                    </div>
                  )}
                  {service.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>{service.rating}</span>
                    </div>
                  )}
                </div>

                {/* Location */}
                {service.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <span>{service.location}</span>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-2">
                  <Button
                    size="sm"
                    className="w-full h-8 text-xs font-medium bg-[#0061A8] hover:bg-[#0056a3] text-white"
                    onClick={(e) => handleViewMore(service.id, e)}
                    aria-label={`Ver detalles de ${service.title}`}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver más
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          Haz clic en un servicio para centrarlo en el mapa
        </p>
      </div>
    </div>
  )
}
