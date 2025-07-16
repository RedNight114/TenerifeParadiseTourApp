"use client"

import React from "react"
import { useState } from "react"
import { Search, MapPin, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface HeroSectionProps {
  onSearch: (filters: { query: string; category: string; date: string }) => void
}

export const HeroSection = React.memo(function HeroSection({ onSearch }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")

  const handleSearch = () => {
    // Implementar lógica de búsqueda
    onSearch({
      query: searchQuery,
      category: location,
      date
    })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/hero-background.avif')",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center pt-16 xs:pt-20 sm:pt-8 md:pt-0">
          {/* Hero Text */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Descubre
              <br />
              <span className="text-[#F4C762]">La Isla de Tenerife</span>
            </h1>
            <p className="text-sm xs:text-base sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Desde el corazón de la capital hasta los rincones más salvajes de la isla.
              <br />
              Vive experiencias únicas en la tierra de la eterna primavera.
            </p>
          </div>

          {/* Search Form */}
          <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-0">
            <CardContent className="p-3 xs:p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
                {/* Search Input */}
                <div className="md:col-span-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                  <Input
                    type="text"
                    placeholder="¿Qué experiencia buscas?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 xs:pl-10 sm:pl-12 h-10 xs:h-11 sm:h-12 text-xs xs:text-sm sm:text-base border-gray-200 focus:border-[#0061A8] focus:ring-[#0061A8]"
                  />
                </div>

                {/* Location Select */}
                <div className="md:col-span-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 z-10" />
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="pl-8 xs:pl-10 sm:pl-12 h-10 xs:h-11 sm:h-12 text-xs xs:text-sm sm:text-base border-gray-200 focus:border-[#0061A8] focus:ring-[#0061A8]">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas las zonas</SelectItem>
                      <SelectItem value="norte">Norte de Tenerife</SelectItem>
                      <SelectItem value="sur">Sur de Tenerife</SelectItem>
                      <SelectItem value="teide">Parque Nacional del Teide</SelectItem>
                      <SelectItem value="anaga">Parque Rural de Anaga</SelectItem>
                      <SelectItem value="costa">Costa Adeje</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Input */}
                <div className="md:col-span-1 relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 z-10" />
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-8 xs:pl-10 sm:pl-12 h-10 xs:h-11 sm:h-12 text-xs xs:text-sm sm:text-base border-gray-200 focus:border-[#0061A8] focus:ring-[#0061A8]"
                  />
                </div>

                {/* Search Button */}
                <div className="md:col-span-1">
                  <Button
                    onClick={handleSearch}
                    className="w-full h-10 xs:h-11 sm:h-12 bg-gradient-to-r from-[#0061A8] to-[#F4C762] hover:from-[#0061A8]/90 hover:to-[#F4C762]/90 text-white font-semibold text-xs xs:text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <span className="sm:hidden">OK</span>
                    <span className="hidden sm:inline">Buscar</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
})
