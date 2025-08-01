"use client"

import { HeroSection } from "@/components/hero-section"
import { CategoryShowcase } from "@/components/category-showcase"
import { FeaturedServices } from "@/components/featured-services"
import { GallerySection } from "@/components/gallery-section"

export default function HomePage() {
  const handleCategorySelect = (categoryId: string) => {
    // Aquí puedes implementar la navegación a la página de servicios con filtro
    window.location.href = `/services?category=${categoryId}`
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section con búsqueda funcional */}
      <HeroSection />

      {/* Category Showcase */}
      <CategoryShowcase onCategorySelect={handleCategorySelect} />

      {/* Servicios Destacados */}
      <FeaturedServices />

      {/* Gallery Section */}
      <GallerySection />
    </div>
  )
} 