"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Euro, Users } from 'lucide-react'

interface AgeRange {
  id: string
  range_name: string
  min_age: number
  max_age: number
  price: number
  price_type: string
}

interface SimpleAgePricingProps {
  serviceId?: string
  servicePrice?: number
  onRangesChange?: (ranges: AgeRange[]) => void
}

export function SimpleAgePricing({ 
  serviceId, 
  servicePrice = 0,
  onRangesChange 
}: SimpleAgePricingProps) {
  const [ageRanges, setAgeRanges] = useState<AgeRange[]>([])
  const [newRange, setNewRange] = useState<AgeRange>({
    id: '',
    range_name: '',
    min_age: 0,
    max_age: 0,
    price: 0,
    price_type: 'per_person'
  })

  const addRange = () => {
    if (!newRange.range_name || newRange.min_age === 0 && newRange.max_age === 0) {
      return
    }

    const range: AgeRange = {
      ...newRange,
      id: Date.now().toString(),
      price: newRange.price || servicePrice * 0.5
    }

    const updatedRanges = [...ageRanges, range]
    setAgeRanges(updatedRanges)
    
    if (onRangesChange) {
      onRangesChange(updatedRanges)
    }

    setNewRange({
      id: '',
      range_name: '',
      min_age: 0,
      max_age: 0,
      price: 0,
      price_type: 'per_person'
    })
  }

  const removeRange = (id: string) => {
    const updatedRanges = ageRanges.filter(r => r.id !== id)
    setAgeRanges(updatedRanges)
    
    if (onRangesChange) {
      onRangesChange(updatedRanges)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-blue-600" />
          Precios por Edad
        </CardTitle>
        <p className="text-sm text-gray-600">
          Configura precios personalizados por rango de edad para este servicio
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulario para nuevo rango */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="space-y-2">
            <Label htmlFor="range-name">Nombre del Rango</Label>
            <Input
              id="range-name"
              value={newRange.range_name}
              onChange={(e) => setNewRange({ ...newRange, range_name: e.target.value })}
              placeholder="Ej: Niños, Adolescentes"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="min-age">Edad Mínima</Label>
            <Input
              id="min-age"
              type="number"
              min="0"
              value={newRange.min_age}
              onChange={(e) => setNewRange({ ...newRange, min_age: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-age">Edad Máxima</Label>
            <Input
              id="max-age"
              type="number"
              min="0"
              value={newRange.max_age}
              onChange={(e) => setNewRange({ ...newRange, max_age: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Precio (€)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={newRange.price}
              onChange={(e) => setNewRange({ ...newRange, price: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price-type">Tipo de Precio</Label>
            <select
              id="price-type"
              value={newRange.price_type}
              onChange={(e) => setNewRange({ ...newRange, price_type: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="per_person">Por persona</option>
              <option value="per_group">Por grupo</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button onClick={addRange} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Agregar
            </Button>
          </div>
        </div>

        {/* Lista de rangos */}
        <div className="space-y-2">
          {ageRanges.map((range) => (
            <div
              key={range.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-white"
            >
              <div className="flex items-center gap-3">
                <Badge variant="secondary">
                  {range.range_name}
                </Badge>
                <span className="text-sm text-gray-600">
                  {range.min_age}-{range.max_age} años
                </span>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Euro className="h-3 w-3" />
                  {range.price} {range.price_type === 'per_person' ? 'por persona' : 'por grupo'}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeRange(range.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {ageRanges.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No hay rangos de edad configurados</p>
            <p className="text-sm">Agrega rangos de edad con precios personalizados</p>
            <p className="text-xs mt-2">Precio base: €{servicePrice || 0}</p>
          </div>
        )}

        {/* Información adicional */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Los rangos de edad se aplicarán automáticamente según la edad de cada participante.
            {!serviceId && ' Los rangos se guardarán cuando guardes el servicio.'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}