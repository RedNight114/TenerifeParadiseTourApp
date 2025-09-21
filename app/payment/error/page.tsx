"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function PaymentErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-800">
            Error en el Pago
          </CardTitle>
          <CardDescription>
            Ha ocurrido un problema con tu reserva
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">No te preocupes</span>
            </div>
            <p className="text-sm text-red-700">
              Tu tarjeta NO ha sido cobrada. El error puede ser temporal.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Posibles causas:</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Problema temporal de conexión</p>
              <p>• Datos de tarjeta incorrectos</p>
              <p>• Fondos insuficientes</p>
              <p>• Restricciones de tu banco</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">¿Qué puedes hacer?</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Verifica los datos de tu tarjeta</p>
              <p>• Intenta con otra tarjeta</p>
              <p>• Contacta con tu banco</p>
              <p>• Llámanos para ayuda personalizada</p>
            </div>
          </div>

          <div className="pt-4 border-t space-y-3">
            <Link href="/" className="w-full">
              <Button className="w-full" variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Inicio
              </Button>
            </Link>
            
            <Button className="w-full" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Intentar de Nuevo
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p>¿Necesitas ayuda? Contacta con nosotros</p>
            <p>Email: info@tenerifeparadisetour.com</p>
            <p>Teléfono: +34 617 30 39 29</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
