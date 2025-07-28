import { NextRequest, NextResponse } from 'next/server';
import { verifyRedsysSignature } from '@/lib/redsys/signature';
import { createClient } from '@supabase/supabase-js';

const SECRET_KEY = process.env.REDSYS_SECRET_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const merchantParametersBase64 = form.get('Ds_MerchantParameters') as string;
    const signature = form.get('Ds_Signature') as string;

    if (!merchantParametersBase64 || !signature) {
      return NextResponse.json({ error: 'Faltan parámetros de Redsys' }, { status: 400 });
    }

    // Decodificar merchantParameters
    const merchantParams = JSON.parse(Buffer.from(merchantParametersBase64, 'base64').toString('utf8'));
    const orderNumber = merchantParams.DS_MERCHANT_ORDER || merchantParams.Ds_Merchant_Order;

    // Verificar firma
    const isValid = verifyRedsysSignature(SECRET_KEY, orderNumber, merchantParams, signature);
    if (!isValid) {
      // Registrar error en la base de datos para debug
      await supabase.from('payments').insert({
        order_number: orderNumber,
        status: 'error',
        error_message: 'Firma inválida en notificación IPN',
        raw: merchantParams,
      });
      return NextResponse.json({ error: 'Firma inválida' }, { status: 400 });
    }

    // Actualizar estado del pago en la tabla payments
    await supabase.from('payments').update({
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      raw: merchantParams,
    }).eq('order_number', orderNumber);

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Registrar error para debug
    await supabase.from('payments').insert({
      status: 'error',
      error_message: (error as any)?.message,
      raw: null,
    });
    return NextResponse.json({ error: 'Error interno en notificación', details: (error as any)?.message }, { status: 500 });
  }
} 