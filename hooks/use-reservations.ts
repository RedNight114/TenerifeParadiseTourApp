"use client"

import { useState, useEffect, useCallback } from "react"
import { getSupabaseClient } from "@/lib/supabase-optimized"
import { useAuthContext } from "@/components/auth-provider"

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
  const { user } = useAuthContext()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const supabaseClient = getSupabaseClient()
      const client = await supabaseClient.getClient()
      
      if (!client) {
        throw new Error('No se pudo obtener el cliente de Supabase')
      }

      const { data, error } = await client
        .from('reservations')
        .select(`
          *,
          profiles(full_name, email),
          services(title, price)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setReservations(data || [])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(errorMessage)
} finally {
      setLoading(false)
    }
  }, [user?.id])

  const cancelReservation = useCallback(async (reservationId: string) => {
    if (!user?.id) return

    try {
      const supabaseClient = getSupabaseClient()
      const client = await supabaseClient.getClient()
      if (!client) {
        throw new Error("No se pudo obtener el cliente de Supabase")
      }
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

