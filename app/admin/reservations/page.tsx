"use client"

import React, { useState, useEffect } from "react"
import { AdminLayoutModern } from "@/components/admin/admin-layout-modern"
import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, CheckCircle, X, Euro, Users, AlertCircle, Filter, Download, Plus, Eye, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getSupabaseClient } from "@/lib/supabase"

interface Reservation {
  id: string
  user_id: string
  service_id: string
  reservation_date: string
  reservation_time?: string
  guests: number
  total_amount: number
  status: 'pending' | 'confirmed' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'refunded'
  payment_id?: string
  notes?: string
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  special_requests?: string
  order_number?: string
  created_at: string
  updated_at: string
  // Campos relacionados
  service_title?: string
  user_name?: string
  user_email?: string
}

export default function AdminReservations() {
  // Estados principales
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isNewReservationOpen, setIsNewReservationOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)


  // Cargar reservas al montar el componente
  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = async () => {
    setLoading(true)
    try {
      const supabase = await getSupabaseClient()

      // Cargar reservas con información relacionada
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select(`
          *,
          services:service_id (
            title
          ),
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (reservationsError) {
        throw new Error(`Error cargando reservas: ${reservationsError.message}`)
      }

      // Procesar los datos para incluir información relacionada
      const processedReservations: Reservation[] = reservationsData?.map(reservation => ({
        ...reservation,
        service_title: reservation.services?.title || 'Servicio no disponible',
        user_name: reservation.profiles?.full_name || reservation.contact_name || 'Usuario no disponible',
        user_email: reservation.profiles?.email || reservation.contact_email || 'Email no disponible'
      })) || []

      setReservations(processedReservations)
    } catch (error) {
      toast.error('Error cargando reservas')
      setReservations([])
    } finally {
      setLoading(false)
    }
  }

  // Función para exportar reservas
  const handleExport = () => {
    const csvContent = [
      ['ID', 'Cliente', 'Servicio', 'Participantes', 'Fecha', 'Estado', 'Monto', 'Pago'],
      ...reservations.map(res => [
        res.id,
        res.user_name,
        res.service_title,
        res.guests,
        res.reservation_date,
        res.status,
        `€${res.total_amount}`,
        res.payment_status
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `reservas_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Reservas exportadas correctamente')
  }

  // Función para cambiar estado de reserva
  const handleStatusChange = async (reservationId: string, newStatus: 'confirmed' | 'cancelled') => {
    try {
      const supabase = await getSupabaseClient()

      // Actualizar en la base de datos
      const { error } = await supabase
        .from('reservations')
        .update({ 
          status: newStatus,
          payment_status: newStatus === 'confirmed' ? 'paid' : 'refunded',
          updated_at: new Date().toISOString()
        })
        .eq('id', reservationId)

      if (error) {
        throw new Error(`Error actualizando reserva: ${error.message}`)
      }

      // Actualizar el estado local
      setReservations(prev => prev.map(res => 
        res.id === reservationId 
          ? { 
              ...res, 
              status: newStatus, 
              payment_status: newStatus === 'confirmed' ? 'paid' : 'refunded',
              updated_at: new Date().toISOString()
            }
          : res
      ))
      
      toast.success(`Reserva ${newStatus === 'confirmed' ? 'confirmada' : 'cancelada'} correctamente`)
    } catch (error) {
      toast.error('Error actualizando reserva')
    }
  }

  // Función para ver detalles
  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setIsDetailsOpen(true)
  }

  // Función para filtrar reservas
  const filteredReservations = reservations.filter(reservation => {
    const matchesStatus = filterStatus === 'todos' || reservation.status === filterStatus
    const matchesSearch = (reservation.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (reservation.service_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (reservation.contact_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (reservation.order_number || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Función para crear nueva reserva
  const handleNewReservation = async (formData: any) => {
    try {
      const supabase = await getSupabaseClient()

      // Crear nueva reserva en la base de datos
      const { data: newReservation, error } = await supabase
        .from('reservations')
        .insert({
          user_id: formData.user_id || null,
          service_id: formData.service_id,
          reservation_date: formData.date,
          reservation_time: formData.time || null,
          guests: parseInt(formData.participants),
          total_amount: parseFloat(formData.amount),
          status: 'pending',
          payment_status: 'pending',
          notes: formData.notes || null,
          contact_name: formData.customer_name,
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          special_requests: formData.special_requests || null
        })
        .select(`
          *,
          services:service_id (
            title
          ),
          profiles:user_id (
            full_name,
            email
          )
        `)
        .single()

      if (error) {
        throw new Error(`Error creando reserva: ${error.message}`)
      }

      // Procesar la nueva reserva para incluir información relacionada
      const processedReservation: Reservation = {
        ...newReservation,
        service_title: newReservation.services?.title || 'Servicio no disponible',
        user_name: newReservation.profiles?.full_name || newReservation.contact_name || 'Usuario no disponible',
        user_email: newReservation.profiles?.email || newReservation.contact_email || 'Email no disponible'
      }
      
      setReservations(prev => [processedReservation, ...prev])
      setIsNewReservationOpen(false)
      toast.success('Nueva reserva creada correctamente')
    } catch (error) {
      toast.error('Error creando reserva')
    }
  }

  // Estadísticas calculadas
  const stats = {
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
    totalRevenue: reservations
      .filter(r => r.status === 'confirmed')
      .reduce((sum, r) => sum + (r.total_amount || 0), 0)
  }

  return (
    <AdminGuard>
      <AdminLayoutModern>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Reservas</h1>
              <p className="mt-1 text-gray-600">Administra todas las reservas y confirmaciones</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Dialog open={isNewReservationOpen} onOpenChange={setIsNewReservationOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Reserva
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nueva Reserva</DialogTitle>
                  </DialogHeader>
                  <NewReservationForm onSubmit={handleNewReservation} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-md bg-white border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
                <p className="text-xs text-gray-500">Requieren atención</p>
                <div className="mt-2">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {stats.pending > 0 ? 'Acción requerida' : 'Al día'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Confirmadas</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.confirmed}</div>
                <p className="text-xs text-gray-500">Este mes</p>
                <div className="mt-2">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {stats.confirmed > 0 ? `${((stats.confirmed / reservations.length) * 100).toFixed(1)}%` : '0%'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Canceladas</CardTitle>
                <X className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.cancelled}</div>
                <p className="text-xs text-gray-500">Este mes</p>
                <div className="mt-2">
                  <Badge variant="destructive" className="bg-red-100 text-red-800">
                    {stats.cancelled > 0 ? `${((stats.cancelled / reservations.length) * 100).toFixed(1)}%` : '0%'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Ingresos</CardTitle>
                <Euro className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">€{stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-gray-500">Este mes</p>
                <div className="mt-2">
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    {stats.confirmed > 0 ? '€' + Math.round(stats.totalRevenue / stats.confirmed) + ' promedio' : 'Sin ingresos'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros y búsqueda */}
          <Card className="border-0 shadow-md bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                  Reservas Recientes
                </span>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {filteredReservations.length} de {reservations.length} reservas
                  </Badge>
                </div>
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar por cliente, servicio o ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="confirmed">Confirmadas</SelectItem>
                    <SelectItem value="cancelled">Canceladas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-600">Cargando reservas...</p>
                  </div>
                </div>
              ) : filteredReservations.length > 0 ? (
                <div className="space-y-4">
                  {filteredReservations.map((reservation) => {
                    const getStatusStyles = (status: string) => {
                      switch (status) {
                        case 'confirmed':
                          return {
                            bg: 'bg-green-50',
                            border: 'border-green-200',
                            iconBg: 'bg-green-100',
                            iconColor: 'text-green-600',
                            amountColor: 'text-green-600',
                            badge: 'bg-green-100 text-green-800'
                          }
                        case 'pending':
                          return {
                            bg: 'bg-yellow-50',
                            border: 'border-yellow-200',
                            iconBg: 'bg-yellow-100',
                            iconColor: 'text-yellow-600',
                            amountColor: 'text-yellow-600',
                            badge: 'bg-yellow-100 text-yellow-800'
                          }
                        case 'cancelled':
                          return {
                            bg: 'bg-red-50',
                            border: 'border-red-200',
                            iconBg: 'bg-red-100',
                            iconColor: 'text-red-600',
                            amountColor: 'text-red-600',
                            badge: 'bg-red-100 text-red-800'
                          }
                        default:
                          return {
                            bg: 'bg-gray-50',
                            border: 'border-gray-200',
                            iconBg: 'bg-gray-100',
                            iconColor: 'text-gray-600',
                            amountColor: 'text-gray-600',
                            badge: 'bg-gray-100 text-gray-800'
                          }
                      }
                    }

                    const styles = getStatusStyles(reservation.status)

                    return (
                      <div key={reservation.id} className={`flex items-center justify-between p-4 ${styles.bg} rounded-lg border ${styles.border}`}>
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 ${styles.iconBg} rounded-lg flex items-center justify-center`}>
                            {reservation.status === 'pending' ? (
                              <Clock className={`w-6 h-6 ${styles.iconColor}`} />
                            ) : reservation.status === 'confirmed' ? (
                              <CheckCircle className={`w-6 h-6 ${styles.iconColor}`} />
                            ) : (
                              <X className={`w-6 h-6 ${styles.iconColor}`} />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{reservation.service_title}</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-600">{reservation.user_name}</span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-600">{reservation.guests} personas</span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-600">{new Date(reservation.reservation_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={styles.badge}>
                                {reservation.status === 'pending' ? (
                                  <>
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pendiente
                                  </>
                                ) : reservation.status === 'confirmed' ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Confirmada
                                  </>
                                ) : (
                                  <>
                                    <X className="w-3 h-3 mr-1" />
                                    Cancelada
                                  </>
                                )}
                              </Badge>
                              <Badge variant="outline">ID: {reservation.id}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${styles.amountColor}`}>€{reservation.total_amount}</div>
                          <p className="text-sm text-gray-500">
                            {reservation.payment_status === 'paid' ? 'Pagado' : 
                             reservation.payment_status === 'pending' ? 'Pendiente pago' : 'Reembolsado'}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewDetails(reservation)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver detalles
                            </Button>
                            {reservation.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Confirmar
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-red-200 text-red-600 hover:bg-red-50"
                                  onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Cancelar
                                </Button>
                              </>
                            )}
                            {reservation.status === 'confirmed' && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Cancelar
                              </Button>
                            )}
                            {reservation.status === 'cancelled' && (
                              <Badge variant="outline" className="text-gray-500">
                                Finalizada
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron reservas</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {searchTerm || filterStatus !== 'todos' ? 'Intenta ajustar los filtros' : 'No hay reservas disponibles'}
                  </p>
                </div>
              )}

              {/* Paginación */}
              {filteredReservations.length > 0 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Mostrando {filteredReservations.length} de {reservations.length} reservas
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" disabled>
                      Anterior
                    </Button>
                    <Button variant="outline" size="sm" className="bg-blue-50 text-blue-700">
                      1
                    </Button>
                    <Button variant="outline" size="sm">
                      2
                    </Button>
                    <Button variant="outline" size="sm">
                      3
                    </Button>
                    <Button variant="outline" size="sm">
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modal de detalles de reserva */}
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detalles de la Reserva</DialogTitle>
              </DialogHeader>
              {selectedReservation && (
                <ReservationDetails reservation={selectedReservation} />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayoutModern>
    </AdminGuard>
  )
}

// Componente para el formulario de nueva reserva
function NewReservationForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    contact_email: '',
    contact_phone: '',
    service_id: '',
    participants: '',
    date: '',
    time: '',
    amount: '',
    notes: '',
    special_requests: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      customer_name: '',
      contact_email: '',
      contact_phone: '',
      service_id: '',
      participants: '',
      date: '',
      time: '',
      amount: '',
      notes: '',
      special_requests: ''
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customer_name">Nombre del Cliente</Label>
          <Input
            id="customer_name"
            value={formData.customer_name}
            onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="service_id">Servicio</Label>
          <Select value={formData.service_id} onValueChange={(value) => setFormData({...formData, service_id: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar servicio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Tour del Teide</SelectItem>
              <SelectItem value="2">Loro Parque</SelectItem>
              <SelectItem value="3">Tour Masca</SelectItem>
              <SelectItem value="4">Siam Park</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contact_email">Email de Contacto</Label>
          <Input
            id="contact_email"
            type="email"
            value={formData.contact_email}
            onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="contact_phone">Teléfono</Label>
          <Input
            id="contact_phone"
            type="tel"
            value={formData.contact_phone}
            onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="participants">Participantes</Label>
          <Input
            id="participants"
            type="number"
            value={formData.participants}
            onChange={(e) => setFormData({...formData, participants: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="date">Fecha</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="time">Hora (opcional)</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({...formData, time: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="amount">Monto (€)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Información adicional sobre la reserva..."
        />
      </div>

      <div>
        <Label htmlFor="special_requests">Solicitudes Especiales (opcional)</Label>
        <Textarea
          id="special_requests"
          value={formData.special_requests}
          onChange={(e) => setFormData({...formData, special_requests: e.target.value})}
          placeholder="Dietas especiales, accesibilidad, etc..."
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline">
          Cancelar
        </Button>
        <Button type="submit">
          Crear Reserva
        </Button>
      </div>
    </form>
  )
}

// Componente para mostrar detalles de la reserva
function ReservationDetails({ reservation }: { reservation: Reservation }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Información del Cliente</h3>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-600">Nombre:</span>
              <p className="text-sm text-gray-900">{reservation.user_name || reservation.contact_name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Email:</span>
              <p className="text-sm text-gray-900">{reservation.user_email || reservation.contact_email}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Participantes:</span>
              <p className="text-sm text-gray-900">{reservation.guests} personas</p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Información del Servicio</h3>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-600">Servicio:</span>
              <p className="text-sm text-gray-900">{reservation.service_title}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Fecha:</span>
              <p className="text-sm text-gray-900">{new Date(reservation.reservation_date).toLocaleDateString()}</p>
            </div>
            {reservation.reservation_time && (
              <div>
                <span className="text-sm font-medium text-gray-600">Hora:</span>
                <p className="text-sm text-gray-900">{reservation.reservation_time}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Detalles de Pago</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <span className="text-sm font-medium text-gray-600">Monto Total:</span>
            <p className="text-lg font-bold text-gray-900">€{reservation.total_amount}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Estado del Pago:</span>
            <p className="text-sm text-gray-900 capitalize">
              {reservation.payment_status === 'paid' ? 'Pagado' : 
               reservation.payment_status === 'pending' ? 'Pendiente' : 'Reembolsado'}
            </p>
          </div>
          {reservation.order_number && (
            <div>
              <span className="text-sm font-medium text-gray-600">Número de Pedido:</span>
              <p className="text-sm text-gray-900">{reservation.order_number}</p>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Estado de la Reserva</h3>
        <div className="flex items-center space-x-2">
          {reservation.status === 'pending' ? (
            <Badge className="bg-yellow-100 text-yellow-800">
              <Clock className="w-3 h-3 mr-1" />
              Pendiente
            </Badge>
          ) : reservation.status === 'confirmed' ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Confirmada
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800">
              <X className="w-3 h-3 mr-1" />
              Cancelada
            </Badge>
          )}
          <Badge variant="outline">ID: {reservation.id}</Badge>
        </div>
      </div>
      
      {(reservation.notes || reservation.special_requests) && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Notas y Solicitudes</h3>
          {reservation.notes && (
            <div className="mb-3">
              <span className="text-sm font-medium text-gray-600">Notas:</span>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mt-1">{reservation.notes}</p>
            </div>
          )}
          {reservation.special_requests && (
            <div>
              <span className="text-sm font-medium text-gray-600">Solicitudes especiales:</span>
              <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg mt-1">{reservation.special_requests}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}