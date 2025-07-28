require('dotenv').config({path: '.env.local'});
const crypto = require('crypto');

console.log('🧪 PRUEBA REDSYS - PARÁMETROS MINIMALISTAS');
console.log('===========================================');

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

// Datos de prueba
const testData = {
  order: 'testreservat',
  amount: '000000018000',
  merchantCode: '367529286',
  terminal: '1',
  currency: '978',
  transactionType: '1'
};

console.log('\n📋 DATOS DE PRUEBA:');
console.log('Order:', testData.order);
console.log('Amount:', testData.amount);
console.log('Merchant Code:', testData.merchantCode);
console.log('Terminal:', testData.terminal);

// Parámetros MINIMALISTAS (solo obligatorios, sin URLs)
const merchantParams = {
  DS_MERCHANT_AMOUNT: testData.amount,
  DS_MERCHANT_CURRENCY: testData.currency,
  DS_MERCHANT_MERCHANTCODE: testData.merchantCode,
  DS_MERCHANT_ORDER: testData.order,
  DS_MERCHANT_TERMINAL: testData.terminal,
  DS_MERCHANT_TRANSACTIONTYPE: testData.transactionType
};

console.log('\n📤 PARÁMETROS MINIMALISTAS:');
console.log('merchantParams:', merchantParams);

// Generar firma
console.log('\n🎯 GENERANDO FIRMA:');
const signatureResult = generateRedsysSignatureV2(process.env.REDSYS_SECRET_KEY, testData.order, merchantParams, { debug: true });

console.log('\n✅ RESULTADO FINAL:');
console.log('Firma:', signatureResult.signature);

// Generar Base64 para el formulario
const orderedParams = Object.fromEntries(
  Object.entries(merchantParams).sort(([a], [b]) => a.localeCompare(b))
);
const merchantParametersJson = JSON.stringify(orderedParams);
const merchantParametersBase64 = Buffer.from(merchantParametersJson, 'utf8').toString('base64');

console.log('\n📄 DATOS PARA FORMULARIO MINIMALISTA:');
console.log('merchantParametersBase64:', merchantParametersBase64);
console.log('signature:', signatureResult.signature);

console.log('\n🎯 PRUEBA MINIMALISTA COMPLETADA'); 