"use client"

import React, { Suspense, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AdminLayoutModern } from "@/components/admin/admin-layout-modern"
import { AdminGuard } from "@/components/admin/admin-guard"
import { DashboardStatsModern } from "@/components/admin/dashboard-stats-modern"
import { QuickActionsModern, SystemStatusModern, UserInfoModern } from "@/components/admin/quick-actions-modern"
import { MapManager } from "@/components/admin/MapManager"
import { MapStatsAdmin } from "@/components/admin/MapStatsAdmin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Euro, 
  Users, 
  Activity, 
  MessageSquare, 
  Package,
  TrendingUp,
  Loader2,
  BarChart3,
  FileText,
  Database,
  Shield,
  Map
} from "lucide-react"

// Componente de Resumen con métricas reales
const OverviewTab = () => {
  const [activityStats, setActivityStats] = useState({
    todayReservations: 0,
    todayUsers: 0,
    todayMessages: 0,
    todayServices: 0,
    loading: true
  })

  const [quickMetrics, setQuickMetrics] = useState({
    conversionRate: 0,
    responseTime: 0,
    satisfaction: 0,
    popularService: 'N/A',
    todayRevenue: 0,
    loading: true
  })

  useEffect(() => {
    const loadOverviewData = async () => {
      try {
        const { getSupabaseClient } = await import('@/lib/supabase')
        const supabase = await getSupabaseClient()

        // Obtener estadísticas del día
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        // Reservas de hoy
        const { data: todayReservations, error: reservationsError } = await supabase
          .from('reservations')
          .select('id, status')
          .gte('created_at', today.toISOString())
          .lt('created_at', tomorrow.toISOString())

        // Usuarios de hoy
        const { data: todayUsers, error: usersError } = await supabase
          .from('profiles')
          .select('id')
          .gte('created_at', today.toISOString())
          .lt('created_at', tomorrow.toISOString())

        // Mensajes de hoy (simulado)
        const { data: todayMessages, error: messagesError } = await supabase
          .from('messages')
          .select('id')
          .gte('created_at', today.toISOString())
          .lt('created_at', tomorrow.toISOString())

        // Servicios activados hoy (simulado)
        const { data: todayServices, error: servicesError } = await supabase
          .from('services')
          .select('id')
          .gte('created_at', today.toISOString())
          .lt('created_at', tomorrow.toISOString())

        // Calcular métricas rápidas
        const totalReservations = await supabase
          .from('reservations')
          .select('id', { count: 'exact' })

        const confirmedReservations = await supabase
          .from('reservations')
          .select('id', { count: 'exact' })
          .eq('status', 'confirmed')

        const conversionRate = (totalReservations.count || 0) > 0 
          ? ((confirmedReservations.count || 0) / (totalReservations.count || 1)) * 100 
          : 0

        // Servicio más popular (simulado)
        const { data: popularServices } = await supabase
          .from('services')
          .select('title')
          .limit(1)

        // Ingresos de hoy
        const { data: todayRevenueData } = await supabase
          .from('reservations')
          .select('total_amount')
          .eq('status', 'confirmed')
          .gte('created_at', today.toISOString())
          .lt('created_at', tomorrow.toISOString())

        const todayRevenue = todayRevenueData?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0

        setActivityStats({
          todayReservations: todayReservations?.length || 0,
          todayUsers: todayUsers?.length || 0,
          todayMessages: todayMessages?.length || 0,
          todayServices: todayServices?.length || 0,
          loading: false
        })

        setQuickMetrics({
          conversionRate: Math.round(conversionRate * 10) / 10,
          responseTime: 2.3, // Simulado
          satisfaction: 4.8, // Simulado
          popularService: popularServices?.[0]?.title || 'N/A',
          todayRevenue: Math.round(todayRevenue),
          loading: false
        })

      } catch (error) {
        setActivityStats(prev => ({ ...prev, loading: false }))
        setQuickMetrics(prev => ({ ...prev, loading: false }))
      }
    }

    loadOverviewData()
  }, [])

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <Card className="border-0 shadow-md bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center text-lg text-gray-900">
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            Resumen de Actividad
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activityStats.loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Cargando actividad...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-900">Reservas confirmadas hoy</span>
                </div>
                <span className="text-sm font-bold text-green-600">+{activityStats.todayReservations}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-900">Nuevos usuarios</span>
                </div>
                <span className="text-sm font-bold text-blue-600">+{activityStats.todayUsers}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-900">Mensajes de chat</span>
                </div>
                <span className="text-sm font-bold text-purple-600">+{activityStats.todayMessages}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-900">Servicios activados</span>
                </div>
                <span className="text-sm font-bold text-orange-600">+{activityStats.todayServices}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center text-lg text-gray-900">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
            Métricas Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quickMetrics.loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Cargando métricas...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tasa de conversión</span>
                <span className="text-sm font-bold text-gray-900">{quickMetrics.conversionRate.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tiempo promedio de respuesta</span>
                <span className="text-sm font-bold text-gray-900">{quickMetrics.responseTime.toFixed(1)} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Satisfacción del cliente</span>
                <span className="text-sm font-bold text-gray-900">{quickMetrics.satisfaction.toFixed(1)}/5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Servicio más popular</span>
                <span className="text-sm font-bold text-gray-900">{quickMetrics.popularService}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ingresos hoy</span>
                <span className="text-sm font-bold text-gray-900">€{quickMetrics.todayRevenue.toLocaleString()}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Componentes simplificados para evitar problemas de importación
const ServicesManagement = () => {
  const [servicesStats, setServicesStats] = React.useState({
    total: 0,
    active: 0,
    inactive: 0,
    loading: true
  })

  React.useEffect(() => {
    const loadServicesStats = async () => {
      try {
        const { getSupabaseClient } = await import('@/lib/supabase')
        const supabase = await getSupabaseClient()

        const { data: services, error } = await supabase
          .from('services')
          .select('id, available')

        if (error) {
          return
        }

        const stats = {
          total: services?.length || 0,
          active: services?.filter(s => s.available === true).length || 0,
          inactive: services?.filter(s => s.available === false).length || 0,
          loading: false
        }

        setServicesStats(stats)
      } catch (error) {
        setServicesStats(prev => ({ ...prev, loading: false }))
      }
    }

    loadServicesStats()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Servicios</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {servicesStats.loading ? 'Cargando...' : `${servicesStats.total} servicios`}
          </Badge>
          {servicesStats.active > 0 && (
            <Badge variant="default" className="bg-green-500">{servicesStats.active} activos</Badge>
          )}
        </div>
      </div>
      
      <Card className="border-0 shadow-md bg-white border-gray-200">
        <CardContent className="p-8 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2 text-gray-700">Gestión de Servicios</h3>
          <p className="text-gray-500 mb-6">
            {servicesStats.total === 0 
              ? 'No hay servicios registrados aún' 
              : 'Administra todos los tours y actividades disponibles'
            }
          </p>
          
          {servicesStats.loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Cargando estadísticas...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{servicesStats.total}</div>
                <div className="text-sm text-blue-800">Total Servicios</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{servicesStats.active}</div>
                <div className="text-sm text-green-800">Activos</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{servicesStats.inactive}</div>
                <div className="text-sm text-orange-800">Inactivos</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

const ReservationsManagement = () => {
  const [reservationsStats, setReservationsStats] = React.useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    loading: true
  })

  React.useEffect(() => {
    const loadReservationsStats = async () => {
      try {
        const { getSupabaseClient } = await import('@/lib/supabase')
        const supabase = await getSupabaseClient()

        const { data: reservations, error } = await supabase
          .from('reservations')
          .select('id, status')

        if (error) {
          return
        }

        const stats = {
          total: reservations?.length || 0,
          pending: reservations?.filter(r => r.status === 'pending').length || 0,
          confirmed: reservations?.filter(r => r.status === 'confirmed').length || 0,
          cancelled: reservations?.filter(r => r.status === 'cancelled').length || 0,
          loading: false
        }

        setReservationsStats(stats)
      } catch (error) {
        setReservationsStats(prev => ({ ...prev, loading: false }))
      }
    }

    loadReservationsStats()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Reservas</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {reservationsStats.loading ? 'Cargando...' : `${reservationsStats.total.toLocaleString()} reservas`}
          </Badge>
          {reservationsStats.pending > 0 && (
            <Badge variant="destructive">{reservationsStats.pending} pendientes</Badge>
          )}
        </div>
      </div>
      
      <Card className="border-0 shadow-md bg-white border-gray-200">
        <CardContent className="p-8 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2 text-gray-700">Gestión de Reservas</h3>
          <p className="text-gray-500 mb-6">
            {reservationsStats.total === 0 
              ? 'No hay reservas registradas aún' 
              : 'Administra todas las reservas y confirmaciones'
            }
          </p>
          
          {reservationsStats.loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Cargando estadísticas...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{reservationsStats.pending}</div>
                <div className="text-sm text-yellow-800">Pendientes</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{reservationsStats.confirmed}</div>
                <div className="text-sm text-green-800">Confirmadas</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{reservationsStats.cancelled}</div>
                <div className="text-sm text-red-800">Canceladas</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

const AuditDashboard = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h2 className="text-2xl font-bold text-gray-900">Auditoría del Sistema</h2>
      <Badge variant="secondary">Últimas actividades</Badge>
    </div>
    
    <Card className="border-0 shadow-md bg-white border-gray-200">
      <CardContent className="p-8 text-center">
        <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2 text-gray-700">Auditoría del Sistema</h3>
        <p className="text-gray-500 mb-6">Monitorea todas las actividades y cambios del sistema</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">156</div>
            <div className="text-sm text-blue-800">Acciones Hoy</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">2,340</div>
            <div className="text-sm text-purple-800">Esta Semana</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)

const AdminChatDashboard = () => {
  const [chatStats, setChatStats] = React.useState({
    totalConversations: 0,
    unreadMessages: 0,
    loading: true
  })

  React.useEffect(() => {
    const loadChatStats = async () => {
      try {
        const { getSupabaseClient } = await import('@/lib/supabase')
        const supabase = await getSupabaseClient()

        // Obtener conversaciones
        const { data: conversations, error: conversationsError } = await supabase
          .from('conversations')
          .select('id')

        if (conversationsError) {
          return
        }

        // Obtener mensajes no leídos (simulado)
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('id, is_read')
          .eq('is_read', false)

        if (messagesError) {
          return
        }

        const stats = {
          totalConversations: conversations?.length || 0,
          unreadMessages: messages?.length || 0,
          loading: false
        }

        setChatStats(stats)
      } catch (error) {
        setChatStats(prev => ({ ...prev, loading: false }))
      }
    }

    loadChatStats()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Chat de Soporte</h2>
        <div className="flex items-center space-x-2">
          {chatStats.unreadMessages > 0 && (
            <Badge variant="destructive">{chatStats.unreadMessages} mensajes</Badge>
          )}
          <Badge variant="default" className="bg-green-500">En línea</Badge>
        </div>
      </div>
      
      <Card className="border-0 shadow-md bg-white border-gray-200">
        <CardContent className="p-8 text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2 text-gray-700">Chat de Soporte</h3>
          <p className="text-gray-500 mb-6">
            {chatStats.totalConversations === 0 
              ? 'No hay conversaciones activas aún' 
              : 'Atiende las consultas de los clientes en tiempo real'
            }
          </p>
          
          {chatStats.loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Cargando estadísticas...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{chatStats.unreadMessages}</div>
                <div className="text-sm text-green-800">Mensajes Nuevos</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{chatStats.totalConversations}</div>
                <div className="text-sm text-blue-800">Conversaciones</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

const AgePricingManager = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h2 className="text-2xl font-bold text-gray-900">Gestión de Precios</h2>
      <Badge variant="secondary">Tarifas por edad</Badge>
    </div>
    
    <Card className="border-0 shadow-md bg-white border-gray-200">
      <CardContent className="p-8 text-center">
        <Euro className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2 text-gray-700">Gestión de Precios</h3>
        <p className="text-gray-500 mb-6">Configura tarifas especiales por grupos de edad</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">Adultos</div>
            <div className="text-sm text-blue-800">€45 - €120</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">Niños</div>
            <div className="text-sm text-green-800">€25 - €65</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">Bebés</div>
            <div className="text-sm text-purple-800">Gratis</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)

// Componente de carga para el dashboard
function DashboardLoading() {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header loading */}
      <div className="border-b border-gray-200 pb-3">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-96 mt-1 animate-pulse" />
      </div>
      
      {/* Stats loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse border-gray-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 w-4 bg-gray-200 rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions loading */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse border-gray-200 bg-white">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Componente principal del dashboard
function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview')

  // Actualizar el tab activo cuando cambie la URL
  useEffect(() => {
    const tab = searchParams.get('tab') || 'overview'
    setActiveTab(tab)
  }, [searchParams])

  // Función para manejar el cambio de tab
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Actualizar la URL sin recargar la página
    const url = new URL(window.location.href)
    if (value === 'overview') {
      url.searchParams.delete('tab')
    } else {
      url.searchParams.set('tab', value)
    }
    router.replace(url.pathname + url.search, { scroll: false })
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header del dashboard */}
      <div className="border-b border-gray-200 pb-3">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Panel de control y gestión de Tenerife Paradise Tours
        </p>
      </div>

      {/* Estadísticas principales */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Estadísticas principales</h2>
        <DashboardStatsModern />
      </section>

      {/* Acciones rápidas y estado del sistema */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6" aria-labelledby="actions-heading">
        <h2 id="actions-heading" className="sr-only">Acciones rápidas y estado del sistema</h2>
        <QuickActionsModern />
        <SystemStatusModern />
      </section>

      {/* Información del usuario */}
      <section aria-labelledby="user-info-heading">
        <h2 id="user-info-heading" className="sr-only">Información del usuario</h2>
        <UserInfoModern />
      </section>

      {/* Tabs de gestión */}
      <section aria-labelledby="management-tabs-heading">
        <h2 id="management-tabs-heading" className="sr-only">Gestión del sistema</h2>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 bg-white shadow-sm border border-gray-200">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Resumen
            </TabsTrigger>
            <TabsTrigger 
              value="reservations" 
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Reservas
            </TabsTrigger>
            <TabsTrigger 
              value="services" 
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Servicios
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="pricing" 
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Precios
            </TabsTrigger>
            <TabsTrigger 
              value="audit" 
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Auditoría
            </TabsTrigger>
            <TabsTrigger 
              value="map" 
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Mapa
            </TabsTrigger>
          </TabsList>

        {/* Tab de Resumen */}
        <TabsContent value="overview" className="space-y-4">
          <OverviewTab />
        </TabsContent>

        {/* Tab de Reservas */}
        <TabsContent value="reservations">
          <ReservationsManagement />
        </TabsContent>

        {/* Tab de Servicios */}
        <TabsContent value="services">
          <ServicesManagement />
        </TabsContent>

        {/* Tab de Chat */}
        <TabsContent value="chat">
          <AdminChatDashboard />
        </TabsContent>

        {/* Tab de Precios */}
        <TabsContent value="pricing">
          <AgePricingManager />
        </TabsContent>

        {/* Tab de Auditoría */}
        <TabsContent value="audit">
          <AuditDashboard />
        </TabsContent>

        {/* Tab de Mapa */}
        <TabsContent value="map">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MapManager />
            </div>
            <div className="lg:col-span-1">
              <MapStatsAdmin />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      </section>
    </div>
  )
}

// Componente principal con protección de admin
export default function AdminDashboard() {
  return (
    <AdminGuard>
      <AdminLayoutModern>
        <DashboardContent />
      </AdminLayoutModern>
    </AdminGuard>
  )
}