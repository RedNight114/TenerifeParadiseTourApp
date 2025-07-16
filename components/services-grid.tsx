"use client"

import React, { Suspense, lazy } from "react"
import { ServiceCard } from "./service-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Service } from "@/lib/supabase"

// Lazy load del componente ServiceCard para mejor performance
const LazyServiceCard = lazy(() => import("./service-card").then(module => ({ default: module.ServiceCard })))

interface ServicesGridProps {
  services: Service[]
  loading?: boolean
}

// Skeleton para loading
const ServiceCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <Skeleton className="h-48 w-full" />
    <div className="p-4 space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  </div>
)

export const ServicesGrid = React.memo(function ServicesGrid({ services, loading = false }: ServicesGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <ServiceCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (!services || services.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron servicios</h3>
          <p className="text-gray-500">Intenta ajustar los filtros de búsqueda o vuelve más tarde.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Suspense fallback={<ServiceCardSkeleton />}>
        {services.map((service) => (
          <LazyServiceCard key={service.id} service={service} />
        ))}
      </Suspense>
    </div>
  )
})
