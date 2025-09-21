"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">
            ¡Pago Autorizado!
          </CardTitle>
          <CardDescription>
            Tu reserva ha sido creada exitosamente
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800 mb-2">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Estado: Pago en Standby</span>
            </div>
            <p className="text-sm text-blue-700">
              Tu tarjeta ha sido autorizada pero el pago no se ha cobrado aún. 
              Estamos revisando la disponibilidad de tu reserva.
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 text-amber-800 mb-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Próximos Pasos</span>
            </div>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Revisaremos la disponibilidad en las próximas 24h</li>
              <li>• Te enviaremos un email de confirmación</li>
              <li>• Solo entonces se cobrará el importe</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">¿Qué pasa ahora?</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>1. Autorización:</strong> Tu banco ha reservado el importe
              </p>
              <p>
                <strong>2. Verificación:</strong> Confirmamos disponibilidad
              </p>
              <p>
                <strong>3. Confirmación:</strong> Se procesa el pago final
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Link href="/" className="w-full">
              <Button className="w-full" variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Inicio
              </Button>
            </Link>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p>Si tienes alguna pregunta, contacta con nosotros</p>
            <p>Email: info@tenerifeparadisetour.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
