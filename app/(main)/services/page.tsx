"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Car, Utensils, Activity, RefreshCw, MapPin, Star, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ServicesGrid } from "@/components/services-grid"
import { useServices } from "@/hooks/use-services"
import { AdvancedLoading, SectionLoading, TableLoading } from "@/components/advanced-loading"
import { AdvancedError } from "@/components/advanced-error-handling"
import type { Service } from "@/lib/supabase"
import Image from "next/image"

export default function ServicesPage() {
  const {
    services,
    loading,
    error,
    refreshServices,
    featuredServices,
    servicesByCategory
  } = useServices()

  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Obtener parámetros de la URL si existen
    const category = searchParams.get("category")
    const query = searchParams.get("query")

    if (category && category !== "all") {
      setSelectedCategory(category)
    }
    if (query) {
      setSearchQuery(query)
    }
  }, [searchParams])

  useEffect(() => {
    applyFilters()
  }, [services, searchQuery, selectedCategory, sortBy])

  const applyFilters = () => {
    let filtered = [...services]

    // Filtrar por categoría
    if (selectedCategory !== "all") {
      filtered = filtered.filter((service) => service.category_id === selectedCategory)
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter((service) =>
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Ordenar
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      default:
        break
    }

    setFilteredServices(filtered)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    // Actualizar URL
    const params = new URLSearchParams(searchParams.toString())
    if (category === "all") {
      params.delete("category")
    } else {
      params.set("category", category)
    }
    router.push(`/services?${params.toString()}`)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    // Actualizar URL
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set("query", query)
    } else {
      params.delete("query")
    }
    router.push(`/services?${params.toString()}`)
  }

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case "1": return <Car className="h-4 w-4" />
      case "2": return <Utensils className="h-4 w-4" />
      case "3": return <Activity className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const categoryOptions = [
    { id: "all", name: "Todas las Categorías", count: services.length },
    ...Object.entries(servicesByCategory).map(([categoryId, servicesList]) => ({
      id: categoryId,
      name: `Categoría ${categoryId}`,
      count: servicesList.length,
    })),
  ]

  // Loading inicial
  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold mb-2">Cargando servicios...</h2>
            <p className="text-gray-600">Por favor, espera un momento</p>
          </div>
        </div>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-red-800 mb-2">Error al cargar servicios</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={refreshServices}>
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-services.jpg"
            alt="Tenerife Paradise Tours - Servicios"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/70 to-blue-700/80"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center text-white max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="h-8 w-8 text-yellow-400" />
              <h1 className="text-4xl md:text-6xl font-bold hero-text-shadow">
                Nuestros Servicios
              </h1>
              <Star className="h-8 w-8 text-yellow-400" />
            </div>
            <p className="text-xl md:text-2xl text-blue-100 mb-6 hero-text-shadow">
              Descubre las mejores experiencias en Tenerife
            </p>
            <p className="text-lg text-blue-200 mb-8 max-w-2xl mx-auto">
              Desde aventuras en la naturaleza hasta experiencias gastronómicas únicas, 
              tenemos todo lo que necesitas para hacer de tu viaje a Tenerife una experiencia inolvidable.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  {services.length}+
                </div>
                <div className="text-blue-100">Experiencias Únicas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  <MapPin className="h-8 w-8 mx-auto mb-2" />
                </div>
                <div className="text-blue-100">Toda la Isla</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  <Clock className="h-8 w-8 mx-auto mb-2" />
                </div>
                <div className="text-blue-100">Reserva 24/7</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8 -mt-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar servicios
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar servicios..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{category.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {category.count}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ordenar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="oldest">Más antiguos</SelectItem>
                  <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
                  <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedCategory === "all"
                ? "Todos los Servicios"
                : `Categoría ${selectedCategory}`}
            </h2>
            <p className="text-gray-600">
              {filteredServices.length} servicio{filteredServices.length !== 1 ? 's' : ''} encontrado{filteredServices.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Services Grid */}
          {filteredServices.length > 0 ? (
            <ServicesGrid services={filteredServices} loading={loading} />
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron servicios
              </h3>
              <p className="text-gray-600">
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
