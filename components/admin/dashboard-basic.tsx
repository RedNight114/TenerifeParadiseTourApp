"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { Calendar, Euro, Users, TrendingUp, Activity, Database, MessageSquare } from "lucide-react"

interface DashboardBasicProps {
  stats: {
    totalReservations: number
    monthlyReservations: number
    totalRevenue: number
    monthlyRevenue: number
    totalServices: number
    pendingReservations: number
    confirmedReservations: number
    cancelledReservations: number
    activeServices: number
    totalUsers: number
    monthlyUsers: number 
  }
  loading: boolean
}

export function DashboardBasic({ stats, loading }: DashboardBasicProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </CardTitle>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReservations}</div>
            <p className="text-xs text-muted-foreground">
              {stats.monthlyReservations} este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              €{stats.monthlyRevenue.toLocaleString()} este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalServices}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeServices} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.monthlyUsers} este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estado de reservas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Pendientes</CardTitle>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              {stats.pendingReservations}
            </Badge>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Confirmadas</CardTitle>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {stats.confirmedReservations}
            </Badge>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Canceladas</CardTitle>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              {stats.cancelledReservations}
            </Badge>
          </CardHeader>
        </Card>
      </div>

      {/* Mensaje informativo si no hay datos */}
      {stats.totalReservations === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay datos disponibles</h3>
            <p className="text-muted-foreground text-center max-w-md">
              El dashboard está funcionando correctamente, pero no hay reservas en la base de datos.
              Una vez que se creen reservas, aparecerán aquí.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
