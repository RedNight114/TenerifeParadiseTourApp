import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateRedsysSignature } from '@/lib/redsys/signature';

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

    // Validar datos requeridos
    if (!user_id || !service_id || !total_amount) {
      return new NextResponse('Datos de reserva incompletos', { status: 400 });
    }

    // Crear cliente Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Crear la reserva en Supabase
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
        special_requests,
        contact_name,
        contact_email,
        contact_phone
      })
      .select()
      .single();

    if (reservationError) {
      console.error('Error creando reserva:', reservationError);
      return new NextResponse('Error al crear la reserva', { status: 500 });
    }

    // 🔥 CONFIGURACIÓN REDSYS REAL CON CORRECCIONES
    const MERCHANT_CODE = process.env.REDSYS_MERCHANT_CODE!; // 367529286
    const TERMINAL = process.env.REDSYS_TERMINAL!; // 1
    const SECRET_KEY = process.env.REDSYS_SECRET_KEY!;
    const CURRENCY = '978'; // EUR
    const TRANSACTION_TYPE = '1'; // Pre-autorización

    // Generar número de orden único (usar ID de reserva)
    // 🔥 CORRECCIÓN CRÍTICA: Exactamente 12 caracteres para Redsys
    const order = reservation.id.replace(/-/g, '').slice(0, 12).padEnd(12, '0');
    
    // Convertir monto a formato Redsys (centavos, 12 dígitos)
    const amountCents = Math.round(Number(total_amount) * 100).toString().padStart(12, '0');

    // Generar parámetros Redsys SOLO con los campos obligatorios
    const merchantParams = {
      DS_MERCHANT_AMOUNT: amountCents,
      DS_MERCHANT_ORDER: order,
      DS_MERCHANT_MERCHANTCODE: MERCHANT_CODE,
      DS_MERCHANT_CURRENCY: CURRENCY,
      DS_MERCHANT_TRANSACTIONTYPE: TRANSACTION_TYPE,
      DS_MERCHANT_TERMINAL: TERMINAL,
      DS_MERCHANT_MERCHANTURL: `${process.env.NEXT_PUBLIC_SITE_URL}/api/redsys/notify`, // 🔥 VOLVER A URLs reales
      DS_MERCHANT_URLOK: `${process.env.NEXT_PUBLIC_SITE_URL}/reserva/estado`, // 🔥 VOLVER A URLs reales
      DS_MERCHANT_URLKO: `${process.env.NEXT_PUBLIC_SITE_URL}/reserva/estado` // 🔥 VOLVER A URLs reales
    };

    // 🔥 CORRECCIÓN CRÍTICA: Ordenación alfabética para Redsys
    const orderedParams = Object.fromEntries(
      Object.entries(merchantParams).sort(([a], [b]) => a.localeCompare(b))
    );

    // Generar firma con parámetros ordenados
    const signature = generateRedsysSignature(SECRET_KEY, order, orderedParams);
    
    // Generar Base64 con parámetros ordenados
    const merchantParametersJson = JSON.stringify(orderedParams);
    const merchantParametersBase64 = Buffer.from(merchantParametersJson, 'utf8').toString('base64');

    const ENVIRONMENT = process.env.REDSYS_ENVIRONMENT!;
    
    // LOG DETALLADO PARA DEPURACIÓN
    console.log('🔍 REDSYS DEBUG DATOS REALES');
    console.log('Reservation ID:', reservation.id);
    console.log('order:', order);
    console.log('amountCents:', amountCents);
    console.log('total_amount:', total_amount);
    console.log('merchantParams (original):', merchantParams);
    console.log('orderedParams (para firma):', orderedParams);
    console.log('merchantParametersJson (ordenado):', merchantParametersJson);
    console.log('merchantParametersBase64:', merchantParametersBase64);
    console.log('signature:', signature);
    console.log('MERCHANT_CODE:', MERCHANT_CODE);
    console.log('TERMINAL:', TERMINAL);
    console.log('SECRET_KEY (base64):', SECRET_KEY);
    console.log('ENVIRONMENT:', ENVIRONMENT);

    // Generar HTML del formulario Redsys (autoenvío)
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Redirigiendo a Redsys...</title>
</head>
<body>
  <form id="redsysForm" action="${ENVIRONMENT}" method="POST">
    <input type="hidden" name="Ds_SignatureVersion" value="HMAC_SHA256_V1" />
    <input type="hidden" name="Ds_MerchantParameters" value="${merchantParametersBase64}" />
    <input type="hidden" name="Ds_Signature" value="${signature}" />
  </form>
  <script>document.getElementById('redsysForm').submit();</script>
  <div style="text-align:center;margin-top:2em;font-family:sans-serif;color:#333;">
    <h2>Redirigiendo a la pasarela de pago segura...</h2>
    <p>Por favor, espera un momento.</p>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Error en create reservation:', error);
    return new NextResponse('Error interno en la reserva', { status: 500 });
  }
} 