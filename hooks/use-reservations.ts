"use client"

import { useState, useEffect, useCallback } from "react"
import { getSupabaseClient } from "@/lib/supabase-optimized"
import { useAuth } from "./use-auth"

interface Reservation {
  id: string
  user_id: string
  service_id: string
  service_name: string
  date: string
  time: string
  participants: number
  total_price: number
  status: string
  notes?: string
  location?: string
  created_at: string
}

export function useReservations() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReservations = useCallback(async () => {
    if (!user?.id) return

    setLoading(true)
    setError(null)

    try {
      const client = getSupabaseClient()
      const { data, error } = await client
        .from("reservations")
        .select(`
          *,
          service:services(
            title,
            location
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Transformar los datos para que coincidan con la interfaz
      const transformedData = (data || []).map((reservation: any) => ({
        id: reservation.id,
        user_id: reservation.user_id,
        service_id: reservation.service_id,
        service_name: reservation.service?.title || "Servicio no disponible",
        date: reservation.reservation_date || reservation.date,
        time: reservation.reservation_time || reservation.time,
        participants: reservation.guests || reservation.participants,
        total_price: reservation.total_amount || reservation.total_price,
        status: reservation.status,
        notes: reservation.special_requests || reservation.notes,
        location: reservation.service?.location || reservation.location,
        created_at: reservation.created_at
      }))

      setReservations(transformedData)
    } catch (err) {
      console.error("Error fetching reservations:", err)
      setError(err instanceof Error ? err.message : "Error al cargar las reservas")
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const cancelReservation = useCallback(async (reservationId: string) => {
    if (!user?.id) return

    try {
      const client = getSupabaseClient()
      const { error } = await client
        .from("reservations")
        .update({ status: "cancelled" })
        .eq("id", reservationId)
        .eq("user_id", user.id)

      if (error) throw error

      // Actualizar el estado local
      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === reservationId ? { ...reservation, status: "cancelled" } : reservation,
        ),
      )

      return { success: true }
    } catch (err) {
      console.error("Error canceling reservation:", err)
      return { error: err instanceof Error ? err.message : "Error al cancelar la reserva" }
    }
  }, [user?.id])

  // Cargar reservaciones automáticamente cuando el usuario esté disponible
  useEffect(() => {
    if (user?.id) {
      fetchReservations()
    }
  }, [user?.id, fetchReservations])

  return {
    reservations,
    loading,
    error,
    fetchReservations,
    cancelReservation,
  }
}
