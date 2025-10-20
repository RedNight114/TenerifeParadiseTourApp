"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Hotel, Eye, EyeOff, TrendingUp } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key environment variables.')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function MapStatsAdmin() {
  const { data: mapStats, isLoading } = useQuery({
    queryKey: ['mapStatsAdmin'],
    queryFn: async () => {
      const [hotelsResult, servicesResult] = await Promise.all([
        supabase.from('hoteles').select('id, visible_en_mapa, estrellas'),
        supabase.from('services').select('id, visible_en_mapa, price, category_id')
      ])

      if (hotelsResult.error) throw hotelsResult.error
      if (servicesResult.error) throw servicesResult.error

      const hotels = hotelsResult.data || []
      const services = servicesResult.data || []

      return {
        totalHotels: hotels.length,
        visibleHotels: hotels.filter(h => h.visible_en_mapa).length,
        totalServices: services.length,
        visibleServices: services.filter(s => s.visible_en_mapa).length,
        avgStars: hotels.length > 0 
          ? hotels.reduce((sum, h) => sum + (h.estrellas || 0), 0) / hotels.length 
          : 0,
        avgPrice: services.length > 0
          ? services.reduce((sum, s) => sum + s.price, 0) / services.length
          : 0,
        categories: [...new Set(services.map(s => s.category_id).filter(Boolean))].length
      }
    },
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" /> Estadísticas del Mapa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!mapStats) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" /> Estadísticas del Mapa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hoteles */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Hotel className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-semibold text-gray-900">Hoteles</p>
              <p className="text-sm text-gray-600">
                {mapStats.visibleHotels} de {mapStats.totalHotels} visibles
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant={mapStats.visibleHotels > 0 ? "default" : "secondary"}>
              {mapStats.visibleHotels > 0 ? (
                <Eye className="h-3 w-3 mr-1" />
              ) : (
                <EyeOff className="h-3 w-3 mr-1" />
              )}
              {mapStats.visibleHotels > 0 ? 'Activos' : 'Inactivos'}
            </Badge>
            <p className="text-xs text-gray-500 mt-1">
              {mapStats.avgStars.toFixed(1)} ⭐ promedio
            </p>
          </div>
        </div>

        {/* Servicios */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-semibold text-gray-900">Servicios</p>
              <p className="text-sm text-gray-600">
                {mapStats.visibleServices} de {mapStats.totalServices} visibles
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant={mapStats.visibleServices > 0 ? "default" : "secondary"}>
              {mapStats.visibleServices > 0 ? (
                <Eye className="h-3 w-3 mr-1" />
              ) : (
                <EyeOff className="h-3 w-3 mr-1" />
              )}
              {mapStats.visibleServices > 0 ? 'Activos' : 'Inactivos'}
            </Badge>
            <p className="text-xs text-gray-500 mt-1">
              €{mapStats.avgPrice.toFixed(0)} promedio
            </p>
          </div>
        </div>

        {/* Resumen */}
        <div className="pt-3 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{mapStats.totalHotels}</p>
              <p className="text-xs text-gray-500">Total Hoteles</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{mapStats.totalServices}</p>
              <p className="text-xs text-gray-500">Total Servicios</p>
            </div>
          </div>
          <div className="mt-3 text-center">
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              {mapStats.categories} categorías diferentes
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
