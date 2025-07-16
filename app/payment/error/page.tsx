"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function PaymentErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [reservationId, setReservationId] = useState<string | null>(null)

  useEffect(() => {
    const id = searchParams.get("reservationId")
    setReservationId(id)
  }, [searchParams])

  const handleRetry = () => {
    if (reservationId) {
      router.push(`/booking/${reservationId}`)
    } else {
      router.push("/services")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-800">Error en el Pago</CardTitle>
            <CardDescription className="text-base">No se pudo procesar tu pago</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-800 text-sm">
                Ha ocurrido un error durante el procesamiento del pago. No se ha realizado ningún cargo a tu tarjeta.
              </p>
            </div>

            <div className="text-sm text-gray-600">
              <p>
                <strong>Posibles causas:</strong>
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-left">
                <li>Datos de tarjeta incorrectos</li>
                <li>Fondos insuficientes</li>
                <li>Tarjeta bloqueada o expirada</li>
                <li>Error temporal del sistema</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button onClick={handleRetry} className="w-full bg-[#0061A8] hover:bg-[#0061A8]/90">
                <RefreshCw className="h-4 w-4 mr-2" />
                Intentar de Nuevo
              </Button>

              <Link href="/services">
                <Button variant="outline" className="w-full bg-transparent">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a Servicios
                </Button>
              </Link>
            </div>

            <div className="text-xs text-gray-500 pt-4 border-t">
              <p>
                ¿Necesitas ayuda? Contáctanos al{" "}
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
