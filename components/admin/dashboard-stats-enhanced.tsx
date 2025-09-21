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
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { unifiedCache } from '@/lib/unified-cache-system'

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
}

function StatCard({ title, value, subtitle, icon: Icon, trend, loading, className }: StatCardProps) {
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            value
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            {trend.value > 0 ? (
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
            ) : trend.value < 0 ? (
              <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
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

export function DashboardStatsEnhanced() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // Intentar obtener datos del caché primero
      const cacheKey = 'admin:dashboard:stats'
      const cachedStats = await unifiedCache.get<DashboardStats>(cacheKey)
      
      if (cachedStats) {
        setStats(cachedStats)
        setLoading(false)
        return
      }

      // Si no hay caché, obtener datos frescos
      const { getSupabaseClient } = await import('@/lib/supabase-unified')
      const supabase = await getSupabaseClient()

      // Obtener datos básicos con timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      )

      const dataPromise = Promise.all([
        supabase.from('reservations').select('id, total_amount, status, created_at').limit(1000),
        supabase.from('services').select('id, title, available').limit(1000),
        supabase.from('profiles').select('id, full_name, email, created_at').limit(1000)
      ])

      const [reservationsResult, servicesResult, profilesResult] = await Promise.race([
        dataPromise,
        timeoutPromise
      ]) as any[]

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
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

      const monthlyReservations = reservations.filter((r: any) => {
        const created = new Date(r.created_at)
        return created.getMonth() === currentMonth && created.getFullYear() === currentYear
      })

      const lastMonthReservations = reservations.filter((r: any) => {
        const created = new Date(r.created_at)
        return created.getMonth() === lastMonth && created.getFullYear() === lastMonthYear
      })

      const monthlyProfiles = profiles.filter((p: any) => {
        const created = new Date(p.created_at)
        return created.getMonth() === currentMonth && created.getFullYear() === currentYear
      })

      const monthlyRevenue = monthlyReservations.reduce((sum: number, r: any) => sum + (Number(r.total_amount) || 0), 0)
      const lastMonthRevenue = lastMonthReservations.reduce((sum: number, r: any) => sum + (Number(r.total_amount) || 0), 0)

      const revenueGrowth = lastMonthRevenue > 0 
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0

      const reservationsGrowth = lastMonthReservations.length > 0 
        ? ((monthlyReservations.length - lastMonthReservations.length) / lastMonthReservations.length) * 100 
        : 0

      const statsData: DashboardStats = {
        totalReservations: reservations.length,
        monthlyReservations: monthlyReservations.length,
        totalRevenue: reservations.reduce((sum: number, r: any) => sum + (Number(r.total_amount) || 0), 0),
        monthlyRevenue,
        totalServices: services.length,
        totalUsers: profiles.length,
        activeServices: services.filter((s: any) => s.available).length,
        pendingReservations: reservations.filter((r: any) => r.status === 'pendiente').length,
        confirmedReservations: reservations.filter((r: any) => r.status === 'confirmado').length,
        cancelledReservations: reservations.filter((r: any) => r.status === 'cancelado').length,
        monthlyUsers: monthlyProfiles.length,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        reservationsGrowth: Math.round(reservationsGrowth * 100) / 100
      }

      setStats(statsData)
      setLastUpdated(new Date())

      // Guardar en caché por 5 minutos
      await unifiedCache.set(cacheKey, statsData, { 
        ttl: 5 * 60 * 1000, // 5 minutos
        tags: ['admin', 'dashboard', 'stats']
      })

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
    unifiedCache.invalidateByTags(['admin', 'dashboard', 'stats'])
    loadStats()
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
    <div className="space-y-6">
      {/* Header con botón de actualizar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Estadísticas del Dashboard</h2>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Última actualización: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button
          onClick={refreshStats}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Reservas Totales"
          value={stats?.totalReservations || 0}
          subtitle={`${stats?.monthlyReservations || 0} este mes`}
          icon={Calendar}
          trend={stats ? {
            value: stats.reservationsGrowth,
            label: 'vs mes anterior'
          } : undefined}
          loading={loading}
        />

        <StatCard
          title="Ingresos Totales"
          value={`€${stats?.totalRevenue?.toLocaleString() || 0}`}
          subtitle={`€${stats?.monthlyRevenue?.toLocaleString() || 0} este mes`}
          icon={Euro}
          trend={stats ? {
            value: stats.revenueGrowth,
            label: 'vs mes anterior'
          } : undefined}
          loading={loading}
        />

        <StatCard
          title="Servicios"
          value={stats?.totalServices || 0}
          subtitle={`${stats?.activeServices || 0} activos`}
          icon={Activity}
          loading={loading}
        />

        <StatCard
          title="Usuarios"
          value={stats?.totalUsers || 0}
          subtitle={`${stats?.monthlyUsers || 0} este mes`}
          icon={Users}
          loading={loading}
        />
      </div>

      {/* Estadísticas de reservas por estado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Pendientes"
          value={stats?.pendingReservations || 0}
          icon={Clock}
          className="border-l-4 border-l-yellow-500"
          loading={loading}
        />

        <StatCard
          title="Confirmadas"
          value={stats?.confirmedReservations || 0}
          icon={CheckCircle}
          className="border-l-4 border-l-green-500"
          loading={loading}
        />

        <StatCard
          title="Canceladas"
          value={stats?.cancelledReservations || 0}
          icon={X}
          className="border-l-4 border-l-red-500"
          loading={loading}
        />
      </div>
    </div>
  )
}
