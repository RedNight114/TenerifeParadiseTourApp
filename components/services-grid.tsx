"use client"

import { useMemo } from "react"
import { ServiceCard } from "@/components/service-card"
import { useServices } from "@/hooks/use-services"
import { Skeleton } from "@/components/ui/skeleton"

interface ServicesGridProps {
  services?: any[]
  loading?: boolean
  showFeatured?: boolean
  limit?: number
}

export function ServicesGrid({ 
  services: propServices, 
  loading: propLoading, 
  showFeatured = false,
  limit 
}: ServicesGridProps) {
  const { services, loading } = useServices()

  // Use provided services or fallback to hook services
  const displayServices = useMemo(() => {
    const sourceServices = propServices || services
    
    if (showFeatured) {
      return sourceServices.filter((s) => s.featured)
    }
    
    if (limit) {
      return sourceServices.slice(0, limit)
    }
    
    return sourceServices
  }, [propServices, services, showFeatured, limit])

  const isLoading = propLoading !== undefined ? propLoading : loading

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (displayServices.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No se encontraron servicios</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {displayServices.map((service, index) => (
        <ServiceCard 
          key={service.id} 
          service={service}
          priority={index < 4} // Priorizar las primeras 4 imágenes
        />
      ))}
    </div>
  )
}
