"use client"

import { useState, useEffect } from "react"
import { Activity, Car, Utensils } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCategories } from "@/hooks/use-categories"

interface CategoryShowcaseProps {
  onCategorySelect: (categoryId: string) => void
}

export function CategoryShowcase({ onCategorySelect }: CategoryShowcaseProps) {
  const { categories, subcategories, loadingCategories } = useCategories()

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

  if (loadingCategories) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0061A8] mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando categorías...</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
      </div>
    </section>
  )
}
