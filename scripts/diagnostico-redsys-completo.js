const crypto = require('crypto');

console.log('🔍 DIAGNÓSTICO COMPLETO REDSYS');
console.log('================================');

// 1. Verificar variables de entorno
console.log('\n📋 VARIABLES DE ENTORNO:');
console.log('REDSYS_MERCHANT_CODE:', process.env.REDSYS_MERCHANT_CODE || 'NO DEFINIDA');
console.log('REDSYS_TERMINAL:', process.env.REDSYS_TERMINAL || 'NO DEFINIDA');
console.log('REDSYS_SECRET_KEY:', process.env.REDSYS_SECRET_KEY ? 'DEFINIDA' : 'NO DEFINIDA');
console.log('REDSYS_ENVIRONMENT:', process.env.REDSYS_ENVIRONMENT || 'NO DEFINIDA');
console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL || 'NO DEFINIDA');

// 2. Clave correcta de Redsys (según el email)
const CLAVE_CORRECTA_REDYS = 'sq7HjrUOBfKmC576ILgskD5srU870gJ7';
console.log('\n🔑 CLAVE CORRECTA DE REDSYS:', CLAVE_CORRECTA_REDYS);

// 3. Función de firma Redsys (copia exacta del código)
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
    console.log('\n🔍 DEBUG FIRMA:');
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

// 4. Datos de prueba
console.log('\n🧪 DATOS DE PRUEBA:');
const testData = {
  order: '123456789012',
  amount: '18000', // 180.00 EUR en centavos
  merchantCode: '367529286',
  terminal: '1',
  currency: '978',
  transactionType: '1'
};

console.log('Order:', testData.order);
console.log('Amount:', testData.amount);
console.log('Merchant Code:', testData.merchantCode);
console.log('Terminal:', testData.terminal);

// 5. Parámetros de prueba
const testParams = {
  DS_MERCHANT_AMOUNT: testData.amount,
  DS_MERCHANT_ORDER: testData.order,
  DS_MERCHANT_MERCHANTCODE: testData.merchantCode,
  DS_MERCHANT_CURRENCY: testData.currency,
  DS_MERCHANT_TRANSACTIONTYPE: testData.transactionType,
  DS_MERCHANT_TERMINAL: testData.terminal,
  DS_MERCHANT_MERCHANTURL: 'https://tu-dominio.com/api/redsys/notify',
  DS_MERCHANT_URLOK: 'https://tu-dominio.com/reserva/estado',
  DS_MERCHANT_URLKO: 'https://tu-dominio.com/reserva/estado'
};

// 6. Generar firma con clave correcta
console.log('\n🎯 GENERANDO FIRMA CON CLAVE CORRECTA:');
const signatureResult = generateRedsysSignatureV2(CLAVE_CORRECTA_REDYS, testData.order, testParams, { debug: true });

console.log('\n✅ FIRMA GENERADA:', signatureResult.signature);

// 7. Verificar si la clave actual coincide
const claveActual = process.env.REDSYS_SECRET_KEY;
if (claveActual) {
  console.log('\n🔍 COMPARANDO CLAVES:');
  console.log('Clave actual:', claveActual);
  console.log('Clave correcta:', CLAVE_CORRECTA_REDYS);
  console.log('¿Coinciden?', claveActual === CLAVE_CORRECTA_REDYS ? '✅ SÍ' : '❌ NO');
  
  if (claveActual !== CLAVE_CORRECTA_REDYS) {
    console.log('\n🚨 PROBLEMA IDENTIFICADO:');
    console.log('Tu clave actual NO coincide con la clave correcta de Redsys.');
    console.log('Debes actualizar REDSYS_SECRET_KEY en tu .env.local');
  }
}

// 8. Generar firma con clave actual (si existe)
if (claveActual && claveActual !== CLAVE_CORRECTA_REDYS) {
  console.log('\n⚠️ FIRMA CON CLAVE ACTUAL (INCORRECTA):');
  const signatureIncorrecta = generateRedsysSignatureV2(claveActual, testData.order, testParams, { debug: false });
  console.log('Firma incorrecta:', signatureIncorrecta.signature);
  console.log('Firma correcta:', signatureResult.signature);
}

console.log('\n📝 INSTRUCCIONES:');
console.log('1. Actualiza REDSYS_SECRET_KEY=sq7HjrUOBfKmC576ILgskD5srU870gJ7 en tu .env.local');
console.log('2. Reinicia el servidor: npm run dev');
console.log('3. Prueba una nueva reserva');
console.log('4. El error SIS0042 debería desaparecer');

console.log('\n🎯 DIAGNÓSTICO COMPLETADO'); 