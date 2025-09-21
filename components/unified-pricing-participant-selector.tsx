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
  X,
  Euro,
  Settings,
  Save,
  RefreshCw,
  Equal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface UnifiedPricingParticipantSelectorProps {
  serviceId: string
  basePrice: number
  onParticipantsChange: (participants: Participant[], totalPrice: number) => void
  onPricingChange?: (ageRanges: AgeRange[]) => void
  maxParticipants?: number
  className?: string
  ageRanges?: AgeRange[]
  isAdmin?: boolean
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
    maxAge: 99, 
    price: 0, 
    priceType: 'per_person', 
    description: '20% descuento para seniors', 
    ageLabel: 'Seniors (65+ años)' 
  }
]

function UnifiedPricingParticipantSelector({ 
  basePrice, 
  onParticipantsChange, 
  onPricingChange,
  maxParticipants = 20,
  className = "",
  ageRanges = DEFAULT_AGE_RANGES,
  isAdmin = false
}: UnifiedPricingParticipantSelectorProps) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)
  const [customAge, setCustomAge] = useState<number>(18)
  
  // Estados para gestión de precios
  const [pricingMode, setPricingMode] = useState<'view' | 'edit'>('view')
  const [editingRanges, setEditingRanges] = useState<AgeRange[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  // Inicializar cantidades y rangos de edición
  useEffect(() => {
    const initialQuantities: Record<string, number> = {}
    ageRanges.forEach(range => {
      initialQuantities[range.id.toString()] = 0
    })
    setQuantities(initialQuantities)
    setEditingRanges([...ageRanges])
  }, [ageRanges])

  // Obtener multiplicador de precio por defecto - MOVIDO ANTES DE SU USO
  const getPriceMultiplier = (range: AgeRange): number => {
    if (range.rangeName === 'Bebés') return 0.0
    if (range.rangeName === 'Niños') return 0.5
    if (range.rangeName === 'Adolescentes') return 0.75
    if (range.rangeName === 'Seniors') return 0.9
    return 1.0 // Adultos
  }

  // Calcular precios por rango de edad
  const ageRangePricing = useMemo(() => {
    return editingRanges.map(range => ({
      ...range,
      price: range.price > 0 ? range.price : basePrice * getPriceMultiplier(range)
    }))
  }, [editingRanges, basePrice])

  // Verificar si todos los precios son iguales (excluyendo bebés que son gratis)
  const allPricesEqual = useMemo(() => {
    const nonFreePrices = ageRangePricing
      .filter(range => range.price > 0)
      .map(range => range.price)
    
    if (nonFreePrices.length <= 1) return true
    
    const firstPrice = nonFreePrices[0]
    return nonFreePrices.every(price => Math.abs(price - firstPrice) < 0.01)
  }, [ageRangePricing])

  // Obtener etiqueta de rango de edad basada en la edad
  const getAgeRangeLabel = (age: number): string => {
    if (age < 0 || age > 120) return 'Edad no válida'
    
    // Si todos los precios son iguales, no validar por rangos específicos
    if (allPricesEqual) {
      return 'Participante'
    }
    
    const range = ageRangePricing.find(r => age >= r.minAge && age <= r.maxAge)
    return range ? range.ageLabel : 'Edad no válida'
  }

  // Obtener tipo de participante basado en la edad
  const getParticipantType = (age: number): string => {
    // Si todos los precios son iguales, usar un tipo genérico
    if (allPricesEqual) {
      return 'Participante'
    }
    
    const range = ageRangePricing.find(r => age >= r.minAge && age <= r.maxAge)
    return range ? range.rangeName : 'Participante'
  }

  // Calcular precio para una edad específica
  const calculatePriceForAge = (age: number): number => {
    const range = ageRangePricing.find(r => age >= r.minAge && age <= r.maxAge)
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

  // Guardar edición de participante
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

  // Cancelar edición de participante
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

  // GESTIÓN DE PRECIOS
  const startPricingEdit = () => {
    setPricingMode('edit')
    setEditingRanges([...ageRanges])
    setHasChanges(false)
  }

  const cancelPricingEdit = () => {
    setPricingMode('view')
    setEditingRanges([...ageRanges])
    setHasChanges(false)
  }

  const savePricingChanges = () => {
    if (onPricingChange) {
      onPricingChange(editingRanges)
    }
    setPricingMode('view')
    setHasChanges(false)
  }

  const updateRangePrice = (rangeId: number, newPrice: number) => {
    setEditingRanges(prev => prev.map(range => 
      range.id === rangeId 
        ? { ...range, price: newPrice }
        : range
    ))
    setHasChanges(true)
  }

  const updateRangeAges = (rangeId: number, minAge: number, maxAge: number) => {
    setEditingRanges(prev => prev.map(range => 
      range.id === rangeId 
        ? { 
            ...range, 
            minAge, 
            maxAge, 
            ageLabel: `${range.rangeName} (${minAge}-${maxAge === 120 ? '+' : maxAge} años)` 
          }
        : range
    ))
    setHasChanges(true)
  }

  const resetToDefaults = () => {
    const defaultRanges = DEFAULT_AGE_RANGES.map(range => ({
      ...range,
      price: range.price > 0 ? range.price : basePrice * getPriceMultiplier(range)
    }))
    setEditingRanges(defaultRanges)
    setHasChanges(true)
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
      <div className={cn("space-y-3", className)}>
        {/* Sección Unificada de Precios y Selección */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Seleccionar Participantes
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Elige la cantidad de participantes para cada rango de edad
                  </p>
                </div>
              </div>
              
              {isAdmin && (
                <div className="flex flex-wrap items-center gap-1">
                  {pricingMode === 'view' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={startPricingEdit}
                      className="text-blue-700 border-blue-300 hover:bg-blue-100 text-xs h-7 px-2"
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetToDefaults}
                        className="text-orange-700 border-orange-300 hover:bg-orange-100 text-xs h-7 px-2"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Restaurar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelPricingEdit}
                        className="text-gray-700 border-gray-300 hover:bg-gray-100 text-xs h-7 px-2"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancelar
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={savePricingChanges}
                        disabled={!hasChanges}
                        className="bg-blue-600 hover:bg-blue-700 text-xs h-7 px-2"
                      >
                        <Save className="w-3 h-3 mr-1" />
                        Guardar
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-blue-700 mt-0.5">
              {pricingMode === 'view' 
                ? 'Selecciona la cantidad de participantes para cada rango de edad'
                : 'Modifica los precios y rangos de edad según necesites'
              }
            </p>
            
            {/* Indicador de precio único */}
            {pricingMode === 'view' && allPricesEqual && (
              <div className="flex items-center gap-2 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Equal className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Precio único: €{ageRangePricing.find(r => r.price > 0)?.price.toFixed(2) || basePrice.toFixed(2)} por persona
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3">
            <div className="space-y-2">
              {ageRangePricing.map((range) => (
                <div key={range.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    {/* Icono */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                        {getParticipantIcon(range.rangeName)}
                      </div>
                    </div>
                    
                    {/* Información */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {range.rangeName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          ({range.minAge}-{range.maxAge === 99 ? '+' : range.maxAge} años)
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {range.description || `Participantes de ${range.minAge} a ${range.maxAge === 99 ? 'más' : range.maxAge} años`}
                      </p>
                    </div>
                    
                    {/* Precio */}
                    <div className="flex-shrink-0">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-xs px-3 py-1 font-medium",
                          range.price === 0 
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-blue-100 text-blue-800 border-blue-200"
                        )}
                      >
                        {range.price === 0 ? 'Gratis' : `€${range.price.toFixed(2)}`}
                      </Badge>
                    </div>
                    
                    {/* Controles */}
                    {pricingMode === 'view' && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Controles +/- */}
                        <div className="flex items-center bg-white rounded border border-gray-300 p-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(range.id.toString(), false)}
                            disabled={quantities[range.id.toString()] === 0}
                            className="w-6 h-6 p-0 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          
                          <div className="min-w-[1.5rem] text-center">
                            <span className="text-sm font-bold text-blue-600">
                              {quantities[range.id.toString()] || 0}
                            </span>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(range.id.toString(), true)}
                            disabled={participants.length + (quantities[range.id.toString()] || 0) >= maxParticipants}
                            className="w-6 h-6 p-0 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        {/* Botón Agregar */}
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => addParticipantsForRange(range)}
                          disabled={quantities[range.id.toString()] === 0}
                          className="h-8 px-3 text-xs font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Agregar
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Edición de rangos de edad (solo admin) - ULTRA COMPACTA */}
                  {pricingMode === 'edit' && isAdmin && (
                    <div className="mt-2 p-2 bg-gray-50 rounded border">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs font-medium text-gray-700 mb-0.5 block">Min</Label>
                          <Input
                            type="number"
                            min="0"
                            max="120"
                            value={range.minAge}
                            onChange={(e) => updateRangeAges(range.id, parseInt(e.target.value) || 0, range.maxAge)}
                            className="h-6 text-xs border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-700 mb-0.5 block">Max</Label>
                          <Input
                            type="number"
                            min="0"
                            max="120"
                            value={range.maxAge}
                            onChange={(e) => updateRangeAges(range.id, range.minAge, parseInt(e.target.value) || 120)}
                            className="h-6 text-xs border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-700 mb-0.5 block">€</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={range.price}
                            onChange={(e) => updateRangePrice(range.id, parseFloat(e.target.value) || 0)}
                            className="h-6 text-xs border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="0=auto"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sección de Participante Personalizado */}
        {pricingMode === 'view' && (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Participante Personalizado
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Añade un participante con una edad específica
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {allPricesEqual ? (
                  // Diseño simplificado para precio único
                  <div className="flex gap-4 items-end">
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="custom-age" className="text-sm font-medium text-gray-700">
                        Edad del participante
                      </Label>
                      <Input
                        id="custom-age"
                        type="number"
                        min="0"
                        max="120"
                        value={customAge}
                        onChange={(e) => setCustomAge(parseInt(e.target.value) || 0)}
                        className="h-12 text-lg border border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                        placeholder="Introduce la edad"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Button
                        onClick={addCustomParticipant}
                        disabled={participants.length >= maxParticipants || customAge < 0 || customAge > 120}
                        className="h-12 px-6 bg-green-600 hover:bg-green-700 text-white text-base font-medium"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Agregar
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Diseño completo para precios por edad
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                      <Label htmlFor="custom-age" className="text-sm font-medium text-gray-700">
                        Edad
                      </Label>
                      <Input
                        id="custom-age"
                        type="number"
                        min="0"
                        max="120"
                        value={customAge}
                        onChange={(e) => setCustomAge(parseInt(e.target.value) || 0)}
                        className="h-10 text-sm border border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                        placeholder="Edad"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Precio
                      </Label>
                      <div className="h-10 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-green-700 flex items-center justify-center">
                        €{calculatePriceForAge(customAge).toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Categoría
                      </Label>
                      <div className={cn(
                        "h-10 px-3 py-2 border rounded-lg text-sm font-medium flex items-center justify-center",
                        getAgeRangeLabel(customAge) === 'Edad no válida'
                          ? "bg-red-50 border-red-300 text-red-700"
                          : "bg-blue-50 border-blue-300 text-blue-700"
                      )}>
                        {getAgeRangeLabel(customAge)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button
                        onClick={addCustomParticipant}
                        disabled={participants.length >= maxParticipants}
                        className="w-full h-10 bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Información adicional */}
                {customAge > 0 && (
                  <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                    <div className="flex items-center gap-2 text-xs text-blue-800">
                      <Info className="w-3 h-3" />
                      <span className="font-medium">
                        {allPricesEqual 
                          ? `${customAge} años → €${calculatePriceForAge(customAge).toFixed(2)}`
                          : `${customAge} años → ${getAgeRangeLabel(customAge)} → €${calculatePriceForAge(customAge).toFixed(2)}`
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resumen y Participantes Seleccionados */}
        {pricingMode === 'view' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resumen */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <UserCheck className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Resumen
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Detalles de tu selección
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-700 text-sm font-medium">
                      Total Participantes:
                    </span>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-sm px-3 py-1">
                      {participants.length}/{maxParticipants}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 text-sm font-medium">
                      Precio Total:
                    </span>
                    <span className="text-2xl font-bold text-purple-900">
                      €{totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {participants.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-700 mb-3 font-medium">
                      Distribución por edad:
                    </div>
                    <div className="space-y-2">
                      {Object.entries(
                        participants.reduce((acc, p) => {
                          acc[p.type] = (acc[p.type] || 0) + 1
                          return acc
                        }, {} as Record<string, number>)
                      ).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center p-2 bg-white rounded border border-gray-200">
                          <span className="text-gray-700 text-sm">{type}:</span>
                          <Badge variant="outline" className="text-gray-700 border-gray-300">
                            {count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Participantes Seleccionados */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Participantes Seleccionados
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {participants.length} participante{participants.length !== 1 ? 's' : ''} seleccionado{participants.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                {participants.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm font-medium">No hay participantes seleccionados</p>
                    <p className="text-xs text-gray-400">Usa los controles de arriba para agregar participantes</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {participants.map((participant, index) => (
                      <div
                        key={participant.id}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                                {getParticipantIcon(participant.type)}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm text-gray-900">{participant.type}</span>
                                <span className="text-xs text-gray-500">#{index + 1}</span>
                              </div>
                              <div className="text-xs text-gray-600">
                                {participant.age} años • €{participant.price.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => editParticipant(participant)}
                                  className="w-7 h-7 p-0 hover:bg-orange-100 rounded"
                                >
                                  <Edit className="w-3 h-3" />
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
                                  className="w-7 h-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Eliminar participante</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal de Edición de Participante */}
        {editingParticipant && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Editar Participante</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-age" className="text-sm">Edad</Label>
                  <Input
                    id="edit-age"
                    type="number"
                    min="0"
                    max="120"
                    value={customAge}
                    onChange={(e) => setCustomAge(parseInt(e.target.value) || 0)}
                    className="mt-1 h-9"
                  />
                </div>
                
                <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                  <div>Nuevo precio: €{calculatePriceForAge(customAge).toFixed(2)}</div>
                  <div>Nuevo rango: {getAgeRangeLabel(customAge)}</div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button onClick={saveEdit} className="flex-1 h-9">
                    <Check className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                  <Button variant="outline" onClick={cancelEdit} className="flex-1 h-9">
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
            <AlertDescription className="text-orange-800 text-sm">
              Has alcanzado el límite máximo de {maxParticipants} participantes.
            </AlertDescription>
          </Alert>
        )}

        {pricingMode === 'edit' && hasChanges && (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              Tienes cambios sin guardar en los precios. Haz clic en "Guardar" para aplicar los cambios.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </TooltipProvider>
  )
}

export default UnifiedPricingParticipantSelector
