"use client"

import { HeroSection } from "@/components/hero-section"
import { CategoryShowcase } from "@/components/category-showcase"
import { FeaturedServices } from "@/components/featured-services"
import { GallerySection } from "@/components/gallery-section"
import { SuppressHydrationWarning } from "@/components/hydration-safe"

export default function HomePage() {
  const handleSearch = (filters: { query: string; category: string; date: string }) => {
    // Implementar lógica de búsqueda
  }

  const handleCategorySelect = (categoryId: string) => {
    // Aquí puedes implementar la navegación a la página de servicios con filtro
    if (typeof window !== 'undefined') {
      window.location.href = `/services?category=${categoryId}`
    }
  }

  return (
    <SuppressHydrationWarning>
      <div className="min-h-screen">
        {/* Hero Section con búsqueda */}
        <HeroSection onSearch={handleSearch} />

        {/* Category Showcase */}
        <CategoryShowcase onCategorySelect={handleCategorySelect} />

        {/* Servicios Destacados - Con hidratación segura */}
        <FeaturedServices />

        {/* Gallery Section */}
        <GallerySection />
      </div>
    </SuppressHydrationWarning>
  )
} 