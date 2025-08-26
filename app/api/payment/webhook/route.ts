import { NextRequest, NextResponse } from 'next/server';
import { verifyRedsysSignatureV2Original } from '@/lib/redsys/signature-v2';
import { createClient } from '@supabase/supabase-js';

const SECRET_KEY = process.env.REDSYS_SECRET_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req: NextRequest) {
  try {
    console.log('Webhook Redsys recibido:', new Date().toISOString());
    
    const form = await req.formData();
    const merchantParametersBase64 = form.get('Ds_MerchantParameters') as string;
    const signature = form.get('Ds_Signature') as string;


if (!merchantParametersBase64 || !signature) {
return NextResponse.json({ error: 'Faltan parámetros de Redsys' }, { status: 400 });
    }

    // Decodificar merchantParameters
    const merchantParams = JSON.parse(Buffer.from(merchantParametersBase64, 'base64').toString('utf8'));
    const orderNumber = merchantParams.DS_MERCHANT_ORDER || merchantParams.Ds_Merchant_Order;

    // 🔥 CORRECCIÓN CRÍTICA: Agregar Ds_Order a los parámetros para validación
    const paramsForValidation = {
      ...merchantParams,
      Ds_Order: orderNumber // Campo requerido para validación de firma
    };
    console.log('Parámetros para validación:', paramsForValidation);

    // Verificar firma con la nueva implementación CBC
    const isValid = verifyRedsysSignatureV2Original(SECRET_KEY, orderNumber, paramsForValidation, signature, { debug: true });
if (!isValid) {
      // Registrar error en la base de datos para debug
      await supabase.from('payments').insert({
        order_number: orderNumber,
        status: 'error',
        error_message: 'Firma inválida en notificación IPN (CBC)',
        raw: merchantParams,
        signature_received: signature,
        merchant_parameters: merchantParametersBase64,
        created_at: new Date().toISOString()
      });
return NextResponse.json({ error: 'Firma inválida' }, { status: 400 });
    }

    // Extraer información del pago
    const responseCode = merchantParams.DS_RESPONSE || merchantParams.Ds_Response;
    const responseText = merchantParams.DS_RESPONSE_TEXT || merchantParams.Ds_Response_Text;
    const authCode = merchantParams.DS_AUTHORISATIONCODE || merchantParams.Ds_AuthorisationCode;
    const amount = merchantParams.DS_MERCHANT_AMOUNT || merchantParams.Ds_Merchant_Amount;




// Determinar estado del pago
    let paymentStatus = 'pending';
    if (responseCode === '0000') {
      paymentStatus = 'confirmed';
    } else if (responseCode && responseCode !== '0000') {
      paymentStatus = 'failed';
    }

    // Actualizar estado del pago en la tabla payments
    const { error: updateError } = await supabase.from('payments').update({
      status: paymentStatus,
      response_code: responseCode,
      response_text: responseText,
      auth_code: authCode,
      confirmed_at: paymentStatus === 'confirmed' ? new Date().toISOString() : null,
      raw: merchantParams,
      updated_at: new Date().toISOString()
    }).eq('order_number', orderNumber);

    if (updateError) {
// Intentar insertar si no existe
      await supabase.from('payments').insert({
        order_number: orderNumber,
        status: paymentStatus,
        response_code: responseCode,
        response_text: responseText,
        auth_code: authCode,
        confirmed_at: paymentStatus === 'confirmed' ? new Date().toISOString() : null,
        raw: merchantParams,
        created_at: new Date().toISOString()
      });
    }

    // Si el pago está confirmado, actualizar también la reserva
    if (paymentStatus === 'confirmed') {
      // Buscar la reserva por order_number
      const { data: reservation, error: findError } = await supabase
        .from('reservations')
        .select('id')
        .eq('order_number', orderNumber)
        .single();

      if (findError) {

} else {
        const { error: reservationError } = await supabase.from('reservations').update({
          payment_status: 'pagado',
          updated_at: new Date().toISOString()
        }).eq('id', reservation.id);

        if (reservationError) {
} else {
}
      }
    }
return NextResponse.json({ 
      ok: true, 
      status: paymentStatus,
      response_code: responseCode 
    });

  } catch (error) {
// Registrar error para debug
    try {
      await supabase.from('payments').insert({
        status: 'error',
        error_message: (error as any)?.message || 'Error desconocido en webhook',
        raw: null,
        created_at: new Date().toISOString()
      });
    } catch (dbError) {
}
    
    return NextResponse.json({ 
      error: 'Error interno en notificación', 
      details: (error as any)?.message 
    }, { status: 500 });
  }
} 
