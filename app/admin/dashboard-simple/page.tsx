"use client"

import { useAuthContext } from "@/components/auth-provider"
import { AdminGuard } from "@/components/admin/admin-guard"
import { DashboardBasic } from "@/components/admin/dashboard-basic"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle } from "lucide-react"

export default function DashboardSimple() {
  const { user } = useAuthContext()
  const { stats, loading, error, refreshData } = useDashboardData()

  return (
    <AdminGuard>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Simplificado</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Estado de carga */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando dashboard...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Si esto tarda más de 10 segundos, se mostrarán datos vacíos
              </p>
            </div>
          </div>
        )}

        {/* Estado de timeout */}
        {false && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
              <p className="text-muted-foreground">La carga tardó demasiado</p>
              <p className="text-sm text-muted-foreground mt-2">
                Mostrando datos vacíos. Intenta actualizar.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                className="mt-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </div>
        )}

        {/* Estado de error */}
        {error && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <p className="text-muted-foreground">Error al cargar datos</p>
              <p className="text-sm text-muted-foreground mt-2">
                {error || 'Error desconocido'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                className="mt-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </div>
        )}

        {/* Dashboard con datos */}
        {stats && (
          <DashboardBasic stats={stats} loading={loading} />
        )}

        {/* Información de debug */}
        <div className="text-xs text-muted-foreground mt-8 p-4 bg-gray-50 rounded-lg">
          <p><strong>Estado:</strong> {loading ? 'Cargando...' : error ? 'Error' : 'Cargado'}</p>
          <p><strong>Cargando:</strong> {loading ? 'Sí' : 'No'}</p>
          <p><strong>Usuario:</strong> {user?.email || 'No autenticado'}</p>
          {error && <p><strong>Error:</strong> {error}</p>}
        </div>
      </div>
    </AdminGuard>
  )
}
