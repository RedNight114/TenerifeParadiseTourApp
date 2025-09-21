import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseClient } from '@/lib/supabase-unified';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, reservationId } = body;

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

    // Capturar el pago
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Obtener cliente unificado
      const supabase = await getSupabaseClient();

      // Actualizar la reserva y el estado del pago
      const { error: updateError } = await supabase
        .from('reservations')
        .update({
          status: 'confirmado',
          payment_status: 'pagado',
          updated_at: new Date().toISOString(),
        })
        .eq('id', reservationId);

      if (updateError) {
        return NextResponse.json(
          { error: 'Error actualizando la reserva' },
          { status: 500 }
        );
      }

      // Crear registro en la tabla de pagos
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: paymentIntent.metadata.userId,
          order_number: paymentIntent.metadata.orderNumber || `STRIPE-${Date.now()}`,
          amount: paymentIntent.amount / 100, // Convertir de céntimos
          status: 'confirmed',
          raw: paymentIntent,
          confirmed_at: new Date().toISOString(),
        });

      if (paymentError) {
        }

      return NextResponse.json({
        success: true,
        paymentIntent,
        message: 'Pago capturado exitosamente',
      });
    } else {
      return NextResponse.json(
        { error: 'El pago no pudo ser capturado' },
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


