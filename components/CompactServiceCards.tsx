"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Euro,
  Star,
  Clock,
  Users,
  Heart,
  ExternalLink,
  Eye,
  Calendar,
  Navigation
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

interface CompactServiceCardProps {
  service: Service
  isSelected: boolean
  onSelect: (service: Service) => void
  onBook?: (service: Service) => void
  onViewDetails?: (service: Service) => void
}

export function CompactServiceCard({ 
  service, 
  isSelected, 
  onSelect, 
  onBook,
  onViewDetails
}: CompactServiceCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleCardClick = () => {
    onSelect(service)
  }

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onBook) {
      onBook(service)
    }
  }

  const handleViewDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onViewDetails) {
      onViewDetails(service)
    }
  }

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  // Obtener la mejor imagen disponible
  const getServiceImage = () => {
    if (imageError || !service.images || service.images.length === 0) {
      return '/images/placeholder.jpg'
    }
    return service.images[0]
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  return (
    <Card
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group ${
        isSelected 
          ? 'ring-2 ring-[#0061A8] bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg' 
          : 'hover:shadow-md border-gray-200'
      }`}
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* Imagen del servicio mejorada */}
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={getServiceImage()}
            alt={service.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={handleImageError}
            sizes="(max-width: 768px) 100vw, 320px"
          />
          
          {/* Overlay gradiente mejorado */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Precio destacado */}
          <div className="absolute top-3 right-3">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg">
              <div className="text-center">
                <span className="text-xs font-medium text-gray-600 block leading-tight">Desde</span>
                <span className="text-lg font-bold text-emerald-600 leading-tight">€{service.price}</span>
              </div>
            </div>
          </div>

          {/* Badges superpuestos */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {service.featured && (
              <Badge className="bg-gradient-to-r from-[#0061A8] to-[#F4C762] text-white border-0 shadow-lg font-medium text-xs">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Destacado
              </Badge>
            )}
            {service.rating && service.rating > 0 && (
              <Badge variant="secondary" className="bg-white/95 text-gray-800 shadow-lg backdrop-blur-sm text-xs">
                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                {service.rating}
              </Badge>
            )}
          </div>

          {/* Botón de like mejorado */}
          <button
            onClick={handleLikeClick}
            className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 hover:scale-110 shadow-lg"
            aria-label={isLiked ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          >
            <Heart 
              className={`h-4 w-4 transition-colors ${
                isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600 hover:text-red-500'
              }`} 
            />
          </button>

          {/* Indicador de selección */}
          {isSelected && (
            <div className="absolute inset-0 border-2 border-[#0061A8] rounded-lg pointer-events-none">
              <div className="absolute top-2 left-2 bg-[#0061A8] text-white px-2 py-1 rounded-full text-xs font-medium">
                Seleccionado
              </div>
            </div>
          )}
        </div>

        {/* Contenido de la tarjeta mejorado */}
        <div className="p-4">
          {/* Título */}
          <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mb-2 leading-tight">
            {service.title}
          </h3>
          
          {/* Descripción */}
          <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">
            {truncateText(service.description, 80)}
          </p>
          
          {/* Información adicional en grid */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-500">
            {service.location && (
              <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="truncate">{service.location}</span>
              </div>
            )}
            {service.duration && (
              <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                <Clock className="h-3 w-3 text-gray-400" />
                <span>{service.duration}</span>
              </div>
            )}
          </div>

          {/* Participantes */}
          {service.max_participants && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-3 bg-gray-50 px-2 py-1 rounded-lg">
              <Users className="h-3 w-3 text-gray-400" />
              <span>Máx. {service.max_participants} personas</span>
            </div>
          )}

          {/* Botones de acción mejorados */}
          <div className="flex gap-2">
            <Button
              onClick={handleViewDetailsClick}
              variant="outline"
              size="sm"
              className="flex-1 text-xs font-medium hover:bg-gray-50 transition-colors border-gray-300 rounded-lg h-8"
            >
              <Eye className="h-3 w-3 mr-1" />
              Ver más
            </Button>
            <Button
              onClick={handleBookClick}
              size="sm"
              className="flex-1 text-xs font-medium bg-gradient-to-r from-[#0061A8] to-[#F4C762] hover:from-[#0056a0] hover:to-[#e6b855] text-white transition-all duration-200 shadow-md hover:shadow-lg rounded-lg h-8"
            >
              <Calendar className="h-3 w-3 mr-1" />
              Reservar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface CompactServicesListProps {
  services: Service[]
  onServiceSelect: (service: Service) => void
  selectedServiceId?: string
  onServiceBook?: (service: Service) => void
  onServiceViewDetails?: (service: Service) => void
}

export function CompactServicesList({
  services,
  onServiceSelect,
  selectedServiceId,
  onServiceBook,
  onServiceViewDetails
}: CompactServicesListProps) {
  if (services.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">No se encontraron servicios</h3>
        <p className="text-xs text-gray-500">Ajusta los filtros para ver más resultados</p>
      </div>
    )
  }

  return (
    <div className="p-3 space-y-4 sidebar-content">
      {services.map((service) => (
        <CompactServiceCard
          key={service.id}
          service={service}
          isSelected={selectedServiceId === service.id}
          onSelect={onServiceSelect}
          onBook={onServiceBook}
          onViewDetails={onServiceViewDetails}
        />
      ))}
    </div>
  )
}