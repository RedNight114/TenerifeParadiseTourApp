"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Euro,
  Star,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Calendar
} from 'lucide-react'
import Image from 'next/image'

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

interface ServiceClusterProps {
  services: Service[]
  onServiceSelect: (service: Service) => void
  onServiceBook?: (service: Service) => void
  onServiceViewDetails?: (service: Service) => void
}

export function ServiceCluster({ 
  services, 
  onServiceSelect, 
  onServiceBook,
  onServiceViewDetails 
}: ServiceClusterProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [imageError, setImageError] = React.useState<Set<string>>(new Set())

  const handleImageError = (serviceId: string) => {
    setImageError(prev => new Set(prev).add(serviceId))
  }

  const getServiceImage = (service: Service) => {
    if (imageError.has(service.id) || !service.images || service.images.length === 0) {
      return '/images/placeholder.jpg'
    }
    return service.images[0]
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  const minPrice = Math.min(...services.map(s => s.price))
  const maxPrice = Math.max(...services.map(s => s.price))
  const hasMultiplePrices = minPrice !== maxPrice

  return (
    <Card className="w-full max-w-sm bg-white shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 ease-out service-cluster rounded-2xl">
      <CardContent className="p-0">
        {/* Header del cluster */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  {services.length} Servicio{services.length > 1 ? 's' : ''} en esta ubicación
                </h3>
                <p className="text-sm text-gray-600">
                  {services[0].location || 'Tenerife'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
          
          {/* Rango de precios */}
          <div className="mt-3 flex items-center gap-2">
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <Euro className="w-3 h-3 mr-1" />
              {hasMultiplePrices ? `€${minPrice} - €${maxPrice}` : `€${minPrice}`}
            </Badge>
            {services.some(s => s.featured) && (
              <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                <Star className="w-3 h-3 mr-1 fill-current" />
                Destacados
              </Badge>
            )}
          </div>
        </div>

        {/* Lista de servicios */}
        <div className="max-h-96 overflow-y-auto">
          {services.map((service, index) => (
            <div 
              key={service.id}
              className={`p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                isExpanded ? 'block' : index < 2 ? 'block' : 'hidden'
              }`}
            >
              {/* Información del servicio */}
              <div className="flex gap-3">
                {/* Imagen del servicio */}
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={getServiceImage(service)}
                    alt={service.title}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(service.id)}
                  />
                </div>

                {/* Contenido del servicio */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
                      {service.title}
                    </h4>
                    <Badge className="bg-green-100 text-green-700 text-xs ml-2">
                      €{service.price}
                    </Badge>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {truncateText(service.description, 60)}
                  </p>

                  {/* Información adicional */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    {service.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{service.duration}</span>
                      </div>
                    )}
                    {service.max_participants && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{service.max_participants}</span>
                      </div>
                    )}
                    {service.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{service.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onServiceViewDetails?.(service)}
                      className="flex-1 text-xs h-7"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Ver más
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onServiceBook?.(service)}
                      className="flex-1 text-xs h-7 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Calendar className="w-3 h-3 mr-1" />
                      Reservar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Botón para mostrar más servicios */}
          {!isExpanded && services.length > 2 && (
            <div className="p-4 text-center border-t border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="text-green-600 hover:text-green-700"
              >
                Ver {services.length - 2} servicios más
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
