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
  const formatPrice = (price: number, priceType?: string) => {
    const formatted = new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(price)
    
    // Si no hay price_type especificado, asumir precio por persona
    const type = priceType || "per_person"
    
    return `${formatted}${type === "per_person" ? "/persona" : ""}`
  }

  const getPriceDisplay = () => {
    if (!service.price || service.price <= 0) {
      return { amount: "Precio no disponible", type: "N/A", badgeText: "N/A" }
    }
    
    const type = service.price_type || "per_person"
    const formatted = new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(service.price)
    
    return {
      amount: formatted,
      type: type === "per_person" ? "por persona" : "precio total del servicio",
      badgeText: type === "per_person" ? "Por persona" : "Precio total"
    }
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
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] bg-white border-gray-100 rounded-2xl shadow-lg hover:shadow-blue-100/50">
      <div className="relative h-48 xs:h-52 sm:h-56 overflow-hidden bg-gray-100">
        <Image
          src={imageSrc}
          alt={service.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        
        {/* Badges superiores mejorados */}
        <div className="absolute top-2 xs:top-3 right-2 xs:right-3 flex flex-col gap-1 xs:gap-1.5">
          {service.featured && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white border-0 text-xs px-2 py-1 shadow-lg">
              <Star className="h-3 w-3 xs:h-3.5 xs:w-3.5 mr-1" />
              <span className="hidden xs:inline">Destacado</span>
              <span className="xs:hidden">Dest.</span>
            </Badge>
          )}
          {service.difficulty_level && (
            <Badge className={`${getDifficultyColor(service.difficulty_level)} border-0 text-xs px-2 py-1 shadow-lg backdrop-blur-sm`}>
              {service.difficulty_level.charAt(0).toUpperCase() + service.difficulty_level.slice(1)}
            </Badge>
          )}
        </div>
        
        {/* Badge inferior mejorado */}
        <div className="absolute bottom-2 xs:bottom-3 left-2 xs:left-3">
          {service.activity_type && (
            <Badge variant="secondary" className="bg-white/95 backdrop-blur-sm text-gray-800 border-0 text-xs px-2 py-1 shadow-lg">
              {getCategoryIcon(service.category_id)}
              <span className="ml-1 hidden sm:inline">{service.activity_type}</span>
              <span className="ml-1 sm:hidden">{service.activity_type.slice(0, 8)}...</span>
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4 xs:p-5 sm:p-6">
        <div className="space-y-3 xs:space-y-4">
          {/* Título mejorado */}
          <h3 className="font-bold text-lg xs:text-xl line-clamp-2 text-gray-900 group-hover:text-[#0061A8] transition-colors leading-tight">
            {service.title}
          </h3>

          {/* Descripción mejorada */}
          <p className="text-gray-600 text-sm xs:text-base line-clamp-2 leading-relaxed">
            {service.description}
          </p>

          {/* Información adicional mejorada */}
          <div className="grid grid-cols-1 gap-2 xs:gap-3 text-sm text-gray-500">
            {service.duration && (
              <div className="flex items-center gap-1.5 xs:gap-2 bg-gray-50 px-2 py-1 rounded-lg">
                <Clock className="h-3.5 w-3.5 xs:h-4 xs:w-4 flex-shrink-0 text-[#0061A8]" />
                <span className="font-medium">{service.duration} min</span>
              </div>
            )}
            {service.location && (
              <div className="flex items-center gap-1.5 xs:gap-2 bg-gray-50 px-2 py-1 rounded-lg">
                <MapPin className="h-3.5 w-3.5 xs:h-4 xs:w-4 flex-shrink-0 text-[#0061A8]" />
                <span className="line-clamp-1 font-medium text-xs xs:text-sm truncate">{service.location}</span>
              </div>
            )}
            {service.min_group_size && service.max_group_size && (
              <div className="flex items-center gap-1.5 xs:gap-2 bg-gray-50 px-2 py-1 rounded-lg">
                <Users className="h-3.5 w-3.5 xs:h-4 xs:w-4 flex-shrink-0 text-[#0061A8]" />
                <span className="font-medium">{service.min_group_size}-{service.max_group_size} pers.</span>
              </div>
            )}
          </div>

          {/* Precio y botones mejorados */}
          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 xs:gap-0 pt-3">
            <div className="text-left xs:text-right w-full xs:w-auto">
              <div className="flex items-center gap-2 justify-start xs:justify-end mb-1">
                <div className="text-lg xs:text-xl font-bold text-[#0061A8]">
                  {getPriceDisplay().amount}
                </div>
                <Badge className={`text-xs px-2 py-1 shadow-sm ${
                  (service.price_type || "per_person") === "per_person"
                    ? "bg-blue-100 text-blue-800 border-blue-200"
                    : "bg-purple-100 text-purple-800 border-purple-200"
                }`}>
                  {getPriceDisplay().badgeText}
                </Badge>
              </div>
              <div className="text-xs text-gray-500">
                {getPriceDisplay().type}
              </div>
            </div>
            
            <div className="flex gap-2 w-full xs:w-auto">
              <Link href={`/services/${service.id}`} className="flex-1 xs:flex-none">
                <Button 
                  variant="outline"
                  className="w-full xs:w-auto px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-3.5 text-sm xs:text-base font-semibold transition-all duration-300 hover:scale-105 border-gray-300 hover:border-[#0061A8] hover:bg-[#0061A8]/5 rounded-xl"
                  size="sm"
                >
                  <span className="hidden sm:inline">Ver Detalles</span>
                  <span className="sm:hidden">Detalles</span>
                </Button>
              </Link>
              <Link href={`/booking/${service.id}`} className="flex-1 xs:flex-none">
                <Button 
                  className="w-full xs:w-auto bg-gradient-to-r from-[#0061A8] to-[#0061A8]/90 hover:from-[#0061A8]/90 hover:to-[#0061A8] text-white px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-3.5 text-sm xs:text-base font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl rounded-xl"
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
