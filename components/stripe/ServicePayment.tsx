"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, CreditCard, Shield, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
    console.log(`[${type.toUpperCase()}]: ${message}`)
  }
};
import { useStripePayment } from '@/hooks/useStripePayment';
import { CheckoutWrapper } from './CheckoutWrapper';

interface ServicePaymentProps {
  serviceId: string;
  serviceTitle: string;
  price: number;
  userId: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function ServicePayment({
  serviceId,
  serviceTitle,
  price,
  userId,
  onSuccess,
  onError,
}: ServicePaymentProps) {
  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [reservationDate, setReservationDate] = useState<Date | undefined>();
  const [guests, setGuests] = useState(1);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const {
    loading,
    clientSecret,
    createPaymentIntent,
    reset,
  } = useStripePayment({
    onSuccess: (data) => {
      setStep('payment');
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reservationDate) {
      showToast('error', 'Por favor selecciona una fecha');
      return;
    }

    if (!contactName || !contactEmail) {
      showToast('error', 'Por favor completa los campos de contacto');
      return;
    }

    try {
      await createPaymentIntent({
        amount: price * guests,
        serviceId,
        userId,
        reservationDate: format(reservationDate, 'yyyy-MM-dd'),
        guests,
        contactInfo: {
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
        },
      });
    } catch (error) {
      }
  };

  const handleBack = () => {
    setStep('form');
    reset();
  };

  if (step === 'payment' && clientSecret) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={handleBack} className="mb-4">
          ← Volver al formulario
        </Button>
        
        <CheckoutWrapper
          clientSecret={clientSecret}
          amount={price * guests}
          serviceTitle={serviceTitle}
          onSuccess={(paymentIntentId) => {
            showToast('success', '¡Reserva creada exitosamente! Está pendiente de confirmación.');
            onSuccess?.({ paymentIntentId, step: 'success' });
          }}
          onError={(error) => {
            showToast('error', error);
            onError?.(error);
          }}
        />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Reservar Servicio
        </CardTitle>
        <CardDescription>
          Completa los datos para tu reserva
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Fecha de Reserva</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {reservationDate ? (
                    format(reservationDate, 'PPP', { locale: es })
                  ) : (
                    <span className="text-muted-foreground">Selecciona una fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={reservationDate}
                  onSelect={setReservationDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guests">Número de Personas</Label>
            <Input
              id="guests"
              type="number"
              min="1"
              max="20"
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">Nombre de Contacto</Label>
            <Input
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Tu nombre completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Teléfono (opcional)</Label>
            <Input
              id="contactPhone"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+34 600 000 000"
            />
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800 mb-2">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Total a Pagar</span>
            </div>
            <p className="text-lg font-bold text-blue-900">
              {(price * guests).toFixed(2)}€
            </p>
            <p className="text-sm text-blue-700">
              {guests === 1 ? '1 persona' : `${guests} personas`} × {price.toFixed(2)}€
            </p>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 text-amber-800 mb-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Pago en Standby</span>
            </div>
            <p className="text-sm text-amber-700">
              Tu tarjeta será autorizada pero no se cobrará hasta que confirmemos la disponibilidad.
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparando Pago...
              </>
            ) : (
              'Continuar al Pago'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}



















