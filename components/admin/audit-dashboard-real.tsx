"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, Activity, Clock, CheckCircle, AlertTriangle, User, Calendar, Package, Search, Filter, RefreshCw } from "lucide-react"

interface AuditLog {
  id: string
  action: string
  details: string
  severity: 'info' | 'warning' | 'error'
  user_id?: string
  service_id?: string
  reservation_id?: string
  created_at: string
  user_info?: {
    full_name: string
    email: string
  }
  service_info?: {
    title: string
  }
  reservation_info?: {
    id: string
    reservation_date: string
    guests: number
  }
}

interface AuditStats {
  totalLogs: number
  todayLogs: number
  thisWeekLogs: number
  errorLogs: number
  warningLogs: number
  infoLogs: number
}

export function AuditDashboardReal() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<AuditStats>({
    totalLogs: 0,
    todayLogs: 0,
    thisWeekLogs: 0,
    errorLogs: 0,
    warningLogs: 0,
    infoLogs: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    action: '',
    severity: ''
  })

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      })

      const response = await fetch(`/api/admin/audit-logs?${params}`, {
        credentials: 'include'
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('No autorizado - Usuario no autenticado')
          return
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.logs) {
        setLogs(data.logs || [])
        setTotalPages(data.pagination?.totalPages || 1)
        
        // Calcular estadísticas básicas
        const today = new Date().toISOString().split('T')[0]
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        
        const todayLogs = data.logs?.filter((log: AuditLog) => 
          log.created_at.startsWith(today)
        ).length || 0
        
        const thisWeekLogs = data.logs?.filter((log: AuditLog) => 
          log.created_at >= weekAgo
        ).length || 0

        const errorLogs = data.logs?.filter((log: AuditLog) => log.severity === 'error').length || 0
        const warningLogs = data.logs?.filter((log: AuditLog) => log.severity === 'warning').length || 0
        const infoLogs = data.logs?.filter((log: AuditLog) => log.severity === 'info').length || 0

        setStats({
          totalLogs: data.pagination?.total || 0,
          todayLogs,
          thisWeekLogs,
          errorLogs,
          warningLogs,
          infoLogs
        })
      }
    } catch (error) {
      setError('Error al cargar los logs de auditoría')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditLogs()
  }, [page])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'info': return <CheckCircle className="w-4 h-4 text-blue-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1) // Reset to first page when filtering
  }

  const clearFilters = () => {
    setFilters({
      action: '',
      severity: ''
    })
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Logs</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalLogs}</div>
            <p className="text-xs text-gray-500">Registros totales</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Hoy</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.todayLogs}</div>
            <p className="text-xs text-gray-500">Acciones de hoy</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Esta Semana</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.thisWeekLogs}</div>
            <p className="text-xs text-gray-500">Últimos 7 días</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Errores</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.errorLogs}</div>
            <p className="text-xs text-gray-500">Logs de error</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2 text-purple-500" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Acción</label>
              <Input
                placeholder="Buscar acción..."
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Severidad</label>
              <Input
                placeholder="info, warning, error"
                value={filters.severity}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={fetchAuditLogs} disabled={loading} variant="outline" size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button onClick={clearFilters} variant="outline" size="sm">
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs de Auditoría */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2 text-purple-500" />
            Registro de Actividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 mb-2">Error al cargar los datos</p>
              <p className="text-gray-500 text-sm">{error}</p>
              <Button onClick={fetchAuditLogs} className="mt-4" variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
            </div>
          ) : loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-64"></div>
                  </div>
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron logs de auditoría</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className={`p-4 rounded-lg border ${getSeverityColor(log.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getSeverityIcon(log.severity)}
                        <Badge variant="outline" className={getSeverityColor(log.severity)}>
                          {log.severity.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{log.action}</span>
                      </div>
                      <p className="text-sm mb-2">{log.details}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                        {log.user_info && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{log.user_info.full_name}</span>
                          </div>
                        )}
                        {log.service_info && (
                          <div className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            <span>{log.service_info.title}</span>
                          </div>
                        )}
                        {log.reservation_info && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Reserva #{log.reservation_info.id}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 ml-4">
                      {formatDate(log.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Página {page} de {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1 || loading}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages || loading}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
