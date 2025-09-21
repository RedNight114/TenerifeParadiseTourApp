"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Service {
  id: string
  title: string
  description: string
  price: number
  available: boolean
  created_at: string
  image_url?: string
}

export default function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const loadServices = async () => {
    if (!mounted) return
    
    try {
      setLoading(true)
      setError(null)
      
      const { getSupabaseClient } = await import("@/lib/supabase-unified")
      const supabase = await getSupabaseClient()
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setServices(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando servicios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      loadServices()
    }
  }, [mounted])

  const handleToggleAvailability = async (serviceId: string, currentStatus: boolean) => {
    try {
      const { getSupabaseClient } = await import("@/lib/supabase-unified")
      const supabase = await getSupabaseClient()
      
      const { error } = await supabase
        .from('services')
        .update({ available: !currentStatus })
        .eq('id', serviceId)

      if (error) throw error
      
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, available: !currentStatus }
          : service
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando servicio')
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este servicio?')) return
    
    try {
      const { getSupabaseClient } = await import("@/lib/supabase-unified")
      const supabase = await getSupabaseClient()
      
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)

      if (error) throw error
      
      setServices(prev => prev.filter(service => service.id !== serviceId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando servicio')
    }
  }

  if (!mounted || loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">Cargando servicios...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Servicios</h2>
          <p className="text-gray-600">Administra los servicios disponibles</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Servicio
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.length > 0 ? (
          services.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <Badge variant={service.available ? "default" : "secondary"}>
                    {service.available ? "Disponible" : "No disponible"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {service.description}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-green-600">
                    €{service.price}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(service.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleAvailability(service.id, service.available)}
                  >
                    {service.available ? "Desactivar" : "Activar"}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No hay servicios disponibles</p>
            <Button className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Servicio
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground">Total Servicios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {services.filter(s => s.available).length}
            </div>
            <p className="text-xs text-muted-foreground">Disponibles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">
              {services.filter(s => !s.available).length}
            </div>
            <p className="text-xs text-muted-foreground">No Disponibles</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
