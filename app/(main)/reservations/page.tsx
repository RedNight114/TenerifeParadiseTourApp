"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Clock, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { CancelReservationModal } from "@/components/cancel-reservation-modal"
import { usePageTracking, useInteractionTracking } from "@/hooks/use-analytics"

interface Reservation {
  id: string
  service_id: string
  service_name: string
  service_image: string
  date: string
  time: string
  participants: number
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  created_at: string
  location: string
  duration: string
}

export default function ReservationsPage() {
  // Analytics
  usePageTracking('reservations')
  const { trackClick } = useInteractionTracking()

  const [reservations, setReservations] = useState<Reservation[]>([])
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('date')
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean
    reservation: Reservation | null
  }>({ isOpen: false, reservation: null })

  // Evitar problemas de hidratación
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      loadReservations()
    }
  }, [mounted])

  // Filtrar y ordenar reservas
  useEffect(() => {
    let filtered = [...reservations]

    // Aplicar filtro
    if (filter !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === filter)
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case 'price':
          return b.total_price - a.total_price
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

    setFilteredReservations(filtered)
  }, [reservations, filter, sortBy])

  const loadReservations = async () => {
    try {
      setLoading(true)
      setAuthError(null)
      
      console.log('Loading reservations...')
      
      // Verificar cookies primero
      const cookies = document.cookie
      console.log('Current cookies:', cookies)
      
      const response = await fetch('/api/reservations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', response.status, errorData)
        
        if (response.status === 401) {
          setAuthError('No estás autenticado. Por favor, inicia sesión.')
          return
        }
        
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Reservations loaded:', data.reservations?.length || 0)
      setReservations(data.reservations || [])
    } catch (error) {
      console.error('Error loading reservations:', error)
      setAuthError('Error al cargar las reservas')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelReservation = async (reservationId: string) => {
    try {
      setCancellingId(reservationId)
      
      const response = await fetch(`/api/reservations/${reservationId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Recargar las reservas después de cancelar
      await loadReservations()
      
      // Cerrar modal
      setCancelModal({ isOpen: false, reservation: null })
    } catch (error) {
      console.error('Error cancelling reservation:', error)
    } finally {
      setCancellingId(null)
    }
  }

  const openCancelModal = (reservation: Reservation) => {
    setCancelModal({ isOpen: true, reservation })
  }

  const closeCancelModal = () => {
    if (!cancellingId) {
      setCancelModal({ isOpen: false, reservation: null })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'confirmado': { 
        label: 'Confirmada', 
        className: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200', 
        icon: CheckCircle 
      },
      'pendiente': { 
        label: 'Pendiente', 
        className: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200', 
        icon: Clock 
      },
      'cancelado': { 
        label: 'Cancelada', 
        className: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200', 
        icon: X 
      },
      'completada': { 
        label: 'Completada', 
        className: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200', 
        icon: CheckCircle 
      }
    }
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      className: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200', 
      icon: AlertCircle 
    }
    
    const Icon = statusInfo.icon
    
    return (
      <Badge className={`${statusInfo.className} px-3 py-1 font-semibold shadow-sm`}>
        <Icon className="w-4 h-4 mr-2" />
        {statusInfo.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const formatPrice = (price: number) => {
    try {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    } catch {
      return `${price}€`
    }
  }

  // No renderizar nada hasta que esté montado
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
          <p className="text-gray-600 text-lg">Inicializando...</p>
        </div>
      </div>
    )
  }

  // Mostrar error de autenticación
  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <Card className="max-w-lg w-full mx-4 border-0 shadow-2xl bg-white">
          <CardContent className="text-center py-12">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Error de Autenticación</h3>
            <p className="text-gray-600 mb-8">{authError}</p>
            <Button 
              onClick={() => window.location.href = '/auth/login'}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Ir al Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mb-6">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Cargando reservas</h2>
          <p className="text-gray-600 text-lg">Obteniendo tus reservas...</p>
          <div className="mt-4 flex justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce mx-1"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce mx-1" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce mx-1" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <ReservationsNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16">
        {/* Header Mejorado */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-3">
                Mis Reservas
              </h1>
              <p className="text-lg text-gray-600">
                Gestiona todas tus reservas y excursiones en Tenerife
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-full px-4 py-2 shadow-sm border">
                <span className="text-sm font-medium text-gray-600">
                  {reservations.length} reserva{reservations.length !== 1 ? 's' : ''}
                </span>
              </div>
              <Button 
                onClick={() => window.location.href = '/services'}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Nueva Reserva
              </Button>
            </div>
          </div>
          
          {/* Filtros y Búsqueda */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-semibold text-gray-700">Filtrar por:</span>
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="all">Todas ({reservations.length})</option>
                  <option value="confirmado">Confirmadas ({reservations.filter(r => r.status === 'confirmado').length})</option>
                  <option value="pendiente">Pendientes ({reservations.filter(r => r.status === 'pendiente').length})</option>
                  <option value="cancelado">Canceladas ({reservations.filter(r => r.status === 'cancelado').length})</option>
                </select>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-semibold text-gray-700">Ordenar por:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="date">Fecha</option>
                  <option value="price">Precio</option>
                  <option value="status">Estado</option>
                </select>
              </div>
              <div className="ml-auto">
                <span className="text-sm text-gray-500">
                  Mostrando {filteredReservations.length} de {reservations.length} reservas
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reservations List */}
        {reservations.length === 0 ? (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
            <CardContent className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No tienes reservas</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Aún no has realizado ninguna reserva. Explora nuestros servicios y reserva tu próxima aventura en Tenerife.
              </p>
              <Button 
                onClick={() => window.location.href = '/services'}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Explorar Servicios
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8">
            {filteredReservations.length === 0 ? (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-yellow-50">
                <CardContent className="text-center py-16">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-12 h-12 text-yellow-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No hay reservas con este filtro</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    No se encontraron reservas que coincidan con los criterios seleccionados.
                  </p>
                  <Button 
                    onClick={() => setFilter('all')}
                    className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Ver Todas las Reservas
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredReservations.map((reservation, index) => (
              <Card key={reservation.id} className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white">
                <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-green-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {reservation.service_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold text-gray-900 mb-1">
                            {reservation.service_name}
                          </CardTitle>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span className="bg-white px-2 py-1 rounded-full">#{reservation.id.slice(-8)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{formatDate(reservation.date)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="w-4 h-4 text-green-500" />
                          <span className="font-medium">{reservation.time}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Users className="w-4 h-4 text-purple-500" />
                          <span className="font-medium">{reservation.participants} personas</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-red-500" />
                          <span className="font-medium truncate">{reservation.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-3">
                      {getStatusBadge(reservation.status)}
                      <div className="text-right">
                        <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                          {formatPrice(reservation.total_price)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Duración: {reservation.duration}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Reserva realizada:</span> {formatDate(reservation.created_at)}
                      </div>
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">ID:</span> {reservation.id.slice(0, 8)}...
                      </div>
                    </div>
                    
                    {reservation.status === 'confirmado' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openCancelModal(reservation)}
                        disabled={cancellingId === reservation.id}
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar Reserva
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* Modal de Cancelación */}
      <CancelReservationModal
        isOpen={cancelModal.isOpen}
        onClose={closeCancelModal}
        onConfirm={() => cancelModal.reservation && handleCancelReservation(cancelModal.reservation.id)}
        reservationName={cancelModal.reservation?.service_name || ''}
        reservationDate={cancelModal.reservation ? formatDate(cancelModal.reservation.date) : ''}
        isLoading={cancellingId === cancelModal.reservation?.id}
      />
    </div>
  )
}