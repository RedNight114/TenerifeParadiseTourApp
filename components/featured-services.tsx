"use client"

import { useMemo } from "react"
import { ServiceCard } from "@/components/service-card"
import { Button } from "@/components/ui/button"
import { useServicesAdvanced } from "@/hooks/use-services-advanced"
import { AdvancedLoading, SectionLoading } from "@/components/advanced-loading"
import { AdvancedError } from "@/components/advanced-error-handling"
import { Star } from "lucide-react"

export function FeaturedServices() {
  const {
    services,
    isLoading,
    isInitialLoading,
    error,
    hasError,
    refreshServices,
    clearError
  } = useServicesAdvanced()

  // Memoize featured services to avoid unnecessary re-renders
  const displayServices = useMemo(() => {
    const featured = services.filter(service => service.featured).slice(0, 6)
    return featured.length > 0 ? featured : services.slice(0, 6) // Fallback a los primeros 6
  }, [services])

  // Loading inicial
  if (isInitialLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <SectionLoading message="Cargando servicios destacados..." />
        </div>
      </section>
    )
  }

  // Error no crítico
  if (hasError && error) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-4">Servicios Destacados</h2>
            <AdvancedError
              error={error}
              variant="inline"
              onRetry={refreshServices}
              onDismiss={clearError}
              showDetails={false}
            />
          </div>
        </div>
      </section>
    )
  }

  // Loading de actualización
  if (isLoading && !isInitialLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="h-8 w-8 text-yellow-500" />
              <h2 className="text-3xl md:text-4xl font-bold text-gradient">Servicios Destacados</h2>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <AdvancedLoading
              isLoading={true}
              variant="minimal"
              size="sm"
              message="Actualizando servicios..."
            />
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