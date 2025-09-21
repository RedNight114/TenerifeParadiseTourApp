import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseClient } from '@/lib/supabase-unified';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      amount, 
      currency = 'eur', 
      serviceId, 
      userId, 
      reservationDate, 
      guests,
      contactInfo 
    } = body;

    if (!amount || !serviceId || !userId) {
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

    // Crear PaymentIntent con captura manual
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir a céntimos
      currency,
      capture_method: 'manual', // Pago en standby
      automatic_payment_methods: { enabled: true },
      metadata: {
        serviceId,
        userId,
        reservationDate,
        guests: guests?.toString() || '1',
        contactName: contactInfo?.name || '',
        contactEmail: contactInfo?.email || '',
        contactPhone: contactInfo?.phone || '',
      },
    });

    // Obtener cliente unificado
    const supabase = await getSupabaseClient();

    // Crear reserva en estado pendiente
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert({
        user_id: userId,
        service_id: serviceId,
        reservation_date: reservationDate,
        guests: guests || 1,
        total_amount: amount,
        status: 'pendiente',
        payment_status: 'preautorizado',
        payment_id: paymentIntent.id,
        contact_name: contactInfo?.name || '',
        contact_email: contactInfo?.email || '',
        contact_phone: contactInfo?.phone || '',
        order_number: `STRIPE-${Date.now()}`,
      })
      .select()
      .single();

    if (reservationError) {
      // Cancelar el PaymentIntent si falla la creación de la reserva
      if (stripe) {
        await stripe.paymentIntents.cancel(paymentIntent.id);
      }
      return NextResponse.json(
        { error: 'Error creando la reserva' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      reservationId: reservation.id,
      status: 'requires_capture',
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


