"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search, Eye, CheckCircle, XCircle, Calendar, Euro, User, MapPin } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner";

interface Reservation {
  id: string
  user_id: string
  service_id: string
  reservation_date: string
  total_amount: number
  status: "pendiente" | "confirmado" | "cancelado"
  payment_status: "pendiente" | "preautorizado" | "pagado" | "fallido"
  payment_id?: string
  created_at: string
  updated_at: string
  profiles: {
    full_name: string | null
    email: string
  } | null
  services: {
    title: string
    location: string
  } | null
}

interface ReservationStats {
  total: number
  pendiente: number
  confirmado: number
  cancelado: number
}

export function ReservationsManagement() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([])
  const [stats, setStats] = useState<ReservationStats>({
    total: 0,
    pendiente: 0,
    confirmado: 0,
    cancelado: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [capturing, setCapturing] = useState<string | null>(null);

  useEffect(() => {
    loadReservations()
  }, [])

  useEffect(() => {
    filterReservations()
  }, [reservations, searchTerm, statusFilter])

  const loadReservations = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from("reservations")
        .select(`
          id,
          user_id,
          service_id,
          reservation_date,
          total_amount,
          status,
          payment_status,
          payment_id,
          created_at,
          updated_at,
          profiles!reservations_user_id_fkey (
            full_name,
            email
          ),
          services (
            title,
            location
          )
        `)
        .order("created_at", { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      // Transformar los datos para que coincidan con la interfaz
      const reservationsData = (data || []).map((reservation: any) => ({
        ...reservation,
        profiles: reservation.profiles?.[0] || null,
        services: reservation.services?.[0] || null,
      }))

      setReservations(reservationsData)

      // Calcular estadísticas
      const newStats = {
        total: reservationsData.length,
        pendiente: reservationsData.filter((r) => r.status === "pendiente").length,
        confirmado: reservationsData.filter((r) => r.status === "confirmado").length,
        cancelado: reservationsData.filter((r) => r.status === "cancelado").length,
      }
      setStats(newStats)
    } catch (err) {
      setError(`Error al cargar las reservas: ${  (err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  const filterReservations = () => {
    let filtered = reservations

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (reservation) =>
          reservation.profiles?.full_name?.toLowerCase().includes(term) ||
          reservation.profiles?.email?.toLowerCase().includes(term) ||
          reservation.services?.title?.toLowerCase().includes(term) ||
          reservation.id.toLowerCase().includes(term),
      )
    }

    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((reservation) => reservation.status === statusFilter)
    }

    setFilteredReservations(filtered)
  }

  const updateReservationStatus = async (reservationId: string, newStatus: "confirmado" | "cancelado") => {
    try {
      setUpdating(reservationId)

      const { error: updateError } = await supabase
        .from("reservations")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reservationId)

      if (updateError) {
        throw updateError
      }

      // Actualizar el estado local
      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === reservationId
            ? { ...reservation, status: newStatus, updated_at: new Date().toISOString() }
            : reservation,
        ),
      )

      // Recalcular estadísticas
      const updatedReservations = reservations.map((reservation) =>
        reservation.id === reservationId ? { ...reservation, status: newStatus } : reservation,
      )

      const newStats = {
        total: updatedReservations.length,
        pendiente: updatedReservations.filter((r) => r.status === "pendiente").length,
        confirmado: updatedReservations.filter((r) => r.status === "confirmado").length,
        cancelado: updatedReservations.filter((r) => r.status === "cancelado").length,
      }
      setStats(newStats)
    } catch (err) {
      setError(`Error al actualizar la reserva: ${  (err as Error).message}`)
    } finally {
      setUpdating(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendiente":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pendiente
          </Badge>
        )
      case "confirmado":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Confirmada
          </Badge>
        )
      case "cancelado":
        return <Badge variant="destructive">Cancelada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "pagado":
        return <Badge className="bg-green-100 text-green-800">Pagado</Badge>
      case "preautorizado":
        return <Badge className="bg-blue-100 text-blue-800">Preautorizado</Badge>
      case "pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case "fallido":
        return <Badge className="bg-red-100 text-red-800">Fallido</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: es })
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando reservas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendiente}</div>
              <div className="text-sm text-gray-500">Pendientes</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.confirmado}</div>
              <div className="text-sm text-gray-500">Confirmadas</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.cancelado}</div>
              <div className="text-sm text-gray-500">Canceladas</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por cliente, email, servicio o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="confirmado">Confirmadas</SelectItem>
                <SelectItem value="cancelado">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de reservas */}
      <Card>
        <CardHeader>
          <CardTitle>Reservas ({filteredReservations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Fecha Reserva</TableHead>
                  <TableHead>Importe</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Creada</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No se encontraron reservas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{reservation.profiles?.full_name || "Sin nombre"}</div>
                          <div className="text-sm text-gray-500">{reservation.profiles?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{reservation.services?.title || "Servicio eliminado"}</div>
                          <div className="text-sm text-gray-500">{reservation.services?.location}</div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(reservation.reservation_date)}</TableCell>
                      <TableCell>
                        <div className="font-medium">
                          €{reservation.total_amount.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(reservation.payment_status)}</TableCell>
                      <TableCell>{formatDateTime(reservation.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  console.log('Abriendo detalles de reserva:', reservation.id)
                                  setSelectedReservation(reservation)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Detalles de la Reserva</DialogTitle>
                              </DialogHeader>
                              {selectedReservation && selectedReservation.id === reservation.id && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Cliente
                                      </h4>
                                      <p>{selectedReservation.profiles?.full_name || "Sin nombre"}</p>
                                      <p className="text-sm text-gray-500">{selectedReservation.profiles?.email}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Servicio
                                      </h4>
                                      <p>{selectedReservation.services?.title || "Servicio eliminado"}</p>
                                      <p className="text-sm text-gray-500">{selectedReservation.services?.location}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Fecha de Reserva
                                      </h4>
                                      <p>{formatDate(selectedReservation.reservation_date)}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold flex items-center gap-2">
                                        <Euro className="h-4 w-4" />
                                        Importe Total
                                      </h4>
                                      <p className="text-lg font-bold">
                                        €
                                        {selectedReservation.total_amount.toLocaleString("es-ES", {
                                          minimumFractionDigits: 2,
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Estado</h4>
                                    {getStatusBadge(selectedReservation.status)}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Estado de Pago</h4>
                                    {getPaymentStatusBadge(selectedReservation.payment_status)}
                                    {selectedReservation.payment_id && (
                                      <div className="text-xs text-gray-500 mt-1">ID Redsys: {selectedReservation.payment_id}</div>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                                    <div>
                                      <strong>ID:</strong> {selectedReservation.id}
                                    </div>
                                    <div>
                                      <strong>Creada:</strong> {formatDateTime(selectedReservation.created_at)}
                                    </div>
                                    <div>
                                      <strong>Actualizada:</strong> {formatDateTime(selectedReservation.updated_at)}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {reservation.status === "pendiente" && reservation.payment_status === "preautorizado" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700"
                              disabled={updating === reservation.id || capturing === reservation.id}
                              onClick={async () => {
                                setCapturing(reservation.id);
                                try {
                                  const res = await fetch("/api/redsys/capture", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ reservationId: reservation.id }),
                                  });
                                  const data = await res.json();
                                  if (data.ok) {
                                    toast.success("Pago capturado correctamente");
                                  } else {
                                    toast.error(data.message || "Error al capturar el pago");
                                  }
                                  await loadReservations(); // Refrescar la tabla
                                } catch (err: any) {
                                  toast.error(err.message || "Error inesperado al capturar el pago");
                                } finally {
                                  setCapturing(null);
                                }
                              }}
                            >
                              {capturing === reservation.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Autorizar/Cobrar pago"
                              )}
                            </Button>
                          )}

                          {reservation.status === "pendiente" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateReservationStatus(reservation.id, "confirmado")}
                                disabled={updating === reservation.id}
                                className="text-green-600 hover:text-green-700"
                              >
                                {updating === reservation.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateReservationStatus(reservation.id, "cancelado")}
                                disabled={updating === reservation.id}
                                className="text-red-600 hover:text-red-700"
                              >
                                {updating === reservation.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
