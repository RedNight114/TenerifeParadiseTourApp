"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Calendar, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Image from "next/image"
import { useOptimizedData } from "@/hooks/use-optimized-data"
import "@/styles/hero-section.css"

interface HeroSectionProps {
  onSearch?: (filters: { query: string; category: string; date: string }) => void
}

interface SmartSuggestion {
  type: 'service' | 'category' | 'subcategory'
  id: string
  title: string
  category?: string
  subcategory?: string
  count?: number
  price?: number
  duration?: number
  location?: string
  icon: string
  searchTerm: string
  difficulty?: string
  featured?: boolean
}

export const HeroSection = React.memo(function HeroSection({ onSearch }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [date, setDate] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [minDate, setMinDate] = useState("")
  const [isClient, setIsClient] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const router = useRouter()
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Obtener datos de la base de datos
  const { data: { services, categories, subcategories } } = useOptimizedData()

  // Función para obtener icono de categoría
  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'actividades':
        return '🏔️'
      case 'renting':
        return '🚗'
      case 'gastronomia':
        return '🍽️'
      default:
        return '🎯'
    }
  }

  // Función para obtener icono específico del servicio
  const getServiceIcon = (categoryId: string, subcategoryId: string) => {
    // Iconos específicos por subcategoría
    switch (subcategoryId) {
      case 'excursiones':
        return '🗺️'
      case 'aventura':
        return '🧗'
      case 'acuaticas':
        return '🌊'
      case 'naturaleza':
        return '🌿'
      case 'coches':
        return '🚗'
      case 'motos':
        return '🏍️'
      case 'bicicletas':
        return '🚲'
      case 'especiales':
        return '🚐'
      case 'restaurantes':
        return '🍽️'
      case 'tours':
        return '🥘'
      case 'talleres':
        return '👨‍🍳'
      case 'eventos':
        return '🎉'
      default:
        return getCategoryIcon(categoryId)
    }
  }

  // Lista de imágenes de respaldo en orden de preferencia
  const fallbackImages = useMemo(() => [
    "/images/hero-background.avif",
    "/images/hero-tenerife-sunset.jpg",
    "/images/teide_sunset.jpg",
    "/images/volcanic_landscape.jpg",
    "/images/teide_crater.jpg"
  ], [])

  // Sugerencias inteligentes basadas en datos reales de la base de datos
  const smartSuggestions = useMemo(() => {
    if (!services || !categories || !subcategories) {
      return []
    }

    const suggestions: SmartSuggestion[] = []

    // 1. Servicios destacados (featured) - PRIORIDAD ALTA
    const featuredServices = services.filter(s => s.featured).slice(0, 6)
    
    featuredServices.forEach(service => {
      const category = categories.find(c => c.id === service.category_id)
      const subcategory = subcategories.find(sc => sc.id === service.subcategory_id)
      
      suggestions.push({
        type: 'service',
        id: service.id,
        title: service.title,
        category: category?.name || '',
        subcategory: subcategory?.name || '',
        count: undefined,
        price: service.price,
        duration: service.duration,
        location: service.location,
        icon: getServiceIcon(service.category_id, service.subcategory_id || ''),
        searchTerm: service.title,
        difficulty: service.difficulty_level,
        featured: true
      })
    })

    // 2. Servicios populares por categoría (si no hay suficientes destacados)
    if (suggestions.length < 6) {
      const popularByCategory = categories.map(category => {
        const categoryServices = services.filter(s => s.category_id === category.id)
        return {
          category,
          services: categoryServices.slice(0, 2) // Top 2 por categoría
        }
      })

      popularByCategory.forEach(({ category, services: categoryServices }) => {
        categoryServices.forEach(service => {
          // Solo agregar si no está ya en las sugerencias
          if (!suggestions.find(s => s.id === service.id)) {
            const subcategory = subcategories.find(sc => sc.id === service.subcategory_id)
            suggestions.push({
              type: 'service',
              id: service.id,
              title: service.title,
              category: category.name,
              subcategory: subcategory?.name || '',
              count: undefined,
              price: service.price,
              duration: service.duration,
              location: service.location,
              icon: getServiceIcon(service.category_id, service.subcategory_id || ''),
              searchTerm: service.title,
              difficulty: service.difficulty_level,
              featured: false
            })
          }
        })
      })
    }

    // 3. Servicios económicos (si aún no tenemos suficientes)
    if (suggestions.length < 6) {
      const affordableServices = services
        .filter(s => s.price < 50 && !suggestions.find(existing => existing.id === s.id))
        .sort((a, b) => a.price - b.price)
        .slice(0, 6 - suggestions.length)
      
      affordableServices.forEach(service => {
        const category = categories.find(c => c.id === service.category_id)
        const subcategory = subcategories.find(sc => sc.id === service.subcategory_id)
        
        suggestions.push({
          type: 'service',
          id: service.id,
          title: service.title,
          category: category?.name || '',
          subcategory: subcategory?.name || '',
          count: undefined,
          price: service.price,
          duration: service.duration,
          location: service.location,
          icon: getServiceIcon(service.category_id, service.subcategory_id || ''),
          searchTerm: service.title,
          difficulty: service.difficulty_level,
          featured: false
        })
      })
    }

    // Limitar a 6 sugerencias principales
    return suggestions.slice(0, 6)
  }, [services, categories, subcategories])

  // Establecer fecha mínima solo en el cliente para evitar errores de hidratación
  useEffect(() => {
    setIsClient(true)
    setMinDate(new Date().toISOString().split('T')[0])
    
    // Cleanup para el timeout de búsqueda
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // Memoizar la función de búsqueda para evitar re-renders
  const handleSearch = useCallback(async () => {
    try {
      setIsSearching(true)
      
      // Validar que al menos hay un criterio de búsqueda
      if (!searchQuery.trim() && !selectedLocation && !date) {
        toast.error("Por favor, ingresa al menos un criterio de búsqueda")
        setIsSearching(false)
        return
      }

      // Construir URL con parámetros de búsqueda
      const searchParams = new URLSearchParams()
      
      if (searchQuery.trim()) {
        searchParams.set("query", searchQuery.trim())
      }
      
      if (selectedLocation && selectedLocation !== "todas") {
        searchParams.set("location", selectedLocation)
      }
      
      if (date) {
        searchParams.set("date", date)
      }

      // Llamar callback si existe (para compatibilidad)
      if (onSearch) {
        onSearch({
          query: searchQuery,
          category: selectedLocation,
          date
        })
      }

      // Mostrar toast de confirmación
      toast.success("Buscando experiencias...")

      // Redirigir a la página de servicios con los filtros
      const searchUrl = `/services?${searchParams.toString()}`
      
      // Usar router.push para evitar problemas de navegación
      await router.push(searchUrl)
      
      // Limpiar el estado después de la navegación exitosa
      setTimeout(() => {
        setSearchQuery("")
        setSelectedLocation("")
        setDate("")
      }, 100)

    } catch (error) {
toast.error("Error al realizar la búsqueda. Intenta de nuevo.")
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery, selectedLocation, date, onSearch, router])

  // Función de búsqueda con debounce para evitar múltiples llamadas
  const debouncedSearch = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch()
    }, 300)
  }, [handleSearch])

  // Manejar búsqueda con Enter
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSearching) {
      e.preventDefault()
      debouncedSearch()
    }
  }, [debouncedSearch, isSearching])

  // Manejar error de imagen con fallback automático
  const handleImageError = useCallback(() => {
// Intentar con la siguiente imagen si hay más disponibles
    if (currentImageIndex < fallbackImages.length - 1) {
      setCurrentImageIndex(prev => prev + 1)
      setImageError(false)
      setImageLoaded(false)
    } else {
      // Si todas las imágenes fallaron, mostrar fallback
      setImageError(true)
}
  }, [currentImageIndex, fallbackImages])

  // Manejar carga exitosa de imagen
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
    setImageError(false)
}, [currentImageIndex, fallbackImages])

  // Imagen de fondo con fallback robusto
  const heroImageSrc = useMemo(() => {
    return fallbackImages[currentImageIndex]
  }, [currentImageIndex, fallbackImages])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Imagen de fondo optimizada con manejo de errores */}
      <div className="absolute inset-0 z-0">
        {!imageError ? (
          <>
            <Image
              src={heroImageSrc}
              alt="Tenerife Paradise Tour - Paisaje de Tenerife"
              fill
              priority
              quality={85}
              className={`object-cover transition-opacity duration-1000 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              sizes="100vw"
            />
            
            {/* Indicador de carga */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-lg font-medium">Cargando experiencia...</p>
                  <p className="text-sm text-white/70 mt-2">
                    Imagen {currentImageIndex + 1} de {fallbackImages.length}
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          // Fallback cuando hay error en la imagen - gradiente atractivo
          <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏔️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Tenerife Paradise Tour</h3>
              <p className="text-white/70">Descubre la magia de la isla</p>
            </div>
          </div>
        )}
        
        {/* Overlay gradiente para mejor legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/50" />
      </div>

      {/* Contenido principal */}
      <div className="relative z-20 text-center text-white px-4 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
            Tenerife Paradise Tour
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            Descubre la magia de Tenerife con nuestras experiencias únicas y tours personalizados
          </p>
        </div>

        {/* Formulario de búsqueda súper sencillo con autocompletado */}
        <div className="max-w-2xl mx-auto animate-fade-in-up animation-delay-400 relative z-20">
          <div className="relative group">
            {/* Barra de búsqueda minimalista */}
            <div className="relative">
              <Input
                type="text"
                placeholder={isSearching ? "Buscando experiencias..." : "Buscar experiencias..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsHovered(true)}
                onBlur={() => setTimeout(() => setIsHovered(false), 200)}
                disabled={isSearching}
                className={`hero-search-input w-full h-14 pl-6 pr-16 text-lg bg-white/95 backdrop-blur-sm border-2 transition-all duration-300 rounded-full shadow-lg placeholder:text-gray-600 text-gray-900 ${
                  isSearching 
                    ? 'border-blue-400 bg-blue-50/95 cursor-not-allowed text-gray-700' 
                    : 'border-white/40 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20'
                }`}
              />
              
              {/* Botón de búsqueda integrado */}
              <Button
                onClick={debouncedSearch}
                disabled={isSearching}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-full transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Buscando...</span>
                  </div>
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </Button>
            </div>
            
            {/* Panel de sugerencias de autocompletado */}
            {(searchQuery || isHovered) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border border-white/40 rounded-2xl shadow-xl overflow-hidden z-20 animate-fade-in-up max-h-[600px] overflow-y-auto">
                                 {searchQuery ? (
                   // Sugerencias relacionadas cuando hay búsqueda activa
                   <div className="p-6">
                     <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                       <span className="text-blue-500">💡</span>
                       Sugerencias Relacionadas
                     </h3>
                     <div className="space-y-3">
                      {smartSuggestions
                        .filter(suggestion => 
                          suggestion.searchTerm.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (suggestion.category && suggestion.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (suggestion.subcategory && suggestion.subcategory.toLowerCase().includes(searchQuery.toLowerCase()))
                        )
                        .slice(0, 4)
                        .map((suggestion) => (
                                                     <button
                             key={`search-${suggestion.type}-${suggestion.id}`}
                             onClick={async () => {
                               setSearchQuery(suggestion.searchTerm)
                               // Pequeño delay para que se actualice el estado
                               await new Promise(resolve => setTimeout(resolve, 50))
                               debouncedSearch()
                             }}
                             className="w-full text-left p-4 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-sm text-gray-700 hover:text-blue-600 flex items-center justify-between group"
                           >
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{suggestion.icon}</span>
                              <div className="text-left">
                                <div className="font-medium">{suggestion.searchTerm}</div>
                                {suggestion.category && (
                                  <div className="text-xs text-gray-500">{suggestion.category}</div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {suggestion.price && (
                                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                                  €{suggestion.price}
                                </span>
                              )}
                              <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                →
                              </span>
                            </div>
                          </button>
                        ))
                      }
                    </div>
                  </div>
                                 ) : (
                   // Experiencias destacadas cuando no hay búsqueda activa
                   <div className="p-6">
                     <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                       <span className="text-orange-500">🔥</span>
                       Experiencias Destacadas de Tenerife
                     </h3>
                     <div className="space-y-4">
                      {!services || !categories || !subcategories ? (
                        // Estado de carga
                        <div className="text-center py-8">
                          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                          <p className="text-gray-500 text-sm">Cargando experiencias...</p>
                        </div>
                      ) : smartSuggestions.length === 0 ? (
                        // Estado sin sugerencias
                        <div className="text-center py-8">
                          <span className="text-4xl mb-3 block">🏝️</span>
                          <p className="text-gray-500 text-sm">No hay experiencias disponibles</p>
                          <p className="text-gray-400 text-xs mt-1">Intenta más tarde</p>
                        </div>
                      ) : (
                        // Sugerencias destacadas disponibles
                        smartSuggestions.slice(0, 6).map((suggestion) => (
                                                     <button
                             key={`featured-${suggestion.type}-${suggestion.id}`}
                             onClick={async () => {
                               setSearchQuery(suggestion.searchTerm)
                               // Pequeño delay para que se actualice el estado
                               await new Promise(resolve => setTimeout(resolve, 50))
                               debouncedSearch()
                             }}
                             className="w-full text-left p-5 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 text-sm text-gray-700 hover:text-blue-600 group border border-gray-100 hover:border-blue-200 hover:shadow-md"
                           >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <span className="text-2xl mt-1">{suggestion.icon}</span>
                                                                 <div className="text-left flex-1">
                                   <div className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors mb-2">
                                     {suggestion.title}
                                   </div>
                                   <div className="flex items-center gap-2 mb-3">
                                     {suggestion.category && (
                                       <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                         {suggestion.category}
                                       </span>
                                     )}
                                     {suggestion.subcategory && (
                                       <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                                         {suggestion.subcategory}
                                       </span>
                                     )}
                                   </div>
                                   <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                                    {suggestion.location && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {suggestion.location}
                                      </span>
                                    )}
                                    {suggestion.duration && (
                                      <span className="text-xs">
                                        {Math.round(suggestion.duration / 60)}h
                                      </span>
                                    )}
                                    {suggestion.difficulty && (
                                      <span className="flex items-center gap-1">
                                        <Sparkles className="h-3 w-3" />
                                        {suggestion.difficulty}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                                                             <div className="flex flex-col items-end space-y-3 ml-4">
                                 {suggestion.featured && (
                                   <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                                     ⭐ Destacado
                                   </span>
                                 )}
                                 {suggestion.price && (
                                   <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                                     €{suggestion.price}
                                   </span>
                                 )}
                                 <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity text-lg">
                                   →
                                 </span>
                               </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Información minimalista */}
          <div className="mt-4 text-center">
            <p className="text-white/70 text-xs">
              💡 Haz clic para ver experiencias reales de Tenerife con precios y detalles
            </p>
          </div>
        </div>

        {/* Indicadores de características */}
        <div className="mt-12 animate-fade-in-up animation-delay-800">
          <div className="flex items-center justify-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span className="text-sm">+50 Destinos</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span className="text-sm">Reserva 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm">Experiencias Únicas</span>
            </div>
          </div>
          
          {/* Indicador de estado de búsqueda */}
          {isSearching && (
            <div className="mt-6 flex items-center justify-center gap-3 text-white/90 animate-pulse">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Redirigiendo a servicios...</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
})

