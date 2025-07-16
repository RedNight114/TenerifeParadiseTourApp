"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Clock, Users } from "lucide-react"
import type { Service } from "@/lib/supabase"

interface ServiceCardProps {
  service: Service
}

export const ServiceCard = React.memo(function ServiceCard({ service }: ServiceCardProps) {
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

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-white border-gray-200">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={service.images?.[0] || "/placeholder.svg?height=200&width=300&text=Sin+imagen"}
          alt={service.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        
        {/* Badges superiores */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {service.featured && (
            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-0">
              <Star className="h-3 w-3 mr-1" />
              Destacado
            </Badge>
          )}
          {service.difficulty_level && (
            <Badge className={`${getDifficultyColor(service.difficulty_level)} border-0`}>
              {service.difficulty_level.charAt(0).toUpperCase() + service.difficulty_level.slice(1)}
            </Badge>
          )}
        </div>
        
        {/* Badge inferior */}
        <div className="absolute bottom-2 left-2">
          {service.activity_type && (
            <Badge variant="secondary" className="bg-white/90 text-gray-800 border-0">
              {getCategoryIcon(service.category_id)}
              <span className="ml-1">{service.activity_type}</span>
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Título */}
          <h3 className="font-semibold text-lg line-clamp-2 text-gray-900 group-hover:text-[#0061A8] transition-colors">
            {service.title}
          </h3>

          {/* Descripción */}
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
            {service.description}
          </p>

          {/* Información adicional */}
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            {service.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{service.duration} min</span>
              </div>
            )}
            {service.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="line-clamp-1">{service.location}</span>
              </div>
            )}
            {service.min_group_size && service.max_group_size && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{service.min_group_size}-{service.max_group_size} pers.</span>
              </div>
            )}
          </div>

          {/* Precio y botón */}
          <div className="flex justify-between items-center pt-2">
            <div className="text-right">
              <div className="text-lg font-bold text-[#0061A8]">
                {formatPrice(service.price, service.price_type || "per_person")}
              </div>
              {service.price_type === "per_person" && (
                <div className="text-xs text-gray-500">por persona</div>
              )}
            </div>
            
            <Link href={`/booking/${service.id}`}>
              <Button 
                className="bg-[#0061A8] hover:bg-[#0061A8]/90 text-white px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105"
                size="sm"
              >
                Reservar
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
