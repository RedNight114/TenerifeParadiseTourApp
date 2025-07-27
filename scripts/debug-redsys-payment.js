#!/usr/bin/env node

/**
 * Script para debuggear el problema de Redsys SIS0042
 * Simula exactamente lo que se envía al frontend
 */

require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

console.log('🔍 DEBUG REDSYS PAYMENT - SIS0042');
console.log('==================================');

// Configuración
const config = {
  merchantCode: process.env.REDSYS_MERCHANT_CODE || '367529286',
  terminal: process.env.REDSYS_TERMINAL || '1',
  secretKey: process.env.REDSYS_SECRET_KEY || 'c3E3SGpyVU9CZkttQzU3NklMZ3NrRDVzclU4NzBnSjc=',
  environment: process.env.REDSYS_ENVIRONMENT || 'https://sis-t.redsys.es:25443/sis/realizarPago',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://tenerifeparadisetoursexcursions.com'
};

console.log('📋 Configuración cargada:');
console.log(`   Merchant Code: ${config.merchantCode}`);
console.log(`   Terminal: ${config.terminal}`);
console.log(`   Secret Key: ${config.secretKey ? '✅ Configurada' : '❌ No configurada'}`);
console.log(`   Environment: ${config.environment}`);
console.log(`   Base URL: ${config.baseUrl}`);

// Simular datos de reserva
const reservationData = {
  reservationId: 'test-reservation-123',
  amount: 180,
  description: 'Reserva: Test Service'
};

console.log('\n💰 Datos de reserva simulados:');
console.log(`   Reservation ID: ${reservationData.reservationId}`);
console.log(`   Amount: ${reservationData.amount}€`);
console.log(`   Description: ${reservationData.description}`);

// Calcular importe en céntimos
const amountInCents = reservationData.amount * 100;
console.log(`   Amount in cents: ${amountInCents}`);

// Generar número de pedido
const timestamp = Date.now();
const reservationSuffix = reservationData.reservationId.replace(/-/g, '').slice(-4);
const orderNumber = `${timestamp}${reservationSuffix}`.slice(0, 12);

console.log('\n📋 Número de pedido generado:');
console.log(`   Timestamp: ${timestamp}`);
console.log(`   Reservation suffix: ${reservationSuffix}`);
console.log(`   Order number: ${orderNumber}`);
console.log(`   Order length: ${orderNumber.length}`);

// Crear parámetros de Redsys
const merchantParameters = {
  DS_MERCHANT_AMOUNT: amountInCents.toString().padStart(12, '0'),
  DS_MERCHANT_ORDER: orderNumber,
  DS_MERCHANT_MERCHANTCODE: config.merchantCode,
  DS_MERCHANT_CURRENCY: '978',
  DS_MERCHANT_TRANSACTIONTYPE: '1',
  DS_MERCHANT_TERMINAL: config.terminal.padStart(3, '0'),
  DS_MERCHANT_MERCHANTURL: `${config.baseUrl}/api/payment/webhook`,
  DS_MERCHANT_URLOK: `${config.baseUrl}/payment/success?reservationId=${reservationData.reservationId}`,
  DS_MERCHANT_URLKO: `${config.baseUrl}/payment/error?reservationId=${reservationData.reservationId}`,
  DS_MERCHANT_PRODUCTDESCRIPTION: reservationData.description,
  DS_MERCHANT_MERCHANTNAME: 'Tenerife Paradise Tours',
  DS_MERCHANT_CONSUMERLANGUAGE: '001',
  DS_MERCHANT_MERCHANTDATA: reservationData.reservationId
};

console.log('\n📊 Parámetros de Redsys:');
Object.entries(merchantParameters).forEach(([key, value]) => {
  console.log(`   ${key}: ${value}`);
});

// Codificar parámetros en base64
const merchantParametersJson = JSON.stringify(merchantParameters);
const merchantParametersBase64 = Buffer.from(merchantParametersJson).toString('base64');

console.log('\n🔍 Codificación de parámetros:');
console.log(`   JSON length: ${merchantParametersJson.length}`);
console.log(`   Base64 length: ${merchantParametersBase64.length}`);
console.log(`   Base64 preview: ${merchantParametersBase64.substring(0, 50)}...`);

// Generar firma
function generateSignature(order, merchantParameters, secretKey) {
  const cleanOrder = order.toString().trim();
  const cleanMerchantParameters = merchantParameters.toString().trim();
  const cleanSecretKey = secretKey.toString().trim();
  
  const decodedKey = Buffer.from(cleanSecretKey, "base64");
  const hmac = crypto.createHmac("sha256", decodedKey);
  const dataToSign = cleanOrder + cleanMerchantParameters;
  hmac.update(dataToSign, 'utf8');
  const signature = hmac.digest("base64");
  
  return signature;
}

const signature = generateSignature(orderNumber, merchantParametersBase64, config.secretKey);

console.log('\n🔐 Firma generada:');
console.log(`   Order: ${orderNumber}`);
console.log(`   Order length: ${orderNumber.length}`);
console.log(`   Merchant parameters length: ${merchantParametersBase64.length}`);
console.log(`   Signature length: ${signature.length}`);
console.log(`   Signature preview: ${signature.substring(0, 20)}...`);

// Crear datos del formulario
const formData = {
  Ds_SignatureVersion: "HMAC_SHA256_V1",
  Ds_MerchantParameters: merchantParametersBase64,
  Ds_Signature: signature,
};

console.log('\n📝 Datos del formulario que se envían a Redsys:');
Object.entries(formData).forEach(([key, value]) => {
  console.log(`   ${key}: ${value}`);
});

// Simular respuesta de la API
const apiResponse = {
  redsysUrl: config.environment,
  formData,
  orderNumber,
  amount: reservationData.amount,
  reservationId: reservationData.reservationId,
  debug: {
    amountInCents,
    finalAmount: merchantParameters.DS_MERCHANT_AMOUNT,
    finalOrder: merchantParameters.DS_MERCHANT_ORDER
  }
};

console.log('\n📤 Respuesta simulada de la API:');
console.log(JSON.stringify(apiResponse, null, 2));

// Verificar posibles problemas
console.log('\n🔍 VERIFICACIÓN DE POSIBLES PROBLEMAS:');
console.log('=====================================');

// 1. Verificar formato del importe
const amountCheck = merchantParameters.DS_MERCHANT_AMOUNT;
if (amountCheck === '000000000000') {
  console.log('❌ PROBLEMA: Importe en cero');
} else if (amountCheck.length !== 12) {
  console.log('❌ PROBLEMA: Importe no tiene 12 dígitos');
} else {
  console.log('✅ Importe correcto:', amountCheck);
}

// 2. Verificar número de pedido
const orderCheck = merchantParameters.DS_MERCHANT_ORDER;
if (!orderCheck || orderCheck.length === 0) {
  console.log('❌ PROBLEMA: Número de pedido vacío');
} else if (orderCheck.length > 12) {
  console.log('❌ PROBLEMA: Número de pedido muy largo');
} else {
  console.log('✅ Número de pedido correcto:', orderCheck);
}

// 3. Verificar terminal
const terminalCheck = merchantParameters.DS_MERCHANT_TERMINAL;
if (terminalCheck !== '001') {
  console.log('❌ PROBLEMA: Terminal incorrecto:', terminalCheck);
} else {
  console.log('✅ Terminal correcto:', terminalCheck);
}

// 4. Verificar firma
if (signature.length < 20) {
  console.log('❌ PROBLEMA: Firma demasiado corta');
} else {
  console.log('✅ Firma correcta:', signature.length, 'caracteres');
}

// 5. Verificar URLs
const urlCheck = merchantParameters.DS_MERCHANT_URLOK;
if (!urlCheck.includes('https://')) {
  console.log('❌ PROBLEMA: URL no es HTTPS');
} else {
  console.log('✅ URLs correctas');
}

console.log('\n📋 HTML FORM SIMULADO:');
console.log('=====================');
console.log(`<form method="POST" action="${config.environment}">`);
Object.entries(formData).forEach(([key, value]) => {
  console.log(`  <input type="hidden" name="${key}" value="${value}">`);
});
console.log('</form>');

console.log('\n🎯 CONCLUSIÓN:');
console.log('==============');
console.log('Si todos los checks están ✅, el problema puede ser:');
console.log('1. Configuración específica de tu cuenta de Redsys');
console.log('2. Entorno incorrecto (test vs producción)');
console.log('3. Restricciones de IP o dominio');
console.log('4. Problema temporal de Redsys'); 