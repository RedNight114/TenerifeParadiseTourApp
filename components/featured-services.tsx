"use client"

import { useMemo } from "react"
import { ServiceCard } from "@/components/service-card"
import { Button } from "@/components/ui/button"
import { useServices } from "@/hooks/use-services"
import { Star } from "lucide-react"

export function FeaturedServices() {
  const { services, loading, featuredServices } = useServices()

  // Memoize featured services to avoid unnecessary re-renders
  const displayServices = useMemo(() => {
    return featuredServices.slice(0, 6)
  }, [featuredServices])

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0061A8] mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando servicios destacados...</p>
          </div>
        </div>
      </section>
    )
  }

  if (displayServices.length === 0) {
    return null // No mostrar la sección si no hay servicios destacados
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="h-8 w-8 text-yellow-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-gradient">Servicios Destacados</h2>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nuestras experiencias más populares seleccionadas especialmente para ti
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayServices.map((service, index) => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              priority={index < 3} // Priorizar las primeras 3 imágenes
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            size="lg"
            variant="outline"
            className="border-[#0061A8] text-[#0061A8] hover:bg-[#0061A8] hover:text-white font-semibold px-8 py-3 transition-all duration-300 bg-transparent"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = "/services"
              }
            }}
          >
            Ver Todos los Servicios
          </Button>
        </div>
      </div>
    </section>
  )
} 