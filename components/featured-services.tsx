"use client"

import React from "react"
import { Star, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ServiceCard } from "@/components/service-card"
import { useServices } from "@/hooks/use-services"

// Componente principal simplificado
export function FeaturedServices() {
  const { services, loading, error, refreshServices } = useServices()

  // Mostrar loading
  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-10 w-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Star className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Experiencias Destacadas
              </h2>
              <div className="h-10 w-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Star className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Cargando experiencias...</span>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Mostrar error
  if (error) {
    return (
      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-10 w-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Star className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Experiencias Destacadas
              </h2>
              <div className="h-10 w-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Star className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md mx-auto shadow-lg">
              <p className="text-red-800 mb-4 font-medium">Error al cargar servicios: {error}</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={refreshServices} size="sm" className="bg-red-600 hover:bg-red-700">
                  Reintentar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Obtener servicios destacados (primeros 6)
  const displayServices = services.slice(0, 6)

  if (displayServices.length === 0) {
    return null // No mostrar la sección si no hay servicios
  }

  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-10 w-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Star className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Experiencias Destacadas
            </h2>
            <div className="h-10 w-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Star className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-4">
            Nuestras experiencias más populares seleccionadas especialmente para ti
          </p>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-gray-500 font-medium">Cuidadosamente seleccionadas</span>
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {displayServices.map((service, index) => (
            <div key={service.id} className="group">
              <ServiceCard 
                service={service} 
                priority={index < 3} // Priorizar las primeras 3 imágenes
              />
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-10 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group"
            onClick={() => {
              window.location.href = "/services"
            }}
          >
            <span className="flex items-center gap-3">
              Ver Todas las Experiencias
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            Descubre más de {services.length} experiencias únicas
          </p>
        </div>
      </div>
    </section>
  )
} 