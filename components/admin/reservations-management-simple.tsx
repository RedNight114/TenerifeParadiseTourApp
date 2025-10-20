"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Euro, Users, Loader2, AlertCircle, CheckCircle, X, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Reservation {
  id: string
  total_amount: number
  status: string
  created_at: string
  user_id: string
  service_id: string
  booking_date: string
  services?: {
    title: string
  }[]
}

export default function ReservationsManagementSimple() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadReservations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { getSupabaseClient } = await import("@/lib/supabase-unified")
      const supabase = await getSupabaseClient()
      
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          total_amount,
          total_price: total_amount ?? total_price,
          status,
          created_at,
          user_id,
          service_id,
          booking_date,
          participants,
          guests,
          services:service_id (
            title
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReservations(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando reservas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReservations()
  }, [])

  const handleStatusChange = async (reservationId: string, newStatus: string) => {
    try {
      const { getSupabaseClient } = await import("@/lib/supabase-unified")
      const supabase = await getSupabaseClient()
      
      const { error } = await supabase
        .from('reservations')
        .update({ status: newStatus })
        .eq('id', reservationId)

      if (error) throw error
      
      // Actualizar estado local
      setReservations(prev => prev.map(reservation => 
        reservation.id === reservationId 
          ? { ...reservation, status: newStatus }
          : reservation
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando reserva')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmado':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Confirmado</Badge>
      case 'pendiente':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>
      case 'cancelado':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Cancelado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">Cargando reservas...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Reservas</h2>
          <p className="text-gray-600">Administra las reservas de servicios</p>
        </div>
        <Button onClick={loadReservations}>
          <Calendar className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{reservations.length}</div>
            <p className="text-xs text-muted-foreground">Total Reservas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {reservations.filter(r => r.status === 'confirmado').length}
            </div>
            <p className="text-xs text-muted-foreground">Confirmadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {reservations.filter(r => r.status === 'pendiente').length}
            </div>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {reservations.filter(r => r.status === 'cancelado').length}
            </div>
            <p className="text-xs text-muted-foreground">Canceladas</p>
          </CardContent>
        </Card>
      </div>

      {/* Reservations List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Reservas</CardTitle>
        </CardHeader>
        <CardContent>
          {reservations.length > 0 ? (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{reservation.services?.[0]?.title || 'Servicio'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(reservation.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Fecha: {new Date(reservation.booking_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-lg">€{reservation.total_amount}</p>
                    <div className="mb-2">
                      {getStatusBadge(reservation.status)}
                    </div>
                    <div className="flex gap-2">
                      {reservation.status === 'pendiente' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(reservation.id, 'confirmado')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(reservation.id, 'cancelado')}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                        </>
                      )}
                      {reservation.status === 'confirmado' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(reservation.id, 'cancelado')}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay reservas disponibles</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
