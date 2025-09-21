"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "./stat-card"
import { StatusCard } from "./status-card"
import { Calendar, Euro, Users, Activity, Clock, CheckCircle, X } from "lucide-react"

interface DashboardStatsSimpleProps {
  stats: {
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
  }
  loading?: boolean
}

export function DashboardStatsSimple({ stats, loading = false }: DashboardStatsSimpleProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Reservas Totales"
          value={stats.totalReservations}
          subtitle={`${stats.monthlyReservations} este mes`}
          icon={Calendar}
        />
        <StatCard
          title="Ingresos Totales"
          value={`€${stats.totalRevenue}`}
          subtitle={`€${stats.monthlyRevenue} este mes`}
          icon={Euro}
        />
        <StatCard
          title="Servicios"
          value={stats.totalServices}
          subtitle={`${stats.activeServices} activos`}
          icon={Activity}
        />
        <StatCard
          title="Usuarios"
          value={stats.totalUsers}
          subtitle="Registrados"
          icon={Users}
        />
      </div>

      {/* Estado de Reservas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard
          status="pending"
          title="Pendientes"
          description="Esperando confirmación"
          count={stats.pendingReservations}
        />
        <StatusCard
          status="success"
          title="Confirmadas"
          description="Reservas confirmadas"
          count={stats.confirmedReservations}
        />
        <StatusCard
          status="error"
          title="Canceladas"
          description="Reservas canceladas"
          count={stats.cancelledReservations}
        />
      </div>
    </div>
  )
}