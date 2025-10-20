"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapModule } from '@/components/MapModule'
import { MapPin, Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react'

interface MapPreviewProps {
  className?: string
}

export function MapPreview({ className }: MapPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showHotels, setShowHotels] = useState(true)
  const [showServices, setShowServices] = useState(true)

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" /> Vista Previa del Mapa
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHotels(!showHotels)}
              className={`flex items-center gap-1 ${showHotels ? 'bg-blue-50' : ''}`}
            >
              {showHotels ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              Hoteles
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowServices(!showServices)}
              className={`flex items-center gap-1 ${showServices ? 'bg-green-50' : ''}`}
            >
              {showServices ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              Servicios
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className={`relative ${isExpanded ? 'h-[600px]' : 'h-[300px]'} transition-all duration-300`}>
          <MapModule
            className="w-full h-full rounded-b-lg"
            filters={{
              showHotels,
              showServices,
              priceRange: [0, 500],
              category: 'all',
              stars: [],
              searchTerm: ''
            }}
          />
          
          {/* Overlay con información */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Hoteles</span>
                <Badge variant="secondary" className="ml-1">12</Badge>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Servicios</span>
                <Badge variant="secondary" className="ml-1">25</Badge>
              </div>
            </div>
          </div>

          {/* Botón para abrir mapa completo */}
          <div className="absolute bottom-4 right-4">
            <Button
              asChild
              className="bg-[#0061A8] hover:bg-[#0056a3] text-white shadow-lg"
            >
              <a href="/map" target="_blank" rel="noopener noreferrer">
                <MapPin className="h-4 w-4 mr-2" />
                Ver Mapa Completo
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
