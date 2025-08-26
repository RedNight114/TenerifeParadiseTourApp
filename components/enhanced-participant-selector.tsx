"use client"

import React, { useState, useEffect, useMemo } from "react"
import { 
  Plus, 
  Minus, 
  Users, 
  Baby, 
  User, 
  UserCheck, 
  Crown, 
  AlertCircle, 
  Info,
  Trash2,
  Edit,
  Check,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface EnhancedParticipantSelectorProps {
  serviceId: string
  basePrice: number
  onParticipantsChange: (participants: Participant[], totalPrice: number) => void
  maxParticipants?: number
  className?: string
  ageRanges?: AgeRange[]
}

export interface Participant {
  id: string
  type: string
  age: number
  price: number
  ageRange: string
  name?: string
}

interface AgeRange {
  id: number
  serviceId: string
  rangeName: string
  minAge: number
  maxAge: number
  price: number
  priceType: string
  description?: string
  ageLabel: string
}

// Rangos por defecto si no se proporcionan
const DEFAULT_AGE_RANGES: AgeRange[] = [
  { 
    id: 1, 
    serviceId: '', 
    rangeName: 'Bebés', 
    minAge: 0, 
    maxAge: 2, 
    price: 0, 
    priceType: 'per_person', 
    description: 'Gratis para bebés', 
    ageLabel: 'Bebés (0-2 años)' 
  },
  { 
    id: 2, 
    serviceId: '', 
    rangeName: 'Niños', 
    minAge: 3, 
    maxAge: 11, 
    price: 0, 
    priceType: 'per_person', 
    description: '50% del precio adulto', 
    ageLabel: 'Niños (3-11 años)' 
  },
  { 
    id: 3, 
    serviceId: '', 
    rangeName: 'Adolescentes', 
    minAge: 12, 
    maxAge: 17, 
    price: 0, 
    priceType: 'per_person', 
    description: '75% del precio adulto', 
    ageLabel: 'Adolescentes (12-17 años)' 
  },
  { 
    id: 4, 
    serviceId: '', 
    rangeName: 'Adultos', 
    minAge: 18, 
    maxAge: 64, 
    price: 0, 
    priceType: 'per_person', 
    description: 'Precio completo', 
    ageLabel: 'Adultos (18-64 años)' 
  },
  { 
    id: 5, 
    serviceId: '', 
    rangeName: 'Seniors', 
    minAge: 65, 
    maxAge: 120, 
    price: 0, 
    priceType: 'per_person', 
    description: '20% descuento para seniors', 
    ageLabel: 'Seniors (65+ años)' 
  }
]

export function EnhancedParticipantSelector({ 
  serviceId, 
  basePrice, 
  onParticipantsChange, 
  maxParticipants = 20,
  className = "",
  ageRanges = DEFAULT_AGE_RANGES
}: EnhancedParticipantSelectorProps) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)
  const [customAge, setCustomAge] = useState<number>(18)

  // Inicializar cantidades
  useEffect(() => {
    const initialQuantities: Record<string, number> = {}
    ageRanges.forEach(range => {
      initialQuantities[range.id.toString()] = 0
    })
    setQuantities(initialQuantities)
  }, [ageRanges])

  // Calcular precios por rango de edad
  const ageRangePricing = useMemo(() => {
    return ageRanges.map(range => ({
      ...range,
      price: range.price > 0 ? range.price : basePrice * getPriceMultiplier(range)
    }))
  }, [ageRanges, basePrice])

  // Obtener multiplicador de precio por defecto
  const getPriceMultiplier = (range: AgeRange): number => {
    if (range.rangeName === 'Bebés') return 0.0
    if (range.rangeName === 'Niños') return 0.5
    if (range.rangeName === 'Adolescentes') return 0.75
    if (range.rangeName === 'Seniors') return 0.9
    return 1.0 // Adultos
  }

  // Obtener etiqueta de rango de edad basada en la edad
  const getAgeRangeLabel = (age: number): string => {
    const range = ageRanges.find(r => age >= r.minAge && age <= r.maxAge)
    return range ? range.ageLabel : 'Edad no válida'
  }

  // Obtener tipo de participante basado en la edad
  const getParticipantType = (age: number): string => {
    const range = ageRanges.find(r => age >= r.minAge && age <= r.maxAge)
    return range ? range.rangeName : 'Adultos'
  }

  // Calcular precio para una edad específica
  const calculatePriceForAge = (age: number): number => {
    const range = ageRanges.find(r => age >= r.minAge && age <= r.maxAge)
    if (!range) return basePrice
    
    return range.price > 0 ? range.price : basePrice * getPriceMultiplier(range)
  }

  // Actualizar cantidad para un rango de edad
  const updateQuantity = (rangeId: string, increment: boolean) => {
    const currentQuantity = quantities[rangeId] || 0
    const newQuantity = increment ? currentQuantity + 1 : Math.max(0, currentQuantity - 1)
    
    if (newQuantity + participants.length > maxParticipants) {
      return // No exceder el máximo
    }

    setQuantities(prev => ({ ...prev, [rangeId]: newQuantity }))
  }

  // Agregar participantes para un rango de edad
  const addParticipantsForRange = (range: AgeRange) => {
    const quantity = quantities[range.id.toString()] || 0
    if (quantity === 0) return

    const newParticipants: Participant[] = []
    
    for (let i = 0; i < quantity; i++) {
      const age = range.minAge + Math.floor(Math.random() * (range.maxAge - range.minAge + 1))
      const price = calculatePriceForAge(age)
      const ageRange = getAgeRangeLabel(age)
      
      newParticipants.push({
        id: `${range.id}-${Date.now()}-${Math.random()}`,
        type: range.rangeName,
        age,
        price,
        ageRange
      })
    }

    const updatedParticipants = [...participants, ...newParticipants]
    setParticipants(updatedParticipants)
    updateTotalPrice(updatedParticipants)
    
    // Resetear cantidad
    setQuantities(prev => ({ ...prev, [range.id.toString()]: 0 }))
  }

  // Agregar participante personalizado
  const addCustomParticipant = () => {
    if (participants.length >= maxParticipants) return
    
    const price = calculatePriceForAge(customAge)
    const ageRange = getAgeRangeLabel(customAge)
    const type = getParticipantType(customAge)
    
    const newParticipant: Participant = {
      id: `custom-${Date.now()}-${Math.random()}`,
      type,
      age: customAge,
      price,
      ageRange
    }

    const updatedParticipants = [...participants, newParticipant]
    setParticipants(updatedParticipants)
    updateTotalPrice(updatedParticipants)
    setCustomAge(18)
  }

  // Editar participante
  const editParticipant = (participant: Participant) => {
    setEditingParticipant(participant)
    setCustomAge(participant.age)
  }

  // Guardar edición
  const saveEdit = () => {
    if (!editingParticipant) return
    
    const updatedParticipants = participants.map(p => 
      p.id === editingParticipant.id 
        ? { ...p, age: customAge, price: calculatePriceForAge(customAge), ageRange: getAgeRangeLabel(customAge), type: getParticipantType(customAge) }
        : p
    )
    
    setParticipants(updatedParticipants)
    updateTotalPrice(updatedParticipants)
    setEditingParticipant(null)
    setCustomAge(18)
  }

  // Cancelar edición
  const cancelEdit = () => {
    setEditingParticipant(null)
    setCustomAge(18)
  }

  // Eliminar participante
  const removeParticipant = (id: string) => {
    const updatedParticipants = participants.filter(p => p.id !== id)
    setParticipants(updatedParticipants)
    updateTotalPrice(updatedParticipants)
  }

  // Actualizar precio total
  const updateTotalPrice = (participantsList: Participant[]) => {
    const total = participantsList.reduce((sum, p) => sum + p.price, 0)
    setTotalPrice(total)
    onParticipantsChange(participantsList, total)
  }

  // Obtener icono para el tipo de participante
  const getParticipantIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bebés': return <Baby className="w-4 h-4" />
      case 'niños': return <Baby className="w-4 h-4" />
      case 'adolescentes': return <User className="w-4 h-4" />
      case 'adultos': return <UserCheck className="w-4 h-4" />
      case 'seniors': return <Crown className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  // Obtener color para el tipo de participante
  const getParticipantColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bebés': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'niños': return 'bg-green-100 text-green-800 border-green-200'
      case 'adolescentes': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'adultos': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'seniors': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        {/* Sección de Precios por Edad */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
              <Users className="w-5 h-5" />
              Precios por Edad
            </CardTitle>
            <p className="text-sm text-blue-700">
              Selecciona la cantidad de participantes para cada rango de edad
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ageRangePricing.map((range) => (
                <div key={range.id} className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getParticipantIcon(range.rangeName)}
                      <span className="font-medium text-gray-900">{range.rangeName}</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {range.price === 0 ? 'Gratis' : `€${range.price.toFixed(2)}`}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-gray-600 mb-3">
                    {range.minAge}-{range.maxAge === 120 ? '+' : range.maxAge} años
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(range.id.toString(), false)}
                      disabled={quantities[range.id.toString()] === 0}
                      className="w-8 h-8 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    
                    <span className="min-w-[2rem] text-center font-medium">
                      {quantities[range.id.toString()] || 0}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(range.id.toString(), true)}
                      disabled={participants.length + (quantities[range.id.toString()] || 0) >= maxParticipants}
                      className="w-8 h-8 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => addParticipantsForRange(range)}
                      disabled={quantities[range.id.toString()] === 0}
                      className="flex-1"
                    >
                      Agregar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sección de Participante Personalizado */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-green-900">
              <User className="w-5 h-5" />
              Participante Personalizado
            </CardTitle>
            <p className="text-sm text-green-700">
              Agrega un participante con edad específica
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="custom-age">Edad</Label>
                <Input
                  id="custom-age"
                  type="number"
                  min="0"
                  max="120"
                  value={customAge}
                  onChange={(e) => setCustomAge(parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              
              <div className="flex-1">
                <Label>Precio</Label>
                <div className="mt-1 text-lg font-semibold text-green-700">
                  €{calculatePriceForAge(customAge).toFixed(2)}
                </div>
              </div>
              
              <div className="flex-1">
                <Label>Rango</Label>
                <div className="mt-1 text-sm text-gray-600">
                  {getAgeRangeLabel(customAge)}
                </div>
              </div>
              
              <Button
                onClick={addCustomParticipant}
                disabled={participants.length >= maxParticipants}
                className="mt-6"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resumen y Participantes Seleccionados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resumen */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-purple-900">
                <UserCheck className="w-5 h-5" />
                Resumen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Participantes:</span>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {participants.length}/{maxParticipants}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Precio Total:</span>
                <span className="text-2xl font-bold text-purple-900">
                  €{totalPrice.toFixed(2)}
                </span>
              </div>
              
              {participants.length > 0 && (
                <div className="pt-3 border-t border-purple-200">
                  <div className="text-sm text-gray-600 mb-2">Distribución por edad:</div>
                  {Object.entries(
                    participants.reduce((acc, p) => {
                      acc[p.type] = (acc[p.type] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span className="text-gray-600">{type}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Participantes Seleccionados */}
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-orange-900">
                <Users className="w-5 h-5" />
                Participantes Seleccionados
              </CardTitle>
              <p className="text-sm text-orange-700">
                {participants.length} participante{participants.length !== 1 ? 's' : ''} seleccionado{participants.length !== 1 ? 's' : ''}
              </p>
            </CardHeader>
            <CardContent>
              {participants.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay participantes seleccionados</p>
                  <p className="text-sm">Usa los controles de arriba para agregar participantes</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border",
                        getParticipantColor(participant.type)
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {getParticipantIcon(participant.type)}
                        <div>
                          <div className="font-medium">{participant.type}</div>
                          <div className="text-sm opacity-75">
                            {participant.age} años • €{participant.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => editParticipant(participant)}
                              className="w-8 h-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar edad</TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeParticipant(participant.id)}
                              className="w-8 h-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Eliminar participante</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal de Edición */}
        {editingParticipant && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Editar Participante</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-age">Edad</Label>
                  <Input
                    id="edit-age"
                    type="number"
                    min="0"
                    max="120"
                    value={customAge}
                    onChange={(e) => setCustomAge(parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="text-sm text-gray-600">
                  <div>Nuevo precio: €{calculatePriceForAge(customAge).toFixed(2)}</div>
                  <div>Nuevo rango: {getAgeRangeLabel(customAge)}</div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={saveEdit} className="flex-1">
                    <Check className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                  <Button variant="outline" onClick={cancelEdit} className="flex-1">
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alertas */}
        {participants.length >= maxParticipants && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Has alcanzado el límite máximo de {maxParticipants} participantes.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </TooltipProvider>
  )
}

