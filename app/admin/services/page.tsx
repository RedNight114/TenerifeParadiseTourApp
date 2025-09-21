"use client"

import React, { useState, useEffect } from "react"
import { AdminLayoutModern } from "@/components/admin/admin-layout-modern"
import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Package, Activity, Plus, Edit, Trash2, Eye, Search, Filter, Loader2, Upload, X, CheckCircle, Euro, Image as ImageIcon, ClipboardList } from "lucide-react"
import { toast } from "sonner"
import { ImageUpload } from "@/components/admin/image-upload"

// --- Componente de "Etiquetas" reutilizable ---
function TagInput({
  label,
  items,
  setItems,
  placeholder,
}: { label: string; items: string[]; setItems: (items: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState("")

  const handleAddItem = () => {
    if (input.trim() && !items.includes(input.trim())) {
      setItems([...items, input.trim()])
      setInput("")
    }
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  return (
    <div>
      <Label className="text-sm font-semibold text-gray-700">{label}</Label>
      <div className="flex gap-2 mt-1">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddItem())}
          className="h-10"
        />
        <Button type="button" onClick={handleAddItem} disabled={!input.trim()} size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {items.map((item, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {item}
            <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => handleRemoveItem(index)} />
          </Badge>
        ))}
      </div>
    </div>
  )
}

interface AgeRange {
  id: string;
  min_age: number;
  max_age: number;
  price: number;
  description: string;
}

interface Service {
  id: string
  title: string
  description?: string
  category_id: string
  subcategory_id: string
  price: number
  images?: string[]
  available: boolean
  featured: boolean
  duration?: number
  location?: string
  min_group_size?: number
  max_group_size?: number
  difficulty_level?: string
  vehicle_type?: string
  characteristics?: string
  insurance_included?: boolean
  fuel_included?: boolean
  menu?: string
  capacity?: number
  dietary_options?: string[]
  price_type?: string
  min_age?: number
  license_required?: boolean
  permit_required?: boolean
  activity_type?: string
  fitness_level_required?: string
  equipment_provided?: string[]
  cancellation_policy?: string
  itinerary?: string
  guide_languages?: string[]
  what_to_bring?: string[]
  included_services?: string[]
  not_included_services?: string[]
  meeting_point_details?: string
  transmission?: string
  seats?: number
  doors?: number
  fuel_policy?: string
  pickup_locations?: string[]
  deposit_required?: boolean
  deposit_amount?: number
  experience_type?: string
  chef_name?: string
  drink_options?: string
  ambience?: string
  schedule?: any
  price_children?: number
  age_ranges?: AgeRange[]
  precio_ninos?: number
  edad_maxima_ninos?: number
  created_at?: string
  updated_at?: string
}

export default function AdminServices() {
  // Estados principales
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('todos')
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [isNewServiceOpen, setIsNewServiceOpen] = useState(false)
  const [isEditServiceOpen, setIsEditServiceOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  // Cargar servicios al montar el componente
  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    setLoading(true)
    try {
      const { getSupabaseClient } = await import("@/lib/supabase-unified")
      const supabase = await getSupabaseClient()
      
      const { data, error } = await supabase
        .from('services')
        .select(`
          id,
          title,
          description,
          category_id,
          subcategory_id,
          price,
          images,
          available,
          featured,
          duration,
          location,
          min_group_size,
          max_group_size,
          difficulty_level,
          vehicle_type,
          characteristics,
          insurance_included,
          fuel_included,
          menu,
          capacity,
          dietary_options,
          price_type,
          min_age,
          license_required,
          permit_required,
          activity_type,
          fitness_level_required,
          equipment_provided,
          cancellation_policy,
          itinerary,
          guide_languages,
          what_to_bring,
          included_services,
          not_included_services,
          meeting_point_details,
          transmission,
          seats,
          doors,
          fuel_policy,
          pickup_locations,
          deposit_required,
          deposit_amount,
          experience_type,
          chef_name,
          drink_options,
          ambience,
          schedule,
          price_children,
          age_ranges,
          precio_ninos,
          edad_maxima_ninos,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      toast.error('Error cargando servicios')
      } finally {
      setLoading(false)
    }
  }

  // Función para crear nuevo servicio
  const handleCreateService = async (serviceData: Partial<Service>) => {
    try {
      const { getSupabaseClient } = await import("@/lib/supabase-unified")
      const supabase = await getSupabaseClient()
      
      const { data, error } = await supabase
        .from('services')
        .insert([serviceData])
        .select()

      if (error) throw error
      
      setServices(prev => [data[0], ...prev])
      setIsNewServiceOpen(false)
      toast.success('Servicio creado correctamente')
    } catch (error) {
      toast.error('Error creando servicio')
      }
  }

  // Función para actualizar servicio
  const handleUpdateService = async (serviceData: Partial<Service>) => {
    try {
      const { getSupabaseClient } = await import("@/lib/supabase-unified")
      const supabase = await getSupabaseClient()
      
      const { error } = await supabase
        .from('services')
        .update({
          ...serviceData,
          updated_at: new Date().toISOString()
        })
        .eq('id', serviceData.id)

      if (error) throw error
      
      setServices(prev => prev.map(service => 
        service.id === serviceData.id 
          ? { ...service, ...serviceData, updated_at: new Date().toISOString() }
          : service
      ))
      
      setIsEditServiceOpen(false)
      setSelectedService(null)
      toast.success('Servicio actualizado correctamente')
    } catch (error) {
      toast.error('Error actualizando servicio')
      }
  }

  // Función para eliminar servicio
  const handleDeleteService = async (serviceId: string) => {
    try {
      const { getSupabaseClient } = await import("@/lib/supabase-unified")
      const supabase = await getSupabaseClient()
      
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)

      if (error) throw error
      
      setServices(prev => prev.filter(service => service.id !== serviceId))
      toast.success('Servicio eliminado correctamente')
    } catch (error) {
      toast.error('Error eliminando servicio')
      }
  }

  // Función para alternar disponibilidad
  const handleToggleAvailability = async (serviceId: string, currentStatus: boolean) => {
    try {
      const { getSupabaseClient } = await import("@/lib/supabase-unified")
      const supabase = await getSupabaseClient()
      
      const { error } = await supabase
        .from('services')
        .update({ 
          available: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', serviceId)

      if (error) throw error
      
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, available: !currentStatus, updated_at: new Date().toISOString() }
          : service
      ))
      
      toast.success(`Servicio ${!currentStatus ? 'activado' : 'desactivado'} correctamente`)
    } catch (error) {
      toast.error('Error actualizando servicio')
      }
  }

  // Función para filtrar servicios
  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.location?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'todos' || service.category_id === filterCategory
    const matchesStatus = filterStatus === 'todos' || 
                         (filterStatus === 'activos' && service.available) ||
                         (filterStatus === 'inactivos' && !service.available)
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Estadísticas calculadas
  const stats = {
    total: services.length,
    active: services.filter(s => s.available).length,
    inactive: services.filter(s => !s.available).length,
    featured: services.filter(s => s.featured).length
  }

  // Categorías disponibles
  const categories = [
    { id: 'actividades', name: 'Actividades & Aventuras' },
    { id: 'gastronomia', name: 'Experiencias Gastronómicas' },
    { id: 'renting', name: 'Alquiler de Vehículos' }
  ]

  const subcategories = {
    actividades: [
      { id: 'acuaticas', name: 'Acuáticas' },
      { id: 'excursiones', name: 'Excursiones' },
      { id: 'naturaleza', name: 'Naturaleza' }
    ],
    gastronomia: [
      { id: 'restaurantes', name: 'Restaurantes' },
      { id: 'degustaciones', name: 'Degustaciones' },
      { id: 'cursos', name: 'Cursos de Cocina' },
      { id: 'catas', name: 'Catas de Vino' }
    ],
    renting: [
      { id: 'especiales', name: 'Especiales' },
      { id: 'coches', name: 'Coches' },
      { id: 'motos', name: 'Motos' },
      { id: 'barcos', name: 'Barcos' }
    ]
  }

  return (
    <AdminGuard>
      <AdminLayoutModern>
        <div className="space-y-6">
          {/* Header Profesional */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
            <div>
                  <h1 className="text-3xl font-bold text-gray-900">Gestión de Servicios</h1>
                  <p className="mt-1 text-gray-600">Administra y configura tu catálogo completo de servicios turísticos</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                      CRUD Completo
                    </span>
                    <span className="flex items-center">
                      <Activity className="w-4 h-4 mr-1 text-blue-500" />
                      Tiempo Real
                    </span>
                    <span className="flex items-center">
                      <Filter className="w-4 h-4 mr-1 text-purple-500" />
                      Filtros Avanzados
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={loadServices}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Actualizar
                </Button>
                <Dialog open={isNewServiceOpen} onOpenChange={setIsNewServiceOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Servicio
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center text-xl">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <Plus className="w-4 h-4 text-blue-600" />
                        </div>
                        Crear Nuevo Servicio
                      </DialogTitle>
                      <p className="text-gray-600">Completa la información para agregar un nuevo servicio al catálogo</p>
                    </DialogHeader>
                    <ServiceForm 
                      onSubmit={handleCreateService} 
                      categories={categories}
                      subcategories={subcategories}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Estadísticas Profesionales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <CardTitle className="text-sm font-semibold text-blue-700">Total Servicios</CardTitle>
                  <p className="text-xs text-blue-600 mt-1">En catálogo</p>
                </div>
                <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900 mb-2">{stats.total}</div>
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="bg-blue-200 text-blue-800 font-medium">
                    {stats.featured} destacados
                  </Badge>
                  <span className="text-xs text-blue-600">Catálogo completo</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <CardTitle className="text-sm font-semibold text-green-700">Servicios Activos</CardTitle>
                  <p className="text-xs text-green-600 mt-1">Disponibles</p>
                </div>
                <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-green-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900 mb-2">{stats.active}</div>
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="bg-green-200 text-green-800 font-medium">
                    {stats.total > 0 ? `${((stats.active / stats.total) * 100).toFixed(1)}%` : '0%'}
                  </Badge>
                  <span className="text-xs text-green-600">En operación</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <CardTitle className="text-sm font-semibold text-gray-700">Servicios Inactivos</CardTitle>
                  <p className="text-xs text-gray-600 mt-1">En mantenimiento</p>
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-gray-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stats.inactive}</div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-gray-200 text-gray-800 font-medium">
                    {stats.total > 0 ? `${((stats.inactive / stats.total) * 100).toFixed(1)}%` : '0%'}
                  </Badge>
                  <span className="text-xs text-gray-600">Pendientes</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <CardTitle className="text-sm font-semibold text-purple-700">Servicios Destacados</CardTitle>
                  <p className="text-xs text-purple-600 mt-1">En portada</p>
                </div>
                <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-purple-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900 mb-2">{stats.featured}</div>
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="bg-purple-200 text-purple-800 font-medium">
                    Premium
                  </Badge>
                  <span className="text-xs text-purple-600">Destacados</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros y Búsqueda Profesionales */}
          <Card className="border-0 shadow-lg bg-white border-gray-200">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Filter className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Gestión de Servicios</CardTitle>
                    <p className="text-sm text-gray-600">Busca, filtra y administra tu catálogo de servicios</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-white border-blue-200 text-blue-700">
                    {filteredServices.length} de {services.length} servicios
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Buscar por título, descripción, ubicación o categoría..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 text-sm border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-1">
                    💡 Tip: Busca por palabras clave para encontrar servicios rápidamente
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Categoría</label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="h-12 border-gray-200 focus:border-blue-300">
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas las categorías</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Estado</label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="h-12 border-gray-200 focus:border-blue-300">
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos los estados</SelectItem>
                        <SelectItem value="activos">Solo activos</SelectItem>
                        <SelectItem value="inactivos">Solo inactivos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-600">Cargando servicios...</p>
                  </div>
                </div>
              ) : filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onEdit={(service) => {
                        setSelectedService(service)
                        setIsEditServiceOpen(true)
                      }}
                      onDelete={handleDeleteService}
                      onToggleAvailability={handleToggleAvailability}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron servicios</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {searchTerm || filterCategory !== 'todos' || filterStatus !== 'todos' 
                      ? 'Intenta ajustar los filtros' 
                      : 'No hay servicios disponibles'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modal de Edición Profesional */}
          <Dialog open={isEditServiceOpen} onOpenChange={setIsEditServiceOpen}>
            <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center text-xl">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Edit className="w-4 h-4 text-green-600" />
                  </div>
                  Editar Servicio
                </DialogTitle>
                <p className="text-gray-600">
                  Modifica la información del servicio: <span className="font-semibold text-gray-900">{selectedService?.title}</span>
                </p>
              </DialogHeader>
              {selectedService && (
                <ServiceForm 
                  service={selectedService}
                  onSubmit={handleUpdateService}
                  categories={categories}
                  subcategories={subcategories}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayoutModern>
    </AdminGuard>
  )
}

// Componente para mostrar cada servicio en la lista
function ServiceCard({ 
  service, 
  onEdit, 
  onDelete, 
  onToggleAvailability 
}: { 
  service: Service
  onEdit: (service: Service) => void
  onDelete: (id: string) => void
  onToggleAvailability: (id: string, currentStatus: boolean) => void
}) {
  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'No especificado'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${mins}m`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificado'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'actividades':
        return {
          color: 'from-blue-500 to-blue-600',
          bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
          border: 'border-blue-200',
          icon: Activity,
          name: 'Actividades',
          accent: 'text-blue-600'
        }
      case 'gastronomia':
        return {
          color: 'from-orange-500 to-orange-600',
          bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
          border: 'border-orange-200',
          icon: Package,
          name: 'Gastronomía',
          accent: 'text-orange-600'
        }
      case 'renting':
        return {
          color: 'from-green-500 to-green-600',
          bg: 'bg-gradient-to-br from-green-50 to-green-100',
          border: 'border-green-200',
          icon: Package,
          name: 'Alquiler',
          accent: 'text-green-600'
        }
      default:
        return {
          color: 'from-gray-500 to-gray-600',
          bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
          border: 'border-gray-200',
          icon: Package,
          name: 'Servicio',
          accent: 'text-gray-600'
        }
    }
  }

  const categoryInfo = getCategoryInfo(service.category_id)
  const CategoryIcon = categoryInfo.icon

  return (
    <div className={`group relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 ${categoryInfo.bg} ${categoryInfo.border} border overflow-hidden`}>
      {/* Header con imagen y badges mejorado */}
      <div className="relative h-40 sm:h-44 md:h-48 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200">
        {service.images && service.images.length > 0 ? (
          <div className="relative w-full h-full overflow-hidden">
            <img 
              src={service.images[0]} 
              alt={service.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200"></div>
            <div className="relative z-10">
              <CategoryIcon className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-gray-400 group-hover:text-gray-500 transition-colors duration-300" />
            </div>
          </div>
        )}
        
        {/* Overlay con badges mejorado */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-2 z-20">
          <Badge className={`bg-gradient-to-r ${categoryInfo.color} text-white border-0 shadow-md backdrop-blur-sm text-xs`}>
            <CategoryIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
            <span className="hidden sm:inline">{categoryInfo.name}</span>
            <span className="sm:hidden">{categoryInfo.name.substring(0, 3)}</span>
          </Badge>
          {service.featured && (
            <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-md backdrop-blur-sm text-xs">
              <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
              <span className="hidden sm:inline">Destacado</span>
              <span className="sm:hidden">★</span>
            </Badge>
          )}
        </div>

        {/* Status badge mejorado */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20">
          <Badge 
            variant={service.available ? "default" : "secondary"}
            className={`${service.available ? 'bg-green-500/90 text-white border-0' : 'bg-gray-500/90 text-white border-0'} shadow-md backdrop-blur-sm text-xs`}
          >
            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1 sm:mr-2 ${service.available ? 'bg-green-300' : 'bg-gray-300'}`}></div>
            <span className="hidden sm:inline">{service.available ? 'Activo' : 'Inactivo'}</span>
            <span className="sm:hidden">{service.available ? '✓' : '✗'}</span>
          </Badge>
        </div>

        {/* Indicador de imágenes múltiples */}
        {service.images && service.images.length > 1 && (
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-20">
            <Badge className="bg-black/50 text-white border-0 backdrop-blur-sm text-xs">
              <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
              +{service.images.length - 1}
            </Badge>
          </div>
        )}
      </div>

      {/* Contenido de la tarjeta mejorado */}
      <div className="p-3 sm:p-4 md:p-6 relative">
        {/* Título y descripción mejorados */}
        <div className="mb-3 sm:mb-4 md:mb-5">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
            {service.title}
          </h3>
          {service.description && (
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3 leading-relaxed">
              {service.description}
            </p>
          )}
        </div>

        {/* Información del servicio reorganizada */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {/* Precio destacado */}
          <div className="bg-white/70 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Euro className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span className="text-xs sm:text-sm font-semibold text-gray-700">Precio Principal</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">€{service.price}</span>
                {service.age_ranges && service.age_ranges.length > 0 ? (
                  <div className="flex flex-col items-end">
                    <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-300">
                      {service.age_ranges.length} rango{service.age_ranges.length !== 1 ? 's' : ''}
                    </Badge>
                    <span className="text-xs text-indigo-600 mt-1 font-medium">
                      €{service.age_ranges.map(r => r.price).join(' / €')}
                    </span>
                  </div>
                ) : service.price_children ? (
                  <div className="text-right">
                    <span className="text-xs sm:text-sm text-blue-600 font-semibold">€{service.price_children}</span>
                    <div className="text-xs text-gray-500">niños</div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Información adicional en grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            {/* Duración */}
            {service.duration && (
              <div className="flex items-center space-x-2 p-2 sm:p-3 bg-white/50 rounded-lg">
                <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-gray-500">Duración</div>
                  <div className="text-xs sm:text-sm font-semibold text-gray-700 truncate">{formatDuration(service.duration)}</div>
                </div>
              </div>
            )}

            {/* Ubicación */}
            {service.location && (
              <div className="flex items-center space-x-2 p-2 sm:p-3 bg-white/50 rounded-lg">
                <Package className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-gray-500">Ubicación</div>
                  <div className="text-xs sm:text-sm font-semibold text-gray-700 truncate">{service.location}</div>
                </div>
              </div>
            )}

            {/* Grupos */}
            {(service.min_group_size || service.max_group_size) && (
              <div className="flex items-center space-x-2 p-2 sm:p-3 bg-white/50 rounded-lg">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-gray-500">Grupo</div>
                  <div className="text-xs sm:text-sm font-semibold text-gray-700">
                    {service.min_group_size || '0'} - {service.max_group_size || '∞'} pax
                  </div>
                </div>
              </div>
            )}

            {/* Fecha de creación */}
            {service.created_at && (
              <div className="flex items-center space-x-2 p-2 sm:p-3 bg-white/50 rounded-lg">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-gray-500">Creado</div>
                  <div className="text-xs sm:text-sm font-semibold text-gray-700">{formatDate(service.created_at)}</div>
                </div>
              </div>
            )}
          </div>

          {/* Rangos de edad detallados */}
          {service.age_ranges && service.age_ranges.length > 0 && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-indigo-200">
              <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
                <span className="text-xs sm:text-sm font-semibold text-indigo-700">Rangos de Edad</span>
              </div>
              <div className="grid grid-cols-1 gap-1 sm:gap-2">
                {service.age_ranges.slice(0, 3).map((range, index) => (
                  <div key={range.id} className="flex items-center justify-between bg-white rounded-lg p-1.5 sm:p-2">
                    <span className="text-xs text-gray-600 truncate">
                      {range.min_age}-{range.max_age} años {range.description && `(${range.description})`}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-indigo-600 ml-2">€{range.price}</span>
                  </div>
                ))}
                {service.age_ranges.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{service.age_ranges.length - 3} rango(s) más
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción mejorados */}
        <div className="flex items-center space-x-1 sm:space-x-2 pt-2 border-t border-gray-200">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleAvailability(service.id, service.available)}
            className={`flex-1 text-xs sm:text-sm transition-all duration-200 ${service.available 
              ? 'hover:bg-red-50 hover:text-red-600 hover:border-red-300 hover:shadow-sm' 
              : 'hover:bg-green-50 hover:text-green-600 hover:border-green-300 hover:shadow-sm'
            }`}
          >
            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1 sm:mr-2 ${service.available ? 'bg-red-400' : 'bg-green-400'}`}></div>
            <span className="hidden sm:inline">{service.available ? 'Desactivar' : 'Activar'}</span>
            <span className="sm:hidden">{service.available ? 'OFF' : 'ON'}</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(service)}
            className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 hover:shadow-sm transition-all duration-200 text-xs sm:text-sm"
          >
            <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">Editar</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 hover:shadow-sm transition-all duration-200"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente el servicio "{service.title}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(service.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}

// Componente para el formulario de servicios
function ServiceForm({ 
  service, 
  onSubmit, 
  categories, 
  subcategories 
}: { 
  service?: Service
  onSubmit: (data: Partial<Service>) => void
  categories: Array<{id: string, name: string}>
  subcategories: Record<string, Array<{id: string, name: string}>>
}) {
  const [formData, setFormData] = useState({
    title: service?.title || '',
    description: service?.description || '',
    category_id: service?.category_id || '',
    subcategory_id: service?.subcategory_id || '',
    price: service?.price?.toString() || '',
    location: service?.location || '',
    duration: service?.duration?.toString() || '',
    min_group_size: service?.min_group_size?.toString() || '',
    max_group_size: service?.max_group_size?.toString() || '',
    difficulty_level: service?.difficulty_level || '',
    vehicle_type: service?.vehicle_type || '',
    characteristics: service?.characteristics || '',
    insurance_included: service?.insurance_included || false,
    fuel_included: service?.fuel_included || false,
    menu: service?.menu || '',
    capacity: service?.capacity?.toString() || '',
    price_type: service?.price_type || 'per_person',
    min_age: service?.min_age?.toString() || '',
    license_required: service?.license_required || false,
    permit_required: service?.permit_required || false,
    activity_type: service?.activity_type || '',
    fitness_level_required: service?.fitness_level_required || '',
    cancellation_policy: service?.cancellation_policy || '',
    itinerary: service?.itinerary || '',
    meeting_point_details: service?.meeting_point_details || '',
    transmission: service?.transmission || '',
    seats: service?.seats?.toString() || '',
    doors: service?.doors?.toString() || '',
    fuel_policy: service?.fuel_policy || '',
    deposit_required: service?.deposit_required || false,
    deposit_amount: service?.deposit_amount?.toString() || '',
    experience_type: service?.experience_type || '',
    chef_name: service?.chef_name || '',
    drink_options: service?.drink_options || '',
    ambience: service?.ambience || '',
    price_children: service?.price_children?.toString() || '',
    precio_ninos: service?.precio_ninos?.toString() || '',
    edad_maxima_ninos: service?.edad_maxima_ninos?.toString() || '',
    age_ranges: service?.age_ranges || [],
    available: service?.available ?? true,
    featured: service?.featured ?? false,
    images: service?.images || [],
    what_to_bring: service?.what_to_bring || [],
    included_services: service?.included_services || [],
    not_included_services: service?.not_included_services || []
  })

  const [selectedSubcategories, setSelectedSubcategories] = useState<Array<{id: string, name: string}>>([])

  useEffect(() => {
    if (formData.category_id && subcategories[formData.category_id]) {
      setSelectedSubcategories(subcategories[formData.category_id])
    } else {
      setSelectedSubcategories([])
    }
  }, [formData.category_id, subcategories])

  // Funciones para manejar rangos de edad
  const addAgeRange = () => {
    const newRange: AgeRange = {
      id: Date.now().toString(),
      min_age: 0,
      max_age: 17,
      price: 0,
      description: ''
    }
    setFormData({
      ...formData,
      age_ranges: [...(formData.age_ranges || []), newRange]
    })
  }

  const removeAgeRange = (id: string) => {
    setFormData({
      ...formData,
      age_ranges: formData.age_ranges?.filter(range => range.id !== id) || []
    })
  }

  const updateAgeRange = (id: string, field: keyof AgeRange, value: string | number) => {
    setFormData({
      ...formData,
      age_ranges: formData.age_ranges?.map(range => 
        range.id === id ? { ...range, [field]: value } : range
      ) || []
    })
  }

  const validateAgeRanges = (ranges: AgeRange[]): boolean => {
    if (!ranges || ranges.length === 0) return true
    
    // Verificar que no haya rangos superpuestos
    for (let i = 0; i < ranges.length; i++) {
      for (let j = i + 1; j < ranges.length; j++) {
        const range1 = ranges[i]
        const range2 = ranges[j]
        
        // Verificar superposición
        if (!(range1.max_age < range2.min_age || range2.max_age < range1.min_age)) {
          return false
        }
      }
      
      // Verificar que min_age <= max_age
      if (ranges[i].min_age > ranges[i].max_age) {
        return false
      }
    }
    
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar rangos de edad
    if (formData.age_ranges && formData.age_ranges.length > 0) {
      if (!validateAgeRanges(formData.age_ranges)) {
        toast.error('Los rangos de edad no pueden superponerse y la edad mínima debe ser menor o igual a la máxima')
        return
      }
    }
    
    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      min_group_size: formData.min_group_size ? parseInt(formData.min_group_size) : undefined,
      max_group_size: formData.max_group_size ? parseInt(formData.max_group_size) : undefined,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      min_age: formData.min_age ? parseInt(formData.min_age) : undefined,
      seats: formData.seats ? parseInt(formData.seats) : undefined,
      doors: formData.doors ? parseInt(formData.doors) : undefined,
      price_children: formData.price_children ? parseFloat(formData.price_children) : undefined,
      precio_ninos: formData.precio_ninos ? parseFloat(formData.precio_ninos) : undefined,
      edad_maxima_ninos: formData.edad_maxima_ninos ? parseInt(formData.edad_maxima_ninos) : undefined,
      deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : undefined,
      age_ranges: formData.age_ranges && formData.age_ranges.length > 0 ? formData.age_ranges : undefined,
      ...(service && { id: service.id })
    }

    onSubmit(submitData)
  }

  const difficultyLevels = [
    { id: 'facil', name: 'Fácil' },
    { id: 'medio', name: 'Medio' },
    { id: 'dificil', name: 'Difícil' },
    { id: 'experto', name: 'Experto' }
  ]

  const priceTypes = [
    { id: 'per_person', name: 'Por Persona' },
    { id: 'per_group', name: 'Por Grupo' },
    { id: 'per_hour', name: 'Por Hora' },
    { id: 'per_day', name: 'Por Día' }
  ]

  const activityTypes = [
    { id: 'Actividad acuática', name: 'Actividad Acuática' },
    { id: 'Avistamiento de Cetáceos', name: 'Avistamiento de Cetáceos' },
    { id: 'Tour terrestre', name: 'Tour Terrestre' },
    { id: 'Actividad de aventura', name: 'Actividad de Aventura' },
    { id: 'Experiencia gastronómica', name: 'Experiencia Gastronómica' },
    { id: 'Tour cultural', name: 'Tour Cultural' }
  ]

  const fitnessLevels = [
    { id: 'bajo', name: 'Bajo' },
    { id: 'medio', name: 'Medio' },
    { id: 'alto', name: 'Alto' },
    { id: 'muy_alto', name: 'Muy Alto' }
  ]

  const transmissionTypes = [
    { id: 'manual', name: 'Manual' },
    { id: 'automatico', name: 'Automático' },
    { id: 'hibrido', name: 'Híbrido' },
    { id: 'electrico', name: 'Eléctrico' }
  ]

  // Función para determinar qué campos mostrar según la categoría
  const getFieldsForCategory = (categoryId: string) => {
    const fields = {
      // Campos básicos que siempre se muestran
      basic: ['title', 'description', 'category_id', 'subcategory_id', 'price', 'price_type', 'location', 'duration', 'available', 'featured'],
      
      // Campos para actividades acuáticas
      actividades: ['min_group_size', 'max_group_size', 'difficulty_level', 'activity_type', 'fitness_level_required', 'min_age', 'characteristics', 'meeting_point_details', 'itinerary', 'cancellation_policy', 'price_children', 'edad_maxima_ninos'],
      
      // Campos para alquiler de vehículos (coches, motos, etc.)
      renting: ['vehicle_type', 'transmission', 'capacity', 'seats', 'doors', 'fuel_policy', 'insurance_included', 'fuel_included', 'license_required', 'permit_required', 'deposit_required', 'deposit_amount'],
      
      // Campos para experiencias gastronómicas
      gastronomia: ['menu', 'dietary_options', 'chef_name', 'drink_options', 'ambience', 'experience_type', 'capacity'],
      
      // Campos para alojamientos
      alojamiento: ['capacity', 'characteristics', 'cancellation_policy', 'deposit_required', 'deposit_amount'],
      
      // Campos para tours y excursiones
      tours: ['min_group_size', 'max_group_size', 'difficulty_level', 'fitness_level_required', 'itinerary', 'meeting_point_details', 'guide_languages', 'what_to_bring', 'included_services', 'not_included_services', 'cancellation_policy']
    }

    // Retornar campos básicos + campos específicos de la categoría
    const categoryFields = fields[categoryId as keyof typeof fields] || []
    return [...fields.basic, ...categoryFields]
  }

  // Determinar qué secciones mostrar según la categoría
  const shouldShowSection = (sectionName: string) => {
    const visibleFields = getFieldsForCategory(formData.category_id)
    
    const sectionFields = {
      'basic': ['title', 'description', 'category_id', 'subcategory_id'],
      'pricing': ['price', 'price_type', 'price_children', 'precio_ninos', 'edad_maxima_ninos', 'min_age'],
      'details': ['duration', 'location', 'min_group_size', 'max_group_size', 'difficulty_level', 'activity_type', 'fitness_level_required', 'characteristics', 'meeting_point_details', 'itinerary'],
      'vehicles': ['vehicle_type', 'transmission', 'seats', 'doors', 'fuel_policy', 'insurance_included', 'fuel_included', 'license_required', 'permit_required'],
      'policies': ['cancellation_policy', 'deposit_required', 'deposit_amount'],
      'gastronomy': ['menu', 'dietary_options', 'chef_name', 'drink_options', 'ambience', 'experience_type', 'capacity'],
      'config': ['available', 'featured']
    }

    const fields = sectionFields[sectionName as keyof typeof sectionFields] || []
    return fields.some(field => visibleFields.includes(field))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Sección 1: Información Básica */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Información Básica</h3>
            <p className="text-sm text-blue-700">Define los datos principales del servicio</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
              Título del Servicio *
              <span className="text-xs font-normal text-gray-500 ml-2">
                Nombre atractivo que aparecerá en el catálogo
              </span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
              placeholder="Ej: Tour del Teide - Experiencia Volcánica"
              className="mt-1 h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
              Descripción Detallada
              <span className="text-xs font-normal text-gray-500 ml-2">
                Explica qué incluye el servicio y qué experiencia ofreces
              </span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe la experiencia completa, qué verán, qué harán y por qué es especial..."
              rows={4}
              className="mt-1 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
            />
          </div>

          <div>
            <Label htmlFor="category_id" className="text-sm font-semibold text-gray-700">
              Categoría Principal *
              <span className="text-xs font-normal text-gray-500 ml-2">
                Tipo principal de servicio que ofreces
              </span>
            </Label>
            <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value, subcategory_id: ''})}>
              <SelectTrigger className="mt-1 h-11 border-gray-200 focus:border-blue-300">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subcategory_id" className="text-sm font-semibold text-gray-700">
              Subcategoría *
              <span className="text-xs font-normal text-gray-500 ml-2">
                Especifica el tipo exacto de actividad
              </span>
            </Label>
            <Select 
              value={formData.subcategory_id} 
              onValueChange={(value) => setFormData({...formData, subcategory_id: value})}
              disabled={!formData.category_id}
            >
              <SelectTrigger className="mt-1 h-11 border-gray-200 focus:border-blue-300">
                <SelectValue placeholder={formData.category_id ? "Seleccionar subcategoría" : "Primero selecciona una categoría"} />
              </SelectTrigger>
              <SelectContent>
                {selectedSubcategories.map(subcategory => (
                  <SelectItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Indicador de Campos Visibles */}
      {formData.category_id && (
        <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-3 h-3 text-blue-600" />
            </div>
            <h4 className="text-sm font-semibold text-gray-700">
              Campos visibles para: {categories.find(c => c.id === formData.category_id)?.name || 'Categoría seleccionada'}
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {shouldShowSection('pricing') && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">💰 Precios</span>}
            {shouldShowSection('details') && <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">🎯 Detalles</span>}
            {shouldShowSection('vehicles') && <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">🚗 Vehículos</span>}
            {shouldShowSection('policies') && <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">📋 Políticas</span>}
            {shouldShowSection('gastronomy') && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">🍽️ Gastronomía</span>}
            {shouldShowSection('config') && <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">⚙️ Configuración</span>}
          </div>
        </div>
      )}

      {/* Sección 2: Imágenes del Servicio */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-200 shadow-lg">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-purple-900">Imágenes del Servicio</h3>
            <p className="text-purple-700">Sube imágenes atractivas que muestren tu servicio</p>
          </div>
        </div>
        
        <ImageUpload
          images={formData.images}
          onImagesChange={(images) => setFormData({...formData, images})}
          maxImages={10}
          bucketName="service-images"
          folderPath="services"
        />
      </div>

      {/* Sección 3: Precios y Tarifas */}
      {shouldShowSection('pricing') && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-200 shadow-lg">
          {/* Header mejorado */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Euro className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-900">💰 Precios y Tarifas</h3>
                <p className="text-green-700 font-medium">Configura la estructura de precios de tu servicio</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm font-medium text-green-700">Configuración de Precios</span>
            </div>
          </div>

          {/* Precio Principal */}
          <div className="bg-white rounded-xl p-6 border border-green-200 shadow-sm mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Euro className="w-4 h-4 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Precio Principal</h4>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="price" className="text-sm font-bold text-gray-700 flex items-center space-x-2">
                  <span>Precio Adultos (€) *</span>
                  <Badge variant="destructive" className="text-xs">Requerido</Badge>
                </Label>
                <div className="relative mt-2">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                    placeholder="85.00"
                    className="pl-10 h-12 text-lg font-semibold border-gray-200 focus:border-green-400 focus:ring-green-200"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                  <span>💡</span>
                  <span>Precio base por persona adulta</span>
                </p>
              </div>

              <div>
                <Label htmlFor="price_type" className="text-sm font-bold text-gray-700">
                  Tipo de Precio *
                </Label>
                <Select value={formData.price_type} onValueChange={(value) => setFormData({...formData, price_type: value})}>
                  <SelectTrigger className="mt-2 h-12 border-gray-200 focus:border-green-400">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center space-x-2">
                          <span>{type.name}</span>
                          {type.id === 'per_person' && <span className="text-xs text-gray-500">(Más común)</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                  <span>📊</span>
                  <span>Cómo se aplica el precio</span>
                </p>
              </div>
            </div>
          </div>

          {/* Precios para Niños */}
          <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Precios para Niños</h4>
              <Badge variant="outline" className="text-blue-600 border-blue-300">Opcional</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="price_children" className="text-sm font-semibold text-gray-700">
                  Precio Niños (€)
                </Label>
                <div className="relative mt-2">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="price_children"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price_children}
                    onChange={(e) => setFormData({...formData, price_children: e.target.value})}
                    placeholder="65.00"
                    className="pl-10 h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-200"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Precio estándar para niños</p>
              </div>

              <div>
                <Label htmlFor="precio_ninos" className="text-sm font-semibold text-gray-700">
                  Precio Niños Alt. (€)
                </Label>
                <div className="relative mt-2">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="precio_ninos"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio_ninos}
                    onChange={(e) => setFormData({...formData, precio_ninos: e.target.value})}
                    placeholder="50.00"
                    className="pl-10 h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-200"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Precio alternativo o promocional</p>
              </div>

              <div>
                <Label htmlFor="edad_maxima_ninos" className="text-sm font-semibold text-gray-700">
                  Edad Máxima Niños
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="edad_maxima_ninos"
                    type="number"
                    min="0"
                    max="17"
                    value={formData.edad_maxima_ninos}
                    onChange={(e) => setFormData({...formData, edad_maxima_ninos: e.target.value})}
                    placeholder="12"
                    className="h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-200 text-center"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">años</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Hasta qué edad aplica el precio de niños</p>
              </div>
            </div>
          </div>

          {/* Restricciones de Edad */}
          <div className="bg-white rounded-xl p-6 border border-orange-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Restricciones de Edad</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="min_age" className="text-sm font-semibold text-gray-700">
                  Edad Mínima Requerida
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="min_age"
                    type="number"
                    min="0"
                    max="99"
                    value={formData.min_age}
                    onChange={(e) => setFormData({...formData, min_age: e.target.value})}
                    placeholder="18"
                    className="h-11 border-gray-200 focus:border-orange-400 focus:ring-orange-200 text-center"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">años</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                  <span>⚠️</span>
                  <span>Edad mínima para participar en la actividad</span>
                </p>
              </div>

              <div className="flex items-center justify-center">
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-sm font-medium text-orange-700 mb-1">💡 Información</div>
                  <div className="text-xs text-orange-600">
                    Los precios para niños solo aplican si se configuran los campos anteriores
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen de Precios */}
          {(formData.price || formData.price_children || formData.precio_ninos || (formData.age_ranges && formData.age_ranges.length > 0)) && (
            <div className="mt-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-6 border border-green-300">
              <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Resumen de Precios Configurados</span>
              </h4>
              
              {/* Información sobre rangos de edad */}
              {formData.age_ranges && formData.age_ranges.length > 0 && (
                <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-700">
                      Tienes {formData.age_ranges.length} rango(s) de edad personalizado(s) configurado(s)
                    </span>
                  </div>
                  <div className="text-xs text-indigo-600 mt-1">
                    Los precios estándar de niños se ignorarán cuando uses rangos de edad
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formData.price && (
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="text-sm font-medium text-gray-600">Adultos</div>
                    <div className="text-2xl font-bold text-green-600">€{formData.price}</div>
                    <div className="text-xs text-gray-500">{priceTypes.find(p => p.id === formData.price_type)?.name || 'Por persona'}</div>
                  </div>
                )}
                {formData.price_children && !(formData.age_ranges && formData.age_ranges.length > 0) && (
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="text-sm font-medium text-gray-600">Niños</div>
                    <div className="text-2xl font-bold text-blue-600">€{formData.price_children}</div>
                    <div className="text-xs text-gray-500">Hasta {formData.edad_maxima_ninos || '12'} años</div>
                  </div>
                )}
                {formData.precio_ninos && !(formData.age_ranges && formData.age_ranges.length > 0) && (
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <div className="text-sm font-medium text-gray-600">Niños Alt.</div>
                    <div className="text-2xl font-bold text-purple-600">€{formData.precio_ninos}</div>
                    <div className="text-xs text-gray-500">Precio alternativo</div>
                  </div>
                )}
                {formData.age_ranges && formData.age_ranges.length > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-indigo-200">
                    <div className="text-sm font-medium text-gray-600">Rangos de Edad</div>
                    <div className="text-2xl font-bold text-indigo-600">{formData.age_ranges.length}</div>
                    <div className="text-xs text-gray-500">rangos personalizados</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sección 3.5: Rangos de Edad Personalizados */}
      {shouldShowSection('pricing') && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-200 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-indigo-900">🎯 Precios por Rangos de Edad</h3>
                <p className="text-indigo-700 font-medium">Configura precios específicos para diferentes edades</p>
              </div>
            </div>
            <Button 
              type="button"
              onClick={addAgeRange}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir Rango
            </Button>
          </div>

          {/* Información */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">💡 Cómo funciona</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Define rangos de edad específicos (ej: 3-5 años, 6-12 años, 13-17 años)</li>
                  <li>• Cada rango puede tener un precio diferente</li>
                  <li>• Los rangos no pueden superponerse</li>
                  <li>• Si no defines rangos, se usan los precios estándar de niños</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Lista de Rangos */}
          {formData.age_ranges && formData.age_ranges.length > 0 ? (
              <div className="space-y-4">
              {formData.age_ranges.map((range, index) => (
                <div key={range.id} className="bg-white rounded-xl p-6 border border-indigo-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-indigo-600">#{index + 1}</span>
                    </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Rango de Edad {index + 1}
                      </h4>
                      </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAgeRange(range.id)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                      </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">
                        Edad Mínima
                      </Label>
                      <div className="relative mt-2">
                        <Input
                          type="number"
                          min="0"
                          max="17"
                          value={range.min_age}
                          onChange={(e) => updateAgeRange(range.id, 'min_age', parseInt(e.target.value) || 0)}
                          className="h-11 border-gray-200 focus:border-indigo-400 focus:ring-indigo-200 text-center"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">años</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-700">
                        Edad Máxima
                      </Label>
                      <div className="relative mt-2">
                        <Input
                          type="number"
                          min="0"
                          max="17"
                          value={range.max_age}
                          onChange={(e) => updateAgeRange(range.id, 'max_age', parseInt(e.target.value) || 0)}
                          className="h-11 border-gray-200 focus:border-indigo-400 focus:ring-indigo-200 text-center"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">años</span>
                    </div>
                  </div>
                  
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">
                        Precio (€)
                      </Label>
                      <div className="relative mt-2">
                        <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={range.price}
                          onChange={(e) => updateAgeRange(range.id, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="pl-10 h-11 border-gray-200 focus:border-indigo-400 focus:ring-indigo-200"
                        />
                    </div>
                      </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-700">
                        Descripción
                      </Label>
                      <Input
                        type="text"
                        value={range.description}
                        onChange={(e) => updateAgeRange(range.id, 'description', e.target.value)}
                        placeholder="ej: Niños pequeños"
                        className="mt-2 h-11 border-gray-200 focus:border-indigo-400 focus:ring-indigo-200"
                      />
                      </div>
                      </div>

                  {/* Validación visual */}
                  {range.min_age > range.max_age && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <X className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-700">
                          La edad mínima no puede ser mayor que la máxima
                        </span>
                    </div>
                  </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay rangos de edad configurados</h3>
              <p className="text-gray-600 mb-4">Añade rangos de edad para ofrecer precios específicos por edad</p>
              <Button 
                type="button"
                onClick={addAgeRange}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear primer rango
              </Button>
            </div>
          )}

          {/* Resumen de Rangos */}
          {formData.age_ranges && formData.age_ranges.length > 0 && (
            <div className="mt-6 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl p-6 border border-indigo-300">
              <h4 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Resumen de Rangos de Edad</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formData.age_ranges.map((range, index) => (
                  <div key={range.id} className="bg-white rounded-lg p-4 border border-indigo-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-gray-600">
                        Rango {index + 1}
                    </div>
                      <div className="text-2xl font-bold text-indigo-600">
                        €{range.price}
                      </div>
                      </div>
                    <div className="text-xs text-gray-500">
                      {range.min_age} - {range.max_age} años
                      </div>
                    {range.description && (
                      <div className="text-xs text-indigo-600 mt-1">
                        {range.description}
                    </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sección 4: Detalles del Servicio */}
      {shouldShowSection('details') && (
        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4 text-purple-600" />
                    </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-900">Detalles del Servicio</h3>
            <p className="text-sm text-purple-700">Especifica duración, ubicación y características</p>
                      </div>
                      </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="duration" className="text-sm font-semibold text-gray-700">
              Duración (minutos)
              <span className="text-xs font-normal text-gray-500 ml-2">
                Tiempo total que dura la actividad
              </span>
            </Label>
            <Input
              id="duration"
              type="number"
              min="0"
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
              placeholder="480 (8 horas)"
              className="mt-1 h-11 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Tip: 60 minutos = 1 hora, 480 minutos = 8 horas
            </p>
                      </div>

          <div>
            <Label htmlFor="location" className="text-sm font-semibold text-gray-700">
              Ubicación/Punto de Encuentro
              <span className="text-xs font-normal text-gray-500 ml-2">
                Dónde comienza o se realiza la actividad
              </span>
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="Puerto Colón, Costa Adeje - Pantalán 3"
              className="mt-1 h-11 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
            />
                    </div>
                  </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div>
            <Label htmlFor="min_group_size" className="text-sm font-semibold text-gray-700">
              Grupo Mínimo
              <span className="text-xs font-normal text-gray-500 ml-2">
                Número mínimo de personas para realizar la actividad
              </span>
            </Label>
            <Input
              id="min_group_size"
              type="number"
              min="1"
              value={formData.min_group_size}
              onChange={(e) => setFormData({...formData, min_group_size: e.target.value})}
              placeholder="2"
              className="mt-1 h-11 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
            />
                </div>

          <div>
            <Label htmlFor="max_group_size" className="text-sm font-semibold text-gray-700">
              Grupo Máximo
              <span className="text-xs font-normal text-gray-500 ml-2">
                Número máximo de personas por grupo
              </span>
            </Label>
            <Input
              id="max_group_size"
              type="number"
              min="1"
              value={formData.max_group_size}
              onChange={(e) => setFormData({...formData, max_group_size: e.target.value})}
              placeholder="12"
              className="mt-1 h-11 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
            />
              </div>

          <div>
            <Label htmlFor="difficulty_level" className="text-sm font-semibold text-gray-700">
              Nivel de Dificultad
              <span className="text-xs font-normal text-gray-500 ml-2">
                Qué tan exigente es físicamente la actividad
              </span>
            </Label>
            <Select value={formData.difficulty_level} onValueChange={(value) => setFormData({...formData, difficulty_level: value})}>
              <SelectTrigger className="mt-1 h-11 border-gray-200 focus:border-purple-300">
                <SelectValue placeholder="Seleccionar nivel" />
              </SelectTrigger>
              <SelectContent>
                {difficultyLevels.map(level => (
                  <SelectItem key={level.id} value={level.id}>
                    <div className="flex items-center space-x-2">
                      <span>{level.name}</span>
                      {level.id === 'facil' && <span className="text-xs text-green-600">(Cualquier edad)</span>}
                      {level.id === 'medio' && <span className="text-xs text-yellow-600">(Mayores de 8 años)</span>}
                      {level.id === 'dificil' && <span className="text-xs text-orange-600">(Mayores de 12 años)</span>}
                      {level.id === 'experto' && <span className="text-xs text-red-600">(Mayores de 16 años)</span>}
        </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <Label htmlFor="activity_type" className="text-sm font-semibold text-gray-700">
              Tipo de Actividad
              <span className="text-xs font-normal text-gray-500 ml-2">
                Categorización específica del servicio
              </span>
            </Label>
            <Select value={formData.activity_type} onValueChange={(value) => setFormData({...formData, activity_type: value})}>
              <SelectTrigger className="mt-1 h-11 border-gray-200 focus:border-purple-300">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fitness_level_required" className="text-sm font-semibold text-gray-700">
              Nivel de Forma Física
              <span className="text-xs font-normal text-gray-500 ml-2">
                Exigencia física requerida
              </span>
            </Label>
            <Select value={formData.fitness_level_required} onValueChange={(value) => setFormData({...formData, fitness_level_required: value})}>
              <SelectTrigger className="mt-1 h-11 border-gray-200 focus:border-purple-300">
                <SelectValue placeholder="Seleccionar nivel" />
              </SelectTrigger>
              <SelectContent>
                {fitnessLevels.map(level => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6">
          <Label htmlFor="characteristics" className="text-sm font-semibold text-gray-700">
            Características Especiales
            <span className="text-xs font-normal text-gray-500 ml-2">
              Detalles únicos o especiales del servicio
            </span>
          </Label>
          <Textarea
            id="characteristics"
            value={formData.characteristics}
            onChange={(e) => setFormData({...formData, characteristics: e.target.value})}
            placeholder="Incluye: Guía profesional, equipo de seguridad, fotos submarinas..."
            className="mt-1 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
            rows={3}
          />
        </div>

        <div className="mt-6">
          <Label htmlFor="meeting_point_details" className="text-sm font-semibold text-gray-700">
            Detalles del Punto de Encuentro
            <span className="text-xs font-normal text-gray-500 ml-2">
              Instrucciones específicas para llegar al punto de encuentro
            </span>
          </Label>
          <Textarea
            id="meeting_point_details"
            value={formData.meeting_point_details}
            onChange={(e) => setFormData({...formData, meeting_point_details: e.target.value})}
            placeholder="Nos encontramos en el Pantalán 3 del Puerto Colón. Busca el barco 'Blue Ocean' con bandera azul..."
            className="mt-1 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
            rows={3}
          />
        </div>

        <div className="mt-6">
          <Label htmlFor="itinerary" className="text-sm font-semibold text-gray-700">
            Itinerario Detallado
            <span className="text-xs font-normal text-gray-500 ml-2">
              Descripción paso a paso de la actividad
            </span>
          </Label>
          <Textarea
            id="itinerary"
            value={formData.itinerary}
            onChange={(e) => setFormData({...formData, itinerary: e.target.value})}
            placeholder="1. Recepción y briefing de seguridad (15 min)&#10;2. Salida hacia Los Gigantes (45 min)&#10;3. Avistamiento de delfines (30 min)&#10;4. Tiempo libre para nadar (45 min)..."
            className="mt-1 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
            rows={4}
          />
        </div>
        </div>
      )}

      {/* Sección 5: Información de Vehículos (para servicios que incluyan vehículos) */}
      {shouldShowSection('vehicles') && (
        <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-indigo-900">Información de Vehículos</h3>
            <p className="text-sm text-indigo-700">Especifica detalles del vehículo (si aplica)</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="vehicle_type" className="text-sm font-semibold text-gray-700">
              Tipo de Vehículo
              <span className="text-xs font-normal text-gray-500 ml-2">
                Qué tipo de vehículo se utiliza
              </span>
            </Label>
            <Input
              id="vehicle_type"
              value={formData.vehicle_type}
              onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
              placeholder="Catamarán, Lancha rápida, Jeep, etc."
              className="mt-1 h-11 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
            />
          </div>

          <div>
            <Label htmlFor="transmission" className="text-sm font-semibold text-gray-700">
              Transmisión
              <span className="text-xs font-normal text-gray-500 ml-2">
                Tipo de transmisión del vehículo
              </span>
            </Label>
            <Select value={formData.transmission} onValueChange={(value) => setFormData({...formData, transmission: value})}>
              <SelectTrigger className="mt-1 h-11 border-gray-200 focus:border-indigo-300">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {transmissionTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="capacity" className="text-sm font-semibold text-gray-700">
              Capacidad Total
              <span className="text-xs font-normal text-gray-500 ml-2">
                Número total de personas que puede transportar
              </span>
            </Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: e.target.value})}
              placeholder="12"
              className="mt-1 h-11 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div>
            <Label htmlFor="seats" className="text-sm font-semibold text-gray-700">
              Número de Asientos
              <span className="text-xs font-normal text-gray-500 ml-2">
                Cantidad de asientos disponibles
              </span>
            </Label>
            <Input
              id="seats"
              type="number"
              min="1"
              value={formData.seats}
              onChange={(e) => setFormData({...formData, seats: e.target.value})}
              placeholder="8"
              className="mt-1 h-11 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
            />
          </div>

          <div>
            <Label htmlFor="doors" className="text-sm font-semibold text-gray-700">
              Número de Puertas
              <span className="text-xs font-normal text-gray-500 ml-2">
                Cantidad de puertas del vehículo
              </span>
            </Label>
            <Input
              id="doors"
              type="number"
              min="0"
              value={formData.doors}
              onChange={(e) => setFormData({...formData, doors: e.target.value})}
              placeholder="4"
              className="mt-1 h-11 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
            />
          </div>

          <div>
            <Label htmlFor="fuel_policy" className="text-sm font-semibold text-gray-700">
              Política de Combustible
              <span className="text-xs font-normal text-gray-500 ml-2">
                Cómo se maneja el combustible
              </span>
            </Label>
            <Input
              id="fuel_policy"
              value={formData.fuel_policy}
              onChange={(e) => setFormData({...formData, fuel_policy: e.target.value})}
              placeholder="Combustible incluido / Devolver con el mismo nivel"
              className="mt-1 h-11 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="insurance_included"
              checked={formData.insurance_included}
              onChange={(e) => setFormData({...formData, insurance_included: e.target.checked})}
              className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <div>
              <Label htmlFor="insurance_included" className="text-sm font-semibold text-gray-700 cursor-pointer">
                Seguro Incluido
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                El vehículo incluye seguro de responsabilidad civil
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="fuel_included"
              checked={formData.fuel_included}
              onChange={(e) => setFormData({...formData, fuel_included: e.target.checked})}
              className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <div>
              <Label htmlFor="fuel_included" className="text-sm font-semibold text-gray-700 cursor-pointer">
                Combustible Incluido
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                El precio incluye el combustible necesario
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="license_required"
              checked={formData.license_required}
              onChange={(e) => setFormData({...formData, license_required: e.target.checked})}
              className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <div>
              <Label htmlFor="license_required" className="text-sm font-semibold text-gray-700 cursor-pointer">
                Licencia Requerida
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                Se requiere licencia de conducir válida
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="permit_required"
              checked={formData.permit_required}
              onChange={(e) => setFormData({...formData, permit_required: e.target.checked})}
              className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <div>
              <Label htmlFor="permit_required" className="text-sm font-semibold text-gray-700 cursor-pointer">
                Permiso Especial Requerido
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                Se requiere permiso especial (ej: navegación)
              </p>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Sección 6: Políticas y Depósitos */}
      {shouldShowSection('policies') && (
        <div className="bg-red-50 rounded-lg p-6 border border-red-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-900">Políticas y Depósitos</h3>
            <p className="text-sm text-red-700">Configura políticas de cancelación y depósitos</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="cancellation_policy" className="text-sm font-semibold text-gray-700">
              Política de Cancelación
              <span className="text-xs font-normal text-gray-500 ml-2">
                Términos y condiciones de cancelación
              </span>
            </Label>
            <Textarea
              id="cancellation_policy"
              value={formData.cancellation_policy}
              onChange={(e) => setFormData({...formData, cancellation_policy: e.target.value})}
              placeholder="Cancelación gratuita hasta 24 horas antes. Entre 24-12 horas: 50% de reembolso. Menos de 12 horas: sin reembolso."
              className="mt-1 border-gray-200 focus:border-red-300 focus:ring-red-200"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="deposit_amount" className="text-sm font-semibold text-gray-700">
              Monto del Depósito (€)
              <span className="text-xs font-normal text-gray-500 ml-2">
                Depósito requerido para reservar
              </span>
            </Label>
            <Input
              id="deposit_amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.deposit_amount}
              onChange={(e) => setFormData({...formData, deposit_amount: e.target.value})}
              placeholder="100.00"
              className="mt-1 h-11 border-gray-200 focus:border-red-300 focus:ring-red-200"
            />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="deposit_required"
              checked={formData.deposit_required}
              onChange={(e) => setFormData({...formData, deposit_required: e.target.checked})}
              className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <div>
              <Label htmlFor="deposit_required" className="text-sm font-semibold text-gray-700 cursor-pointer">
                Depósito Requerido
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                Se requiere un depósito para confirmar la reserva
              </p>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Sección 6.5: Experiencias Gastronómicas (para servicios de comida) */}
      {shouldShowSection('gastronomy') && (
        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-yellow-900">Experiencias Gastronómicas</h3>
            <p className="text-sm text-yellow-700">Información sobre comida y bebidas (si aplica)</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="menu" className="text-sm font-semibold text-gray-700">
              Menú Incluido
              <span className="text-xs font-normal text-gray-500 ml-2">
                Descripción del menú o comida incluida
              </span>
            </Label>
            <Textarea
              id="menu"
              value={formData.menu}
              onChange={(e) => setFormData({...formData, menu: e.target.value})}
              placeholder="Menú: Ensalada de mariscos, pescado fresco a la plancha, postre tradicional canario, bebidas incluidas"
              className="mt-1 border-gray-200 focus:border-yellow-300 focus:ring-yellow-200"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="drink_options" className="text-sm font-semibold text-gray-700">
              Opciones de Bebidas
              <span className="text-xs font-normal text-gray-500 ml-2">
                Qué bebidas están incluidas o disponibles
              </span>
            </Label>
            <Input
              id="drink_options"
              value={formData.drink_options}
              onChange={(e) => setFormData({...formData, drink_options: e.target.value})}
              placeholder="Agua, refrescos, cerveza, vino local incluido"
              className="mt-1 h-11 border-gray-200 focus:border-yellow-300 focus:ring-yellow-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <Label htmlFor="chef_name" className="text-sm font-semibold text-gray-700">
              Nombre del Chef
              <span className="text-xs font-normal text-gray-500 ml-2">
                Chef responsable de la preparación
              </span>
            </Label>
            <Input
              id="chef_name"
              value={formData.chef_name}
              onChange={(e) => setFormData({...formData, chef_name: e.target.value})}
              placeholder="Chef María González"
              className="mt-1 h-11 border-gray-200 focus:border-yellow-300 focus:ring-yellow-200"
            />
          </div>

          <div>
            <Label htmlFor="ambience" className="text-sm font-semibold text-gray-700">
              Ambiente
              <span className="text-xs font-normal text-gray-500 ml-2">
                Descripción del ambiente y decoración
              </span>
            </Label>
            <Input
              id="ambience"
              value={formData.ambience}
              onChange={(e) => setFormData({...formData, ambience: e.target.value})}
              placeholder="Ambiente romántico con vista al mar, música en vivo"
              className="mt-1 h-11 border-gray-200 focus:border-yellow-300 focus:ring-yellow-200"
            />
          </div>
        </div>

        <div className="mt-6">
          <Label htmlFor="capacity" className="text-sm font-semibold text-gray-700">
            Capacidad del Restaurante
            <span className="text-xs font-normal text-gray-500 ml-2">
              Número máximo de comensales que puede atender
            </span>
          </Label>
          <Input
            id="capacity"
            type="number"
            min="1"
            value={formData.capacity}
            onChange={(e) => setFormData({...formData, capacity: e.target.value})}
            placeholder="50"
            className="mt-1 h-11 border-gray-200 focus:border-yellow-300 focus:ring-yellow-200"
          />
        </div>
        </div>
      )}

      {/* Sección 6.6: Servicios Incluidos y Qué Llevar */}
      {shouldShowSection('details') && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-8 border border-emerald-200 shadow-lg">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-emerald-900">Servicios Incluidos y Qué Llevar</h3>
              <p className="text-emerald-700">Define qué incluye el servicio y qué debe traer el cliente</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Servicios Incluidos */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900">
                    Servicios Incluidos
                  </h4>
                  <p className="text-sm text-gray-600">
                    Lista todos los servicios, equipos y beneficios incluidos en el precio
                  </p>
                </div>
              </div>
              <TagInput
                label=""
                items={formData.included_services}
                setItems={(items) => setFormData({ ...formData, included_services: items })}
                placeholder="Ej: Guía profesional, Seguro de actividad, Equipamiento básico, Transporte, Comida..."
              />
              <div className="grid grid-cols-1 gap-2 text-xs text-gray-500">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Incluye servicios, equipos y beneficios</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Separar cada elemento con Enter</span>
                </div>
              </div>
            </div>

            {/* Qué Llevar */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900">
                    Qué Debe Llevar el Cliente
                  </h4>
                  <p className="text-sm text-gray-600">
                    Especifica qué elementos debe traer el cliente para el servicio
                  </p>
                </div>
              </div>
              <TagInput
                label=""
                items={formData.what_to_bring}
                setItems={(items) => setFormData({ ...formData, what_to_bring: items })}
                placeholder="Ej: Crema solar, Ropa cómoda, Zapatos de senderismo, Cámara, Documentación..."
              />
              <div className="grid grid-cols-1 gap-2 text-xs text-gray-500">
                <div className="flex items-start gap-2">
                  <ClipboardList className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Elementos que el cliente debe traer</span>
                </div>
                <div className="flex items-start gap-2">
                  <ClipboardList className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Incluye ropa, equipos y documentos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Servicios No Incluidos */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <X className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-gray-900">
                  Servicios No Incluidos
                </h4>
                <p className="text-sm text-gray-600">
                  Aclara qué servicios o elementos NO están incluidos en el precio
                </p>
              </div>
            </div>
            <TagInput
              label=""
              items={formData.not_included_services}
              setItems={(items) => setFormData({ ...formData, not_included_services: items })}
              placeholder="Ej: Almuerzo, Bebidas, Propinas, Transporte desde hotel, Seguro adicional..."
            />
            <div className="grid grid-cols-1 gap-2 text-xs text-gray-500">
              <div className="flex items-start gap-2">
                <X className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                <span>Servicios con costo adicional</span>
              </div>
              <div className="flex items-start gap-2">
                <X className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                <span>Evita confusiones sobre el precio</span>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-8 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-medium text-emerald-900 mb-2">💡 Consejos para una buena descripción</h4>
                <ul className="text-sm text-emerald-700 space-y-1">
                  <li>• <strong>Servicios incluidos:</strong> Sé específico sobre qué está cubierto en el precio</li>
                  <li>• <strong>Qué llevar:</strong> Incluye elementos esenciales para la experiencia</li>
                  <li>• <strong>No incluidos:</strong> Aclara costos adicionales para evitar sorpresas</li>
                  <li>• <strong>Separación clara:</strong> Usa una línea por cada elemento para mejor legibilidad</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sección 7: Configuración y Estados */}
      {shouldShowSection('config') && (
        <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-orange-900">Configuración y Estados</h3>
            <p className="text-sm text-orange-700">Define la disponibilidad y visibilidad del servicio</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) => setFormData({...formData, available: e.target.checked})}
                className="mt-1 w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <div>
                <Label htmlFor="available" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Servicio Disponible
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  Cuando esté activado, los clientes podrán reservar este servicio. 
                  Desactívalo para mantenimiento o temporadas cerradas.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                className="mt-1 w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <div>
                <Label htmlFor="featured" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Servicio Destacado
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  Los servicios destacados aparecen en la portada y tienen mayor visibilidad. 
                  Ideal para tus mejores experiencias.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Resumen de Configuración</h4>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${formData.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Estado: {formData.available ? 'Disponible' : 'No disponible'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${formData.featured ? 'bg-purple-500' : 'bg-gray-400'}`}></div>
                <span>Destacado: {formData.featured ? 'Sí' : 'No'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Precio: €{formData.price || '0'} {formData.price_type && `(${priceTypes.find(p => p.id === formData.price_type)?.name})`}</span>
              </div>
              {formData.duration && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>Duración: {formData.duration} min</span>
                </div>
              )}
              {formData.location && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Ubicación: {formData.location}</span>
                </div>
              )}
              {(formData.min_group_size || formData.max_group_size) && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span>Grupo: {formData.min_group_size || '0'}-{formData.max_group_size || '0'} personas</span>
                </div>
              )}
              {formData.difficulty_level && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span>Dificultad: {difficultyLevels.find(d => d.id === formData.difficulty_level)?.name}</span>
                </div>
              )}
              {formData.activity_type && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span>Tipo: {activityTypes.find(a => a.id === formData.activity_type)?.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Botones de Acción */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Los campos marcados con * son obligatorios</span>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            >
              {service ? (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Actualizar Servicio
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Servicio
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}