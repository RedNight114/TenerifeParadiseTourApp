"use client"

import React, { useState, useEffect } from "react"
import { AdminLayoutModern } from "@/components/admin/admin-layout-modern"
import { AdminGuard } from "@/components/admin/admin-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  Search,
  BarChart3,
  TrendingUp,
  Users,
  Euro,
  Package,
  Clock,
  CheckCircle,
  X,
  Loader2,
  Eye,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"
import { getSupabaseClient } from "@/lib/supabase"

interface ReportData {
  reservations: any[]
  users: any[]
  services: any[]
  summary: {
    totalReservations: number
    totalRevenue: number
    totalUsers: number
    averageBookingValue: number
    conversionRate: number
  }
}

interface ReportFilters {
  dateFrom: string
  dateTo: string
  status: string
  serviceId: string
  userId: string
}

export default function AdminReports() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    status: 'all',
    serviceId: 'all',
    userId: 'all'
  })

  useEffect(() => {
    loadServicesAndUsers()
    generateReport()
  }, [])

  const loadServicesAndUsers = async () => {
    try {
      const supabase = await getSupabaseClient()

      const [servicesResult, usersResult] = await Promise.all([
        supabase.from('services').select('id, title').order('title'),
        supabase.from('profiles').select('id, full_name, email').order('full_name')
      ])

      if (servicesResult.data) setServices(servicesResult.data)
      if (usersResult.data) setUsers(usersResult.data)
    } catch (error) {
      }
  }

  const generateReport = async () => {
    try {
      setLoading(true)
      const supabase = await getSupabaseClient()

      // Construir consulta de reservas con filtros
      let reservationsQuery = supabase
        .from('reservations')
        .select(`
          *,
          services:service_id (
            title
          ),
          profiles:user_id (
            full_name,
            email
          )
        `)
        .gte('created_at', filters.dateFrom + 'T00:00:00')
        .lte('created_at', filters.dateTo + 'T23:59:59')

      // Aplicar filtros adicionales
      if (filters.status !== 'all') {
        reservationsQuery = reservationsQuery.eq('status', filters.status)
      }
      if (filters.serviceId !== 'all') {
        reservationsQuery = reservationsQuery.eq('service_id', filters.serviceId)
      }
      if (filters.userId !== 'all') {
        reservationsQuery = reservationsQuery.eq('user_id', filters.userId)
      }

      const { data: reservations, error: reservationsError } = await reservationsQuery.order('created_at', { ascending: false })

      if (reservationsError) {
        throw new Error(`Error cargando reservas: ${reservationsError.message}`)
      }

      // Cargar usuarios del período
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .gte('created_at', filters.dateFrom + 'T00:00:00')
        .lte('created_at', filters.dateTo + 'T23:59:59')

      if (usersError) {
        throw new Error(`Error cargando usuarios: ${usersError.message}`)
      }

      // Cargar servicios
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id, title, available, created_at')

      if (servicesError) {
        throw new Error(`Error cargando servicios: ${servicesError.message}`)
      }

      // Calcular resumen
      const totalReservations = reservations?.length || 0
      const totalRevenue = reservations?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0
      const totalUsers = usersData?.length || 0
      const averageBookingValue = totalReservations > 0 ? totalRevenue / totalReservations : 0
      const confirmedReservations = reservations?.filter(r => r.status === 'confirmed').length || 0
      const conversionRate = totalReservations > 0 ? (confirmedReservations / totalReservations) * 100 : 0

      setReportData({
        reservations: reservations || [],
        users: usersData || [],
        services: servicesData || [],
        summary: {
          totalReservations,
          totalRevenue: Math.round(totalRevenue),
          totalUsers,
          averageBookingValue: Math.round(averageBookingValue * 100) / 100,
          conversionRate: Math.round(conversionRate * 10) / 10
        }
      })

    } catch (error) {
      toast.error('Error generando reporte')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = (type: 'reservations' | 'users' | 'summary') => {
    if (!reportData) return

    let csvContent = ''
    let filename = ''

    switch (type) {
      case 'reservations':
        csvContent = [
          ['ID', 'Cliente', 'Email', 'Servicio', 'Fecha', 'Hora', 'Participantes', 'Monto', 'Estado', 'Pago', 'Notas'],
          ...reportData.reservations.map(r => [
            r.id,
            r.profiles?.full_name || r.contact_name || 'N/A',
            r.profiles?.email || r.contact_email || 'N/A',
            r.services?.title || 'N/A',
            new Date(r.reservation_date).toLocaleDateString(),
            r.reservation_time || 'N/A',
            r.guests,
            `€${r.total_amount}`,
            r.status,
            r.payment_status,
            r.notes || ''
          ])
        ].map(row => row.join(',')).join('\n')
        filename = `reporte_reservas_${filters.dateFrom}_${filters.dateTo}.csv`
        break

      case 'users':
        csvContent = [
          ['ID', 'Nombre', 'Email', 'Fecha Registro'],
          ...reportData.users.map(u => [
            u.id,
            u.full_name || 'N/A',
            u.email || 'N/A',
            new Date(u.created_at).toLocaleDateString()
          ])
        ].map(row => row.join(',')).join('\n')
        filename = `reporte_usuarios_${filters.dateFrom}_${filters.dateTo}.csv`
        break

      case 'summary':
        csvContent = [
          ['Métrica', 'Valor'],
          ['Total Reservas', reportData.summary.totalReservations.toString()],
          ['Ingresos Totales', `€${reportData.summary.totalRevenue.toLocaleString()}`],
          ['Usuarios Registrados', reportData.summary.totalUsers.toString()],
          ['Valor Promedio Reserva', `€${reportData.summary.averageBookingValue.toLocaleString()}`],
          ['Tasa de Conversión', `${reportData.summary.conversionRate}%`],
          ['Período', `${filters.dateFrom} a ${filters.dateTo}`]
        ].map(row => row.join(',')).join('\n')
        filename = `resumen_${filters.dateFrom}_${filters.dateTo}.csv`
        break
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success(`Reporte ${type} exportado correctamente`)
  }

  const exportToPDF = () => {
    // Esta funcionalidad requeriría una librería como jsPDF
    toast.info('Funcionalidad de PDF en desarrollo')
  }

  return (
    <AdminGuard>
      <AdminLayoutModern>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
              <p className="mt-1 text-gray-600">Genera y exporta reportes detallados del negocio</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={generateReport} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Generar Reporte
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <Card className="border-0 shadow-md bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="w-5 h-5 mr-2 text-blue-500" />
                Filtros del Reporte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="dateFrom">Fecha Desde</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo">Fecha Hasta</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendientes</SelectItem>
                      <SelectItem value="confirmed">Confirmadas</SelectItem>
                      <SelectItem value="cancelled">Canceladas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="service">Servicio</Label>
                  <Select value={filters.serviceId} onValueChange={(value) => setFilters({...filters, serviceId: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los servicios</SelectItem>
                      {services.map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="user">Usuario</Label>
                  <Select value={filters.userId} onValueChange={(value) => setFilters({...filters, userId: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los usuarios</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-sm text-gray-600">Generando reporte...</p>
              </div>
            </div>
          ) : reportData ? (
            <>
              {/* Resumen ejecutivo */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card className="border-0 shadow-md bg-white border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Reservas</CardTitle>
                    <Calendar className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{reportData.summary.totalReservations.toLocaleString()}</div>
                    <p className="text-xs text-gray-500 mt-1">En el período seleccionado</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-white border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Ingresos Totales</CardTitle>
                    <Euro className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">€{reportData.summary.totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-gray-500 mt-1">€{reportData.summary.averageBookingValue.toLocaleString()} promedio</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-white border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Usuarios Nuevos</CardTitle>
                    <Users className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{reportData.summary.totalUsers.toLocaleString()}</div>
                    <p className="text-xs text-gray-500 mt-1">Registrados en el período</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-white border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Tasa de Conversión</CardTitle>
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{reportData.summary.conversionRate.toFixed(1)}%</div>
                    <p className="text-xs text-gray-500 mt-1">Reservas confirmadas</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-white border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Servicios Activos</CardTitle>
                    <Package className="h-4 w-4 text-indigo-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {reportData.services.filter(s => s.available).length}/{reportData.services.length}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Disponibles</p>
                  </CardContent>
                </Card>
              </div>

              {/* Sección de exportación */}
              <Card className="border-0 shadow-md bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="w-5 h-5 mr-2 text-green-500" />
                    Exportar Reportes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <h3 className="font-semibold text-gray-900 mb-1">Reservas Detalladas</h3>
                      <p className="text-sm text-gray-600 mb-3">{reportData.reservations.length} registros</p>
                      <Button size="sm" onClick={() => exportToCSV('reservations')}>
                        <Download className="w-4 h-4 mr-2" />
                        CSV
                      </Button>
                    </div>

                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <Users className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                      <h3 className="font-semibold text-gray-900 mb-1">Usuarios Registrados</h3>
                      <p className="text-sm text-gray-600 mb-3">{reportData.users.length} registros</p>
                      <Button size="sm" onClick={() => exportToCSV('users')}>
                        <Download className="w-4 h-4 mr-2" />
                        CSV
                      </Button>
                    </div>

                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <h3 className="font-semibold text-gray-900 mb-1">Resumen Ejecutivo</h3>
                      <p className="text-sm text-gray-600 mb-3">Métricas principales</p>
                      <Button size="sm" onClick={() => exportToCSV('summary')}>
                        <Download className="w-4 h-4 mr-2" />
                        CSV
                      </Button>
                    </div>

                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-red-500" />
                      <h3 className="font-semibold text-gray-900 mb-1">Reporte Completo</h3>
                      <p className="text-sm text-gray-600 mb-3">Todos los datos</p>
                      <Button size="sm" variant="outline" onClick={exportToPDF}>
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vista previa de datos */}
              <Card className="border-0 shadow-md bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-blue-500" />
                    Vista Previa de Datos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Reservas recientes */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservas Recientes</h3>
                      <div className="space-y-3">
                        {reportData.reservations.slice(0, 5).map((reservation) => (
                          <div key={reservation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                {reservation.status === 'pending' ? (
                                  <Clock className="w-5 h-5 text-blue-600" />
                                ) : reservation.status === 'confirmed' ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <X className="w-5 h-5 text-red-600" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {reservation.profiles?.full_name || reservation.contact_name || 'Cliente'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {reservation.services?.title || 'Servicio'} • {new Date(reservation.reservation_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">€{reservation.total_amount}</div>
                              <Badge className={
                                reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {reservation.status === 'confirmed' ? 'Confirmada' :
                                 reservation.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                      {reportData.reservations.length > 5 && (
                        <p className="text-sm text-gray-500 mt-3 text-center">
                          Mostrando 5 de {reportData.reservations.length} reservas
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay datos para mostrar</p>
              <p className="text-sm text-gray-400 mt-1">Ajusta los filtros y genera un reporte</p>
            </div>
          )}
        </div>
      </AdminLayoutModern>
    </AdminGuard>
  )
}