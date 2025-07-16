"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [reservationId, setReservationId] = useState<string | null>(null)

  useEffect(() => {
    const id = searchParams.get("reservationId")
    setReservationId(id)
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">¡Pago Procesado!</CardTitle>
            <CardDescription className="text-base">Tu pago ha sido procesado exitosamente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <h4 className="font-semibold text-blue-900">Reserva Pendiente de Confirmación</h4>
                  <p className="text-blue-800 text-sm mt-1">
                    Tu pago está seguro. Confirmaremos la disponibilidad y te notificaremos por email en las próximas 24
                    horas.
                  </p>
                </div>
              </div>
            </div>

            {reservationId && (
              <div className="text-sm text-gray-600">
                <p>
                  <strong>ID de Reserva:</strong> {reservationId}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Link href="/reservations">
                <Button className="w-full bg-[#0061A8] hover:bg-[#0061A8]/90">
                  Ver Mis Reservas
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>

              <Link href="/services">
                <Button variant="outline" className="w-full bg-transparent">
                  Explorar Más Servicios
                </Button>
              </Link>
            </div>

            <div className="text-xs text-gray-500 pt-4 border-t">
              <p>
                Si tienes alguna pregunta, contáctanos al{" "}
                <a href="tel:+34617303929" className="text-[#0061A8] hover:underline">
                  +34 617 30 39 29
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
