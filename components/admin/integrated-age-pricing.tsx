"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Edit, Save, X, Copy, Check, Euro, Users } from 'lucide-react'
// Importación dinámica de sonner para evitar problemas de SSR
let toast: any = null
if (typeof window !== 'undefined') {
  import('sonner').then(({ toast: toastImport }) => {
    toast = toastImport
  })
}

// Función helper para manejar toasts de manera segura
const showToast = (type: 'success' | 'error' | 'info', message: string) => {
  if (typeof window !== 'undefined' && toast) {
    toast[type](message)
  } else {
    // Fallback para SSR - solo log en consola
    }: ${message}`)
  }
}
import { getSupabaseClient } from '@/lib/supabase-unified'

interface AgeRange {
  id?: number
  range_name: string
  min_age: number
  max_age: number
  price: number
  price_type: string
  description?: string
  is_active?: boolean
}

interface AgeRangeTemplate {
  id: number
  template_name: string
  description: string
  ranges: unknown[]
}

interface Service {
  id: string
  title: string
  price: number
}

interface IntegratedAgePricingProps {
  serviceId?: string
  servicePrice?: number
  onRangesChange?: (ranges: AgeRange[]) => void
}

export function IntegratedAgePricing({ 
  serviceId, 
  servicePrice = 0,
  onRangesChange 
}: IntegratedAgePricingProps) {
  const [ageRanges, setAgeRanges] = useState<AgeRange[]>([])
  const [templates, setTemplates] = useState<AgeRangeTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [editingRange, setEditingRange] = useState<AgeRange | null>(null)
  const [newRange, setNewRange] = useState<AgeRange>({
    range_name: '',
    min_age: 0,
    max_age: 0,
    price: 0,
    price_type: 'per_person'
  })

  // Cargar plantillas
  useEffect(() => {
    loadTemplates()
  }, [])

  // Cargar rangos de edad cuando se proporcione un serviceId
  useEffect(() => {
    if (serviceId) {
      loadAgeRanges(serviceId)
    }
  }, [serviceId])

  // Notificar cambios a los padres - SOLO cuando cambien los rangos, no la función
  useEffect(() => {
    if (onRangesChange && ageRanges.length > 0) {
      onRangesChange(ageRanges)
    }
  }, [ageRanges]) // Removido onRangesChange de las dependencias

  const loadTemplates = async () => {
    try {
      const supabase = await getSupabaseClient()
      
      const { data, error } = await supabase
        .from('age_range_templates')
        .select('*')
        .order('template_name')

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
// No mostrar toast en modo integrado
    }
  }

  const loadAgeRanges = async (serviceId: string) => {
    try {
      setLoading(true)
      const supabase = await getSupabaseClient()
      
      const { data, error } = await supabase
        .from('age_price_ranges')
        .select('*')
        .eq('service_id', serviceId)
        .eq('is_active', true)
        .order('min_age')

      if (error) throw error
      setAgeRanges(data || [])
    } catch (error) {
// No mostrar toast en modo integrado
    } finally {
      setLoading(false)
    }
  }

  const applyTemplate = async (templateId: number) => {
    if (!serviceId) {
      showToast('error', 'Selecciona un servicio primero')
      return
    }

    try {
      setLoading(true)
      const supabase = await getSupabaseClient()
      
      const { error } = await supabase.rpc('apply_age_range_template', {
        p_service_id: serviceId,
        p_template_id: templateId
      })

      if (error) throw error
      
      showToast('success', 'Plantilla aplicada correctamente')
      if (serviceId) {
        loadAgeRanges(serviceId)
      }
    } catch (error) {
showToast('error', 'Error aplicando plantilla')
    } finally {
      setLoading(false)
    }
  }

  const saveRange = async (range: AgeRange) => {
    if (!serviceId) {
      // Modo de vista previa - solo actualizar estado local
      if (range.id) {
        setAgeRanges(prev => prev.map(r => r.id === range.id ? range : r))
      } else {
        const newRangeWithId = { ...range, id: Date.now() }
        setAgeRanges(prev => [...prev, newRangeWithId])
      }
      
      setEditingRange(null)
      setNewRange({
        range_name: '',
        min_age: 0,
        max_age: 0,
        price: 0,
        price_type: 'per_person'
      })
      return
    }

    try {
      setLoading(true)
      const supabase = await getSupabaseClient()
      
      if (range.id && range.id > 1000) {
        // Es un rango local, convertirlo a real
        const { error } = await supabase.rpc('create_custom_age_range', {
          p_service_id: serviceId,
          p_range_name: range.range_name,
          p_min_age: range.min_age,
          p_max_age: range.max_age,
          p_price: range.price,
          p_price_type: range.price_type,
          p_description: range.description
        })

        if (error) throw error
        showToast('success', 'Rango creado correctamente')
      } else if (range.id) {
        // Actualizar rango existente
        const { error } = await supabase
          .from('age_price_ranges')
          .update({
            range_name: range.range_name,
            min_age: range.min_age,
            max_age: range.max_age,
            price: range.price,
            price_type: range.price_type,
            description: range.description
          })
          .eq('id', range.id)

        if (error) throw error
        showToast('success', 'Rango actualizado correctamente')
      } else {
        // Crear nuevo rango
        const { error } = await supabase.rpc('create_custom_age_range', {
          p_service_id: serviceId,
          p_range_name: range.range_name,
          p_min_age: range.min_age,
          p_max_age: range.max_age,
          p_price: range.price,
          p_price_type: range.price_type,
          p_description: range.description
        })

        if (error) throw error
        showToast('success', 'Rango creado correctamente')
      }
      
      setEditingRange(null)
      setNewRange({
        range_name: '',
        min_age: 0,
        max_age: 0,
        price: 0,
        price_type: 'per_person'
      })
      if (serviceId) {
        loadAgeRanges(serviceId)
      }
    } catch (error) {
showToast('error', 'Error guardando rango')
    } finally {
      setLoading(false)
    }
  }

  const deleteRange = async (rangeId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este rango?')) return

    if (!serviceId) {
      // Modo de vista previa - solo actualizar estado local
      setAgeRanges(prev => prev.filter(r => r.id !== rangeId))
      return
    }

    try {
      setLoading(true)
      const supabase = await getSupabaseClient()
      
      const { error } = await supabase
        .from('age_price_ranges')
        .update({ is_active: false })
        .eq('id', rangeId)

      if (error) throw error
      
      showToast('success', 'Rango eliminado correctamente')
      loadAgeRanges(serviceId)
    } catch (error) {
showToast('error', 'Error eliminando rango')
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (range: AgeRange) => {
    setEditingRange(range)
  }

  const cancelEditing = () => {
    setEditingRange(null)
    setNewRange({
      range_name: '',
      min_age: 0,
      max_age: 0,
      price: 0,
      price_type: 'per_person'
    })
  }

  const createPreviewRange = () => {
    if (!newRange.range_name || newRange.min_age === 0 && newRange.max_age === 0) {
      showToast('error', 'Completa los campos obligatorios')
      return
    }

    const previewRange: AgeRange = {
      ...newRange,
      id: Date.now() + Math.random(), // ID temporal
      price: newRange.price || servicePrice * 0.5 // Precio por defecto
    }

    setAgeRanges(prev => [...prev, previewRange])
    setNewRange({
      range_name: '',
      min_age: 0,
      max_age: 0,
      price: 0,
      price_type: 'per_person'
    })
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
        {/* Plantillas Predefinidas */}
        <div className="space-y-3">
          <Label>Plantillas Predefinidas</Label>
          <div className="flex flex-wrap gap-2">
            {templates.map((template) => (
              <Button
                key={template.id}
                variant="outline"
                size="sm"
                onClick={() => applyTemplate(template.id)}
                disabled={loading || !serviceId}
              >
                <Copy className="w-4 h-4 mr-2" />
                {template.template_name}
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Las plantillas sobrescribirán los rangos existentes del servicio
          </p>
        </div>

        {/* Rangos de Edad */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Rangos de Edad Configurados</Label>
            <Button
              onClick={() => setEditingRange({} as AgeRange)}
              size="sm"
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Rango
            </Button>
          </div>

          {/* Lista de Rangos */}
          <div className="space-y-2">
            {ageRanges.map((range) => (
              <div
                key={range.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {range.range_name}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {range.min_age}-{range.max_age} años
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    €{range.price} {range.price_type === 'per_person' ? 'por persona' : 'por grupo'}
                  </div>
                  {range.description && (
                    <div className="text-xs text-gray-400 mt-1">
                      {range.description}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEditing(range)}
                    disabled={loading}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteRange(range.id!)}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Formulario de Edición/Creación */}
          {(editingRange || newRange.range_name) && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="range-name">Nombre del Rango</Label>
                    <Input
                      id="range-name"
                      value={editingRange?.range_name || newRange.range_name}
                      onChange={(e) => {
                        if (editingRange) {
                          setEditingRange({ ...editingRange, range_name: e.target.value })
                        } else {
                          setNewRange({ ...newRange, range_name: e.target.value })
                        }
                      }}
                      placeholder="Ej: Bebés, Niños, Adolescentes"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price-type">Tipo de Precio</Label>
                    <Select
                      value={editingRange?.price_type || newRange.price_type}
                      onValueChange={(value) => {
                        if (editingRange) {
                          setEditingRange({ ...editingRange, price_type: value })
                        } else {
                          setNewRange({ ...newRange, price_type: value })
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per_person">Por persona</SelectItem>
                        <SelectItem value="per_group">Por grupo</SelectItem>
                        <SelectItem value="per_hour">Por hora</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min-age">Edad Mínima</Label>
                    <Input
                      id="min-age"
                      type="number"
                      min="0"
                      value={editingRange?.min_age || newRange.min_age}
                      onChange={(e) => {
                        if (editingRange) {
                          setEditingRange({ ...editingRange, min_age: parseInt(e.target.value) })
                        } else {
                          setNewRange({ ...newRange, min_age: parseInt(e.target.value) })
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-age">Edad Máxima</Label>
                    <Input
                      id="max-age"
                      type="number"
                      min="0"
                      value={editingRange?.max_age || newRange.max_age}
                      onChange={(e) => {
                        if (editingRange) {
                          setEditingRange({ ...editingRange, max_age: parseInt(e.target.value) })
                        } else {
                          setNewRange({ ...newRange, max_age: parseInt(e.target.value) })
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Precio</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editingRange?.price || newRange.price}
                      onChange={(e) => {
                        if (editingRange) {
                          setEditingRange({ ...editingRange, price: parseFloat(e.target.value) })
                        } else {
                          setNewRange({ ...newRange, price: parseFloat(e.target.value) })
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción (opcional)</Label>
                    <Input
                      id="description"
                      value={editingRange?.description || newRange.description}
                      onChange={(e) => {
                        if (editingRange) {
                          setEditingRange({ ...editingRange, description: e.target.value })
                        } else {
                          setNewRange({ ...newRange, description: e.target.value })
                        }
                      }}
                      placeholder="Descripción del rango de edad"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => serviceId ? saveRange(editingRange || newRange) : createPreviewRange()}
                    disabled={loading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingRange ? 'Actualizar' : 'Crear'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={cancelEditing}
                    disabled={loading}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información Adicional */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Puedes crear múltiples rangos de edad con precios personalizados. 
              {!serviceId && ' Los rangos se guardarán cuando guardes el servicio.'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


