import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateRedsysSignature } from '@/lib/redsys/signature';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const MERCHANT_CODE = process.env.REDSYS_MERCHANT_CODE!;
const TERMINAL = process.env.REDSYS_TERMINAL!;
const SECRET_KEY = process.env.REDSYS_SECRET_KEY!;
const ENVIRONMENT = process.env.REDSYS_ENVIRONMENT!;
const CURRENCY = '978'; // EUR
const CAPTURE_TRANSACTION_TYPE = '2'; // Cobro/captura

// Redsys REST endpoint (producción o test)
const REDSYS_REST_URL = ENVIRONMENT.includes('sis-t.redsys.es')
  ? 'https://sis-t.redsys.es:25443/sis/rest/trataPeticionREST'
  : 'https://sis.redsys.es/sis/rest/trataPeticionREST';

export async function POST(req: NextRequest) {
  try {
    const { reservationId } = await req.json();
    if (!reservationId) {
      return NextResponse.json({ error: 'Falta reservationId' }, { status: 400 });
    }

    // Buscar la reserva y datos de pago
    const { data: reservation, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', reservationId)
      .single();
    if (error || !reservation) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });
    }
    if (reservation.payment_status !== 'preautorizado') {
      return NextResponse.json({ error: 'El pago no está preautorizado o ya fue cobrado/cancelado' }, { status: 400 });
    }

    // Preparar datos para la captura
    const order = reservation.id.replace(/-/g, '').slice(0, 12);
    const amountCents = Math.round(Number(reservation.total_amount) * 100).toString();
    const merchantParams = {
      DS_MERCHANT_AMOUNT: amountCents,
      DS_MERCHANT_ORDER: order,
      DS_MERCHANT_MERCHANTCODE: MERCHANT_CODE,
      DS_MERCHANT_CURRENCY: CURRENCY,
      DS_MERCHANT_TRANSACTIONTYPE: CAPTURE_TRANSACTION_TYPE, // '2' para cobro
      DS_MERCHANT_TERMINAL: TERMINAL,
    };
    const merchantParamsBase64 = Buffer.from(JSON.stringify(merchantParams), 'utf8').toString('base64');
    const signature = generateRedsysSignature(SECRET_KEY, order, merchantParams);

    // Construir payload para Redsys REST
    const restPayload = {
      Ds_Merchant_MerchantCode: MERCHANT_CODE,
      Ds_Merchant_Terminal: TERMINAL,
      Ds_Merchant_Order: order,
      Ds_Merchant_Amount: amountCents,
      Ds_Merchant_Currency: CURRENCY,
      Ds_Merchant_TransactionType: CAPTURE_TRANSACTION_TYPE,
      Ds_Merchant_MerchantSignature: signature,
      Ds_Merchant_MerchantParameters: merchantParamsBase64,
      Ds_SignatureVersion: 'HMAC_SHA256_V1',
    };

    // Llamar a la API REST de Redsys
    const response = await fetch(REDSYS_REST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(restPayload),
    });
    const result = await response.json();

    // Analizar respuesta Redsys
    const dsResponse = result.Ds_Response || result.Ds_MerchantParameters?.Ds_Response;
    const isSuccess = dsResponse && Number(dsResponse) < 100;

    // Actualizar estado en Supabase
    await supabase.from('reservations').update({
      payment_status: isSuccess ? 'pagado' : 'fallido',
      status: isSuccess ? 'confirmado' : 'pendiente',
      payment_id: result.Ds_AuthorisationCode || null,
      updated_at: new Date().toISOString(),
    }).eq('id', reservationId);

    return NextResponse.json({
      ok: isSuccess,
      dsResponse,
      result,
      message: isSuccess ? 'Pago capturado correctamente' : 'Error al capturar el pago',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno en la captura', details: (error as any)?.message }, { status: 500 });
  }
} 