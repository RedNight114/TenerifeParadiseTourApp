"use client"

import { useState, useEffect, useCallback } from "react"

import { getSupabaseClient } from "@/lib/supabase-optimized"
import { useAuthContext } from "@/components/auth-provider"
import { AuditLogger } from "@/lib/audit-logger"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Euro, Users, TrendingUp, Shield, LogOut, Loader2, Activity, Search, Filter, RefreshCw, AlertCircle, Clock, CheckCircle, X, MessageSquare, MessageCircle, Database, User, TrendingDown, Minus, Image } from "lucide-react"
import { ReservationsManagement } from "@/components/admin/reservations-management"
import { ServicesManagement } from "@/components/admin/services-management"
import { AuditDashboard } from "@/components/admin/audit-dashboard"
import { AdminChatDashboard } from "@/components/chat/admin-chat-dashboard"
import { AgePricingManager } from "@/components/admin/age-pricing-manager"
import { AdminGuard } from "@/components/admin/admin-guard"
import { StatCard } from "@/components/admin/stat-card"
import { StatusCard } from "@/components/admin/status-card"
import { logError, logDashboard, logPerformance } from '@/lib/logger';

interface DashboardStats {
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

interface Reservation {
  id: string
  total_amount: number
  status: string
  created_at: string
  user_id: string
  service_id: string
  profiles?: {
    full_name: string
    email: string
  }
  services?: {
    title: string
  }
}

interface Service {
  id: string
  title: string
  price: number
  available: boolean
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalReservations: 0,
    monthlyReservations: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalServices: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    cancelledReservations: 0,
    activeServices: 0,
    totalUsers: 0,
    monthlyUsers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("chat")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [dataStatus, setDataStatus] = useState<'loading' | 'success' | 'error'>('loading')

  const { user, profile, signOut } = useAuthContext()

  const loadDashboardStats = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
      setDataStatus('loading')

      const currentDate = new Date()
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

      logDashboard('Cargando estadísticas del dashboard...');
      
      // Registrar acceso al dashboard
      try {
        await AuditLogger.logAdminAction('dashboard_access', {
          action: isRefresh ? 'refresh' : 'load',
          timestamp: new Date().toISOString()
        }, user?.id)
      } catch (auditError) {
        // No fallar si el audit logger falla
}

      // 1. Obtener reservas con información completa
      const supabaseClient = getSupabaseClient()
      const client = await supabaseClient.getClient()
      
      if (!client) {
        throw new Error('Cliente de Supabase no disponible')
      }

      const { data: reservations, error: reservationsError } = await client
        .from("reservations")
        .select(`
          id, 
          total_amount, 
          status, 
          created_at,
          user_id,
          service_id,
          profiles!inner(full_name, email),
          services!inner(title)
        `)
        .order('created_at', { ascending: false })

      if (reservationsError) {
        logError('Error al cargar reservas', reservationsError);
        throw new Error(`Error al cargar reservas: ${reservationsError.message}`)
      }

      logDashboard('Reservas cargadas', { count: reservations?.length || 0 });

      // 2. Obtener servicios con información completa - CORREGIDO: usar 'available' en lugar de 'status'
      const { data: services, error: servicesError } = await client
        .from("services")
        .select("id, title, price, available, created_at")
        .order('created_at', { ascending: false })

      if (servicesError) {
        logError('Error al cargar servicios', servicesError);
        throw new Error(`Error al cargar servicios: ${servicesError.message}`)
      }

      logDashboard('Servicios cargados', { count: services?.length || 0 });

      // 3. Obtener usuarios (perfiles)
      const { data: profiles, error: profilesError } = await client
        .from("profiles")
        .select("id, full_name, email, created_at")
        .order('created_at', { ascending: false })

      if (profilesError) {
        logError('Error al cargar perfiles', profilesError);
        // No lanzamos error aquí, solo log
      }

      logDashboard('Perfiles cargados', { count: profiles?.length || 0 });

      // 4. Calcular estadísticas detalladas
      const totalReservations = reservations?.length || 0
      const monthlyReservations = reservations?.filter((r) => new Date(String(r.created_at)) >= firstDayOfMonth).length || 0

      const totalRevenue = reservations?.reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0) || 0
      const monthlyRevenue =
        reservations
          ?.filter((r) => new Date(String(r.created_at)) >= firstDayOfMonth)
          .reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0) || 0

      const totalServices = services?.length || 0
      const activeServices = services?.filter((s) => s.available === true).length || 0

      const pendingReservations = reservations?.filter((r) => r.status === "pendiente").length || 0
      const confirmedReservations = reservations?.filter((r) => r.status === "confirmado").length || 0
      const cancelledReservations = reservations?.filter((r) => r.status === "cancelado").length || 0

      const totalUsers = profiles?.length || 0
      const monthlyUsers = profiles?.filter((p) => new Date(String(p.created_at)) >= firstDayOfMonth).length || 0

      const newStats = {
        totalReservations,
        monthlyReservations,
        totalRevenue,
        monthlyRevenue,
        totalServices,
        pendingReservations,
        confirmedReservations,
        cancelledReservations,
        activeServices,
        totalUsers,
        monthlyUsers,
      }

      setStats(newStats)
      setLastUpdated(new Date())
      setDataStatus('success')

      // Log detallado para debugging
      if (process.env.NODE_ENV === 'development') {
        logDashboard('Estadísticas del Dashboard Actualizadas', {
          reservas: totalReservations,
          reservasMensuales: monthlyReservations,
          ingresosTotales: formatCurrency(totalRevenue),
          ingresosMensuales: formatCurrency(monthlyRevenue),
          serviciosTotales: totalServices,
          serviciosActivos: activeServices,
          reservasPendientes: pendingReservations,
          reservasConfirmadas: confirmedReservations,
          reservasCanceladas: cancelledReservations,
          usuariosTotales: totalUsers,
          usuariosMensuales: monthlyUsers
        });
      }

      // Registrar estadísticas cargadas
      await AuditLogger.logAdminAction('dashboard_stats_loaded', {
        totalReservations,
        monthlyReservations,
        totalRevenue,
        monthlyRevenue,
        totalServices,
        activeServices,
        pendingReservations,
        confirmedReservations,
        cancelledReservations,
        totalUsers,
        monthlyUsers
      }, user?.id)

      // Verificar datos reales
      if (totalReservations > 0) {
        if (process.env.NODE_ENV === 'development') {
          logDashboard('Ejemplo de reserva', reservations?.[0]);
        }
      }
      if (totalServices > 0) {
        if (process.env.NODE_ENV === 'development') {
          logDashboard('Ejemplo de servicio', services?.[0]);
        }
      }

    } catch (err) {
      const errorMessage = `Error al cargar estadísticas: ${(err as Error).message}`
      setError(errorMessage)
      setDataStatus('error')
      logError('Error del Dashboard', err);
      
      // Registrar error
      await AuditLogger.logError(err as Error, { context: 'dashboard_stats_load' }, user?.id)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.id]);

  const handleRefresh = () => {
    loadDashboardStats(true)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      logError("Error al cerrar sesión", error);
    }
  }

  const getUserName = () => {
    return profile?.full_name || user?.email || "Administrador"
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente': return 'text-orange-600'
      case 'confirmado': return 'text-green-600'
      case 'cancelado': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pendiente': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'confirmado': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Función para obtener el color de tendencia
  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-600'
    if (current < previous) return 'text-red-600'
    return 'text-gray-600'
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-3 w-3" />
    if (current < previous) return <TrendingDown className="h-3 w-3" />
    return <Minus className="h-3 w-3" />
  }

  // Función para calcular el porcentaje de cambio
  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    loadDashboardStats()
  }, [loadDashboardStats])

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">
            Cargando dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        
        {/* Header Mejorado - Fijo en la parte superior */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-white/20 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 sm:h-20 lg:h-24">
              {/* Logo y Título */}
              <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
                  <div className="relative group">
                    <div className="p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl transform hover:scale-105 transition-all duration-300 pulse-glow">
                      <Shield className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white transform group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-green-400 rounded-full border border-white sm:border-2 animate-pulse"></div>
                    <div className="absolute -bottom-0.5 -left-0.5 sm:-bottom-1 sm:-left-1 w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-3 lg:h-3 bg-blue-300 rounded-full opacity-60 float-animation"></div>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1">
                    <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight">
                      Panel de Administración
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium tracking-wide hidden sm:block">
                      TenerifeParadiseTour&Excursions
                    </p>
                  </div>
                </div>
              </div>

                            {/* Información del Usuario y Acciones */}
              <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6 xl:space-x-8">
                <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-5 xl:space-x-6">
                  <div className="relative group admin-avatar">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16 admin-avatar-ring">
                      <AvatarImage 
                        src={profile?.avatar_url || "/placeholder.svg"} 
                        alt={getUserName()}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 text-white text-sm sm:text-base lg:text-lg xl:text-xl font-bold">
                        {getUserInitials(getUserName())}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 lg:-bottom-1.5 lg:-right-1.5 xl:-bottom-2 xl:-right-2 w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 bg-green-500 rounded-full border-2 sm:border-3 border-white shadow-md sm:shadow-lg admin-status-indicator"></div>
                    <div className="absolute -top-0.5 -left-0.5 sm:-top-1 sm:-left-1 lg:-top-1.5 lg:-left-1.5 xl:-top-2 xl:-left-2 w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 xl:w-4 xl:h-4 bg-blue-300 rounded-full opacity-60 animate-bounce"></div>
                  </div>
                  <div className="hidden sm:block space-y-0.5 sm:space-y-1 lg:space-y-1.5 admin-user-info">
                    <p className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-gray-900 leading-tight admin-user-name">{getUserName()}</p>
                    <p className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium truncate max-w-[160px] lg:max-w-[200px] xl:max-w-none admin-user-email">{user?.email}</p>
                    <div className="flex items-center space-x-1.5 sm:space-x-2 admin-online-status">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-2.5 lg:h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs sm:text-sm lg:text-base text-green-600 font-semibold">En línea</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={handleSignOut} 
                  variant="outline"
                  size="sm"
                  className="border border-gray-200 sm:border-2 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:border-red-300 hover:text-red-700 transition-all duration-300 shadow-sm sm:shadow-lg hover:shadow-xl transform hover:scale-105 px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-2 text-xs sm:text-sm"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4 lg:h-4 lg:w-4 mr-1 sm:mr-1.5 lg:mr-2" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                  <span className="sm:hidden">Salir</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Espaciador para el header fijo */}
        <div className="h-16 sm:h-20 lg:h-24"></div>

        {/* Espaciador para el header fijo */}
        <div className="h-20"></div>

        {/* Contenido Principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Resumen General - Futurista */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Resumen General
                </h2>
                <p className="text-gray-600">Vista general de la actividad de la plataforma</p>
                {lastUpdated && (
                  <p className="text-sm text-gray-500 mt-2">
                    Última actualización: {formatDate(lastUpdated)}
                  </p>
                )}
              </div>
              <Button 
                onClick={handleRefresh} 
                disabled={refreshing}
                className="admin-button"
                size="sm"
              >
                <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualizando...' : 'Actualizar Datos'}
              </Button>
            </div>

          {/* Tarjetas de Estadísticas - Mejoradas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tarjeta de Reservas */}
            <StatCard
              title="Reservas Totales"
              value={stats.totalReservations}
              badge={`+${stats.monthlyReservations} este mes`}
              icon={Calendar}
              iconColor="text-blue-600"
              bgGradient="bg-gradient-to-br from-blue-50 to-blue-100/50"
              badgeColor="bg-blue-100 text-blue-700 border-blue-200"
              trend={{
                value: Math.round((stats.monthlyReservations / Math.max(stats.totalReservations, 1)) * 100),
                label: "vs total",
                isPositive: stats.monthlyReservations > 0
              }}
            />

            {/* Tarjeta de Ingresos */}
            <StatCard
              title="Ingresos Totales"
              value={formatCurrency(stats.totalRevenue)}
              badge={`+${formatCurrency(stats.monthlyRevenue)} este mes`}
              icon={Euro}
              iconColor="text-green-600"
              bgGradient="bg-gradient-to-br from-green-50 to-green-100/50"
              badgeColor="bg-green-100 text-green-700 border-green-200"
              trend={{
                value: Math.round(getPercentageChange(stats.monthlyRevenue, stats.totalRevenue)),
                label: "vs total",
                isPositive: stats.monthlyRevenue > 0
              }}
            />

            {/* Tarjeta de Servicios */}
            <StatCard
              title="Servicios Activos"
              value={stats.activeServices}
              badge={`${Math.round((stats.activeServices / Math.max(stats.totalServices, 1)) * 100)}% activos`}
              icon={Activity}
              iconColor="text-purple-600"
              bgGradient="bg-gradient-to-br from-purple-50 to-purple-100/50"
              badgeColor="bg-purple-100 text-purple-700 border-purple-200"
              progress={{
                value: stats.activeServices,
                max: stats.totalServices,
                label: `${stats.totalServices} total`
              }}
            />

            {/* Tarjeta de Estado de Reservas */}
            <StatusCard
              title="Estado de Reservas"
              items={[
                {
                  label: "Pendientes",
                  value: stats.pendingReservations,
                  color: "#ea580c",
                  bgColor: "#fed7aa"
                },
                {
                  label: "Confirmadas",
                  value: stats.confirmedReservations,
                  color: "#16a34a",
                  bgColor: "#dcfce7"
                },
                {
                  label: "Canceladas",
                  value: stats.cancelledReservations,
                  color: "#dc2626",
                  bgColor: "#fee2e2"
                }
              ]}
              icon={Users}
              iconColor="text-orange-600"
              bgGradient="bg-gradient-to-br from-orange-50 to-orange-100/50"
              badge="Estado"
            />
                </div>

          {/* Tarjetas Adicionales de Información */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* Tarjeta de Usuarios */}
            <StatCard
              title="Usuarios Registrados"
              value={stats.totalUsers}
              badge={`+${stats.monthlyUsers} este mes`}
              icon={User}
              iconColor="text-indigo-600"
              bgGradient="bg-gradient-to-br from-indigo-50 to-indigo-100/50"
              badgeColor="bg-indigo-100 text-indigo-700 border-indigo-200"
              progress={{
                value: stats.monthlyUsers,
                max: stats.totalUsers,
                label: "Nuevos"
              }}
            />

            {/* Tarjeta de Tasa de Conversión */}
            <StatCard
              title="Reservas Confirmadas"
              value={stats.confirmedReservations}
              badge={`${Math.round((stats.confirmedReservations / Math.max(stats.totalReservations, 1)) * 100)}%`}
              icon={CheckCircle}
              iconColor="text-emerald-600"
              bgGradient="bg-gradient-to-br from-emerald-50 to-emerald-100/50"
              badgeColor="bg-emerald-100 text-emerald-700 border-emerald-200"
              progress={{
                value: stats.confirmedReservations,
                max: stats.totalReservations,
                label: "Tasa de éxito"
              }}
            />

            {/* Tarjeta de Promedio de Ingresos */}
            <StatCard
              title="Por Reserva"
              value={formatCurrency(stats.totalReservations > 0 ? stats.totalRevenue / stats.totalReservations : 0)}
              badge="Promedio"
              icon={TrendingUp}
              iconColor="text-amber-600"
              bgGradient="bg-gradient-to-br from-amber-50 to-amber-100/50"
              badgeColor="bg-amber-100 text-amber-700 border-amber-200"
              progress={{
                value: Math.min((stats.totalRevenue / Math.max(stats.totalReservations, 1)) / 200, 1) * 100,
                max: 100,
                label: "Valor promedio"
              }}
            />
          </div>
        </div>

                                    {/* Tabs de Gestión - Sin Fondo */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
          <TabsList className="grid w-full grid-cols-6 p-1 bg-gray-100/50 rounded-xl gap-2">
            <TabsTrigger 
              value="reservations" 
              className="relative group px-6 py-4 rounded-lg font-semibold text-base transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:scale-102 hover:bg-white/80"
            >
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-lg bg-blue-100/50 data-[state=active]:bg-white/20">
                  <Calendar className="h-5 w-5 text-blue-600 data-[state=active]:text-white" />
                </div>
                <span>Reservas</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="services" 
              className="relative group px-6 py-4 rounded-lg font-semibold text-base transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:scale-102 hover:bg-white/80"
            >
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-lg bg-emerald-100/50 data-[state=active]:bg-white/20">
                  <Activity className="h-5 w-5 text-emerald-600 data-[state=active]:text-white" />
                </div>
                <span>Servicios</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="images" 
              className="relative group px-6 py-4 rounded-lg font-semibold text-base transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:scale-102 hover:bg-white/80"
            >
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-lg bg-pink-100/50 data-[state=active]:bg-white/20">
                  <Image className="h-5 w-5 text-pink-600 data-[state=active]:text-white" />
                </div>
                <span>Imágenes</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="audit" 
              className="relative group px-6 py-4 rounded-lg font-semibold text-base transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:scale-102 hover:bg-white/80"
            >
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-lg bg-purple-100/50 data-[state=active]:bg-white/20">
                  <Shield className="h-5 w-5 text-purple-600 data-[state=active]:text-white" />
                </div>
                <span>Auditoría</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="pricing" 
              className="relative group px-6 py-4 rounded-lg font-semibold text-base transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:scale-102 hover:bg-white/80"
            >
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-lg bg-indigo-100/50 data-[state=active]:bg-white/20">
                  <Euro className="h-5 w-5 text-indigo-600 data-[state=active]:text-white" />
                </div>
                <span>Precios</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="relative group px-6 py-4 rounded-lg font-semibold text-base transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:scale-102 hover:bg-white/80"
            >
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-lg bg-orange-100/50 data-[state=active]:bg-white/20">
                  <MessageCircle className="h-5 w-5 text-orange-600 data-[state=active]:text-white" />
                </div>
                <span>Chat de Soporte</span>
              </div>
            </TabsTrigger>
          </TabsList>

                      <TabsContent value="reservations" className="space-y-8 pt-8">
            {/* Gestión de Reservas */}
            <ReservationsManagement />
          </TabsContent>

                      <TabsContent value="services" className="space-y-8 pt-8">
            <ServicesManagement />
          </TabsContent>

          <TabsContent value="images" className="space-y-8 pt-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Imágenes</h2>
                <p className="text-gray-600">
                  Administra el almacenamiento de imágenes y limpia archivos huérfanos
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="h-5 w-5 text-pink-600" />
                      Acceso Rápido
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Accede a la gestión completa de imágenes del sistema
                    </p>
                    <Button 
                      onClick={() => window.open('/admin/image-management', '_blank')}
                      className="w-full"
                      variant="outline"
                    >
                      Abrir Gestión de Imágenes
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      Información del Sistema
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bucket:</span>
                        <Badge variant="secondary">service-images</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Compresión:</span>
                        <Badge variant="outline" className="text-green-600">Activada</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Formato:</span>
                        <Badge variant="secondary">JPG, PNG, WebP</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

                      <TabsContent value="pricing" className="space-y-8 pt-8">
            <AgePricingManager />
          </TabsContent>

                      <TabsContent value="audit" className="space-y-8 pt-8">
            <AuditDashboard />
          </TabsContent>

                      <TabsContent value="chat" className="space-y-8 pt-8">
            <AdminChatDashboard showHeader={false} showNavbar={false} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </AdminGuard>
  )
}

