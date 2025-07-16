"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useReservations } from "@/hooks/use-reservations"
import { useServices } from "@/hooks/use-services"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Clock, DollarSign, Users, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const { reservations, loading: reservationsLoading, fetchReservations } = useReservations()
  const { services, loading: servicesLoading } = useServices()
  const [confirmingReservation, setConfirmingReservation] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && (!profile || profile.role !== "admin")) {
      router.push("/login")
    }
  }, [profile, authLoading, router])

  useEffect(() => {
    if (profile?.role === "admin" && user?.id) {
      fetchReservations(user.id) // Fetch all reservations for admin
    }
  }, [profile, user?.id, fetchReservations])

  const handleConfirmReservation = async (reservationId: string) => {
    setConfirmingReservation(reservationId)

    try {
      // Llamar a la Edge Function para confirmar el pago
      const response = await fetch("/api/confirm-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reservationId }),
      })

      if (response.ok) {
        // Recargar las reservas después de confirmar
        await fetchReservations(user?.id || "")
      } else {
        console.error("Error al confirmar reserva:", response.statusText)
      }
    } catch (error) {
      console.error("Error al confirmar reserva:", error)
    } finally {
      setConfirmingReservation(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmado":
        return <Badge className="bg-green-100 text-green-800">Confirmado</Badge>
      case "pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case "cancelado":
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "pagado":
        return <Badge className="bg-green-100 text-green-800">Pagado</Badge>
      case "preautorizado":
        return <Badge className="bg-blue-100 text-blue-800">Pre-autorizado</Badge>
      case "pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case "fallido":
        return <Badge className="bg-red-100 text-red-800">Fallido</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (authLoading || !profile || profile.role !== "admin") {
    return <div>Cargando...</div>
  }

  const totalRevenue = reservations
    .filter((r) => r.status === "confirmado")
    .reduce((sum, r) => sum + r.total_amount, 0)

  const pendingReservations = reservations.filter((r) => r.status === "pendiente").length
  const totalReservations = reservations.length
  const activeServices = services.filter((s) => s.available).length

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard de Administración</h1>
        <p className="text-muted-foreground">Gestiona reservas y servicios</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: "EUR",
              }).format(totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReservations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReservations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeServices}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reservations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reservations">Reservas</TabsTrigger>
          <TabsTrigger value="services">Servicios</TabsTrigger>
        </TabsList>

        <TabsContent value="reservations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Reservas</CardTitle>
              <CardDescription>Confirma o rechaza las reservas de los clientes</CardDescription>
            </CardHeader>
            <CardContent>
              {reservationsLoading ? (
                <div>Cargando reservas...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Servicio</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Huéspedes</TableHead>
                      <TableHead>Importe</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Pago</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>{reservation.user_id}</TableCell>
                        <TableCell>{reservation.service?.title}</TableCell>
                        <TableCell>{new Date(reservation.reservation_date).toLocaleDateString("es-ES")}</TableCell>
                        <TableCell>{reservation.guests}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("es-ES", {
                            style: "currency",
                            currency: "EUR",
                          }).format(reservation.total_amount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                        <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                        <TableCell>
                          {reservation.status === "pendiente" && (
                            <Button
                              size="sm"
                              onClick={() => handleConfirmReservation(reservation.id)}
                              disabled={confirmingReservation === reservation.id}
                            >
                              {confirmingReservation === reservation.id ? (
                                <>
                                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                                  Confirmando...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Confirmar
                                </>
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Servicios</CardTitle>
              <CardDescription>Administra los servicios disponibles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button onClick={() => router.push("/dashboard/admin/services/new")}>Crear Nuevo Servicio</Button>
              </div>

              {servicesLoading ? (
                <div>Cargando servicios...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.title}</TableCell>
                        <TableCell className="capitalize">{typeof service.category === 'string' ? service.category : service.category?.name || "Sin categoría"}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("es-ES", {
                            style: "currency",
                            currency: "EUR",
                          }).format(service.price)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={service.available ? "default" : "secondary"}>
                            {service.available ? "Disponible" : "No disponible"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/admin/services/${service.id}`)}
                          >
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
