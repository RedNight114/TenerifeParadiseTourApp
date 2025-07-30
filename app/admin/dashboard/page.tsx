"use client"

import { useState, useEffect } from "react"

import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider-ultra-simple"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Euro, Users, TrendingUp, Shield, LogOut, Loader2, Activity, Search, Filter, RefreshCw, AlertCircle, Clock, CheckCircle, X, MessageSquare, Database } from "lucide-react"
import { ReservationsManagement } from "@/components/admin/reservations-management"
import { ServicesManagement } from "@/components/admin/services-management"
import { AuditDashboard } from "@/components/admin/audit-dashboard"
import { ContactMessages } from "@/components/admin/contact-messages"
import { AdminGuard } from "@/components/admin/admin-guard"

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
  const [activeTab, setActiveTab] = useState("reservations")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [dataStatus, setDataStatus] = useState<'loading' | 'success' | 'error'>('loading')

  const { user, profile, signOut } = useAuth()

  const loadDashboardStats = async (isRefresh = false) => {
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

      console.log('🔄 Cargando estadísticas del dashboard...')

      // 1. Obtener reservas con información completa
      const { data: reservations, error: reservationsError } = await supabase
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
        console.error('❌ Error al cargar reservas:', reservationsError)
        throw new Error(`Error al cargar reservas: ${reservationsError.message}`)
      }

      console.log(`✅ Reservas cargadas: ${reservations?.length || 0}`)

      // 2. Obtener servicios con información completa - CORREGIDO: usar 'available' en lugar de 'status'
      const { data: services, error: servicesError } = await supabase
        .from("services")
        .select("id, title, price, available, created_at")
        .order('created_at', { ascending: false })

      if (servicesError) {
        console.error('❌ Error al cargar servicios:', servicesError)
        throw new Error(`Error al cargar servicios: ${servicesError.message}`)
      }

      console.log(`✅ Servicios cargados: ${services?.length || 0}`)

      // 3. Obtener usuarios (perfiles)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, created_at")
        .order('created_at', { ascending: false })

      if (profilesError) {
        console.error('❌ Error al cargar perfiles:', profilesError)
        // No lanzamos error aquí, solo log
      }

      console.log(`✅ Perfiles cargados: ${profiles?.length || 0}`)

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
      console.log('📊 Estadísticas del Dashboard Actualizadas:', {
        totalReservations,
        monthlyReservations,
        totalRevenue: formatCurrency(totalRevenue),
        monthlyRevenue: formatCurrency(monthlyRevenue),
        totalServices,
        activeServices,
        pendingReservations,
        confirmedReservations,
        cancelledReservations,
        totalUsers,
        monthlyUsers
      })

      // Verificar datos reales
      if (totalReservations > 0) {
        console.log('📋 Ejemplo de reserva:', reservations?.[0])
      }
      if (totalServices > 0) {
        console.log('🔧 Ejemplo de servicio:', services?.[0])
      }

    } catch (err) {
      const errorMessage = `Error al cargar estadísticas: ${(err as Error).message}`
      setError(errorMessage)
      setDataStatus('error')
      console.error('❌ Error del Dashboard:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    loadDashboardStats(true)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
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

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    loadDashboardStats()
  }, [])

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
        
        {/* Header Optimizado */}
        <header className="admin-header">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-4">
                  <div className="p-2.5 bg-blue-600 rounded-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Panel de Administración
                    </h1>
                    <p className="text-sm text-gray-600 font-medium">Tenerife Paradise Tours & Excursions</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12 ring-2 ring-blue-400/30 shadow-lg">
                    <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={getUserName()} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold">
                      {getUserInitials(getUserName())}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">{getUserName()}</p>
                    <p className="text-xs text-gray-600">{user?.email}</p>
                  </div>
                </div>
                <Button 
                  onClick={handleSignOut} 
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </header>

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

          {/* Tarjetas de Estadísticas - Optimizadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="admin-stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-4xl font-bold text-blue-600 mb-2">
                      {stats.totalReservations.toLocaleString()}
                    </p>
                    <p className="text-sm font-semibold text-gray-700">Reservas Totales</p>
                    <p className="text-xs text-gray-500 mt-1">{stats.monthlyReservations} este mes</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0 ml-4">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="admin-stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-4xl font-bold text-green-600 mb-2">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                    <p className="text-sm font-semibold text-gray-700">Ingresos Totales</p>
                    <p className="text-xs text-gray-500 mt-1">{formatCurrency(stats.monthlyRevenue)} este mes</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg flex-shrink-0 ml-4">
                    <Euro className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="admin-stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-4xl font-bold text-purple-600 mb-2">
                      {stats.activeServices.toLocaleString()}
                    </p>
                    <p className="text-sm font-semibold text-gray-700">Servicios Activos</p>
                    <p className="text-xs text-gray-500 mt-1">{stats.totalServices} total registrados</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg flex-shrink-0 ml-4">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="admin-stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Estado de Reservas</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Pendientes:</span>
                        <span className="text-sm font-bold text-orange-600">{stats.pendingReservations}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Confirmadas:</span>
                        <span className="text-sm font-bold text-green-600">{stats.confirmedReservations}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Canceladas:</span>
                        <span className="text-sm font-bold text-red-600">{stats.cancelledReservations}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg flex-shrink-0 ml-4">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

                  {/* Tabs de Gestión - Simples */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="admin-tab-list grid w-full grid-cols-4 p-2">
            <TabsTrigger 
              value="reservations" 
              className="admin-tab-trigger data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Calendar className="h-5 w-5 mr-2" />
              <span className="font-semibold">Reservas</span>
            </TabsTrigger>
            <TabsTrigger 
              value="services" 
              className="admin-tab-trigger data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Activity className="h-5 w-5 mr-2" />
              <span className="font-semibold">Servicios</span>
            </TabsTrigger>
            <TabsTrigger 
              value="audit" 
              className="admin-tab-trigger data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Shield className="h-5 w-5 mr-2" />
              <span className="font-semibold">Auditoría</span>
            </TabsTrigger>
            <TabsTrigger 
              value="messages" 
              className="admin-tab-trigger data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              <span className="font-semibold">Mensajes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reservations" className="space-y-8">
            {/* Gestión de Reservas */}
            <ReservationsManagement />
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <ServicesManagement />
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <AuditDashboard />
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <ContactMessages />
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </AdminGuard>
  )
}
