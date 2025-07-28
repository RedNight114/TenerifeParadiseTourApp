"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useReservations } from "@/hooks/use-reservations"
import { getSupabaseClient } from "@/lib/supabase-optimized"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, AlertCircle, CheckCircle, User, Plus, X, Clock, MapPin, Users, CreditCard } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ReservationsPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const { reservations, loading: reservationsLoading, error: reservationsError, cancelReservation } = useReservations()
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('🔒 Usuario no autenticado, redirigiendo al login')
      router.push('/auth/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Cargar perfil cuando el usuario esté disponible
  useEffect(() => {
    if (user?.id) {
      loadProfile()
    }
  }, [user?.id])

  const loadProfile = async () => {
    if (!user?.id) return

    try {
      const client = getSupabaseClient()
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

      if (error) {
        console.error("Error cargando perfil en reservas:", error)
        return
      }

      if (data) {
        setProfile(data)
      }
    } catch (error) {
      console.error("Error cargando perfil en reservas:", error)
    }
  }

  const handleCancelReservation = async (reservationId: string) => {
    try {
      await cancelReservation(reservationId)
    } catch (error) {
      console.error("Error cancelando reserva:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmada</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completada</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "cancelled":
        return <X className="w-4 h-4 text-red-600" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-blue-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getPaymentStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "pagado":
        return <Badge className="bg-green-100 text-green-800 ml-2">Pago realizado</Badge>
      case "pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800 ml-2">Pago pendiente</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800 ml-2">Pago fallido</Badge>
      default:
        return <Badge variant="secondary" className="ml-2">{paymentStatus}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Fecha no disponible"
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(price)
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getUserAvatar = () => {
    return profile?.avatar_url || "/placeholder.svg"
  }

  const getUserName = () => {
    return profile?.full_name || user?.email || "Usuario"
  }

  const ReservationCard = ({ reservation }: { reservation: any }) => (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl sm:text-2xl mb-3 text-gray-900">{reservation.service_name}</CardTitle>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm sm:text-base text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span>{formatDate(reservation.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span>{reservation.location || "Tenerife"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                <span>{reservation.participants} personas</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusIcon(reservation.status)}
            {getStatusBadge(reservation.status)}
            {getPaymentStatusBadge(reservation.payment_status)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">
              {formatPrice(reservation.total_price)}
            </div>
            <div className="text-sm sm:text-base text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
              Reserva #{reservation.id.slice(0, 8)}
            </div>
          </div>
          {reservation.status === "pending" && (
            <Button
              variant="outline"
              size="default"
              onClick={() => handleCancelReservation(reservation.id)}
              className="text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Cancelar
            </Button>
          )}
        </div>
        {reservation.notes && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{reservation.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  // Mostrar loading mientras verifica autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verificando autenticación</h2>
          <p className="text-gray-600">Por favor, espera un momento...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, no mostrar nada (ya se redirigió)
  if (!isAuthenticated || !user) {
    return null
  }

  // Filtrar reservas por estado
  const upcomingReservations = reservations.filter(
    (r) => r.status === "confirmed" && new Date(r.date) > new Date()
  )
  const pendingReservations = reservations.filter((r) => r.status === "pending")
  const historyReservations = reservations.filter(
    (r) => r.status === "completed" || r.status === "cancelled" || new Date(r.date) < new Date()
  )

  // Mostrar error si hay problemas cargando reservas
  if (reservationsError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Alert className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Error al cargar las reservas: {reservationsError}
            </AlertDescription>
          </Alert>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/hero-background.avif')",
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Mis Reservas
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Gestiona todas tus reservas y experiencias en Tenerife
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* User Info */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-6 sm:p-8 bg-white rounded-xl shadow-lg border border-gray-100">
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20 ring-4 ring-blue-50 flex-shrink-0">
                <AvatarImage src={getUserAvatar()} alt={getUserName()} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg sm:text-xl font-bold">
                  {getUserInitials(getUserName())}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{getUserName()}</h2>
                <p className="text-base sm:text-lg text-gray-600 mb-4">{user?.email}</p>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Link href="/profile">
                    <Button variant="outline" size="default" className="w-full sm:w-auto px-6 py-2">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Ver Perfil
                    </Button>
                  </Link>
                  <Link href="/services">
                    <Button size="default" className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Nueva Reserva
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-8 h-auto p-1">
              <TabsTrigger value="upcoming" className="flex items-center gap-2 py-3 px-4 text-sm sm:text-base">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Próximas</span>
                <span className="sm:hidden">Próximas</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {upcomingReservations.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2 py-3 px-4 text-sm sm:text-base">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Pendientes</span>
                <span className="sm:hidden">Pendientes</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {pendingReservations.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2 py-3 px-4 text-sm sm:text-base">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Historial</span>
                <span className="sm:hidden">Historial</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {historyReservations.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {reservationsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando reservas...</p>
                </div>
              ) : upcomingReservations.length > 0 ? (
                upcomingReservations.map((reservation) => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes reservas próximas</h3>
                    <p className="text-gray-600 mb-4">
                      Explora nuestros servicios y reserva tu próxima aventura en Tenerife
                    </p>
                    <Link href="/services">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Ver Servicios
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {reservationsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando reservas...</p>
                </div>
              ) : pendingReservations.length > 0 ? (
                pendingReservations.map((reservation) => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes reservas pendientes</h3>
                    <p className="text-gray-600">
                      Todas tus reservas están confirmadas o completadas
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {reservationsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando historial...</p>
                </div>
              ) : historyReservations.length > 0 ? (
                historyReservations.map((reservation) => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes historial de reservas</h3>
                    <p className="text-gray-600 mb-4">
                      Comienza a explorar y reserva tu primera experiencia en Tenerife
                    </p>
                    <Link href="/services">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Ver Servicios
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )
}
