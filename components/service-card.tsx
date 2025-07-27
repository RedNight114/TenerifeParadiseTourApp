"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Clock, Users } from "lucide-react"
import type { Service } from "@/lib/supabase"
import { normalizeImageUrl } from "@/lib/utils"

interface ServiceCardProps {
  service: Service
  priority?: boolean
}

export const ServiceCard = React.memo(function ServiceCard({ service, priority = false }: ServiceCardProps) {
  const formatPrice = (price: number, priceType: string) => {
    const formatted = new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(price)
    return `${formatted}${priceType === "per_person" ? "/persona" : ""}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "facil":
        return "bg-green-100 text-green-800"
      case "moderado":
        return "bg-yellow-100 text-yellow-800"
      case "dificil":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case "activities":
        return <MapPin className="h-4 w-4" />
      case "renting":
        return <Users className="h-4 w-4" />
      case "gastronomy":
        return <Clock className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  // Obtener la primera imagen del servicio
  const firstImage = service.images && service.images.length > 0 ? service.images[0] : null
  const imageSrc = normalizeImageUrl(firstImage)

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-white border-gray-200">
      <div className="relative h-40 xs:h-44 sm:h-48 overflow-hidden bg-gray-100">
        <Image
          src={imageSrc}
          alt={service.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          quality={75}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        
        {/* Badges superiores */}
        <div className="absolute top-1 xs:top-2 right-1 xs:right-2 flex flex-col gap-0.5 xs:gap-1">
          {service.featured && (
            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-0 text-xs px-1.5 py-0.5">
              <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 mr-0.5 xs:mr-1" />
              <span className="hidden xs:inline">Destacado</span>
              <span className="xs:hidden">Dest.</span>
            </Badge>
          )}
          {service.difficulty_level && (
            <Badge className={`${getDifficultyColor(service.difficulty_level)} border-0 text-xs px-1.5 py-0.5`}>
              {service.difficulty_level.charAt(0).toUpperCase() + service.difficulty_level.slice(1)}
            </Badge>
          )}
        </div>
        
        {/* Badge inferior */}
        <div className="absolute bottom-1 xs:bottom-2 left-1 xs:left-2">
          {service.activity_type && (
            <Badge variant="secondary" className="bg-white/90 text-gray-800 border-0 text-xs px-1.5 py-0.5">
              {getCategoryIcon(service.category_id)}
              <span className="ml-0.5 xs:ml-1 hidden sm:inline">{service.activity_type}</span>
              <span className="ml-0.5 xs:ml-1 sm:hidden">{service.activity_type.slice(0, 8)}...</span>
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-2 xs:p-3 sm:p-4">
        <div className="space-y-2 xs:space-y-3">
          {/* Título */}
          <h3 className="font-semibold text-base xs:text-lg line-clamp-2 text-gray-900 group-hover:text-[#0061A8] transition-colors leading-tight">
            {service.title}
          </h3>

          {/* Descripción */}
          <p className="text-gray-600 text-xs xs:text-sm line-clamp-2 leading-relaxed">
            {service.description}
          </p>

          {/* Información adicional */}
          <div className="flex flex-wrap gap-1 xs:gap-2 text-xs text-gray-500">
            {service.duration && (
              <div className="flex items-center gap-0.5 xs:gap-1">
                <Clock className="h-2.5 w-2.5 xs:h-3 xs:w-3 flex-shrink-0" />
                <span>{service.duration} min</span>
              </div>
            )}
            {service.location && (
              <div className="flex items-center gap-0.5 xs:gap-1">
                <MapPin className="h-2.5 w-2.5 xs:h-3 xs:w-3 flex-shrink-0" />
                <span className="line-clamp-1">{service.location}</span>
              </div>
            )}
            {service.min_group_size && service.max_group_size && (
              <div className="flex items-center gap-0.5 xs:gap-1">
                <Users className="h-2.5 w-2.5 xs:h-3 xs:w-3 flex-shrink-0" />
                <span>{service.min_group_size}-{service.max_group_size} pers.</span>
              </div>
            )}
          </div>

          {/* Precio y botones */}
          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 xs:gap-0 pt-2">
            <div className="text-left xs:text-right w-full xs:w-auto">
              <div className="text-base xs:text-lg font-bold text-[#0061A8]">
                {formatPrice(service.price, service.price_type || "per_person")}
              </div>
              {service.price_type === "per_person" && (
                <div className="text-xs text-gray-500">por persona</div>
              )}
            </div>
            
            <div className="flex gap-2 w-full xs:w-auto">
              <Link href={`/services/${service.id}`} className="flex-1 xs:flex-none">
                <Button 
                  variant="outline"
                  className="w-full xs:w-auto px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 sm:py-3 text-xs xs:text-sm font-medium transition-all duration-200 hover:scale-105 border-gray-300 hover:border-[#0061A8] hover:bg-[#0061A8]/5"
                  size="sm"
                >
                  <span className="hidden sm:inline">Ver Detalles</span>
                  <span className="sm:hidden">Detalles</span>
                </Button>
              </Link>
              <Link href={`/booking/${service.id}`} className="flex-1 xs:flex-none">
                <Button 
                  className="w-full xs:w-auto bg-[#0061A8] hover:bg-[#0061A8]/90 text-white px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 sm:py-3 text-xs xs:text-sm font-medium transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                  size="sm"
                >
                  <span className="hidden sm:inline">Reservar</span>
                  <span className="sm:hidden">Reservar</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
