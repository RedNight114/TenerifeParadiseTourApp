"use client"

import { useMemo } from "react"
import { ServiceCard } from "@/components/service-card"
import { Button } from "@/components/ui/button"
import { useServicesSimple } from "@/hooks/use-services-simple"
import { AdvancedLoading, SectionLoading } from "@/components/advanced-loading"
import { AdvancedError } from "@/components/advanced-error-handling"
import { AfterHydration, SuppressHydrationWarning } from "@/components/hydration-safe"
import { Star } from "lucide-react"

// Componente de fallback para el servidor
function FeaturedServicesFallback() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-8 w-8 bg-yellow-500 rounded-full animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-bold text-gradient">Servicios Destacados</h2>
            <div className="h-8 w-8 bg-yellow-500 rounded-full animate-pulse" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nuestras experiencias más populares seleccionadas especialmente para ti
          </p>
        </div>
        
        {/* Skeleton loading para servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-6 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Componente principal que se renderiza en el cliente
function FeaturedServicesContent() {
  const {
    services,
    isLoading,
    error,
    refreshServices
  } = useServicesSimple()

  // Memoize featured services to avoid unnecessary re-renders
  const displayServices = useMemo(() => {
    const featured = services.filter(service => service.featured).slice(0, 6)
    return featured.length > 0 ? featured : services.slice(0, 6) // Fallback a los primeros 6
  }, [services])

  // Loading inicial
  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="h-8 w-8 text-yellow-500" />
              <h2 className="text-3xl md:text-4xl font-bold text-gradient">Servicios Destacados</h2>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando servicios destacados...</p>
          </div>
        </div>
      </section>
    )
  }

  // Error
  if (error) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="h-8 w-8 text-yellow-500" />
              <h2 className="text-3xl md:text-4xl font-bold text-gradient">Servicios Destacados</h2>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-red-800 mb-3">Error al cargar servicios: {error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={refreshServices} size="sm">
                  Reintentar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (displayServices.length === 0) {
    return null // No mostrar la sección si no hay servicios
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

// Componente wrapper principal con estructura consistente
export function FeaturedServices() {
  return (
    <SuppressHydrationWarning>
      <AfterHydration fallback={<FeaturedServicesFallback />}>
        <FeaturedServicesContent />
      </AfterHydration>
    </SuppressHydrationWarning>
  )
} 