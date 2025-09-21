"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from '@/lib/supabase-unified'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search, Filter, Calendar, Users, Euro, CheckCircle, X, AlertCircle } from "lucide-react"

interface Reservation {
  id: string
  user_id: string
  service_id: string
  date: string
  time: string
  participants: number
  total_price: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  payment_status: "pending" | "paid" | "failed" | "refunded"
  special_requests?: string
  created_at: string
  profiles?: {
    full_name: string
    email: string
  }
  services?: {
    title: string
    price: number
  }
}

export function ReservationsManagement() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")

  const fetchReservations = async () => {
    try {
      setLoading(true)
      setError(null)

      const client = await getSupabaseClient()
      
      if (!client) {
        throw new Error("No se pudo obtener el cliente de Supabase")
      }

      let query = client
        .from("reservations")
        .select("*")
        .order("created_at", { ascending: false })

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter)
      }

      if (paymentFilter !== "all") {
        query = query.eq("payment_status", paymentFilter)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      // Transformar los datos para que coincidan con la interfaz
      const transformedData = (data || []).map((reservation: any) => ({
        id: String(reservation.id),
        user_id: String(reservation.user_id),
        service_id: String(reservation.service_id),
        date: String(reservation.date),
        time: String(reservation.time),
        participants: Number(reservation.participants),
        total_price: Number(reservation.total_price),
        status: reservation.status as Reservation["status"],
        payment_status: reservation.payment_status as Reservation["payment_status"],
        special_requests: reservation.special_requests,
        created_at: String(reservation.created_at),
        profiles: undefined, // Se cargará por separado si es necesario
        services: undefined, // Se cargará por separado si es necesario
      }))

      setReservations(transformedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar reservas")
    } finally {
      setLoading(false)
    }
  }

  const updateReservationStatus = async (reservationId: string, status: Reservation["status"]) => {
    try {
      const client = await getSupabaseClient()
      
      if (!client) {
        throw new Error("No se pudo obtener el cliente de Supabase")
      }

      const { error } = await client
        .from("reservations")
        .update({ status })
        .eq("id", reservationId)

      if (error) throw error

      // Actualizar el estado local
      setReservations(prev => 
        prev.map(res => 
          res.id === reservationId ? { ...res, status } : res
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar reserva")
    }
  }

  const updatePaymentStatus = async (reservationId: string, paymentStatus: Reservation["payment_status"]) => {
    try {
      const client = await getSupabaseClient()
      
      if (!client) {
        throw new Error("No se pudo obtener el cliente de Supabase")
      }

      const { error } = await client
        .from("reservations")
        .update({ payment_status: paymentStatus })
        .eq("id", reservationId)

      if (error) throw error

      // Actualizar el estado local
      setReservations(prev => 
        prev.map(res => 
          res.id === reservationId ? { ...res, payment_status: paymentStatus } : res
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar estado de pago")
    }
  }

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.services?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.id.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  useEffect(() => {
    fetchReservations()
  }, [statusFilter, paymentFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "confirmed": return "bg-green-100 text-green-800"
      case "cancelled": return "bg-red-100 text-red-800"
      case "completed": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "paid": return "bg-green-100 text-green-800"
      case "failed": return "bg-red-100 text-red-800"
      case "refunded": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando reservas...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros y Búsqueda</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre, email, servicio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="payment">Pago</Label>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los pagos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="paid">Pagado</SelectItem>
                  <SelectItem value="failed">Fallido</SelectItem>
                  <SelectItem value="refunded">Reembolsado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de reservas */}
      <div className="space-y-4">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {filteredReservations.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reservas</h3>
                <p className="text-gray-600">No se encontraron reservas con los filtros aplicados.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredReservations.map((reservation) => (
            <Card key={reservation.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {reservation.services?.title || "Servicio no disponible"}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {reservation.profiles?.full_name} ({reservation.profiles?.email})
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(reservation.status)}>
                      {reservation.status}
                    </Badge>
                    <Badge className={getPaymentStatusColor(reservation.payment_status)}>
                      {reservation.payment_status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {new Date(reservation.date).toLocaleDateString("es-ES")} a las {reservation.time}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{reservation.participants} personas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Euro className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{reservation.total_price}€</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    ID: {reservation.id.substring(0, 8)}...
                  </div>
                </div>

                {reservation.special_requests && (
                  <div className="mb-4">
                    <Label className="text-sm font-medium">Solicitudes especiales:</Label>
                    <p className="text-sm text-gray-600 mt-1">{reservation.special_requests}</p>
                  </div>
                )}

                <div className="flex items-center space-x-4">
                  <div>
                    <Label htmlFor={`status-${reservation.id}`} className="text-sm">Estado:</Label>
                    <Select
                      value={reservation.status}
                      onValueChange={(value) => updateReservationStatus(reservation.id, value as Reservation["status"])}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="confirmed">Confirmado</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                        <SelectItem value="completed">Completado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`payment-${reservation.id}`} className="text-sm">Pago:</Label>
                    <Select
                      value={reservation.payment_status}
                      onValueChange={(value) => updatePaymentStatus(reservation.id, value as Reservation["payment_status"])}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="paid">Pagado</SelectItem>
                        <SelectItem value="failed">Fallido</SelectItem>
                        <SelectItem value="refunded">Reembolsado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default ReservationsManagement

