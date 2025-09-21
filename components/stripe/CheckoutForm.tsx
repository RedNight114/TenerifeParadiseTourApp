"use client";

import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard, Shield, Clock } from 'lucide-react';
// Importación dinámica de sonner para evitar problemas de SSR
let toast: any = null
if (typeof window !== 'undefined') {
  import('sonner').then(({ toast: toastImport }) => {
    toast = toastImport
  })
}

// Función helper para manejar toasts de manera segura
const showToast = (type: 'success' | 'error' | 'info', message: string) => {
  if (typeof window !== 'undefined' && toast) {
    toast[type](message)
  } else {
    // Fallback para SSR - solo log en consola
    }: ${message}`)
  }
};

interface CheckoutFormProps {
  clientSecret: string;
  amount: number;
  serviceTitle: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export function CheckoutForm({ 
  clientSecret, 
  amount, 
  serviceTitle, 
  onSuccess, 
  onError 
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      onError('Stripe no está inicializado');
      return;
    }

    setLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'Error en el proceso de pago');
        showToast('error', 'Error en el pago: ' + (error.message || 'Error desconocido'));
      } else if (paymentIntent && paymentIntent.status === 'requires_capture') {
        onSuccess(paymentIntent.id);
        showToast('success', 'Pago autorizado correctamente. Tu reserva está pendiente de confirmación.');
      } else {
        onError('Estado de pago inesperado');
        showToast('error', 'Estado de pago inesperado');
      }
    } catch (err: any) {
      onError(err.message || 'Error interno');
      showToast('error', 'Error interno del sistema');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pago Seguro
        </CardTitle>
        <CardDescription>
          Reserva: {serviceTitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <Shield className="h-4 w-4" />
            <span className="font-medium">Pago en Standby</span>
          </div>
          <p className="text-sm text-blue-700">
            Tu tarjeta será autorizada pero no se cobrará hasta que confirmemos la disponibilidad.
          </p>
        </div>

        <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2 text-amber-800 mb-2">
            <Clock className="h-4 w-4" />
            <span className="font-medium">Importe: {amount.toFixed(2)}€</span>
          </div>
          <p className="text-sm text-amber-700">
            Este importe quedará retenido temporalmente en tu tarjeta.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement />
          
          <Button 
            type="submit" 
            disabled={!stripe || loading} 
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              'Autorizar Pago'
            )}
          </Button>
        </form>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Tu información está protegida con encriptación SSL de 256 bits</p>
          <p>Powered by Stripe</p>
        </div>
      </CardContent>
    </Card>
  );
}



















