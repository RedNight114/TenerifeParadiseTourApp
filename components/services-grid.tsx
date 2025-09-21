"use client"

import { useState, useMemo, useCallback } from "react"
import { SimpleServiceCard } from "@/components/simple-service-card"
import { AdvancedServiceCard } from "@/components/advanced-service-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X, RefreshCw } from "lucide-react"
import { useServices } from "@/hooks/use-unified-cache"
import { SmartImagePreloader } from "@/components/image-preloader"
import type { Service } from "@/lib/supabase"

interface ServicesGridProps {
  propLoading?: boolean
  className?: string
  services?: Service[]
}

export function ServicesGrid({ propLoading, className = "", services: externalServices }: ServicesGridProps) {
  const { data: internalServices, isLoading: loading } = useServices()
  const isInitialized = !loading && !!internalServices
  const services = externalServices || internalServices
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("featured")
  const [showFilters, setShowFilters] = useState(false)

  const isLoading = propLoading !== undefined ? propLoading : loading

  // Obtener categorías y subcategorías únicas
  const categories = useMemo(() => {
    const cats = new Set<string>()
    const subcats = new Map<string, Set<string>>()
    
    services?.forEach(service => {
      if (service.category?.name) {
        cats.add(service.category.name)
        if (service.subcategory?.name) {
          if (!subcats.has(service.category.name)) {
            subcats.set(service.category.name, new Set())
          }
          subcats.get(service.category.name)!.add(service.subcategory.name)
        }
      }
    })
    
    return {
      categories: Array.from(cats).sort(),
      subcategories: subcats
    }
  }, [services])

  // Filtrar y ordenar servicios
  const displayServices = useMemo(() => {
    const filtered = (services || []).filter(service => {
      const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.subcategory?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = !selectedCategory || service.category?.name === selectedCategory
      const matchesSubcategory = !selectedSubcategory || service.subcategory?.name === selectedSubcategory
      
      return matchesSearch && matchesCategory && matchesSubcategory
    })

    // Ordenar servicios
    switch (sortBy) {
      case "featured":
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        break
      case "price-low":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case "price-high":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case "name":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime())
        break
      default:
        break
    }

    return filtered
  }, [services, searchTerm, selectedCategory, selectedSubcategory, sortBy])

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setSearchTerm("")
    setSelectedCategory("")
    setSelectedSubcategory("")
    setSortBy("featured")
  }, [])

  // Obtener servicios destacados para precarga prioritaria
  const featuredServices = useMemo(() => {
    return (services || []).filter(service => service.featured).slice(0, 6)
  }, [services])

  // Obtener servicios visibles para precarga
  const visibleServices = useMemo(() => {
    return displayServices.slice(0, 12) // Precargar solo los primeros 12 servicios visibles
  }, [displayServices])

  if (isLoading && (!services || services.length === 0)) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${className}`}>
        {Array.from({ length: 9 }).map((_, index) => (
                          <div key={index} className="h-96 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  if (!isLoading && displayServices.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-md mx-auto">
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron servicios</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory || selectedSubcategory 
              ? "Intenta ajustar los filtros de búsqueda"
              : "No hay servicios disponibles en este momento"
            }
          </p>
          {(searchTerm || selectedCategory || selectedSubcategory) && (
            <Button onClick={clearFilters} variant="outline" className="mr-2">
              <X className="h-4 w-4 mr-2" />
              Limpiar filtros
            </Button>
          )}
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Recargar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Precargador inteligente de imágenes */}
      <SmartImagePreloader 
        services={[...featuredServices, ...visibleServices]} 
        enabled={true} 
      />
      
      {/* Filtros y búsqueda */}
      <div className="mb-8 space-y-4">
        {/* Barra de búsqueda */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          
          {(searchTerm || selectedCategory || selectedSubcategory || sortBy !== "featured") && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>

        {/* Filtros expandibles */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las categorías</SelectItem>
                  {categories.categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subcategoría</label>
              <Select 
                value={selectedSubcategory} 
                onValueChange={setSelectedSubcategory}
                disabled={!selectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las subcategorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las subcategorías</SelectItem>
                  {selectedCategory && Array.from(categories.subcategories.get(selectedCategory) || []).map((subcategory: string) => (
                    <SelectItem key={subcategory} value={subcategory}>
                      {subcategory}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ordenar por */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Destacados primero</SelectItem>
                  <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
                  <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
                  <SelectItem value="name">Nombre A-Z</SelectItem>
                  <SelectItem value="newest">Más recientes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Contador de resultados */}
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{displayServices.length}</span> de {services?.length || 0} servicios
              </div>
            </div>
          </div>
        )}

        {/* Filtros activos */}
        {(searchTerm || selectedCategory || selectedSubcategory) && (
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Búsqueda: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Categoría: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory("")}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedSubcategory && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Subcategoría: {selectedSubcategory}
                <button
                  onClick={() => setSelectedSubcategory("")}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Grid de servicios con alturas uniformes y tarjetas más anchas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
        {displayServices.map((service, index) => (
          <AdvancedServiceCard
            key={service.id}
            service={service}
            priority={index < 6} // Priorizar las primeras 6 imágenes
            variant={service.featured ? 'featured' : 'default'}
            className="transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl h-full"
          />
        ))}
      </div>

      {/* Mensaje si no hay más servicios */}
      {displayServices.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-md mx-auto">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron servicios</h3>
            <p className="text-gray-600 mb-4">
              Intenta ajustar los filtros de búsqueda o contacta con nosotros
            </p>
            <Button onClick={clearFilters} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Limpiar filtros
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
