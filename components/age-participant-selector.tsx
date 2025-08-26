"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Plus, Minus, Users, Baby, User, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface AgeParticipantSelectorProps {
  serviceId: number
  basePrice: number
  onParticipantsChange: (participants: Participant[], totalPrice: number) => void
  maxParticipants?: number
  className?: string
}

export interface Participant {
  id: string
  type: 'baby' | 'child' | 'adult' | 'senior'
  age: number
  price: number
  ageRange: string
}

interface AgeRange {
  minAge: number
  maxAge: number
  type: 'baby' | 'child' | 'adult' | 'senior'
  label: string
  priceMultiplier: number
}

const AGE_RANGES: AgeRange[] = [
  { minAge: 0, maxAge: 2, type: 'baby', label: 'Bebés (0-2 años)', priceMultiplier: 0.0 },
  { minAge: 3, maxAge: 11, type: 'child', label: 'Niños (3-11 años)', priceMultiplier: 0.5 },
  { minAge: 12, maxAge: 17, type: 'child', label: 'Adolescentes (12-17 años)', priceMultiplier: 0.75 },
  { minAge: 18, maxAge: 64, type: 'adult', label: 'Adultos (18-64 años)', priceMultiplier: 1.0 },
  { minAge: 65, maxAge: 120, type: 'senior', label: 'Seniors (65+ años)', priceMultiplier: 0.9 }
]

export function AgeParticipantSelector({ 
  serviceId, 
  basePrice, 
  onParticipantsChange, 
  maxParticipants = 20,
  className = "" 
}: AgeParticipantSelectorProps) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [totalPrice, setTotalPrice] = useState(0)

  // Calcular precios por rango de edad
  const ageRangePricing = useMemo(() => {
    return AGE_RANGES.map(range => ({
      ...range,
      price: basePrice * range.priceMultiplier
    }))
  }, [basePrice])

  // Obtener etiqueta de rango de edad basada en la edad
  const getAgeRangeLabel = (age: number): string => {
    const range = AGE_RANGES.find(r => age >= r.minAge && age <= r.maxAge)
    return range ? range.label : 'Edad no válida'
  }

  // Obtener tipo de participante basado en la edad
  const getParticipantType = (age: number): 'baby' | 'child' | 'adult' | 'senior' => {
    const range = AGE_RANGES.find(r => age >= r.minAge && age <= r.maxAge)
    return range ? range.type : 'adult'
  }

  // Calcular precio para una edad específica
  const calculatePriceForAge = (age: number): number => {
    const range = AGE_RANGES.find(r => age >= r.minAge && age <= r.maxAge)
    return range ? basePrice * range.priceMultiplier : basePrice
  }

  // Agregar participante
  const addParticipant = (type: 'baby' | 'child' | 'adult' | 'senior', age: number) => {
    if (participants.length >= maxParticipants) {
      return
    }

    const price = calculatePriceForAge(age)
    const ageRange = getAgeRangeLabel(age)
    const newParticipant: Participant = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      age,
      price,
      ageRange
    }

    const newParticipants = [...participants, newParticipant]
    setParticipants(newParticipants)
    updateTotalPrice(newParticipants)
  }

  // Eliminar participante
  const removeParticipant = (id: string) => {
    const newParticipants = participants.filter(p => p.id !== id)
    setParticipants(newParticipants)
    updateTotalPrice(newParticipants)
  }

  // Actualizar edad de participante
  const updateParticipantAge = (id: string, newAge: number) => {
    if (newAge < 0 || newAge > 120) return

    const newParticipants = participants.map(p => {
      if (p.id === id) {
        const newType = getParticipantType(newAge)
        const newPrice = calculatePriceForAge(newAge)
        const newAgeRange = getAgeRangeLabel(newAge)
        return { ...p, age: newAge, type: newType, price: newPrice, ageRange: newAgeRange }
      }
      return p
    })

    setParticipants(newParticipants)
    updateTotalPrice(newParticipants)
  }

  // Calcular precio total
  const updateTotalPrice = (participantsList: Participant[]) => {
    const total = participantsList.reduce((sum, p) => sum + p.price, 0)
    setTotalPrice(total)
    onParticipantsChange(participantsList, total)
  }

  // Obtener contadores por tipo
  const getCountByType = (type: 'baby' | 'child' | 'adult' | 'senior') => {
    return participants.filter(p => p.type === type).length
  }

  // Obtener icono para tipo de participante
  const getParticipantIcon = (type: 'baby' | 'child' | 'adult' | 'senior') => {
    switch (type) {
      case 'baby': return <Baby className="h-4 w-4" />
      case 'child': return <User className="h-4 w-4" />
      case 'adult': return <User className="h-4 w-4" />
      case 'senior': return <UserCheck className="h-4 w-4" />
    }
  }

  // Obtener color para tipo de participante
  const getParticipantColor = (type: 'baby' | 'child' | 'adult' | 'senior') => {
    switch (type) {
      case 'baby': return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'child': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'adult': return 'bg-green-100 text-green-800 border-green-200'
      case 'senior': return 'bg-purple-100 text-purple-800 border-purple-200'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Información de precios por edad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Precios por Edad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ageRangePricing.map((range) => (
              <div key={range.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {getParticipantIcon(range.type)}
                  <span className="text-sm font-medium">{range.label}</span>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {range.price === 0 ? 'Gratis' : `€${range.price.toFixed(2)}`}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selector de participantes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Seleccionar Participantes</span>
            <Badge variant="outline">
              {participants.length}/{maxParticipants}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controles para agregar participantes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AGE_RANGES.map((range) => (
              <div key={range.type} className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  {getParticipantIcon(range.type)}
                  <span className="text-xs text-center">{range.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addParticipant(range.type, range.minAge)}
                    disabled={participants.length >= maxParticipants}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Badge variant="secondary" className="min-w-[2rem] text-center">
                    {getCountByType(range.type)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Lista de participantes */}
          {participants.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700">Participantes Seleccionados:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={getParticipantColor(participant.type)}>
                        {getParticipantIcon(participant.type)}
                        {participant.ageRange}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Edad:</span>
                        <input
                          type="number"
                          min="0"
                          max="120"
                          value={participant.age}
                          onChange={(e) => updateParticipantAge(participant.id, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-medium">
                        €{participant.price.toFixed(2)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeParticipant(participant.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No hay participantes seleccionados</p>
              <p className="text-sm">Usa los controles de arriba para agregar participantes</p>
            </div>
          )}

          {/* Resumen de precios */}
          {participants.length > 0 && (
            <>
              <Separator />
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-blue-900">Total:</span>
                  <span className="text-sm text-blue-700">
                    {participants.length} participante{participants.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-900">
                    €{totalPrice.toFixed(2)}
                  </div>
                  <div className="text-sm text-blue-700">
                    Precio base: €{basePrice.toFixed(2)}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
