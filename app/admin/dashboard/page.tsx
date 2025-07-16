"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Euro, Users, TrendingUp, Shield, LogOut, Loader2, Activity } from "lucide-react"
import { ReservationsManagement } from "@/components/admin/reservations-management"
import { ServicesManagement } from "@/components/admin/services-management"
import { AuditDashboard } from "@/components/admin/audit-dashboard"

interface DashboardStats {
  totalReservations: number
  monthlyReservations: number
  totalRevenue: number
  monthlyRevenue: number
  totalServices: number
  pendingReservations: number
  confirmedReservations: number
  cancelledReservations: number
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
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("reservations")
  const [authChecked, setAuthChecked] = useState(false)

  const { user, profile, loading: authLoading, signOut } = useAuth()
  const router = useRouter()

  // Verificar permisos de administrador una sola vez
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/admin/login")
      return
    }

    if (profile && profile.role !== "admin") {
      router.push("/")
      return
    }

    if (user && (profile === null || profile.role === "admin")) {
      setAuthChecked(true)
    }
  }, [user, profile, authLoading, router])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const currentDate = new Date()
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

      // Obtener reservas
      const { data: reservations, error: reservationsError } = await supabase
        .from("reservations")
        .select("id, total_amount, status, created_at")

      if (reservationsError) {
        throw new Error(`Error fetching reservations: ${reservationsError.message}`)
      }

      // Obtener servicios
      const { data: services, error: servicesError } = await supabase.from("services").select("id")

      if (servicesError) {
        throw new Error(`Error fetching services: ${servicesError.message}`)
      }

      // Calcular estadísticas
      const totalReservations = reservations?.length || 0
      const monthlyReservations = reservations?.filter((r) => new Date(r.created_at) >= firstDayOfMonth).length || 0

      const totalRevenue = reservations?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0
      const monthlyRevenue =
        reservations
          ?.filter((r) => new Date(r.created_at) >= firstDayOfMonth)
          .reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0

      const totalServices = services?.length || 0

      const pendingReservations = reservations?.filter((r) => r.status === "pending").length || 0
      const confirmedReservations = reservations?.filter((r) => r.status === "confirmed").length || 0
      const cancelledReservations = reservations?.filter((r) => r.status === "cancelled").length || 0

      setStats({
        totalReservations,
        monthlyReservations,
        totalRevenue,
        monthlyRevenue,
        totalServices,
        pendingReservations,
        confirmedReservations,
        cancelledReservations,
      })
    } catch (err) {
      setError(`Error loading dashboard stats: ${  (err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  // Cargar estadísticas solo cuando la autenticación esté verificada
  useEffect(() => {
    if (authChecked && user && profile?.role === "admin") {
      loadDashboardStats()
    }
  }, [authChecked, user, profile])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/admin/login")
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

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando permisos de administrador...</p>
        </div>
      </div>
    )
  }

  // Si no es admin, no mostrar nada (el useEffect ya redirige)
  if (!user || (profile && profile.role !== "admin")) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del Dashboard - Marcado como admin-header */}
      <header className="admin-header bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
                  <p className="text-sm text-gray-500">Tenerife Paradise Tours & Excursions</p>
                </div>
              </div>
            </div>

            {/* Usuario y acciones */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={getUserName()} />
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {getUserInitials(getUserName())}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{getUserName()}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Resumen General</h2>
            <p className="text-gray-600">Vista general de la actividad de la plataforma</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-red-600">
                  <p className="font-semibold">Error al cargar estadísticas</p>
                  <p className="text-sm mt-1">{error}</p>
                  <Button onClick={loadDashboardStats} variant="outline" className="mt-4 bg-transparent">
                    Reintentar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Reservas Totales */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Reservas Totales</CardTitle>
                  <Calendar className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalReservations.toLocaleString()}</div>
                  <p className="text-xs text-gray-500 mt-1">{stats.monthlyReservations} este mes</p>
                </CardContent>
              </Card>

              {/* Ingresos Totales */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Ingresos Totales</CardTitle>
                  <Euro className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    €{stats.totalRevenue.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    €{stats.monthlyRevenue.toLocaleString("es-ES", { minimumFractionDigits: 2 })} este mes
                  </p>
                </CardContent>
              </Card>

              {/* Servicios Disponibles */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Servicios Disponibles</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalServices}</div>
                  <p className="text-xs text-gray-500 mt-1">Servicios registrados</p>
                </CardContent>
              </Card>

              {/* Estado de Reservas */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Estado de Reservas</CardTitle>
                  <Users className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        Pendientes
                      </Badge>
                      <span className="text-sm font-semibold">{stats.pendingReservations}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="default" className="text-xs">
                        Confirmadas
                      </Badge>
                      <span className="text-sm font-semibold">{stats.confirmedReservations}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="destructive" className="text-xs">
                        Canceladas
                      </Badge>
                      <span className="text-sm font-semibold">{stats.cancelledReservations}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Tabs de gestión */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reservations" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Gestión de Reservas
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Gestión de Servicios
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Auditoría y Seguridad
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reservations">
            <ReservationsManagement />
          </TabsContent>

          <TabsContent value="services">
            <ServicesManagement />
          </TabsContent>

          <TabsContent value="audit">
            <AuditDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
