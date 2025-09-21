"use client"

import { useState, useEffect, useCallback } from "react"
import { getSupabaseClient } from "@/lib/supabase-unified"
import { useAuthContext } from "@/components/auth-provider"

interface Reservation {
  id: string
  user_id: string
  service_id: string
  service_name: string
  date: string
  time?: string
  participants: number
  total_price: number
  status: string
  payment_status?: string
  notes?: string
  location?: string
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

export function useReservations() {
  const { user } = useAuthContext()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const client = await getSupabaseClient()
      
      if (!client) {
        throw new Error('No se pudo obtener el cliente de Supabase')
      }

      const { data, error } = await client
        .from('reservations')
        .select(`
          id,
          user_id,
          service_id,
          participants,
          booking_date,
          total_price,
          status,
          payment_status,
          notes,
          created_at,
          profiles(full_name, email),
          services(title, price)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      // Mapear los datos para que coincidan con la interfaz
      const mappedReservations = (data || []).map((reservation: any) => ({
        id: reservation.id,
        user_id: reservation.user_id,
        service_id: reservation.service_id,
        service_name: reservation.services?.title || 'Servicio no disponible',
        date: reservation.booking_date || reservation.reservation_date || '',
        time: reservation.reservation_time || '',
        participants: reservation.participants || reservation.guests || 1,
        total_price: reservation.total_price || reservation.total_amount || 0,
        status: reservation.status || 'pending',
        payment_status: reservation.payment_status || 'pendiente',
        notes: reservation.notes || '',
        location: 'Tenerife', // Valor por defecto
        created_at: reservation.created_at,
        profiles: reservation.profiles,
        services: reservation.services
      }))

      setReservations(mappedReservations)
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
      const client = await getSupabaseClient()
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

