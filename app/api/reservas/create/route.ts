import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-unified';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      user_id,
      service_id,
      reservation_date,
      reservation_time,
      guests,
      total_amount,
      special_requests,
      contact_name,
      contact_email,
      contact_phone
    } = body;

    if (!user_id || !service_id || !total_amount) {
      return new NextResponse('Datos de reserva incompletos', { status: 400 });
    }

    // Obtener cliente unificado
    const supabase = await getSupabaseClient();

    // Generar order_number único (12 caracteres)
    const order = Math.random().toString(36).substring(2, 14).toUpperCase();

    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert({
        user_id,
        service_id,
        reservation_date,
        reservation_time,
        guests,
        total_amount,
        status: 'pendiente',
        payment_status: 'pendiente',
        order_number: order,
        special_requests,
        contact_name,
        contact_email,
        contact_phone
      })
      .select()
      .single();

    if (reservationError) {
      return new NextResponse('Error al crear la reserva', { status: 500 });
    }

    // Devolver confirmación de reserva creada
    return NextResponse.json({
      success: true,
      reservation: {
        id: reservation.id,
        order_number: order,
        status: 'pendiente',
        payment_status: 'pendiente',
        total_amount,
        reservation_date,
        reservation_time,
        guests
      },
      message: 'Reserva creada exitosamente. El pago se procesará próximamente.'
    });

  } catch (error) {
    return new NextResponse('Error interno en la reserva', { status: 500 });
  }
} 
