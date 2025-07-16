"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useReservations } from "@/hooks/use-reservations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Users, Euro, CheckCircle, XCircle, AlertCircle, ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ReservationsPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const { reservations, loading: reservationsLoading, fetchReservations, cancelReservation } = useReservations()
  const router = useRouter()

  // Handle authentication
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  // Fetch reservations only once when user is available
  useEffect(() => {
    if (user?.id) {
      fetchReservations(user.id)
    }
  }, [user?.id, fetchReservations])

  const handleCancelReservation = async (reservationId: string) => {
    if (!user?.id) return

    if (confirm("¿Estás seguro de que quieres cancelar esta reserva?")) {
      try {
        const result = await cancelReservation(reservationId, user.id)
        if (result.error) {
          alert(`Error al cancelar la reserva: ${  result.error}`)
        }
      } catch (error) {
        alert("Error al cancelar la reserva")
      }
    }
  }

  // Filtrar reservas por estado
  const upcomingReservations =
    reservations?.filter((r) => r.status === "confirmado" && new Date(r.reservation_date) > new Date()) || []

  const pendingReservations = reservations?.filter((r) => r.status === "pendiente") || []

  const historyReservations =
    reservations?.filter(
      (r) =>
        r.status === "completado" ||
        r.status === "cancelado" ||
        (r.status === "confirmado" && new Date(r.reservation_date) <= new Date()),
    ) || []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmado":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmada
          </Badge>
        )
      case "pendiente":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        )
      case "cancelado":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelada
          </Badge>
        )
      case "completado":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completada
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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

  // Obtener la imagen de perfil del usuario
  const getUserAvatar = () => {
    return profile?.avatar_url || user?.user_metadata?.avatar_url || "/placeholder.svg"
  }

  const getUserName = () => {
    return profile?.full_name || user?.user_metadata?.full_name || user?.email || "Usuario"
  }

  const ReservationCard = ({ reservation }: { reservation: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
              {reservation.service?.title || "Servicio no disponible"}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              {reservation.service?.category || "Sin categoría"}
            </CardDescription>
          </div>
          {getStatusBadge(reservation.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-[#0061A8]" />
            <span>{formatDate(reservation.reservation_date)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2 text-[#0061A8]" />
            <span>{reservation.reservation_time || "Por confirmar"}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-2 text-[#0061A8]" />
            <span>{reservation.guests} personas</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Euro className="w-4 h-4 mr-2 text-[#0061A8]" />
            <span className="font-semibold">{formatPrice(reservation.total_amount)}</span>
          </div>
        </div>

        {reservation.special_requests && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Solicitudes especiales:</strong> {reservation.special_requests}
            </p>
          </div>
        )}

        {reservation.status === "pendiente" && (
          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCancelReservation(reservation.id)}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Cancelar Reserva
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0061A8] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-[#0061A8]">Acceso Requerido</CardTitle>
            <CardDescription>Necesitas iniciar sesión para ver tus reservas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/login">
              <Button className="w-full bg-[#0061A8] hover:bg-[#0061A8]/90">Iniciar Sesión</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative h-80 bg-gradient-to-r from-[#0061A8] to-[#F4C762] overflow-hidden">
        <Image
          src="/images/hero-tenerife-sunset.jpg"
          alt="Reservas Background"
          fill
          className="object-cover mix-blend-overlay opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-[#F4C762]/20 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex items-center justify-center h-full pt-20">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-center mb-6">
              <Avatar className="h-20 w-20 mr-6 ring-4 ring-white/30 shadow-2xl">
                <AvatarImage src={getUserAvatar() || "/placeholder.svg"} alt={getUserName()} className="object-cover" />
                <AvatarFallback className="bg-white/20 text-white text-2xl backdrop-blur-sm font-bold">
                  {getUserInitials(getUserName())}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg">
                  ¡Hola, {getUserName().split(" ")[0] || "Usuario"}!
                </h1>
                <p className="text-xl opacity-90 drop-shadow-md">Bienvenido a tu centro de experiencias</p>
              </div>
            </div>
            <p className="text-lg opacity-80 mb-8 drop-shadow-md max-w-2xl mx-auto">
              Gestiona tus reservas, descubre nuevas aventuras y vive experiencias únicas en Tenerife
            </p>
            <div className="flex justify-center gap-6">
              <Link href="/services">
                <Button className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="w-5 h-5 mr-2" />
                  Nueva Reserva
                </Button>
              </Link>
              <Link href="/profile">
                <Button
                  variant="outline"
                  className="bg-transparent text-white border-white/50 hover:bg-white/10 px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Editar Perfil
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Reservations Tabs */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#0061A8]/5 to-[#F4C762]/5">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <Calendar className="w-6 h-6 mr-3 text-[#0061A8]" />
              Mis Reservas
            </CardTitle>
            <CardDescription className="text-base">Gestiona todas tus reservas y experiencias</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="upcoming" className="text-base font-semibold">
                  Próximas ({upcomingReservations.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-base font-semibold">
                  Pendientes ({pendingReservations.length})
                </TabsTrigger>
                <TabsTrigger value="history" className="text-base font-semibold">
                  Historial ({historyReservations.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming">
                {reservationsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0061A8] mx-auto mb-4"></div>
                      <p className="text-gray-600">Cargando reservas...</p>
                    </div>
                  </div>
                ) : upcomingReservations.length === 0 ? (
                  <div className="text-center py-16">
                    <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-6" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No tienes reservas próximas</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      ¡Explora nuestros servicios y reserva tu próxima aventura en Tenerife!
                    </p>
                    <Link href="/services">
                      <Button className="bg-gradient-to-r from-[#0061A8] to-[#F4C762] hover:from-[#0061A8]/90 hover:to-[#F4C762]/90 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                        Explorar Servicios
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {upcomingReservations.map((reservation) => (
                      <ReservationCard key={reservation.id} reservation={reservation} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pending">
                {reservationsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0061A8] mx-auto mb-4"></div>
                      <p className="text-gray-600">Cargando reservas...</p>
                    </div>
                  </div>
                ) : pendingReservations.length === 0 ? (
                  <div className="text-center py-16">
                    <AlertCircle className="mx-auto h-16 w-16 text-gray-400 mb-6" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No tienes reservas pendientes</h3>
                    <p className="text-gray-600">Todas tus reservas están confirmadas o completadas.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingReservations.map((reservation) => (
                      <ReservationCard key={reservation.id} reservation={reservation} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history">
                {reservationsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0061A8] mx-auto mb-4"></div>
                      <p className="text-gray-600">Cargando historial...</p>
                    </div>
                  </div>
                ) : historyReservations.length === 0 ? (
                  <div className="text-center py-16">
                    <CheckCircle className="mx-auto h-16 w-16 text-gray-400 mb-6" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No tienes historial de reservas</h3>
                    <p className="text-gray-600">Aquí aparecerán tus reservas completadas y pasadas.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {historyReservations.map((reservation) => (
                      <ReservationCard key={reservation.id} reservation={reservation} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
