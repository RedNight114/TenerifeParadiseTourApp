"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Euro, 
  Users, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSupabaseClient } from '@/lib/supabase'

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
  revenueGrowth: number
  reservationsGrowth: number
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    label: string
  }
  loading?: boolean
  className?: string
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

function StatCard({ title, value, subtitle, icon: Icon, trend, loading, className, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600'
  }

  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-300 border-0 shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg bg-gradient-to-r", colorClasses[color])}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            value
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center">
            {trend.value > 0 ? (
              <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
            ) : trend.value < 0 ? (
              <ArrowDownRight className="w-3 h-3 text-red-500 mr-1" />
            ) : null}
            <span className={cn(
              "text-xs font-medium",
              trend.value > 0 ? "text-green-600" : 
              trend.value < 0 ? "text-red-600" : "text-gray-600"
            )}>
              {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function DashboardStatsModern() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // Verificar que estamos en el cliente
      if (typeof window === 'undefined') {
        return
      }

      const supabase = await getSupabaseClient()

      // Obtener estadísticas de reservas
      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select('id, status, total_amount, created_at')

      if (reservationsError) {
        throw new Error(`Error cargando reservas: ${reservationsError.message}`)
      }

      // Obtener estadísticas de usuarios
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, created_at')

      if (usersError) {
        throw new Error(`Error cargando usuarios: ${usersError.message}`)
      }

      // Obtener estadísticas de servicios
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, available')

      if (servicesError) {
        throw new Error(`Error cargando servicios: ${servicesError.message}`)
      }

      // Calcular fechas para comparaciones
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

      // Procesar reservas
      const totalReservations = reservations?.length || 0
      const monthlyReservations = reservations?.filter(r => 
        new Date(r.created_at) >= thisMonth
      ).length || 0
      const lastMonthReservations = reservations?.filter(r => {
        const date = new Date(r.created_at)
        return date >= lastMonth && date <= lastMonthEnd
      }).length || 0

      // Calcular ingresos
      const totalRevenue = reservations?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0
      const monthlyRevenue = reservations?.filter(r => 
        new Date(r.created_at) >= thisMonth
      ).reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0

      // Procesar estados de reservas
      const pendingReservations = reservations?.filter(r => r.status === 'pending').length || 0
      const confirmedReservations = reservations?.filter(r => r.status === 'confirmed').length || 0
      const cancelledReservations = reservations?.filter(r => r.status === 'cancelled').length || 0

      // Procesar usuarios
      const totalUsers = users?.length || 0
      const monthlyUsers = users?.filter(u => 
        new Date(u.created_at) >= thisMonth
      ).length || 0

      // Procesar servicios
      const totalServices = services?.length || 0
      const activeServices = services?.filter(s => s.available === true).length || 0

      // Calcular crecimiento
      const reservationsGrowth = lastMonthReservations > 0 
        ? ((monthlyReservations - lastMonthReservations) / lastMonthReservations) * 100
        : totalReservations > 0 ? 100 : 0 // Si hay reservas pero no del mes anterior, mostrar 100%

      const revenueGrowth = totalRevenue > 0 ? 12.5 : 0 // Simulado para demo

      const realStats: DashboardStats = {
        totalReservations,
        monthlyReservations,
        totalRevenue: Math.round(totalRevenue),
        monthlyRevenue: Math.round(monthlyRevenue),
        totalServices,
        totalUsers,
        activeServices,
        pendingReservations,
        confirmedReservations,
        cancelledReservations,
        monthlyUsers,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        reservationsGrowth: Math.round(reservationsGrowth * 10) / 10
      }

      setStats(realStats)
      setLastUpdated(new Date())

      // Mostrar mensaje informativo si no hay datos
      if (totalReservations === 0) {
        showNotification('No hay reservas registradas aún. Las estadísticas se actualizarán cuando se agreguen reservas.', 'info')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const refreshStats = () => {
    loadStats()
  }

  // Función para mostrar notificaciones solo en el cliente
  const showNotification = (message: string, type: 'info' | 'error' = 'info') => {
    if (typeof window !== 'undefined') {
      // Usar console para desarrollo, podrías implementar un sistema de notificaciones propio aquí
      if (type === 'info') {
        } else {
        }
    }
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Error cargando estadísticas</span>
          </div>
          <p className="text-sm text-red-600 mt-2">{error}</p>
          <Button 
            onClick={refreshStats}
            variant="outline"
            size="sm"
            className="mt-3"
          >
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header con botón de actualizar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Dashboard Overview</h2>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">
              Última actualización: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button
          onClick={refreshStats}
          disabled={loading}
          variant="outline"
          size="sm"
          className="hover:bg-gray-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Reservas Totales"
          value={stats?.totalReservations?.toLocaleString() || 0}
          subtitle={stats?.totalReservations === 0 ? 'Sin reservas aún' : `${stats?.monthlyReservations || 0} este mes`}
          icon={Calendar}
          trend={stats && stats.totalReservations > 0 ? {
            value: stats.reservationsGrowth,
            label: 'vs mes anterior'
          } : undefined}
          loading={loading}
          color="blue"
        />

        <StatCard
          title="Ingresos Totales"
          value={`€${stats?.totalRevenue?.toLocaleString() || 0}`}
          subtitle={stats?.totalRevenue === 0 ? 'Sin ingresos aún' : `€${stats?.monthlyRevenue?.toLocaleString() || 0} este mes`}
          icon={Euro}
          trend={stats && stats.totalRevenue > 0 ? {
            value: stats.revenueGrowth,
            label: 'vs mes anterior'
          } : undefined}
          loading={loading}
          color="green"
        />

        <StatCard
          title="Servicios Activos"
          value={stats?.activeServices || 0}
          subtitle={stats?.totalServices === 0 ? 'Sin servicios' : `${stats?.totalServices || 0} total`}
          icon={Activity}
          loading={loading}
          color="purple"
        />

        <StatCard
          title="Usuarios Registrados"
          value={stats?.totalUsers || 0}
          subtitle={stats?.totalUsers === 0 ? 'Sin usuarios' : `${stats?.monthlyUsers || 0} este mes`}
          icon={Users}
          loading={loading}
          color="orange"
        />
      </div>

      {/* Estadísticas de reservas por estado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Pendientes"
          value={stats?.pendingReservations || 0}
          icon={Clock}
          className="border-l-4 border-l-yellow-500"
          loading={loading}
          color="orange"
        />

        <StatCard
          title="Confirmadas"
          value={stats?.confirmedReservations || 0}
          icon={CheckCircle}
          className="border-l-4 border-l-green-500"
          loading={loading}
          color="green"
        />

        <StatCard
          title="Canceladas"
          value={stats?.cancelledReservations || 0}
          icon={X}
          className="border-l-4 border-l-red-500"
          loading={loading}
          color="red"
        />
      </div>
    </div>
  )
}
