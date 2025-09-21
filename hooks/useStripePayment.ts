import { useState } from 'react';
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

interface UseStripePaymentProps {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

interface CreatePaymentIntentData {
  amount: number;
  currency?: string;
  serviceId: string;
  userId: string;
  reservationDate: string;
  guests?: number;
  contactInfo?: {
    name: string;
    email: string;
    phone?: string;
  };
}

export function useStripePayment({ onSuccess, onError }: UseStripePaymentProps = {}) {
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [reservationId, setReservationId] = useState<string | null>(null);

  const createPaymentIntent = async (data: CreatePaymentIntentData) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error creando el intent de pago');
      }

      setClientSecret(result.clientSecret);
      setPaymentIntentId(result.paymentIntentId);
      setReservationId(result.reservationId);

      showToast('success', 'Pago preparado correctamente');
      onSuccess?.(result);
      
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Error interno del servidor';
      showToast('error', errorMessage);
      onError?.(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const capturePayment = async (paymentIntentId: string, reservationId: string) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/stripe/capture-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentIntentId, reservationId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error capturando el pago');
      }

      showToast('success', 'Pago capturado exitosamente');
      onSuccess?.(result);
      
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Error interno del servidor';
      showToast('error', errorMessage);
      onError?.(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelPayment = async (paymentIntentId: string, reservationId: string, reason?: string) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/stripe/cancel-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentIntentId, reservationId, reason }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error cancelando el pago');
      }

      showToast('success', 'Pago cancelado exitosamente');
      onSuccess?.(result);
      
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Error interno del servidor';
      showToast('error', errorMessage);
      onError?.(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatus = async (paymentIntentId: string) => {
    try {
      const response = await fetch(`/api/stripe/payment-status?paymentIntentId=${paymentIntentId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error obteniendo el estado del pago');
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Error interno del servidor';
      showToast('error', errorMessage);
      onError?.(errorMessage);
      throw error;
    }
  };

  const reset = () => {
    setClientSecret(null);
    setPaymentIntentId(null);
    setReservationId(null);
  };

  return {
    loading,
    clientSecret,
    paymentIntentId,
    reservationId,
    createPaymentIntent,
    capturePayment,
    cancelPayment,
    getPaymentStatus,
    reset,
  };
}



















