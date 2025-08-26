import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateRedsysSignatureV2 } from '@/lib/redsys/signature-v2';

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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

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
return new NextResponse('Error al crear la reserva', { status: 500 });
    }

    // 🔥 CONFIGURACIÓN REDSYS CORREGIDA PARA EVITAR SIS0042
    const MERCHANT_CODE = process.env.REDSYS_MERCHANT_CODE!;
    const TERMINAL = process.env.REDSYS_TERMINAL!.padStart(3, '0'); // 🔥 CORRECCIÓN: Terminal debe ser 3 dígitos
    const SECRET_KEY = process.env.REDSYS_SECRET_KEY!;
    const CURRENCY = '978'; // EUR
    const TRANSACTION_TYPE = '1'; // Pre-autorización

    // 🔥 CORRECCIÓN CRÍTICA: Exactamente 12 caracteres para Redsys
    const order = reservation.id.replace(/-/g, '').slice(0, 12).padEnd(12, '0');
    
    // Actualizar la reserva con el order_number
    await supabase
      .from('reservations')
      .update({ order_number: order })
      .eq('id', reservation.id);
    
    // Convertir monto a formato Redsys (centavos, 12 dígitos)
    const amountCents = Math.round(Number(total_amount) * 100).toString().padStart(12, '0');

    // 🔥 CONFIGURACIÓN CORREGIDA: Orden específico para Redsys
    // Para pruebas, usar URLs de localhost
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : process.env.NEXT_PUBLIC_SITE_URL;
    
    const merchantParams = {
      DS_MERCHANT_AMOUNT: amountCents,
      DS_MERCHANT_CURRENCY: CURRENCY,
      DS_MERCHANT_MERCHANTCODE: MERCHANT_CODE,
      DS_MERCHANT_ORDER: order,
      DS_MERCHANT_TERMINAL: TERMINAL,
      DS_MERCHANT_TRANSACTIONTYPE: TRANSACTION_TYPE,
      DS_MERCHANT_MERCHANTURL: `${baseUrl}/api/payment/webhook`,
      DS_MERCHANT_URLOK: `${baseUrl}/reserva/estado`,
      DS_MERCHANT_URLKO: `${baseUrl}/reserva/estado`
    };

    // 🔥 CORRECCIÓN CRÍTICA: Ordenación alfabética para Redsys
    const orderedParams = Object.fromEntries(
      Object.entries(merchantParams).sort(([a], [b]) => a.localeCompare(b))
    );

    // Generar firma con parámetros ordenados
    const signatureResult = generateRedsysSignatureV2(SECRET_KEY, order, orderedParams, { debug: true });
    const signature = signatureResult.signature;
    
    // Generar Base64 con parámetros ordenados
    const merchantParametersJson = JSON.stringify(orderedParams);
    const merchantParametersBase64 = Buffer.from(merchantParametersJson, 'utf8').toString('base64');

    const ENVIRONMENT = process.env.REDSYS_ENVIRONMENT!;
    
    // LOG DETALLADO PARA DEPURACIÓN
    console.log('Parámetros del comerciante:', merchantParams);
    console.log('Parámetros ordenados:', orderedParams);
    console.log('JSON de parámetros:', merchantParametersJson);
    console.log('Clave secreta (primeros 10 chars):', SECRET_KEY.substring(0, 10));
// 🔥 CORRECCIÓN: Formulario con solo parámetros obligatorios
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
return new NextResponse('Error interno en la reserva', { status: 500 });
  }
} 
