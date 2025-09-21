"use client"

import { useState, useEffect } from "react"
import { useAuthContext } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, AlertCircle, CheckCircle, User, Database } from "lucide-react"

export default function DashboardDebug() {
  const { user, profile, loading, error, isAuthenticated, isAdmin, isInitialized } = useAuthContext()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState<string | null>(null)

  const testDashboardData = async () => {
    try {
      setDashboardLoading(true)
      setDashboardError(null)
      
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setDashboardData({
        totalReservations: 0,
        totalServices: 24,
        totalUsers: 6,
        message: "Datos de prueba cargados correctamente"
      })
    } catch (err) {
      setDashboardError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setDashboardLoading(false)
    }
  }

  useEffect(() => {
    testDashboardData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard Debug</h1>
          <Button onClick={testDashboardData} disabled={dashboardLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${dashboardLoading ? 'animate-spin' : ''}`} />
            Probar Datos
          </Button>
        </div>

        {/* Estado de Autenticación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Estado de Autenticación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isInitialized ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {isInitialized ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                  Inicializado
                </div>
              </div>
              <div className="text-center">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  loading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {loading ? <AlertCircle className="h-3 w-3 mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                  Cargando
                </div>
              </div>
              <div className="text-center">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isAuthenticated ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                  Autenticado
                </div>
              </div>
              <div className="text-center">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isAdmin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isAdmin ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                  Admin
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <p><strong>Usuario:</strong> {user?.email || 'No autenticado'}</p>
              <p><strong>Perfil:</strong> {profile?.full_name || 'No disponible'}</p>
              <p><strong>Rol:</strong> {profile?.role || 'No disponible'}</p>
              {error && <p className="text-red-600"><strong>Error:</strong> {error}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Estado del Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Estado del Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardLoading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p>Cargando datos del dashboard...</p>
              </div>
            )}

            {dashboardError && (
              <div className="text-center py-4">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600">Error: {dashboardError}</p>
              </div>
            )}

            {dashboardData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{dashboardData.totalReservations}</div>
                  <div className="text-sm text-gray-600">Reservas</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{dashboardData.totalServices}</div>
                  <div className="text-sm text-gray-600">Servicios</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{dashboardData.totalUsers}</div>
                  <div className="text-sm text-gray-600">Usuarios</div>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600">
              <p><strong>Mensaje:</strong> {dashboardData?.message || 'No hay datos'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Información de Debug */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
              <p><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
              <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
