"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SimpleServiceCard } from "@/components/simple-service-card"
import { useOptimizedServices } from "@/hooks/use-optimized-data"
import { SmartImagePreloader } from "@/components/image-preloader"
import { Sparkles, RefreshCw, Loader2 } from "lucide-react"

export function FeaturedServices() {
  const router = useRouter()
  const { 
    services, 
    loading, 
    error, 
    refreshServices, 
    isInitialized 
  } = useOptimizedServices()
  
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false)

  // ✅ OPTIMIZADO: Memoizar servicios destacados para evitar recálculos
  const featuredServices = useMemo(() => {
    if (services.length === 0) return []
    
    // Primero, obtener servicios marcados como destacados
    const featured = services.filter(service => service.featured)
    
    // Si hay menos de 6 destacados, completar con servicios populares
    if (featured.length < 6) {
      const remainingCount = 6 - featured.length
      const popularServices = services
        .filter(service => !service.featured && service.available)
        .sort((a, b) => {
          // Priorizar por disponibilidad y precio
          if (a.available !== b.available) return b.available ? 1 : -1
          if (a.price && b.price) return a.price - b.price
          return 0
        })
        .slice(0, remainingCount)
      
      return [...featured, ...popularServices]
    }
    
    // Si hay más de 6 destacados, tomar solo los primeros 6
    return featured.slice(0, 6)
  }, [services])

  // ✅ OPTIMIZADO: Lógica de timeout simplificada
  useEffect(() => {
    if (loading && services.length === 0 && !isInitialized) {
      const timer = setTimeout(() => setShowTimeoutMessage(true), 3000)
      return () => clearTimeout(timer)
    } else {
      setShowTimeoutMessage(false)
    }
  }, [loading, services.length, isInitialized])

  // ✅ OPTIMIZADO: Logs de depuración más claros
  useEffect(() => {
}, [services.length, featuredServices.length, loading, error, isInitialized, showTimeoutMessage])

  // ✅ OPTIMIZADO: Estados de carga más claros y efectivos
  if (!isInitialized && !loading && services.length === 0) {
    return (
      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Servicios Destacados
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre nuestras experiencias más populares en Tenerife
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 max-w-md mx-auto shadow-lg">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
                <p className="text-orange-800 font-medium">Inicializando sistema...</p>
              </div>
              <Button 
                onClick={() => refreshServices(true)} 
                size="sm" 
                className="bg-orange-600 hover:bg-orange-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (loading && !isInitialized) {
    return (
      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Servicios Destacados
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre nuestras experiencias más populares en Tenerife
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-96 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (loading && showTimeoutMessage) {
    return (
      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Servicios Destacados
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre nuestras experiencias más populares en Tenerife
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 max-w-md mx-auto shadow-lg">
              <p className="text-yellow-800 mb-4 font-medium">
                La carga está tardando más de lo esperado
              </p>
              <Button 
                onClick={() => refreshServices(true)} 
                size="sm" 
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Servicios Destacados
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre nuestras experiencias más populares en Tenerife
            </p>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md mx-auto shadow-lg">
              <p className="text-red-800 mb-4 font-medium">Error al cargar los servicios</p>
              <Button 
                onClick={() => refreshServices(true)} 
                size="sm" 
                className="bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ✅ OPTIMIZADO: Solo mostrar si hay servicios disponibles
  if (featuredServices.length === 0) {
    return (
      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Servicios Destacados
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre nuestras experiencias más populares en Tenerife
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 max-w-md mx-auto shadow-lg">
              <p className="text-gray-800 mb-4 font-medium">
                No hay servicios disponibles en este momento
              </p>
              <Button 
                onClick={() => refreshServices(true)} 
                size="sm" 
                className="bg-gray-600 hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }
return (
    <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* ✅ OPTIMIZADO: Precargador inteligente solo cuando hay servicios */}
      <SmartImagePreloader services={featuredServices} enabled={featuredServices.length > 0} />
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Servicios Destacados
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre nuestras experiencias más populares en Tenerife
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {featuredServices.map((service, index) => (
            <SimpleServiceCard
              key={service.id}
              service={service}
              priority={index < 3} // Priorizar las primeras 3 imágenes
              className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            />
          ))}
        </div>

        {/* ✅ OPTIMIZADO: Información contextual más clara */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 max-w-2xl mx-auto mb-8">
            <p className="text-blue-800 text-sm">
              💡 <span className="font-medium">Consejo:</span> Estas son nuestras experiencias más populares. 
              {featuredServices.filter(s => s.featured).length < 6 && 
                ` Hemos completado la lista con experiencias destacadas para ofrecerte más opciones.`
              }
            </p>
          </div>
          
          <Button
            onClick={() => router.push('/services')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Ver Todas las Experiencias
            <Sparkles className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
} 
