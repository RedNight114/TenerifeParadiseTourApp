require('dotenv').config({path: '.env.local'});
const crypto = require('crypto');

console.log('🧪 PRUEBA REDSYS CON DATOS REALES');
console.log('==================================');

// Función exacta del código
function generateRedsysSignatureV2(secretKeyBase64, orderNumber, merchantParams, options = {}) {
  const { debug = false } = options;
  
  // Validar entrada
  if (!secretKeyBase64 || !orderNumber || !merchantParams) {
    throw new Error('Parámetros requeridos faltantes');
  }

  // PASO 1: Decodificar clave secreta
  const secretKey = Buffer.from(secretKeyBase64, 'base64');

  // PASO 2: Cifrar número de orden con 3DES ECB
  const cipher = crypto.createCipheriv('des-ede3', secretKey, null);
  cipher.setAutoPadding(true);
  let encryptedOrder = cipher.update(orderNumber, 'utf8');
  encryptedOrder = Buffer.concat([encryptedOrder, cipher.final()]);

  // PASO 3: Ordenar parámetros alfabéticamente
  const orderedParams = Object.fromEntries(
    Object.entries(merchantParams).sort(([a], [b]) => a.localeCompare(b))
  );

  // PASO 4: Serializar a JSON y codificar
  const merchantParamsJson = JSON.stringify(orderedParams);
  const merchantParamsBase64 = Buffer.from(merchantParamsJson, 'utf8').toString('base64');

  // PASO 5: Calcular HMAC-SHA256
  const hmac = crypto.createHmac('sha256', encryptedOrder);
  hmac.update(merchantParamsBase64);
  const signature = hmac.digest('base64');

  if (debug) {
    console.log('\n🔍 DEBUG COMPLETO:');
    console.log('orderNumber:', orderNumber);
    console.log('secretKeyBase64:', secretKeyBase64);
    console.log('secretKey (hex):', secretKey.toString('hex'));
    console.log('encryptedOrder (hex):', encryptedOrder.toString('hex'));
    console.log('merchantParams (original):', merchantParams);
    console.log('orderedParams:', orderedParams);
    console.log('merchantParamsJson:', merchantParamsJson);
    console.log('merchantParamsBase64:', merchantParamsBase64);
    console.log('signature:', signature);
  }

  return { signature, debug: debug ? { orderNumber, merchantParamsJson, merchantParamsBase64 } : undefined };
}

// Datos reales de prueba
const testData = {
  reservationId: 'test-reservation-123',
  totalAmount: 180.00,
  user_id: 'test-user-123',
  service_id: 'test-service-123'
};

console.log('\n📋 DATOS DE PRUEBA:');
console.log('Reservation ID:', testData.reservationId);
console.log('Total Amount:', testData.totalAmount);

// Simular exactamente lo que hace el endpoint
const MERCHANT_CODE = process.env.REDSYS_MERCHANT_CODE;
const TERMINAL = process.env.REDSYS_TERMINAL;
const SECRET_KEY = process.env.REDSYS_SECRET_KEY;
const CURRENCY = '978';
const TRANSACTION_TYPE = '1';

// Generar order (exactamente como en el código)
const order = testData.reservationId.replace(/-/g, '').slice(0, 12).padEnd(12, '0');
const amountCents = Math.round(Number(testData.totalAmount) * 100).toString().padStart(12, '0');

console.log('\n🔧 PARÁMETROS GENERADOS:');
console.log('Order:', order);
console.log('Amount (cents):', amountCents);

// Parámetros de Redsys (orden corregido)
const merchantParams = {
  DS_MERCHANT_AMOUNT: amountCents,
  DS_MERCHANT_CURRENCY: CURRENCY,
  DS_MERCHANT_MERCHANTCODE: MERCHANT_CODE,
  DS_MERCHANT_ORDER: order,
  DS_MERCHANT_TERMINAL: TERMINAL,
  DS_MERCHANT_TRANSACTIONTYPE: TRANSACTION_TYPE,
  DS_MERCHANT_MERCHANTURL: `${process.env.NEXT_PUBLIC_SITE_URL}/api/redsys/notify`,
  DS_MERCHANT_URLOK: `${process.env.NEXT_PUBLIC_SITE_URL}/reserva/estado`,
  DS_MERCHANT_URLKO: `${process.env.NEXT_PUBLIC_SITE_URL}/reserva/estado`
};

console.log('\n📤 PARÁMETROS REDSYS:');
console.log('merchantParams:', merchantParams);

// Generar firma
console.log('\n🎯 GENERANDO FIRMA:');
const signatureResult = generateRedsysSignatureV2(SECRET_KEY, order, merchantParams, { debug: true });

console.log('\n✅ RESULTADO FINAL:');
console.log('Firma:', signatureResult.signature);

// Generar Base64 para el formulario
const orderedParams = Object.fromEntries(
  Object.entries(merchantParams).sort(([a], [b]) => a.localeCompare(b))
);
const merchantParametersJson = JSON.stringify(orderedParams);
const merchantParametersBase64 = Buffer.from(merchantParametersJson, 'utf8').toString('base64');

console.log('\n📄 DATOS PARA FORMULARIO:');
console.log('merchantParametersBase64:', merchantParametersBase64);
console.log('signature:', signatureResult.signature);

console.log('\n🎯 PRUEBA COMPLETADA'); 