"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Car, Utensils, Activity, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ServicesGrid } from "@/components/services-grid"
import { useServices } from "@/hooks/use-services"
import { useCategories } from "@/hooks/use-categories"
import type { Service } from "@/lib/supabase"

export default function ServicesPage() {
  const { services, loading, fetchServices, refreshServices } = useServices()
  const { categories, subcategories } = useCategories()
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedSubcategory, setSelectedSubcategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Obtener parámetros de la URL si existen
    const category = searchParams.get("category")
    const subcategory = searchParams.get("subcategory")
    const query = searchParams.get("query")

    if (category && category !== "all") {
      setSelectedCategory(category)
    }
    if (subcategory && subcategory !== "all") {
      setSelectedSubcategory(subcategory)
    }
    if (query) {
      setSearchQuery(query)
    }
  }, [searchParams])

  useEffect(() => {
    applyFilters()
  }, [services, searchQuery, selectedCategory, selectedSubcategory, sortBy])

  const applyFilters = () => {
    let filtered = [...services]

    // Filtrar por categoría
    if (selectedCategory !== "all") {
      filtered = filtered.filter((service) => service.category_id === selectedCategory)
    }

    // Filtrar por subcategoría
    if (selectedSubcategory !== "all") {
      filtered = filtered.filter((service) => service.subcategory_id === selectedSubcategory)
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (service) =>
          service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.subcategory?.name.toLowerCase().includes(searchQuery.toLowerCase()),
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
      default:
        break
    }

    setFilteredServices(filtered)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setSelectedSubcategory("all") // Reset subcategory when category changes

    // Actualizar URL sin recargar la página
    const params = new URLSearchParams(searchParams.toString())
    if (category === "all") {
      params.delete("category")
    } else {
      params.set("category", category)
    }
    params.delete("subcategory")
    router.push(`/services?${params.toString()}`, { scroll: false })
  }

  const handleSubcategoryChange = (subcategory: string) => {
    setSelectedSubcategory(subcategory)

    // Actualizar URL
    const params = new URLSearchParams(searchParams.toString())
    if (subcategory === "all") {
      params.delete("subcategory")
    } else {
      params.set("subcategory", subcategory)
    }
    router.push(`/services?${params.toString()}`, { scroll: false })
  }

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case "actividades":
        return <Activity className="h-4 w-4" />
      case "renting":
        return <Car className="h-4 w-4" />
      case "gastronomia":
        return <Utensils className="h-4 w-4" />
      default:
        return null
    }
  }

  const getAvailableSubcategories = () => {
    if (selectedCategory === "all") return subcategories
    return subcategories.filter((sub) => sub.category_id === selectedCategory)
  }

  const categoryOptions = [
    { id: "all", name: "Todas las Categorías", count: services.length },
    ...categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      count: services.filter((s) => s.category_id === cat.id).length,
    })),
  ]

  const subcategoryOptions = [
    { id: "all", name: "Todas las Subcategorías", count: filteredServices.length },
    ...getAvailableSubcategories().map((sub) => ({
      id: sub.id,
      name: sub.name,
      count: services.filter((s) => s.subcategory_id === sub.id).length,
    })),
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/hero-services.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0061A8]/80 via-[#0061A8]/60 to-[#F4C762]/40" />
        <div className="relative container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">Todos Nuestros Servicios</h1>
            <p className="text-xl md:text-2xl text-white/95 leading-relaxed drop-shadow-md">
              Descubre la colección completa de experiencias únicas que tenemos preparadas para ti en Tenerife
            </p>
          </div>
        </div>
      </section>

      {/* Sticky Filters Bar */}
      <div className="sticky top-16 xs:top-18 sm:top-20 md:top-22 lg:top-24 xl:top-26 z-30 bg-white border-b shadow-sm">
        <div className="container mx-auto px-2 xs:px-3 sm:px-4 py-2">
          {/* Active Filters Display */}
          {(searchQuery || selectedCategory !== "all") && (
            <div className="flex flex-wrap items-center gap-1 xs:gap-2">
              <span className="text-xs xs:text-sm text-gray-600 font-medium">Filtros activos:</span>
              {searchQuery && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <span className="hidden xs:inline">Búsqueda: "{searchQuery}"</span>
                  <span className="xs:hidden">"{searchQuery}"</span>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 hover:bg-gray-200 rounded-full w-3 h-3 xs:w-4 xs:h-4 flex items-center justify-center text-xs"
                    aria-label={`Eliminar filtro de búsqueda: ${searchQuery}`}
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <span className="hidden xs:inline">{categories.find((c) => c.id === selectedCategory)?.name}</span>
                  <span className="xs:hidden">{categories.find((c) => c.id === selectedCategory)?.name?.slice(0, 10)}...</span>
                  <button
                    onClick={() => handleCategoryChange("all")}
                    className="ml-1 hover:bg-gray-200 rounded-full w-3 h-3 xs:w-4 xs:h-4 flex items-center justify-center text-xs"
                    aria-label={`Eliminar filtro de categoría: ${categories.find((c) => c.id === selectedCategory)?.name}`}
                  >
                    ×
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                  router.push("/services", { scroll: false })
                }}
                className="text-[#0061A8] hover:text-[#0061A8]/80 hover:bg-[#0061A8]/5 text-xs xs:text-sm h-6 xs:h-8 px-2 xs:px-3"
              >
                <span className="hidden xs:inline">Limpiar todos</span>
                <span className="xs:hidden">Limpiar</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <section
        className="py-4 xs:py-6 sm:py-8 bg-white border-b shadow-sm"
        role="search"
        aria-label="Filtros de búsqueda"
      >
        <div className="container mx-auto px-2 xs:px-3 sm:px-4">
          <div className="flex flex-col gap-3 xs:gap-4">
            {/* Search Bar */}
            <div className="w-full">
              <label htmlFor="search-services" className="sr-only">
                Buscar servicios
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 xs:h-5 xs:w-5 text-gray-400" aria-hidden="true" />
                <Input
                  id="search-services"
                  placeholder="Buscar servicios, actividades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 xs:pl-10 h-10 xs:h-12 border-gray-300 focus:border-[#F4C762] focus:ring-2 focus:ring-[#F4C762]/20 transition-all duration-200 text-sm xs:text-base"
                  aria-describedby="search-help"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 xs:right-3 top-2 xs:top-3 h-5 w-5 xs:h-6 xs:w-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors text-xs"
                    aria-label="Limpiar búsqueda"
                  >
                    ×
                  </button>
                )}
              </div>
              <div id="search-help" className="sr-only">
                Escribe para buscar entre nuestros servicios disponibles
              </div>
            </div>

            {/* Filters - Horizontal Layout */}
            <div className="flex flex-col sm:flex-row gap-2 xs:gap-3 sm:gap-4 items-stretch sm:items-center">
              {/* Refresh Button */}
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshServices}
                  disabled={loading}
                  className="h-9 xs:h-10 sm:h-12 px-3 border-gray-300 hover:bg-gray-50 text-xs xs:text-sm"
                  title="Refrescar datos desde la base de datos"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refrescar</span>
                </Button>
              </div>
              {/* Category Filter */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 xs:gap-2 flex-1">
                <label htmlFor="category-filter" className="text-xs xs:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Categoría:
                </label>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger
                    id="category-filter"
                    className="w-full sm:w-40 md:w-48 h-9 xs:h-10 sm:h-12 border-gray-300 focus:border-[#F4C762] focus:ring-2 focus:ring-[#F4C762]/20 text-xs xs:text-sm"
                    aria-label="Filtrar por categoría"
                  >
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(category.id)}
                          <span className="text-xs xs:text-sm">{category.name}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {category.count}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subcategory Filter */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 xs:gap-2 flex-1">
                <label className="text-xs xs:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Subcategoría:
                </label>
                <Select value={selectedSubcategory} onValueChange={handleSubcategoryChange}>
                  <SelectTrigger className="w-full sm:w-40 md:w-48 h-9 xs:h-10 sm:h-12 border-gray-300 focus:border-[#F4C762] text-xs xs:text-sm">
                    <SelectValue placeholder="Todas las subcategorías" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategoryOptions.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs xs:text-sm">{subcategory.name}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {subcategory.count}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Filter */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 xs:gap-2 flex-1">
                <label htmlFor="sort-filter" className="text-xs xs:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Ordenar:
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger
                    id="sort-filter"
                    className="w-full sm:w-40 md:w-48 h-9 xs:h-10 sm:h-12 border-gray-300 focus:border-[#F4C762] focus:ring-2 focus:ring-[#F4C762]/20 text-xs xs:text-sm"
                    aria-label="Ordenar servicios"
                  >
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest" className="text-xs xs:text-sm">Más Recientes</SelectItem>
                    <SelectItem value="price-low" className="text-xs xs:text-sm">Precio: Menor a Mayor</SelectItem>
                    <SelectItem value="price-high" className="text-xs xs:text-sm">Precio: Mayor a Menor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Category Pills - Improved */}
          <div className="mt-6" role="tablist" aria-label="Categorías de servicios">
            <div className="flex flex-wrap gap-3">
              {/*{categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  role="tab"
                  aria-selected={selectedCategory === category.id}
                  aria-controls={`services-${category.id}`}
                  className={`flex items-center px-4 py-3 rounded-full text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F4C762] focus:ring-offset-2 ${
                    selectedCategory === category.id
                      ? "bg-[#F4C762] text-black shadow-md transform scale-105"
                      : "bg-white text-gray-600 border border-gray-300 hover:border-[#F4C762] hover:text-[#0061A8] hover:shadow-sm"
                  }`}
                >
                  {getCategoryIcon(category.id)}
                  <span className="ml-2">{category.name}</span>
                  <Badge
                    variant="secondary"
                    className={`ml-2 ${selectedCategory === category.id ? "bg-black/10" : ""}`}
                  >
                    {category.count}
                  </Badge>
                </button>
              ))}*/}
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-4 xs:py-6 sm:py-8" role="main" aria-label="Resultados de servicios">
        <div className="container mx-auto px-2 xs:px-3 sm:px-4">
          {/* Results Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 xs:mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl xs:text-2xl font-bold text-gray-900 mb-1 xs:mb-2" id="results-heading">
                {selectedCategory === "all"
                  ? "Todos los Servicios"
                  : categories.find((c) => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-gray-600 text-sm xs:text-base" aria-live="polite" aria-atomic="true">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 xs:h-4 xs:w-4 border-b-2 border-[#0061A8]"></div>
                    Cargando servicios...
                  </span>
                ) : (
                  <>
                    {filteredServices.length} servicio{filteredServices.length !== 1 ? "s" : ""} encontrado
                    {filteredServices.length !== 1 ? "s" : ""}
                    {searchQuery && ` para "${searchQuery}"`}
                  </>
                )}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-1 xs:gap-2 mt-3 xs:mt-4 md:mt-0">
              {(searchQuery || selectedCategory !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                    router.push("/services", { scroll: false })
                  }}
                  className="hover:bg-[#0061A8]/5 hover:border-[#0061A8] text-xs xs:text-sm h-8 xs:h-10 px-2 xs:px-3"
                >
                  <span className="hidden xs:inline">Limpiar Filtros</span>
                  <span className="xs:hidden">Limpiar</span>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="hover:bg-[#0061A8]/5 hover:border-[#0061A8] text-xs xs:text-sm h-8 xs:h-10 px-2 xs:px-3"
                aria-label="Volver arriba"
              >
                <span className="hidden xs:inline">↑ Arriba</span>
                <span className="xs:hidden">↑</span>
              </Button>
            </div>
          </div>

          {/* Services Grid with improved loading and empty states */}
          <div role="region" aria-labelledby="results-heading" aria-live="polite">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Cargando servicios">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-t-lg" />
                    <CardContent className="p-4 space-y-3">
                      <div className="bg-gray-200 h-4 rounded" />
                      <div className="bg-gray-200 h-3 rounded w-3/4" />
                      <div className="bg-gray-200 h-8 rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredServices.length > 0 ? (
              <ServicesGrid services={filteredServices} loading={loading} />
            ) : (
              <div className="text-center py-16" role="status" aria-live="polite">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#0061A8]/10 to-[#F4C762]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-12 w-12 text-gray-400" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron servicios</h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery
                      ? `No encontramos servicios que coincidan con "${searchQuery}".`
                      : "No hay servicios disponibles con los filtros seleccionados."}
                    <br />
                    Intenta ajustar tus filtros o explora otras categorías.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => {
                        setSearchQuery("")
                        setSelectedCategory("all")
                        setSelectedSubcategory("all")
                        router.push("/services", { scroll: false })
                      }}
                      className="bg-[#0061A8] hover:bg-[#0061A8]/90"
                    >
                      Ver Todos los Servicios
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => (window.location.href = "tel:+34617303929")}
                      className="hover:bg-[#0061A8]/5"
                    >
                      📞 Contactar para Ayuda
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-[#0061A8] to-[#F4C762]">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">¿No Encuentras Lo Que Buscas?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Contáctanos y crearemos una experiencia personalizada especialmente para ti
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+34617303929"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#0061A8] hover:bg-white/90 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              📞 Llamar: +34 617 30 39 29
            </a>
            <a
              href="https://wa.me/34617303929"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-[#0061A8] font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-12 h-12 rounded-full bg-[#F4C762] hover:bg-[#F4C762]/90 text-black shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
            aria-label="Volver arriba"
          >
            ↑
          </Button>
          <a
            href="https://wa.me/34617303929"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
            aria-label="Contactar por WhatsApp"
          >
            💬
          </a>
        </div>
      </div>
    </div>
  )
}
