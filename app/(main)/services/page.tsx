"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Car, Utensils, Activity, RefreshCw, MapPin, Star, Clock, Filter, Calendar, Sparkles, TrendingUp, Users, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ServicesGrid } from "@/components/services-grid"
import { useOptimizedData } from "@/hooks/use-optimized-data"
import { AdvancedLoading, SectionLoading, TableLoading } from "@/components/advanced-loading"
import { AdvancedError } from "@/components/advanced-error-handling"
import type { Service } from "@/lib/supabase"
import Image from "next/image"
import { toast } from "sonner"

export default function ServicesPage() {
  const {
    data: { services, categories, subcategories, loading, error },
    refreshData: refreshServices,
    isInitialized
  } = useOptimizedData()

  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedDate, setSelectedDate] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [isFiltering, setIsFiltering] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Obtener parámetros de la URL si existen
    const category = searchParams.get("category")
    const query = searchParams.get("query")
    const location = searchParams.get("location")
    const date = searchParams.get("date")

    if (category && category !== "all") {
      setSelectedCategory(category)
    }
    if (query) {
      setSearchQuery(query)
    }
    if (location && location !== "todas") {
      setSelectedLocation(location)
    }
    if (date) {
      setSelectedDate(date)
    }


  }, [searchParams])

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    // Solo aplicar filtros si tenemos servicios y categorías cargadas
    if (services.length > 0 && categories && categories.length > 0) {
      setIsFiltering(true)
      applyFilters()
      // Simular un pequeño delay para mostrar el estado de filtrado
      const timer = setTimeout(() => setIsFiltering(false), 200)
      return () => clearTimeout(timer)
    }
  }, [services, categories, debouncedSearchQuery, selectedCategory, selectedLocation, selectedDate, sortBy])

  const applyFilters = () => {
    // Validar que tenemos los datos necesarios
    if (!categories || categories.length === 0) {
      setFilteredServices(services)
      return
    }

    let filtered = [...services]

    // Filtrar por categoría
    if (selectedCategory !== "all") {
      filtered = filtered.filter((service) => service.category_id === selectedCategory)
    }

    // Filtrar por ubicación
    if (selectedLocation !== "all") {
      filtered = filtered.filter((service) => {
        if (!service.location) return false
        
        const serviceLocation = service.location.toLowerCase()
        const selectedLocationLower = selectedLocation.toLowerCase()
        
        // Mapeo de ubicaciones
        const locationMap: Record<string, string[]> = {
          'norte': ['norte', 'puerto de la cruz', 'la laguna', 'tacoronte', 'la orotava'],
          'sur': ['sur', 'adeje', 'arona', 'san miguel', 'granadilla'],
          'teide': ['teide', 'parque nacional', 'vilaflor', 'guía de isora'],
          'anaga': ['anaga', 'parque rural', 'santa cruz', 'san cristóbal'],
          'costa': ['costa', 'adeje', 'playa', 'mar'],
          'santa-cruz': ['santa cruz', 'capital'],
          'la-laguna': ['la laguna', 'laguna', 'universidad'],
          'puerto-cruz': ['puerto de la cruz', 'puerto cruz', 'loro parque']
        }
        
        const locations = locationMap[selectedLocationLower] || [selectedLocationLower]
        return locations.some(loc => serviceLocation.includes(loc))
      })
    }

    // Filtrar por búsqueda
    if (debouncedSearchQuery) {
      filtered = filtered.filter((service) =>
        service.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        (service.location && service.location.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) ||
        (service.category && service.category.name && service.category.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
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

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location)
    // Actualizar URL
    const params = new URLSearchParams(searchParams.toString())
    if (location === "all") {
      params.delete("location")
    } else {
      params.set("location", location)
    }
    router.push(`/services?${params.toString()}`)
  }

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    // Actualizar URL
    const params = new URLSearchParams(searchParams.toString())
    if (date) {
      params.set("date", date)
    } else {
      params.delete("date")
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

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedLocation("all")
    setSelectedDate("")
    setSortBy("newest")
    router.push("/services")
  }

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case "tours":
        return <Activity className="h-4 w-4" />
      case "vehicles":
        return <Car className="h-4 w-4" />
      case "gastronomy":
        return <Utensils className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getLocationName = (locationKey: string) => {
    const locationMap: Record<string, string> = {
      'norte': 'Norte de Tenerife',
      'sur': 'Sur de Tenerife',
      'teide': 'Parque Nacional del Teide',
      'anaga': 'Parque Rural de Anaga',
      'costa': 'Costa Adeje',
      'santa-cruz': 'Santa Cruz de Tenerife',
      'la-laguna': 'La Laguna',
      'puerto-cruz': 'Puerto de la Cruz'
    }
    return locationMap[locationKey] || locationKey
  }

  // Mostrar loading mientras se cargan los servicios
  if (loading && !isInitialized) {
    return <AdvancedLoading isLoading={true} />
  }

  // Si no hay servicios después de un tiempo, mostrar mensaje de ayuda
  if (!loading && services.length === 0 && isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No se encontraron servicios
            </h2>
            <p className="text-gray-600 mb-6">
              Parece que no hay servicios disponibles en este momento. 
              Intenta recargar la página o contactar con soporte.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => refreshServices()} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
                              <Button 
                  onClick={() => router.push('/')} 
                  variant="outline" 
                  className="w-full"
                >
                  Volver al Inicio
                </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ✅ NUEVO: Mostrar estado cuando las categorías no están cargadas
  if (!loading && services.length > 0 && (!categories || categories.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Cargando categorías
            </h2>
            <p className="text-gray-600 mb-6">
              Los servicios están disponibles pero las categorías aún se están cargando. 
              Por favor, espera un momento.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => refreshServices()} 
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar error si hay algún problema
  if (error) {
    return <AdvancedError 
      error={{
        message: error,
        type: 'unknown',
        timestamp: new Date(),
        retryCount: 0
      }} 
      onRetry={() => refreshServices()} 
    />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section Simple */}
      <div className="bg-gradient-to-r from-[#0061A8] to-[#1E40AF] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32 lg:pt-36 pb-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              ✩ Nuestros Servicios ✩
            </h1>
            <p className="text-xl text-white/90 mb-6">
              Descubre las mejores experiencias en Tenerife
            </p>
            <p className="text-lg text-white/80 max-w-3xl mx-auto mb-8">
              Desde tours guiados hasta alquiler de vehículos, pasando por experiencias gastronómicas únicas. 
              Explora la isla de la eterna primavera con nuestras actividades cuidadosamente seleccionadas.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#F4C762] mb-2">
                  {services.length}+
                </div>
                <div className="text-white/80 text-sm">Experiencias Únicas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#F4C762] mb-2">
                  <MapPin className="h-6 w-6 mx-auto" />
                </div>
                <div className="text-white/80 text-sm">Toda la Isla</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#F4C762] mb-2">
                  <Clock className="h-6 w-6 mx-auto" />
                </div>
                <div className="text-white/80 text-sm">Reserva 24/7</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section Simple */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="shadow-lg">
          <CardContent className="p-6">
                        {/* ✅ NUEVO: Resumen de categorías */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Filtros de búsqueda</h3>
                <div className="text-sm text-gray-600">
                  {services.length} servicios disponibles
                </div>
              </div>
              
              {!categories || categories.length === 0 ? (
                <div className="text-center py-4">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    <span className="text-sm text-gray-500">Cargando categorías...</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-[#0061A8] text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Todas ({services.length})
                  </button>
                  {categories.map((category) => {
                    const count = services.filter(s => s.category_id === category.id).length
                    const isActive = selectedCategory === category.id
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          isActive 
                            ? 'bg-[#0061A8] text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category.name} ({count})
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar servicios..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-[#0061A8] focus:ring-[#0061A8]"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Select 
                  value={selectedCategory} 
                  onValueChange={handleCategoryChange}
                  disabled={!categories || categories.length === 0}
                >
                  <SelectTrigger className="border-gray-200 focus:border-[#0061A8] focus:ring-[#0061A8]">
                    <SelectValue placeholder={!categories ? "Cargando..." : "Categoría"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      Todas las Categorías ({services.length})
                    </SelectItem>
                    {categories && categories.map((category) => {
                      const count = services.filter(s => s.category_id === category.id).length
                      return (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} ({count})
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {!categories && (
                  <div className="absolute inset-0 bg-gray-100/50 rounded-md flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  </div>
                )}
              </div>

              {/* Location Filter */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                <Select value={selectedLocation} onValueChange={handleLocationChange}>
                  <SelectTrigger className="pl-10 border-gray-200 focus:border-[#0061A8] focus:ring-[#0061A8]">
                    <SelectValue placeholder="Ubicación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las zonas</SelectItem>
                    <SelectItem value="norte">Norte de Tenerife</SelectItem>
                    <SelectItem value="sur">Sur de Tenerife</SelectItem>
                    <SelectItem value="teide">Parque Nacional del Teide</SelectItem>
                    <SelectItem value="anaga">Parque Rural de Anaga</SelectItem>
                    <SelectItem value="costa">Costa Adeje</SelectItem>
                    <SelectItem value="santa-cruz">Santa Cruz de Tenerife</SelectItem>
                    <SelectItem value="la-laguna">La Laguna</SelectItem>
                    <SelectItem value="puerto-cruz">Puerto de la Cruz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filter */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="pl-10 border-gray-200 focus:border-[#0061A8] focus:ring-[#0061A8]"
                />
              </div>

              {/* Sort Filter */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-gray-200 focus:border-[#0061A8] focus:ring-[#0061A8]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="oldest">Más antiguos</SelectItem>
                  <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
                  <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {(searchQuery || selectedCategory !== "all" || selectedLocation !== "all" || selectedDate) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Filtros activos:</span>
                    {searchQuery && (
                      <Badge variant="secondary" className="text-xs">
                        Búsqueda: "{searchQuery}"
                      </Badge>
                    )}
                    {selectedCategory !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        Categoría: {selectedCategory}
                      </Badge>
                    )}
                    {selectedLocation !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        Ubicación: {getLocationName(selectedLocation)}
                      </Badge>
                    )}
                    {selectedDate && (
                      <Badge variant="secondary" className="text-xs">
                        Fecha: {new Date(selectedDate).toLocaleDateString('es-ES')}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs"
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* ✅ NUEVO: Indicador de estado de carga */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0061A8] mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando servicios...</p>
            <p className="text-sm text-gray-500 mt-2">
              {services.length > 0 ? `${services.length} servicios cargados` : 'Inicializando...'}
            </p>
          </div>
        )}
        
        {!loading && (
          <>


            {isFiltering ? (
              <SectionLoading />
            ) : (
              <>
                {/* Results Count */}
                <div className="mb-6">
                  <p className="text-gray-600">
                    {filteredServices.length === 0 ? (
                      "No se encontraron experiencias"
                    ) : (
                      `${filteredServices.length} experiencia${filteredServices.length !== 1 ? 's' : ''} encontrada${filteredServices.length !== 1 ? 's' : ''}`
                    )}
                  </p>
                </div>

                {/* Services Grid */}
                {filteredServices.length > 0 ? (
                  <ServicesGrid services={filteredServices} />
                ) : (
                  <div className="text-center py-12">
                    <div className="max-w-md mx-auto">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No se encontraron experiencias
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {selectedCategory !== 'all' ? (
                          `No hay servicios disponibles en la categoría "${categories?.find(c => c.id === selectedCategory)?.name || selectedCategory}".`
                        ) : (
                          'Intenta ajustar tus filtros de búsqueda o explorar todas nuestras experiencias.'
                        )}
                      </p>
                      <div className="space-y-3">
                        <Button onClick={clearAllFilters} variant="outline" className="w-full">
                          Ver todas las experiencias
                        </Button>
                        {selectedCategory !== 'all' && (
                          <Button 
                            onClick={() => handleCategoryChange('all')} 
                            variant="outline" 
                            className="w-full"
                          >
                            Ver otras categorías
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
