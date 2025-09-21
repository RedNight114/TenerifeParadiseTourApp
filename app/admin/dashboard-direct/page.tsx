"use client"

import { useState, useEffect } from "react"
import { useAuthContext } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, AlertCircle, CheckCircle, Database } from "lucide-react"
import { getSimpleSupabaseClient } from "@/lib/supabase-simple"

export default function DashboardDirect() {
  const { user, profile, loading: authLoading } = useAuthContext()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState<string | null>(null)
  const [dataStatus, setDataStatus] = useState<'loading' | 'success' | 'error' | 'timeout'>('loading')

  const loadDashboardData = async () => {
    try {
      setDashboardLoading(true)
      setDashboardError(null)
      setDataStatus('loading')
      
      // Timeout de seguridad
      const timeoutId = setTimeout(() => {
        setDataStatus('timeout')
        setDashboardError('La carga tardó demasiado')
        setDashboardLoading(false)
      }, 10000)

      const supabase = getSimpleSupabaseClient()
      
      // Obtener datos básicos
      const [reservationsResult, servicesResult, profilesResult] = await Promise.all([
        supabase.from('reservations').select('id, total_amount, status, created_at').limit(100),
        supabase.from('services').select('id, title, available').limit(100),
        supabase.from('profiles').select('id, full_name, email, created_at').limit(100)
      ])

      clearTimeout(timeoutId)

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

      // Calcular estadísticas básicas
      const stats = {
        totalReservations: reservations.length,
        totalServices: services.length,
        totalUsers: profiles.length,
        activeServices: services.filter(s => s.available).length,
        pendingReservations: reservations.filter(r => r.status === 'pendiente').length,
        confirmedReservations: reservations.filter(r => r.status === 'confirmado').length,
        cancelledReservations: reservations.filter(r => r.status === 'cancelado').length,
        totalRevenue: reservations.reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0)
      }

      setDashboardData(stats)
      setDataStatus('success')
      
    } catch (err) {
      setDashboardError(err instanceof Error ? err.message : 'Error desconocido')
      setDataStatus('error')
    } finally {
      setDashboardLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Verificar autenticación básica
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">No autenticado</p>
          <p className="text-sm text-gray-600 mt-2">Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">No tienes permisos de administrador</p>
          <p className="text-sm text-gray-600 mt-2">Tu rol: {profile?.role || 'No definido'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard Directo</h1>
          <div className="flex items-center space-x-2">
            <Button onClick={loadDashboardData} disabled={dashboardLoading} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${dashboardLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Estado de carga */}
        {dashboardLoading && dataStatus === 'loading' && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando dashboard...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Si esto tarda más de 10 segundos, se mostrarán datos vacíos
              </p>
            </div>
          </div>
        )}

        {/* Estado de timeout */}
        {dataStatus === 'timeout' && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
              <p className="text-muted-foreground">La carga tardó demasiado</p>
              <p className="text-sm text-muted-foreground mt-2">
                Mostrando datos vacíos. Intenta actualizar.
              </p>
              <Button onClick={loadDashboardData} className="mt-4" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </div>
        )}

        {/* Estado de error */}
        {dataStatus === 'error' && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <p className="text-muted-foreground">Error al cargar datos</p>
              <p className="text-sm text-muted-foreground mt-2">
                {dashboardError || 'Error desconocido'}
              </p>
              <Button onClick={loadDashboardData} className="mt-4" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </div>
        )}

        {/* Dashboard con datos */}
        {(dataStatus === 'success' || dataStatus === 'timeout') && dashboardData && (
          <div className="space-y-6">
            {/* Estadísticas principales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.totalReservations}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData.pendingReservations} pendientes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{dashboardData.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData.confirmedReservations} confirmadas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Servicios</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.totalServices}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData.activeServices} activos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Registrados en el sistema
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Mensaje informativo si no hay datos */}
            {dashboardData.totalReservations === 0 && (
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
        )}

        {/* Información de debug */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Estado:</strong> {dataStatus}</p>
              <p><strong>Cargando:</strong> {dashboardLoading ? 'Sí' : 'No'}</p>
              <p><strong>Usuario:</strong> {user?.email || 'No autenticado'}</p>
              <p><strong>Perfil:</strong> {profile?.full_name || 'No disponible'}</p>
              <p><strong>Rol:</strong> {profile?.role || 'No disponible'}</p>
              {dashboardError && <p><strong>Error:</strong> {dashboardError}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
