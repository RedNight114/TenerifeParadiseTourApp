"use client"

import React, { useState, useEffect } from 'react'
import { useAuthContext } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Euro, Users, TrendingUp, Shield, LogOut, Loader2, Activity, RefreshCw, AlertCircle } from 'lucide-react'
import { AdminGuard } from '@/components/admin/admin-guard'

interface SimpleStats {
  totalReservations: number
  totalServices: number
  totalUsers: number
  activeServices: number
}

export function DashboardSimple() {
  const { user, profile, signOut } = useAuthContext()
  const [stats, setStats] = useState<SimpleStats>({
    totalReservations: 0,
    totalServices: 0,
    totalUsers: 0,
    activeServices: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Función segura para cargar datos
  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Importación dinámica para evitar problemas de SSR
      const { getSupabaseClient } = await import('@/lib/supabase-unified')
      const supabase = await getSupabaseClient()
      
      // Obtener datos básicos con timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )
      
      const dataPromise = Promise.all([
        supabase.from('reservations').select('id').limit(100),
        supabase.from('services').select('id, available').limit(100),
        supabase.from('profiles').select('id').limit(100)
      ])
      
      const [reservationsResult, servicesResult, profilesResult] = await Promise.race([
        dataPromise,
        timeoutPromise
      ]) as any[]

      const reservations = reservationsResult.data || []
      const services = servicesResult.data || []
      const profiles = profilesResult.data || []

      setStats({
        totalReservations: reservations.length,
        totalServices: services.length,
        totalUsers: profiles.length,
        activeServices: services.filter((s: any) => s.available).length
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

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                  <p className="text-sm text-gray-600">
                    Bienvenido, {profile?.full_name || user?.email}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reservas Totales</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.totalReservations}
                </div>
                <p className="text-xs text-muted-foreground">
                  Todas las reservas registradas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Servicios</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.totalServices}
                </div>
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
                <div className="text-2xl font-bold">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.totalUsers}
                </div>
                <p className="text-xs text-muted-foreground">
                  Usuarios registrados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estado del Sistema</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  ) : error ? (
                    <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
                  ) : (
                    <Badge variant="default" className="bg-green-500">
                      Activo
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {loading ? 'Cargando...' : error ? 'Error' : 'Sistema funcionando'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Acciones Rápidas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={loadStats}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Actualizar Estadísticas
                </Button>
                
                <Button 
                  onClick={() => window.open('/admin/chat', '_blank')}
                  className="w-full"
                  variant="outline"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Ir al Chat de Soporte
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Usuario:</span>
                    <span className="font-medium">{profile?.full_name || user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rol:</span>
                    <Badge variant="secondary">{profile?.role || 'user'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Última actualización:</span>
                    <span>{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="mt-6 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center text-red-600">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">Error cargando datos</span>
                </div>
                <p className="text-sm text-red-600 mt-2">{error}</p>
                <Button 
                  onClick={loadStats}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  Reintentar
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminGuard>
  )
}
