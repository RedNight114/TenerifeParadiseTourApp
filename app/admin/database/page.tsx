"use client"

import React, { useState, useEffect } from "react"
import { AdminLayoutFinal } from "@/components/admin/admin-layout-final"
import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Database, 
  Server, 
  HardDrive, 
  Activity,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Loader2
} from "lucide-react"

interface DatabaseStats {
  totalTables: number
  totalRecords: number
  databaseSize: string
  lastBackup?: string
  connectionStatus: 'connected' | 'disconnected' | 'error'
  activeConnections: number
}

export default function AdminDatabase() {
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(true)

  const loadDatabaseStats = async () => {
    try {
      setLoading(true)
      // Simular carga de estadísticas de base de datos
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStats({
        totalTables: 12,
        totalRecords: 15420,
        databaseSize: '2.4 MB',
        lastBackup: new Date().toISOString(),
        connectionStatus: 'connected',
        activeConnections: 3
      })
    } catch (error) {
      } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDatabaseStats()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      default:
        return <Activity className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-500">Conectado</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Desconectado</Badge>
    }
  }

  return (
    <AdminGuard>
      <AdminLayoutFinal>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Base de Datos</h1>
              <AdminBreadcrumbs 
                customItems={[
                  { label: 'Admin', href: '/admin/dashboard' },
                  { label: 'Base de Datos' }
                ]}
                className="mt-2"
              />
            </div>
            <Button
              onClick={loadDatabaseStats}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>

          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estado de Conexión</CardTitle>
                {stats ? getStatusIcon(stats.connectionStatus) : <Loader2 className="w-4 h-4 animate-spin" />}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    getStatusBadge(stats?.connectionStatus || 'disconnected')
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeConnections || 0} conexiones activas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tablas</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    stats?.totalTables || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tablas en la base de datos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Registros</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    stats?.totalRecords?.toLocaleString() || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total de registros
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tamaño</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    stats?.databaseSize || '0 MB'
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tamaño de la base de datos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Información detallada */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Motor de Base de Datos:</span>
                  <span className="text-sm font-medium">PostgreSQL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Versión:</span>
                  <span className="text-sm font-medium">15.4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Host:</span>
                  <span className="text-sm font-medium">Supabase Cloud</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Región:</span>
                  <span className="text-sm font-medium">eu-west-1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">SSL:</span>
                  <Badge variant="default" className="bg-green-500">Habilitado</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Última Copia de Seguridad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats?.lastBackup ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fecha:</span>
                      <span className="text-sm font-medium">
                        {new Date(stats.lastBackup).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Hora:</span>
                      <span className="text-sm font-medium">
                        {new Date(stats.lastBackup).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Estado:</span>
                      <Badge variant="default" className="bg-green-500">Completada</Badge>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No hay información de copia de seguridad
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Acciones de administración */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones de Administración</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Database className="w-6 h-6 mb-2" />
                  <span>Optimizar Base de Datos</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <HardDrive className="w-6 h-6 mb-2" />
                  <span>Crear Copia de Seguridad</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Activity className="w-6 h-6 mb-2" />
                  <span>Ver Logs del Sistema</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayoutFinal>
    </AdminGuard>
  )
}
