"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Calendar, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface HeroSectionProps {
  onSearch?: (filters: { query: string; category: string; date: string }) => void
}

export const HeroSection = React.memo(function HeroSection({ onSearch }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [minDate, setMinDate] = useState("")
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  // Establecer fecha mínima solo en el cliente para evitar errores de hidratación
  useEffect(() => {
    setIsClient(true)
    setMinDate(new Date().toISOString().split('T')[0])
  }, [])

  const handleSearch = async () => {
    try {
      setIsSearching(true)
      
      // Validar que al menos hay un criterio de búsqueda
      if (!searchQuery.trim() && !location && !date) {
        toast.error("Por favor, ingresa al menos un criterio de búsqueda")
        return
      }

      // Construir URL con parámetros de búsqueda
      const searchParams = new URLSearchParams()
      
      if (searchQuery.trim()) {
        searchParams.set("query", searchQuery.trim())
      }
      
      if (location && location !== "todas") {
        searchParams.set("location", location)
      }
      
      if (date) {
        searchParams.set("date", date)
      }

      // Llamar callback si existe (para compatibilidad)
      if (onSearch) {
        onSearch({
          query: searchQuery,
          category: location,
          date
        })
      }

      // Mostrar toast de confirmación
      toast.success("Buscando experiencias...")

      // Redirigir a la página de servicios con los filtros
      const searchUrl = `/services?${searchParams.toString()}`
      router.push(searchUrl)

    } catch (error) {
      console.error("Error en búsqueda:", error)
      toast.error("Error al realizar la búsqueda")
    } finally {
      setIsSearching(false)
    }
  }

  // Manejar búsqueda con Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // Sugerencias de búsqueda populares
  const popularSearches = [
    "Tour al Teide",
    "Whale Watching",
    "Alquiler de coche",
    "Experiencia gastronómica",
    "Senderismo",
    "Parapente"
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/hero-background.avif')"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center pt-16 sm:pt-20 md:pt-24 lg:pt-28">
          {/* Hero Text */}
          <div className="mb-12 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Descubre
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F4C762] via-[#FFD700] to-[#F4C762] animate-pulse">
                La Isla de Tenerife
              </span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-white/95 max-w-3xl mx-auto leading-relaxed">
              Desde el corazón de la capital hasta los rincones más salvajes de la isla.
              <br />
              Vive experiencias únicas en la tierra de la eterna primavera.
            </p>
          </div>

          {/* Search Form */}
          <div className="animate-fade-in-up">
            <Card 
              className="max-w-5xl mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Search Input */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#0061A8] transition-colors duration-200" />
                    </div>
                    <Input
                      type="text"
                      placeholder="¿Qué experiencia buscas?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-[#0061A8] focus:ring-2 focus:ring-[#0061A8]/20 rounded-xl transition-all duration-200 hover:border-gray-300"
                    />
                  </div>

                  {/* Location Select */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-[#0061A8] transition-colors duration-200" />
                    </div>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-[#0061A8] focus:ring-2 focus:ring-[#0061A8]/20 rounded-xl transition-all duration-200 hover:border-gray-300">
                        <SelectValue placeholder="Todas las zonas" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-2 border-gray-200">
                        <SelectItem value="todas">Todas las zonas</SelectItem>
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

                  {/* Date Input */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400 group-focus-within:text-[#0061A8] transition-colors duration-200" />
                    </div>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={isClient ? minDate : undefined}
                      className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-[#0061A8] focus:ring-2 focus:ring-[#0061A8]/20 rounded-xl transition-all duration-200 hover:border-gray-300"
                    />
                  </div>

                  {/* Search Button */}
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="h-14 text-lg font-semibold bg-gradient-to-r from-[#0061A8] to-[#004C87] hover:from-[#004C87] hover:to-[#003366] text-white rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSearching ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        <span>Buscando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Search className="h-5 w-5 mr-2" />
                        <span>Buscar</span>
                      </div>
                    )}
                  </Button>
                </div>

                {/* Popular Searches */}
                <div className="mt-8 pt-6 border-t border-gray-200/50">
                  <div className="flex items-center justify-center mb-4">
                    <Sparkles className="h-5 w-5 text-[#F4C762] mr-2" />
                    <p className="text-lg font-medium text-gray-700">Búsquedas populares</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    {popularSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchQuery(search)
                          handleSearch()
                        }}
                        className="text-sm bg-gradient-to-r from-gray-50 to-gray-100 hover:from-[#0061A8]/10 hover:to-[#004C87]/10 text-gray-700 hover:text-[#0061A8] px-4 py-2 rounded-full border border-gray-200 hover:border-[#0061A8]/30 transition-all duration-200 transform hover:scale-105 hover:shadow-md font-medium"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out 0.3s both;
        }
        
        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </section>
  )
})
