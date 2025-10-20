"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Eye, EyeOff, RefreshCw } from 'lucide-react'

interface MapDebugInfoProps {
  viewState: {
    latitude: number
    longitude: number
    zoom: number
    pitch: number
    bearing: number
  }
  hotelsCount: number
  servicesCount: number
  onResetView: () => void
}

export function MapDebugInfo({ viewState, hotelsCount, servicesCount, onResetView }: MapDebugInfoProps) {
  const [isVisible, setIsVisible] = useState(false)

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm"
        aria-label="Mostrar información de debug"
      >
        <Eye className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Card className="absolute bottom-4 left-4 z-10 w-80 bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Debug Info
          </CardTitle>
          <div className="flex gap-1">
            <Button
              onClick={onResetView}
              variant="outline"
              size="sm"
              className="h-6 w-6 p-0"
              aria-label="Resetear vista"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button
              onClick={() => setIsVisible(false)}
              variant="outline"
              size="sm"
              className="h-6 w-6 p-0"
              aria-label="Ocultar información de debug"
            >
              <EyeOff className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Coordenadas actuales */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-1">Coordenadas Actuales</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-100 p-2 rounded">
              <div className="text-gray-600">Latitud</div>
              <div className="font-mono font-semibold">{viewState.latitude.toFixed(6)}</div>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <div className="text-gray-600">Longitud</div>
              <div className="font-mono font-semibold">{viewState.longitude.toFixed(6)}</div>
            </div>
          </div>
        </div>

        {/* Configuración del mapa */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-1">Configuración</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-blue-100 p-2 rounded text-center">
              <div className="text-blue-600">Zoom</div>
              <div className="font-semibold">{viewState.zoom.toFixed(1)}</div>
            </div>
            <div className="bg-green-100 p-2 rounded text-center">
              <div className="text-green-600">Pitch</div>
              <div className="font-semibold">{viewState.pitch}°</div>
            </div>
            <div className="bg-purple-100 p-2 rounded text-center">
              <div className="text-purple-600">Bearing</div>
              <div className="font-semibold">{viewState.bearing}°</div>
            </div>
          </div>
        </div>

        {/* Contadores */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-1">Elementos Visibles</h4>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              🏨 {hotelsCount} Hoteles
            </Badge>
            <Badge variant="secondary" className="text-xs">
              🎯 {servicesCount} Servicios
            </Badge>
          </div>
        </div>

        {/* Coordenadas de referencia de Tenerife */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-1">Referencia Tenerife</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Centro: 28.2916, -16.6291</div>
            <div>Norte: 28.8 (Anaga)</div>
            <div>Sur: 27.6 (Teno)</div>
            <div>Este: -16.0</div>
            <div>Oeste: -17.2</div>
          </div>
        </div>

        {/* Ubicaciones famosas */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-1">Ubicaciones Famosas</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Santa Cruz: 28.4636, -16.2518</div>
            <div>Puerto Cruz: 28.4178, -16.5494</div>
            <div>Teide: 28.2724, -16.6424</div>
            <div>Costa Adeje: 28.1000, -16.7167</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
