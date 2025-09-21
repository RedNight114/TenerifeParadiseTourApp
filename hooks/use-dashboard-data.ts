"use client"

import { useState, useEffect, useCallback } from 'react'

interface DashboardStats {
  totalReservations: number
  monthlyReservations: number
  totalRevenue: number
  monthlyRevenue: number
  totalServices: number
  totalUsers: number
  activeServices: number
  pendingReservations: number
  confirmedReservations: number
  cancelledReservations: number
  monthlyUsers: number
}

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

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { getSupabaseClient } = await import('@/lib/supabase-unified')
      const supabase = await getSupabaseClient()
      
      // Obtener datos básicos
      const [reservationsResult, servicesResult, profilesResult] = await Promise.all([
        supabase.from('reservations').select('id, total_amount, status, created_at').limit(100),
        supabase.from('services').select('id, title, available').limit(100),
        supabase.from('profiles').select('id, full_name, email, created_at').limit(100)
      ])

      // Verificar errores
      if (reservationsResult.error) {
        throw new Error(`Error en reservas: ${reservationsResult.error.message}`)
      }
      if (servicesResult.error) {
        throw new Error(`Error en servicios: ${servicesResult.error.message}`)
      }
      if (profilesResult.error) {
        throw new Error(`Error en perfiles: ${profilesResult.error.message}`)
      }

      const reservations = reservationsResult.data || []
      const services = servicesResult.data || []
      const profiles = profilesResult.data || []

      // Calcular estadísticas
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      const monthlyReservations = reservations.filter(r => {
        const created = new Date(r.created_at)
        return created.getMonth() === currentMonth && created.getFullYear() === currentYear
      })

      const monthlyProfiles = profiles.filter(p => {
        const created = new Date(p.created_at)
        return created.getMonth() === currentMonth && created.getFullYear() === currentYear
      })

      const statsData: DashboardStats = {
        totalReservations: reservations.length,
        monthlyReservations: monthlyReservations.length,
        totalRevenue: reservations.reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0),
        monthlyRevenue: monthlyReservations.reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0),
        totalServices: services.length,
        totalUsers: profiles.length,
        activeServices: services.filter(s => s.available).length,
        pendingReservations: reservations.filter(r => r.status === 'pendiente').length,
        confirmedReservations: reservations.filter(r => r.status === 'confirmado').length,
        cancelledReservations: reservations.filter(r => r.status === 'cancelado').length,
        monthlyUsers: monthlyProfiles.length
      }

      setStats(statsData)
      setLastUpdated(new Date())
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadRecentReservations = useCallback(async () => {
    try {
      const { getSupabaseClient } = await import('@/lib/supabase-unified')
      const supabase = await getSupabaseClient()
      
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          total_amount,
          total_price,
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
        .limit(10)

      if (error) throw error
      setRecentReservations(data || [])
    } catch (err) {
      }
  }, [])

  const refreshData = useCallback(() => {
    loadStats()
    loadRecentReservations()
  }, [loadStats, loadRecentReservations])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  return {
    stats,
    recentReservations,
    loading,
    error,
    lastUpdated,
    refreshData
  }
}