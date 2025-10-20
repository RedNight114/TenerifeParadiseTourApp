"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Star, Clock, Users } from 'lucide-react'
import Image from 'next/image'

interface ServiceCardProps {
  service: {
    id: string
    title: string
    description: string
    price: number
    images?: string[]
    duration?: string
    max_participants?: number
    rating?: number
    location?: string
    featured?: boolean
  }
  onViewDetails: (serviceId: string) => void
  onBook: (serviceId: string) => void
}

export function ServiceCard({ service, onViewDetails, onBook }: ServiceCardProps) {
  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  const getImageUrl = () => {
    if (service.images && service.images.length > 0) {
      return service.images[0]
    }
    return '/images/placeholder.jpg'
  }

  return (
    <Card className="w-full max-w-sm bg-white shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 ease-out hover:scale-[1.02] service-card group overflow-hidden rounded-2xl">
      <CardContent className="p-0">
        {/* Imagen del servicio */}
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={getImageUrl()}
            alt={service.title}
            fill
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 384px"
          />
          
          {/* Overlay sutil */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {service.featured && (
              <Badge className="bg-orange-500 text-white shadow-md font-medium text-xs px-3 py-1 rounded-full">
                ⭐ Destacado
              </Badge>
            )}
            {service.rating && (
              <Badge className="bg-white/95 text-gray-800 shadow-md text-xs px-2 py-1 rounded-full">
                <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                {service.rating}
              </Badge>
            )}
          </div>

          {/* Precio */}
          <div className="absolute top-3 right-3">
            <div className="bg-green-600 rounded-xl px-3 py-2 shadow-lg">
              <div className="text-center">
                <span className="text-xs font-medium text-white block">Desde</span>
                <span className="text-lg font-bold text-white">€{service.price}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-5">
          {/* Título */}
          <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
            {service.title}
          </h3>

          {/* Descripción */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {truncateDescription(service.description)}
          </p>

          {/* Información adicional */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {service.duration && (
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">{service.duration}</span>
              </div>
            )}
            {service.max_participants && (
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">Máx. {service.max_participants}</span>
              </div>
            )}
          </div>
          
          {service.location && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <MapPin className="h-3 w-3 text-gray-400" />
              <span className="truncate">{service.location}</span>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(service.id)}
              className="flex-1 text-xs font-medium border-gray-300 hover:bg-gray-50"
              aria-label={`Ver más detalles de ${service.title}`}
            >
              Ver más
            </Button>
            <Button
              size="sm"
              onClick={() => onBook(service.id)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium"
              aria-label={`Reservar ${service.title}`}
            >
              Reservar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para tarjetas de hoteles
export function HotelCard({ hotel, onClick }: { hotel: any, onClick?: () => void }) {
  return (
    <Card 
      className="w-full max-w-sm bg-white shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 ease-out hover:scale-[1.02] cursor-pointer hotel-card overflow-hidden rounded-2xl"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Hotel ${hotel.nombre}`}
    >
      <CardContent className="p-6">
        {/* Información del hotel */}
        <div className="flex flex-col items-center text-center">
          {/* Icono del hotel */}
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 14c1.66 0 3-1.34 3-3S8.66 8 7 8s-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm12.71-9.71L12 2h-1v7c0 .55-.45 1-1 1s-1-.45-1-1V2H9l-7.71 1.29c-.39.39-.39 1.02 0 1.41L9 6v12c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V6l7.71-1.29c.39-.39.39-1.02 0-1.41z"/>
            </svg>
          </div>
          
          {/* Nombre del hotel */}
          <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
            {hotel.nombre}
          </h3>
          
          {/* Estrellas */}
          {hotel.estrellas && (
            <div className="flex items-center justify-center gap-1 mb-4">
              {Array.from({ length: hotel.estrellas }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-sm font-medium text-gray-600 ml-2">{hotel.estrellas} estrellas</span>
            </div>
          )}
          
          {/* Dirección */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>{hotel.direccion}</span>
          </div>
          
          {/* Descripción */}
          {hotel.descripcion && (
            <p className="text-sm text-gray-500 mb-4 line-clamp-3 leading-relaxed">
              {hotel.descripcion}
            </p>
          )}
          
          {/* Teléfono */}
          {hotel.telefono && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
              <span className="text-gray-400">📞</span>
              <span>{hotel.telefono}</span>
            </div>
          )}
          
          {/* Botón */}
          <Button
            variant="outline"
            size="sm"
            className="w-full text-sm font-medium bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 rounded-xl"
            onClick={onClick}
            aria-label={`Ver detalles de ${hotel.nombre}`}
          >
            Ver Detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}