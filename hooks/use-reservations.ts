"use client"

import { useState, useCallback } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface Reservation {
  id: string
  user_id: string
  service_id: string
  reservation_date: string
  reservation_time: string
  guests: number
  total_amount: number
  status: string
  special_requests?: string
  created_at: string
  service?: {
    title: string
    category: string
    description: string
  }
}

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReservations = useCallback(async (userId: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          *,
          service:services(
            title,
            category,
            description
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setReservations(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }, [])

  const cancelReservation = useCallback(async (reservationId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from("reservations")
        .update({ status: "cancelado" })
        .eq("id", reservationId)
        .eq("user_id", userId)

      if (error) throw error

      // Actualizar el estado local
      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === reservationId ? { ...reservation, status: "cancelado" } : reservation,
        ),
      )

      return { success: true }
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Error desconocido" }
    }
  }, [])

  return {
    reservations,
    loading,
    error,
    fetchReservations,
    cancelReservation,
  }
}
