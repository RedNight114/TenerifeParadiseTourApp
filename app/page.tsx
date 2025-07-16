"use client"

import { HeroSection } from "@/components/hero-section"
import { CategoryShowcase } from "@/components/category-showcase"
import { GallerySection } from "@/components/gallery-section"

export default function HomePage() {
  const handleSearch = (filters: { query: string; category: string; date: string }) => {
    }

  const handleCategorySelect = (categoryId: string) => {
    // Aquí puedes implementar la navegación a la página de servicios con filtro
    window.location.href = `/services?category=${categoryId}`
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section con búsqueda */}
      <HeroSection onSearch={handleSearch} />

      {/* Category Showcase */}
      <CategoryShowcase onCategorySelect={handleCategorySelect} />

      {/* Gallery Section - Reemplaza las secciones duplicadas */}
      <GallerySection />
    </div>
  )
}
