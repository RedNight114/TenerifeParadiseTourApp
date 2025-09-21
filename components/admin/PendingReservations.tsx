"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle, XCircle, Clock, User, Calendar, Users, Euro } from 'lucide-react';
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
import { getSupabaseClient } from '@/lib/supabase-unified';

interface Reservation {
  id: string;
  user_id: string;
  service_id: string;
  reservation_date: string;
  guests: number;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_id: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  created_at: string;
  service: {
    title: string;
    category_id: string;
  };
  user: {
    full_name: string;
    email: string;
  };
}

export function PendingReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  
  const { capturePayment, cancelPayment, loading: paymentLoading } = useStripePayment({
    onSuccess: (data) => {
      showToast('success', data.message);
      fetchReservations();
    },
    onError: (error) => {
      showToast('error', error);
    },
  });

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const supabase = await getSupabaseClient()
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          service:services(title, category_id),
          user:profiles(full_name, email)
        `)
        .eq('status', 'pendiente')
        .eq('payment_status', 'preautorizado')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (error: any) {
      showToast('error', 'Error cargando las reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reservation: Reservation) => {
    try {
      await capturePayment(reservation.payment_id, reservation.id);
    } catch (error) {
      }
  };

  const handleReject = async (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowRejectDialog(true);
  };

  const confirmRejection = async () => {
    if (!selectedReservation) return;

    try {
      await cancelPayment(
        selectedReservation.payment_id, 
        selectedReservation.id, 
        rejectionReason
      );
      setShowRejectDialog(false);
      setRejectionReason('');
      setSelectedReservation(null);
    } catch (error) {
      }
  };

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (status === 'pendiente' && paymentStatus === 'preautorizado') {
      return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Pendiente de Confirmación</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reservas Pendientes</h2>
        <Badge variant="outline" className="text-sm">
          {reservations.length} reservas
        </Badge>
      </div>

      {reservations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No hay reservas pendientes de confirmación</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reservations.map((reservation) => (
            <Card key={reservation.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{reservation.service?.title}</CardTitle>
                    <CardDescription>
                      {reservation.contact_name || reservation.user?.full_name}
                    </CardDescription>
                  </div>
                  {getStatusBadge(reservation.status, reservation.payment_status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(reservation.reservation_date).toLocaleDateString('es-ES')}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{reservation.guests} {reservation.guests === 1 ? 'persona' : 'personas'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Euro className="h-4 w-4" />
                  <span className="font-medium">{reservation.total_amount.toFixed(2)}€</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{reservation.contact_email || reservation.user?.email}</span>
                </div>
                
                {reservation.contact_phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📞 {reservation.contact_phone}</span>
                  </div>
                )}

                <div className="pt-3 border-t">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(reservation)}
                      disabled={paymentLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {paymentLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Aprobar
                    </Button>
                    
                    <Button
                      onClick={() => handleReject(reservation)}
                      disabled={paymentLoading}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Reserva</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres rechazar esta reserva? El pago será cancelado y se liberará la retención de fondos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Motivo del rechazo (opcional)</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Especifica el motivo del rechazo..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmRejection}>
              Confirmar Rechazo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



















