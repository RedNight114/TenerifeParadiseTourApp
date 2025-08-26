"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2, Edit, Save, X, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { getSupabaseClient } from '@/lib/supabase-optimized'

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
  ranges: any[]
}

interface Service {
  id: string
  title: string
  price: number
}

export function AgePricingManager() {
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<string>('')
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

  // Cargar servicios y plantillas
  useEffect(() => {
    loadServices()
    loadTemplates()
  }, [])

  // Cargar rangos de edad cuando se selecciona un servicio
  useEffect(() => {
    if (selectedService) {
      loadAgeRanges(selectedService)
    }
  }, [selectedService])

  const loadServices = async () => {
    try {
      const supabase = getSupabaseClient()
      const client = await supabase.getClient()
      
      const { data, error } = await client
        .from('services')
        .select('id, title, price')
        .eq('available', true)
        .order('title')

      if (error) throw error
      setServices(data || [])
    } catch (error) {
toast.error('Error cargando servicios')
    }
  }

  const loadTemplates = async () => {
    try {
      const supabase = getSupabaseClient()
      const client = await supabase.getClient()
      
      const { data, error } = await client
        .from('age_range_templates')
        .select('*')
        .order('template_name')

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
toast.error('Error cargando plantillas')
    }
  }

  const loadAgeRanges = async (serviceId: string) => {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      const client = await supabase.getClient()
      
      const { data, error } = await client
        .from('age_price_ranges')
        .select('*')
        .eq('service_id', serviceId)
        .eq('is_active', true)
        .order('min_age')

      if (error) throw error
      setAgeRanges(data || [])
    } catch (error) {
toast.error('Error cargando rangos de edad')
    } finally {
      setLoading(false)
    }
  }

  const applyTemplate = async (templateId: number) => {
    if (!selectedService) {
      toast.error('Selecciona un servicio primero')
      return
    }

    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      const client = await supabase.getClient()
      
      const { error } = await client.rpc('apply_age_range_template', {
        p_service_id: selectedService,
        p_template_id: templateId
      })

      if (error) throw error
      
      toast.success('Plantilla aplicada correctamente')
      loadAgeRanges(selectedService)
    } catch (error) {
toast.error('Error aplicando plantilla')
    } finally {
      setLoading(false)
    }
  }

  const saveRange = async (range: AgeRange) => {
    if (!selectedService) {
      toast.error('Selecciona un servicio primero')
      return
    }

    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      const client = await supabase.getClient()
      
      if (range.id) {
        // Actualizar rango existente
        const { error } = await client
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
        toast.success('Rango actualizado correctamente')
      } else {
        // Crear nuevo rango
        const { error } = await client.rpc('create_custom_age_range', {
          p_service_id: selectedService,
          p_range_name: range.range_name,
          p_min_age: range.min_age,
          p_max_age: range.max_age,
          p_price: range.price,
          p_price_type: range.price_type,
          p_description: range.description
        })

        if (error) throw error
        toast.success('Rango creado correctamente')
      }
      
      setEditingRange(null)
      setNewRange({
        range_name: '',
        min_age: 0,
        max_age: 0,
        price: 0,
        price_type: 'per_person'
      })
      loadAgeRanges(selectedService)
    } catch (error) {
toast.error('Error guardando rango')
    } finally {
      setLoading(false)
    }
  }

  const deleteRange = async (rangeId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este rango?')) return

    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      const client = await supabase.getClient()
      
      const { error } = await client
        .from('age_price_ranges')
        .update({ is_active: false })
        .eq('id', rangeId)

      if (error) throw error
      
      toast.success('Rango eliminado correctamente')
      loadAgeRanges(selectedService)
    } catch (error) {
toast.error('Error eliminando rango')
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

  const getSelectedService = () => {
    return services.find(s => s.id === selectedService)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Precios por Edad</CardTitle>
          <p className="text-sm text-gray-600">
            Configura precios personalizados por rango de edad para cada servicio
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selección de Servicio */}
          <div className="space-y-2">
            <Label htmlFor="service-select">Seleccionar Servicio</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="Elige un servicio" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.title} - €{service.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Plantillas Predefinidas */}
          {selectedService && (
            <div className="space-y-3">
              <Label>Plantillas Predefinidas</Label>
              <div className="flex flex-wrap gap-2">
                {templates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate(template.id)}
                    disabled={loading}
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
          )}

          {/* Rangos de Edad */}
          {selectedService && (
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
                        onClick={() => saveRange(editingRange || newRange)}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

