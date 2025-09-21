"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, Activity, Clock, CheckCircle, AlertTriangle, User, Calendar, Package, Filter, RefreshCw } from "lucide-react"

interface MockAuditLog {
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

export function AuditDashboardSimple() {
  const [logs, setLogs] = useState<MockAuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    action: '',
    severity: ''
  })

  // Generar datos mock
  const generateMockData = () => {
    const mockLogs: MockAuditLog[] = [
      {
        id: '1',
        action: 'login',
        details: 'Usuario admin inició sesión',
        severity: 'info',
        created_at: new Date().toISOString(),
        user_info: {
          full_name: 'Admin Usuario',
          email: 'admin@tenerife.com'
        }
      },
      {
        id: '2',
        action: 'reservation_created',
        details: 'Nueva reserva creada para el servicio Freebird F24',
        severity: 'info',
        created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        user_info: {
          full_name: 'Juan Pérez',
          email: 'juan@email.com'
        },
        service_info: {
          title: 'Freebird F24'
        },
        reservation_info: {
          id: 'RES001',
          reservation_date: '2024-01-15',
          guests: 4
        }
      },
      {
        id: '3',
        action: 'service_updated',
        details: 'Servicio actualizado: cambios en precios',
        severity: 'warning',
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        user_info: {
          full_name: 'Admin Usuario',
          email: 'admin@tenerife.com'
        },
        service_info: {
          title: 'Five Star Catamarán'
        }
      },
      {
        id: '4',
        action: 'error_occurred',
        details: 'Error al procesar pago de reserva',
        severity: 'error',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        user_info: {
          full_name: 'María García',
          email: 'maria@email.com'
        },
        reservation_info: {
          id: 'RES002',
          reservation_date: '2024-01-16',
          guests: 2
        }
      },
      {
        id: '5',
        action: 'user_registered',
        details: 'Nuevo usuario registrado en el sistema',
        severity: 'info',
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        user_info: {
          full_name: 'Carlos López',
          email: 'carlos@email.com'
        }
      }
    ]
    return mockLogs
  }

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockData = generateMockData()
      
      // Aplicar filtros
      let filteredLogs = mockData
      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => 
          log.action.toLowerCase().includes(filters.action.toLowerCase()) ||
          log.details.toLowerCase().includes(filters.action.toLowerCase())
        )
      }
      if (filters.severity) {
        filteredLogs = filteredLogs.filter(log => log.severity === filters.severity)
      }
      
      setLogs(filteredLogs)
    } catch (error) {
      } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditLogs()
  }, [filters])

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
  }

  const clearFilters = () => {
    setFilters({
      action: '',
      severity: ''
    })
  }

  // Calcular estadísticas
  const stats = {
    totalLogs: logs.length,
    todayLogs: logs.filter(log => 
      new Date(log.created_at).toDateString() === new Date().toDateString()
    ).length,
    thisWeekLogs: logs.filter(log => {
      const logDate = new Date(log.created_at)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return logDate >= weekAgo
    }).length,
    errorLogs: logs.filter(log => log.severity === 'error').length
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
          {loading ? (
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
        </CardContent>
      </Card>
    </div>
  )
}