"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { 
  MapPin, 
  Hotel, 
  Eye, 
  EyeOff, 
  Loader2, 
  Plus, 
  Edit, 
  Trash2,
  Save,
  X,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Download,
  Upload,
  Settings,
  Map,
  Star,
  Euro,
  Calendar,
  Users
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key environment variables.')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface Hotel {
  id: string
  nombre: string
  direccion: string
  lat: number
  lng: number
  visible_en_mapa: boolean
  estrellas?: number
  telefono?: string
  descripcion?: string
}

interface Service {
  id: string
  title: string
  description: string
  price: number
  lat?: number
  lng?: number
  visible_en_mapa?: boolean
  category_id?: string
  available: boolean
  featured: boolean
}

export function MapManager() {
  const queryClient = useQueryClient()
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showAddHotel, setShowAddHotel] = useState(false)
  const [newHotel, setNewHotel] = useState({
    nombre: '',
    direccion: '',
    lat: 28.2916,
    lng: -16.6291,
    estrellas: 4,
    telefono: '',
    descripcion: ''
  })

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'stars' | 'price' | 'created'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [filterStars, setFilterStars] = useState<number[]>([])
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [showOnlyVisible, setShowOnlyVisible] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Fetch hotels
  const { data: hotels, isLoading: hotelsLoading, error: hotelsError } = useQuery<Hotel[]>({
    queryKey: ['adminHotels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hoteles')
        .select('*')
        .order('nombre')
      
      if (error) throw error
      return data || []
    },
  })

  // Fetch services
  const { data: services, isLoading: servicesLoading, error: servicesError } = useQuery<Service[]>({
    queryKey: ['adminServices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('title')
      
      if (error) throw error
      return data || []
    },
  })

  // Update hotel visibility
  const updateHotelVisibility = useMutation({
    mutationFn: async ({ id, visible }: { id: string; visible: boolean }) => {
      const { error } = await supabase
        .from('hoteles')
        .update({ visible_en_mapa: visible })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminHotels'] })
      queryClient.invalidateQueries({ queryKey: ['map-data'] })
      toast.success('Visibilidad del hotel actualizada')
    },
    onError: (err) => {
      toast.error(`Error al actualizar hotel: ${err.message}`)
    },
  })

  // Update service visibility
  const updateServiceVisibility = useMutation({
    mutationFn: async ({ id, visible }: { id: string; visible: boolean }) => {
      const { error } = await supabase
        .from('services')
        .update({ visible_en_mapa: visible })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminServices'] })
      queryClient.invalidateQueries({ queryKey: ['map-data'] })
      toast.success('Visibilidad del servicio actualizada')
    },
    onError: (err) => {
      toast.error(`Error al actualizar servicio: ${err.message}`)
    },
  })

  // Update service coordinates
  const updateServiceCoords = useMutation({
    mutationFn: async ({ id, lat, lng }: { id: string; lat: number; lng: number }) => {
      const { error } = await supabase
        .from('services')
        .update({ lat, lng })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminServices'] })
      queryClient.invalidateQueries({ queryKey: ['map-data'] })
      toast.success('Coordenadas del servicio actualizadas')
    },
    onError: (err) => {
      toast.error(`Error al actualizar coordenadas: ${err.message}`)
    },
  })

  // Add new hotel
  const addHotel = useMutation({
    mutationFn: async (hotelData: typeof newHotel) => {
      const { error } = await supabase
        .from('hoteles')
        .insert([{
          ...hotelData,
          visible_en_mapa: true
        }])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminHotels'] })
      queryClient.invalidateQueries({ queryKey: ['map-data'] })
      setShowAddHotel(false)
      setNewHotel({
        nombre: '',
        direccion: '',
        lat: 28.2916,
        lng: -16.6291,
        estrellas: 4,
        telefono: '',
        descripcion: ''
      })
      toast.success('Hotel añadido correctamente')
    },
    onError: (err) => {
      toast.error(`Error al añadir hotel: ${err.message}`)
    },
  })

  // Funciones de filtrado y ordenamiento
  const filteredAndSortedHotels = useMemo(() => {
    if (!hotels) return []
    
    let filtered = hotels.filter(hotel => {
      // Filtro de búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        if (!hotel.nombre.toLowerCase().includes(searchLower) && 
            !hotel.direccion.toLowerCase().includes(searchLower)) {
          return false
        }
      }
      
      // Filtro de estrellas
      if (filterStars.length > 0 && hotel.estrellas && !filterStars.includes(hotel.estrellas)) {
        return false
      }
      
      // Filtro de visibilidad
      if (showOnlyVisible && !hotel.visible_en_mapa) {
        return false
      }
      
      return true
    })
    
    // Ordenamiento
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.nombre.localeCompare(b.nombre)
          break
        case 'stars':
          comparison = (a.estrellas || 0) - (b.estrellas || 0)
          break
        case 'created':
          comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
          break
        default:
          comparison = 0
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })
    
    return filtered
  }, [hotels, searchTerm, filterStars, showOnlyVisible, sortBy, sortOrder])

  const filteredAndSortedServices = useMemo(() => {
    if (!services) return []
    
    let filtered = services.filter(service => {
      // Filtro de búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        if (!service.title.toLowerCase().includes(searchLower) && 
            !service.description.toLowerCase().includes(searchLower)) {
          return false
        }
      }
      
      // Filtro de categoría
      if (filterCategory !== 'all' && service.category_id !== filterCategory) {
        return false
      }
      
      // Filtro de visibilidad
      if (showOnlyVisible && !service.visible_en_mapa) {
        return false
      }
      
      return true
    })
    
    // Ordenamiento
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title)
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'created':
          comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
          break
        default:
          comparison = 0
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })
    
    return filtered
  }, [services, searchTerm, filterCategory, showOnlyVisible, sortBy, sortOrder])

  // Funciones para acciones masivas
  const toggleAllVisible = (type: 'hotels' | 'services', visible: boolean) => {
    const items = type === 'hotels' ? filteredAndSortedHotels : filteredAndSortedServices
    items.forEach(item => {
      if (type === 'hotels') {
        updateHotelVisibility.mutate({ id: item.id, visible })
      } else {
        updateServiceVisibility.mutate({ id: item.id, visible })
      }
    })
  }

  if (hotelsLoading || servicesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" /> Gestión del Mapa
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Cargando datos del mapa...</span>
        </CardContent>
      </Card>
    )
  }

  if (hotelsError || servicesError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" /> Gestión del Mapa
          </CardTitle>
        </CardHeader>
        <CardContent className="text-red-500">
          Error al cargar datos: {hotelsError?.message || servicesError?.message}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" /> Gestión del Mapa
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Barra de filtros y controles */}
        <div className="mb-6 space-y-4">
          {/* Búsqueda y filtros principales */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar hoteles o servicios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nombre</SelectItem>
                  <SelectItem value="stars">Estrellas</SelectItem>
                  <SelectItem value="price">Precio</SelectItem>
                  <SelectItem value="created">Fecha</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Filtros específicos */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showOnlyVisible"
                checked={showOnlyVisible}
                onCheckedChange={(checked) => setShowOnlyVisible(checked as boolean)}
              />
              <Label htmlFor="showOnlyVisible" className="text-sm">Solo visibles</Label>
            </div>
            
            {/* Filtro de estrellas para hoteles */}
            <div className="flex items-center gap-2">
              <Label className="text-sm">Estrellas:</Label>
              {[1, 2, 3, 4, 5].map(star => (
                <Button
                  key={star}
                  variant={filterStars.includes(star) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setFilterStars(prev => 
                      prev.includes(star) 
                        ? prev.filter(s => s !== star)
                        : [...prev, star]
                    )
                  }}
                  className="h-8 w-8 p-0"
                >
                  {star}⭐
                </Button>
              ))}
            </div>

            {/* Filtro de categoría para servicios */}
            <div className="flex items-center gap-2">
              <Label className="text-sm">Categoría:</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="aventura">Aventura</SelectItem>
                  <SelectItem value="relax">Relax</SelectItem>
                  <SelectItem value="cultura">Cultura</SelectItem>
                  <SelectItem value="gastronomia">Gastronomía</SelectItem>
                  <SelectItem value="transporte">Transporte</SelectItem>
                  <SelectItem value="excursion">Excursión</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botones de acción masiva */}
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAllVisible('hotels', true)}
                className="flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                Mostrar Hoteles
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAllVisible('services', true)}
                className="flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                Mostrar Servicios
              </Button>
            </div>
          </div>
        </div>
        <Tabs defaultValue="hotels" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hotels" className="flex items-center gap-2">
              <Hotel className="h-4 w-4" />
              Hoteles ({filteredAndSortedHotels.length})
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Servicios ({filteredAndSortedServices.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab de Hoteles */}
          <TabsContent value="hotels" className="space-y-4">
            {/* Botón para añadir hotel */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Gestión de Hoteles</h3>
              <Button
                onClick={() => setShowAddHotel(!showAddHotel)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {showAddHotel ? 'Cancelar' : 'Añadir Hotel'}
              </Button>
            </div>

            {/* Formulario para añadir hotel */}
            {showAddHotel && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg">Nuevo Hotel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nombre">Nombre del Hotel</Label>
                      <Input
                        id="nombre"
                        value={newHotel.nombre}
                        onChange={(e) => setNewHotel(prev => ({ ...prev, nombre: e.target.value }))}
                        placeholder="Ej: Hotel Paradise Tenerife"
                      />
                    </div>
                    <div>
                      <Label htmlFor="direccion">Dirección</Label>
                      <Input
                        id="direccion"
                        value={newHotel.direccion}
                        onChange={(e) => setNewHotel(prev => ({ ...prev, direccion: e.target.value }))}
                        placeholder="Ej: Calle Principal 123, Santa Cruz"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lat">Latitud</Label>
                      <Input
                        id="lat"
                        type="number"
                        step="any"
                        value={newHotel.lat}
                        onChange={(e) => setNewHotel(prev => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))}
                        placeholder="28.2916"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lng">Longitud</Label>
                      <Input
                        id="lng"
                        type="number"
                        step="any"
                        value={newHotel.lng}
                        onChange={(e) => setNewHotel(prev => ({ ...prev, lng: parseFloat(e.target.value) || 0 }))}
                        placeholder="-16.6291"
                      />
                    </div>
                    <div>
                      <Label htmlFor="estrellas">Estrellas</Label>
                      <Input
                        id="estrellas"
                        type="number"
                        min="1"
                        max="5"
                        value={newHotel.estrellas}
                        onChange={(e) => setNewHotel(prev => ({ ...prev, estrellas: parseInt(e.target.value) || 4 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        value={newHotel.telefono}
                        onChange={(e) => setNewHotel(prev => ({ ...prev, telefono: e.target.value }))}
                        placeholder="+34 922 123 456"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Input
                      id="descripcion"
                      value={newHotel.descripcion}
                      onChange={(e) => setNewHotel(prev => ({ ...prev, descripcion: e.target.value }))}
                      placeholder="Descripción del hotel..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => addHotel.mutate(newHotel)}
                      disabled={!newHotel.nombre || !newHotel.direccion || addHotel.isPending}
                      className="flex items-center gap-2"
                    >
                      {addHotel.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Guardar Hotel
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddHotel(false)}
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {filteredAndSortedHotels.map((hotel) => (
                <div key={hotel.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Hotel className="h-5 w-5 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{hotel.nombre}</h3>
                        <p className="text-sm text-gray-600">{hotel.direccion}</p>
                        {hotel.estrellas && (
                          <Badge variant="secondary" className="mt-1">
                            {hotel.estrellas} ⭐
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={hotel.visible_en_mapa}
                      onCheckedChange={(checked) => 
                        updateHotelVisibility.mutate({ id: hotel.id, visible: checked })
                      }
                      aria-label={`Toggle visibility for ${hotel.nombre}`}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Lat:</span> {hotel.lat}
                    </div>
                    <div>
                      <span className="font-medium">Lng:</span> {hotel.lng}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Tab de Servicios */}
          <TabsContent value="services" className="space-y-4">
            <div className="space-y-4">
              {filteredAndSortedServices.map((service) => (
                <div key={service.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{service.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary">€{service.price}</Badge>
                          {service.category_id && (
                            <Badge variant="outline" className="capitalize">
                              {service.category_id}
                            </Badge>
                          )}
                          {service.featured && (
                            <Badge variant="default" className="bg-yellow-500">
                              Destacado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={service.visible_en_mapa || false}
                      onCheckedChange={(checked) => 
                        updateServiceVisibility.mutate({ id: service.id, visible: checked })
                      }
                      aria-label={`Toggle visibility for ${service.title}`}
                    />
                  </div>
                  
                  {/* Coordenadas del servicio */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Coordenadas del Mapa</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor={`lat-${service.id}`} className="text-xs">Latitud</Label>
                        <Input
                          id={`lat-${service.id}`}
                          type="number"
                          step="any"
                          value={service.lat || ''}
                          onChange={(e) => {
                            const lat = parseFloat(e.target.value)
                            if (!isNaN(lat)) {
                              updateServiceCoords.mutate({ 
                                id: service.id, 
                                lat, 
                                lng: service.lng || 0 
                              })
                            }
                          }}
                          className="h-8 text-xs"
                          placeholder="28.1234"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`lng-${service.id}`} className="text-xs">Longitud</Label>
                        <Input
                          id={`lng-${service.id}`}
                          type="number"
                          step="any"
                          value={service.lng || ''}
                          onChange={(e) => {
                            const lng = parseFloat(e.target.value)
                            if (!isNaN(lng)) {
                              updateServiceCoords.mutate({ 
                                id: service.id, 
                                lat: service.lat || 0, 
                                lng 
                              })
                            }
                          }}
                          className="h-8 text-xs"
                          placeholder="-16.5678"
                        />
                      </div>
                    </div>
                    {(!service.lat || !service.lng) && (
                      <p className="text-xs text-orange-600">
                        ⚠️ Este servicio no aparecerá en el mapa hasta que tenga coordenadas válidas
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}