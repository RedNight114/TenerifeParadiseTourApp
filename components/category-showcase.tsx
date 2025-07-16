"use client"

import { useState, useEffect } from "react"
import { Activity, Car, Utensils } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useServices } from "@/hooks/use-services"
import { useCategories } from "@/hooks/use-categories"

interface CategoryShowcaseProps {
  onCategorySelect: (categoryId: string) => void
}

export function CategoryShowcase({ onCategorySelect }: CategoryShowcaseProps) {
  const { services, loading: servicesLoading } = useServices()
  const { categories, subcategories, loadingCategories } = useCategories()
  const [featuredServices, setFeaturedServices] = useState(services.filter((s) => s.featured).slice(0, 6))

  useEffect(() => {
    setFeaturedServices(services.filter((s) => s.featured).slice(0, 6))
  }, [services])

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case "actividades":
        return Activity
      case "renting":
        return Car
      case "gastronomia":
        return Utensils
      default:
        return Activity
    }
  }

  const getCategoryColor = (categoryId: string) => {
    switch (categoryId) {
      case "actividades":
        return "from-green-500 to-emerald-600"
      case "renting":
        return "from-blue-500 to-cyan-600"
      case "gastronomia":
        return "from-orange-500 to-red-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  const getSubcategoriesForCategory = (categoryId: string) => {
    return subcategories.filter((sub) => sub.category_id === categoryId)
  }

  if (loadingCategories || servicesLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0061A8] mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando servicios...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">Vive Tenerife Como Nunca Antes</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Desde aventuras en la naturaleza hasta experiencias gastronómicas únicas, tenemos todo lo que necesitas para
            crear recuerdos inolvidables
          </p>
        </div>

        {/* Categorías principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {categories.map((category) => {
            const IconComponent = getCategoryIcon(category.id)
            const categorySubcategories = getSubcategoriesForCategory(category.id)

            return (
              <Card
                key={category.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-[#F4C762]/20"
              >
                <CardHeader className={`bg-gradient-to-r ${getCategoryColor(category.id)} text-white p-8`}>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-full">
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl font-bold">{category.name}</CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="p-8">
                  <p className="text-gray-600 mb-6 leading-relaxed">{category.description}</p>

                  <div className="space-y-3 mb-8">
                    {categorySubcategories.map((subcategory) => (
                      <div key={subcategory.id} className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-[#F4C762] rounded-full mr-4 flex-shrink-0" />
                        <span className="text-gray-700">
                          {subcategory.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => onCategorySelect(category.id)}
                    className="w-full bg-[#0061A8] hover:bg-[#0061A8]/90 text-white font-semibold py-3 transition-all duration-300"
                  >
                    Explorar {category.name}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Servicios destacados */}
        {featuredServices.length > 0 && (
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">Servicios Destacados</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Nuestras experiencias más populares seleccionadas especialmente para ti
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredServices.map((service) => (
                <Card
                  key={service.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200"
                >
                  <div className="relative h-48">
                    <img
                      src={`/placeholder.svg?height=200&width=300&query=${encodeURIComponent(service.title)}`}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-yellow-500 text-white">⭐ Destacado</Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-white/90 text-gray-900">
                        {new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: "EUR",
                        }).format(service.price)}
                        {service.category_id === "renting" ? "/día" : ""}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {service.subcategory?.name}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-xl mb-2 text-gray-900">{service.title}</h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-2">{service.description}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-500">
                        {service.location && <span className="flex items-center">📍 {service.location}</span>}
                      </div>
                      <Button size="sm" className="bg-[#0061A8] hover:bg-[#0061A8]/90 text-white font-semibold px-4">
                        Reservar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                size="lg"
                variant="outline"
                className="border-[#0061A8] text-[#0061A8] hover:bg-[#0061A8] hover:text-white font-semibold px-8 py-3 transition-all duration-300 bg-transparent"
                onClick={() => (window.location.href = "/services")}
              >
                Ver Todos los Servicios
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
