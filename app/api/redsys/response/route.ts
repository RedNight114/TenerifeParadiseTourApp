import { NextRequest, NextResponse } from 'next/server';
import { verifyRedsysSignature } from '@/lib/redsys/signature';
import { createClient } from '@supabase/supabase-js';

const SECRET_KEY = process.env.REDSYS_SECRET_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function handleRedsysResponse(params: any, signature: string) {
  const merchantParams = JSON.parse(Buffer.from(params, 'base64').toString('utf8'));
  const orderNumber = merchantParams.DS_MERCHANT_ORDER || merchantParams.Ds_Merchant_Order;
  const isValid = verifyRedsysSignature(SECRET_KEY, orderNumber, merchantParams, signature);

  if (!isValid) {
    await supabase.from('payments').insert({
      order_number: orderNumber,
      status: 'error',
      error_message: 'Firma inválida en retorno usuario',
      raw: merchantParams,
    });
    return { ok: false, orderNumber };
  }

  // Actualizar estado del pago
  await supabase.from('payments').update({
    status: 'success',
    confirmed_at: new Date().toISOString(),
    raw: merchantParams,
  }).eq('order_number', orderNumber);
  return { ok: true, orderNumber };
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const merchantParametersBase64 = form.get('Ds_MerchantParameters') as string;
  const signature = form.get('Ds_Signature') as string;

  if (!merchantParametersBase64 || !signature) {
    return NextResponse.redirect('/pago-error');
  }
  const result = await handleRedsysResponse(merchantParametersBase64, signature);
  if (result.ok) {
    return NextResponse.redirect('/pago-exitoso');
  } else {
    return NextResponse.redirect('/pago-error');
  }
}

export async function GET(req: NextRequest) {
  // Redsys puede redirigir por GET en algunos casos
  const { searchParams } = new URL(req.url);
  const merchantParametersBase64 = searchParams.get('Ds_MerchantParameters') as string;
  const signature = searchParams.get('Ds_Signature') as string;

  if (!merchantParametersBase64 || !signature) {
    return NextResponse.redirect('/pago-error');
  }
  const result = await handleRedsysResponse(merchantParametersBase64, signature);
  if (result.ok) {
    return NextResponse.redirect('/pago-exitoso');
  } else {
    return NextResponse.redirect('/pago-error');
  }
} 