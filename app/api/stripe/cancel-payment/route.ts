import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseClient } from '@/lib/supabase-unified';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, reservationId, reason } = body;

    if (!paymentIntentId || !reservationId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe no está configurado' },
        { status: 500 }
      );
    }

    // Cancelar el PaymentIntent
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId, {
      cancellation_reason: reason || 'reservation_rejected',
    });

    if (paymentIntent.status === 'canceled') {
      // Obtener cliente unificado
      const supabase = await getSupabaseClient();

      // Actualizar la reserva
      const { error: updateError } = await supabase
        .from('reservations')
        .update({
          status: 'rechazado',
          payment_status: 'fallido',
          notes: reason ? `Reserva rechazada: ${reason}` : 'Reserva rechazada por el administrador',
          updated_at: new Date().toISOString(),
        })
        .eq('id', reservationId);

      if (updateError) {
        return NextResponse.json(
          { error: 'Error actualizando la reserva' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        paymentIntent,
        message: 'Pago cancelado exitosamente',
      });
    } else {
      return NextResponse.json(
        { error: 'El pago no pudo ser cancelado' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


