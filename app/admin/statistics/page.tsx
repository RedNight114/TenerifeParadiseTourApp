"use client"

import React, { useState, useEffect } from "react"
import { AdminLayoutModern } from "@/components/admin/admin-layout-modern"
import { AdminGuard } from "@/components/admin/admin-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Euro, 
  Package, 
  Clock,
  CheckCircle,
  X,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Loader2,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { toast } from "sonner"
import { getSupabaseClient } from "@/lib/supabase"

interface DashboardStats {
  totalReservations: number
  monthlyReservations: number
  totalRevenue: number
  monthlyRevenue: number
  totalUsers: number
  monthlyUsers: number
  totalServices: number
  activeServices: number
  pendingReservations: number
  confirmedReservations: number
  cancelledReservations: number
  revenueGrowth: number
  reservationsGrowth: number
  averageBookingValue: number
  conversionRate: number
}

interface MonthlyData {
  month: string
  reservations: number
  revenue: number
  users: number
}

interface ServiceStats {
  id: string
  title: string
  totalBookings: number
  totalRevenue: number
  averageRating?: number
}

export default function AdminStatistics() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [serviceStats, setServiceStats] = useState<ServiceStats[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    loadStatistics()
  }, [timeRange])

  const loadStatistics = async () => {
    try {
      setLoading(true)
      const supabase = await getSupabaseClient()

      // Calcular fechas según el rango seleccionado
      const now = new Date()
      const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))
      
      // Estadísticas generales
      const [reservationsResult, usersResult, servicesResult] = await Promise.all([
        supabase
          .from('reservations')
          .select('id, status, total_amount, created_at, service_id')
          .gte('created_at', startDate.toISOString()),
        
        supabase
          .from('profiles')
          .select('id, created_at')
          .gte('created_at', startDate.toISOString()),
        
        supabase
          .from('services')
          .select('id, title, available, created_at')
      ])

      if (reservationsResult.error) throw new Error(`Error cargando reservas: ${reservationsResult.error.message}`)
      if (usersResult.error) throw new Error(`Error cargando usuarios: ${usersResult.error.message}`)
      if (servicesResult.error) throw new Error(`Error cargando servicios: ${servicesResult.error.message}`)

      const reservations = reservationsResult.data || []
      const users = usersResult.data || []
      const services = servicesResult.data || []

      // Calcular estadísticas del período anterior para comparación
      const previousStartDate = new Date(startDate.getTime() - (daysBack * 24 * 60 * 60 * 1000))
      
      const [prevReservationsResult, prevUsersResult] = await Promise.all([
        supabase
          .from('reservations')
          .select('id, total_amount')
          .gte('created_at', previousStartDate.toISOString())
          .lt('created_at', startDate.toISOString()),
        
        supabase
          .from('profiles')
          .select('id')
          .gte('created_at', previousStartDate.toISOString())
          .lt('created_at', startDate.toISOString())
      ])

      const prevReservations = prevReservationsResult.data || []
      const prevUsers = prevUsersResult.data || []

      // Calcular estadísticas
      const totalReservations = reservations.length
      const totalRevenue = reservations.reduce((sum, r) => sum + (r.total_amount || 0), 0)
      const totalUsers = users.length
      const totalServices = services.length
      const activeServices = services.filter(s => s.available).length
      
      const pendingReservations = reservations.filter(r => r.status === 'pending').length
      const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length
      const cancelledReservations = reservations.filter(r => r.status === 'cancelled').length

      // Cálculos de crecimiento
      const reservationsGrowth = prevReservations.length > 0 
        ? ((totalReservations - prevReservations.length) / prevReservations.length) * 100
        : totalReservations > 0 ? 100 : 0

      const prevRevenue = prevReservations.reduce((sum, r) => sum + (r.total_amount || 0), 0)
      const revenueGrowth = prevRevenue > 0 
        ? ((totalRevenue - prevRevenue) / prevRevenue) * 100
        : totalRevenue > 0 ? 100 : 0

      const averageBookingValue = totalReservations > 0 ? totalRevenue / totalReservations : 0
      const conversionRate = totalReservations > 0 ? (confirmedReservations / totalReservations) * 100 : 0

      // Estadísticas mensuales (últimos 12 meses)
      const monthlyStats: MonthlyData[] = []
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
        
        const monthReservations = reservations.filter(r => {
          const date = new Date(r.created_at)
          return date >= monthDate && date < nextMonthDate
        })
        
        const monthUsers = users.filter(u => {
          const date = new Date(u.created_at)
          return date >= monthDate && date < nextMonthDate
        })
        
        monthlyStats.push({
          month: monthDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
          reservations: monthReservations.length,
          revenue: monthReservations.reduce((sum, r) => sum + (r.total_amount || 0), 0),
          users: monthUsers.length
        })
      }

      // Estadísticas por servicio
      const serviceStatsData: ServiceStats[] = []
      for (const service of services) {
        const serviceReservations = reservations.filter(r => r.service_id === service.id)
        const serviceRevenue = serviceReservations.reduce((sum, r) => sum + (r.total_amount || 0), 0)
        
        serviceStatsData.push({
          id: service.id,
          title: service.title,
          totalBookings: serviceReservations.length,
          totalRevenue: serviceRevenue
        })
      }

      setStats({
        totalReservations,
        monthlyReservations: totalReservations,
        totalRevenue: Math.round(totalRevenue),
        monthlyRevenue: Math.round(totalRevenue),
        totalUsers,
        monthlyUsers: totalUsers,
        totalServices,
        activeServices,
        pendingReservations,
        confirmedReservations,
        cancelledReservations,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        reservationsGrowth: Math.round(reservationsGrowth * 10) / 10,
        averageBookingValue: Math.round(averageBookingValue * 100) / 100,
        conversionRate: Math.round(conversionRate * 10) / 10
      })

      setMonthlyData(monthlyStats)
      setServiceStats(serviceStatsData.sort((a, b) => b.totalRevenue - a.totalRevenue))

    } catch (error) {
      toast.error('Error cargando estadísticas')
    } finally {
      setLoading(false)
    }
  }

  const exportStatistics = () => {
    if (!stats) return

    const csvContent = [
      ['Métrica', 'Valor'],
      ['Reservas Totales', stats.totalReservations.toString()],
      ['Ingresos Totales', `€${stats.totalRevenue.toLocaleString()}`],
      ['Usuarios Registrados', stats.totalUsers.toString()],
      ['Servicios Activos', stats.activeServices.toString()],
      ['Reservas Pendientes', stats.pendingReservations.toString()],
      ['Reservas Confirmadas', stats.confirmedReservations.toString()],
      ['Reservas Canceladas', stats.cancelledReservations.toString()],
      ['Crecimiento de Reservas (%)', stats.reservationsGrowth.toString()],
      ['Crecimiento de Ingresos (%)', stats.revenueGrowth.toString()],
      ['Valor Promedio de Reserva', `€${stats.averageBookingValue.toLocaleString()}`],
      ['Tasa de Conversión (%)', stats.conversionRate.toString()]
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `estadisticas_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Estadísticas exportadas correctamente')
  }

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    color = "blue" 
  }: {
    title: string
    value: string | number
    subtitle?: string
    icon: any
    trend?: { value: number; label: string }
    color?: "blue" | "green" | "purple" | "orange" | "red"
  }) => {
    const colorClasses = {
      blue: "text-blue-600 bg-blue-50 border-blue-200",
      green: "text-green-600 bg-green-50 border-green-200",
      purple: "text-purple-600 bg-purple-50 border-purple-200",
      orange: "text-orange-600 bg-orange-50 border-orange-200",
      red: "text-red-600 bg-red-50 border-red-200"
    }

    return (
      <Card className="border-0 shadow-md bg-white border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              {trend.value >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={`text-xs font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trend.value).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">{trend.label}</span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <AdminGuard>
      <AdminLayoutModern>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Estadísticas</h1>
              <p className="mt-1 text-gray-600">Análisis detallado del rendimiento del negocio</p>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 días</SelectItem>
                  <SelectItem value="30d">Últimos 30 días</SelectItem>
                  <SelectItem value="90d">Últimos 90 días</SelectItem>
                  <SelectItem value="1y">Último año</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportStatistics}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-sm text-gray-600">Cargando estadísticas...</p>
              </div>
            </div>
          ) : stats ? (
            <>
              {/* Métricas principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Reservas Totales"
                  value={stats.totalReservations.toLocaleString()}
                  subtitle={`${timeRange === '7d' ? 'Últimos 7 días' : timeRange === '30d' ? 'Últimos 30 días' : timeRange === '90d' ? 'Últimos 90 días' : 'Último año'}`}
                  icon={Calendar}
                  trend={{ value: stats.reservationsGrowth, label: 'vs período anterior' }}
                  color="blue"
                />

                <StatCard
                  title="Ingresos Totales"
                  value={`€${stats.totalRevenue.toLocaleString()}`}
                  subtitle={`€${stats.averageBookingValue.toLocaleString()} promedio por reserva`}
                  icon={Euro}
                  trend={{ value: stats.revenueGrowth, label: 'vs período anterior' }}
                  color="green"
                />

                <StatCard
                  title="Usuarios Registrados"
                  value={stats.totalUsers.toLocaleString()}
                  subtitle={`${stats.totalUsers > 0 ? Math.round((stats.confirmedReservations / stats.totalUsers) * 100) : 0}% tasa de conversión`}
                  icon={Users}
                  color="purple"
                />

                <StatCard
                  title="Servicios Activos"
                  value={`${stats.activeServices}/${stats.totalServices}`}
                  subtitle={`${stats.totalServices > 0 ? Math.round((stats.activeServices / stats.totalServices) * 100) : 0}% activos`}
                  icon={Package}
                  color="orange"
                />
              </div>

              {/* Métricas de reservas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Reservas Pendientes"
                  value={stats.pendingReservations}
                  subtitle={`${stats.totalReservations > 0 ? Math.round((stats.pendingReservations / stats.totalReservations) * 100) : 0}% del total`}
                  icon={Clock}
                  color="orange"
                />

                <StatCard
                  title="Reservas Confirmadas"
                  value={stats.confirmedReservations}
                  subtitle={`${stats.conversionRate.toFixed(1)}% tasa de conversión`}
                  icon={CheckCircle}
                  color="green"
                />

                <StatCard
                  title="Reservas Canceladas"
                  value={stats.cancelledReservations}
                  subtitle={`${stats.totalReservations > 0 ? Math.round((stats.cancelledReservations / stats.totalReservations) * 100) : 0}% del total`}
                  icon={X}
                  color="red"
                />
              </div>

              {/* Gráficos y datos mensuales */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-md bg-white border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                      Tendencia Mensual
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {monthlyData.slice(-6).map((month, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{month.month}</span>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">{month.reservations} reservas</div>
                              <div className="text-xs text-gray-500">€{month.revenue.toLocaleString()}</div>
                            </div>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${Math.min((month.reservations / Math.max(...monthlyData.map(m => m.reservations))) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-white border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PieChart className="w-5 h-5 mr-2 text-purple-500" />
                      Rendimiento por Servicio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {serviceStats.slice(0, 5).map((service, index) => (
                        <div key={service.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">{service.title}</div>
                            <div className="text-xs text-gray-500">{service.totalBookings} reservas</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-gray-900">€{service.totalRevenue.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">
                              {stats.totalRevenue > 0 ? Math.round((service.totalRevenue / stats.totalRevenue) * 100) : 0}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Resumen ejecutivo */}
              <Card className="border-0 shadow-md bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-green-500" />
                    Resumen Ejecutivo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{stats.conversionRate.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">Tasa de Conversión</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {stats.conversionRate > 70 ? 'Excelente' : stats.conversionRate > 50 ? 'Buena' : 'Mejorable'}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">€{stats.averageBookingValue.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Valor Promedio</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {stats.averageBookingValue > 100 ? 'Alto' : stats.averageBookingValue > 50 ? 'Medio' : 'Bajo'}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {stats.totalReservations > 0 ? Math.round(stats.totalReservations / (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365)) : 0}
                      </div>
                      <div className="text-sm text-gray-600">Reservas/Día</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {stats.totalReservations > 0 ? 'Promedio diario' : 'Sin actividad'}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {stats.totalRevenue > 0 ? Math.round(stats.totalRevenue / (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365)) : 0}
                      </div>
                      <div className="text-sm text-gray-600">Ingresos/Día (€)</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {stats.totalRevenue > 0 ? 'Promedio diario' : 'Sin ingresos'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se pudieron cargar las estadísticas</p>
              <p className="text-sm text-gray-400 mt-1">Intenta recargar la página</p>
            </div>
          )}
        </div>
      </AdminLayoutModern>
    </AdminGuard>
  )
}
