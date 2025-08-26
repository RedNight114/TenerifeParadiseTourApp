"use client"

import type React from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import type { Reservation } from "@/lib/supabase"
import { X } from "lucide-react"

interface ReservationsTableProps {
  reservations: Reservation[]
  loading: boolean
  cancellingId: string | null
  onCancel: (reservationId: string) => void
  getStatusBadge: (status: string) => React.ReactNode
  getPaymentStatusBadge: (status: string) => React.ReactNode
  formatDate: (date: string) => string
  formatPrice: (price: number) => string
}

/**
 * Tabla reutilizable para listar reservas del usuario.
 */
export default function ReservationsTable({
  reservations,
  loading,
  cancellingId,
  onCancel,
  getStatusBadge,
  getPaymentStatusBadge,
  formatDate,
  formatPrice,
}: ReservationsTableProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0061A8] mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando reservas...</p>
      </div>
    )
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No se encontraron reservas para esta sección.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Servicio</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Huéspedes</TableHead>
          <TableHead>Importe</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Pago</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reservations.map((reservation) => (
          <TableRow key={reservation.id}>
            <TableCell className="font-medium">{reservation.service?.title}</TableCell>
            <TableCell>{formatDate(reservation.date)}</TableCell>
            <TableCell>{reservation.guests}</TableCell>
            <TableCell>{formatPrice(reservation.total_price)}</TableCell>
            <TableCell>{getStatusBadge(reservation.status)}</TableCell>
            <TableCell>{getPaymentStatusBadge(reservation.payment_status)}</TableCell>
            <TableCell>
              {reservation.status === "pending" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(reservation.id)}
                  disabled={cancellingId === reservation.id}
                >
                  <X className="h-4 w-4 mr-2" />
                  {cancellingId === reservation.id ? "Cancelando..." : "Cancelar"}
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
