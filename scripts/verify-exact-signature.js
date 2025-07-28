const crypto = require('crypto');

// Datos EXACTOS que está enviando el endpoint (nueva reserva con correcciones)
const MERCHANT_CODE = '367529286';
const TERMINAL = '1';
const SECRET_KEY = 'sq7HjrUOBfKmC576ILgskD5srU870gJ7';
const order = 'd117b7c8c3c5'; // 🔥 CORRECCIÓN: Exactamente 12 chars
const amountCents = '000000018000';
const CURRENCY = '978';
const TRANSACTION_TYPE = '1';

// Parámetros EXACTOS que está enviando el endpoint
const merchantParams = {
  DS_MERCHANT_AMOUNT: amountCents,
  DS_MERCHANT_ORDER: order,
  DS_MERCHANT_MERCHANTCODE: MERCHANT_CODE,
  DS_MERCHANT_CURRENCY: CURRENCY,
  DS_MERCHANT_TRANSACTIONTYPE: TRANSACTION_TYPE,
  DS_MERCHANT_TERMINAL: TERMINAL,
  DS_MERCHANT_MERCHANTURL: 'https://tenerifeparadisetoursexcursions.com/api/redsys/notify',
  DS_MERCHANT_URLOK: 'https://tenerifeparadisetoursexcursions.com/reserva/estado',
  DS_MERCHANT_URLKO: 'https://tenerifeparadisetoursexcursions.com/reserva/estado'
};

// 🔥 CORRECCIÓN: Ordenación alfabética como en el endpoint
const orderedParams = Object.fromEntries(
  Object.entries(merchantParams).sort(([a], [b]) => a.localeCompare(b))
);

console.log('🔍 VERIFICACIÓN EXACTA DE FIRMA REDSYS');
console.log('=====================================');
console.log('Datos de entrada:');
console.log('- Order:', order);
console.log('- Order length:', order.length);
console.log('- Amount:', amountCents);
console.log('- Merchant Code:', MERCHANT_CODE);
console.log('- Terminal:', TERMINAL);
console.log('- Secret Key (base64):', SECRET_KEY);
console.log('');

// 🔥 VALIDACIÓN 1: Verificar longitud de la clave
const key = Buffer.from(SECRET_KEY, 'base64');
console.log('🔥 VALIDACIÓN 1 - Longitud de clave:');
console.log('- Clave decodificada (hex):', key.toString('hex'));
console.log('- Longitud de clave:', key.length, 'bytes');
console.log('- ¿Es 24 bytes?', key.length === 24 ? '✅ SÍ' : '❌ NO');
console.log('');

// 🔥 VALIDACIÓN 2: Verificar longitud del order
console.log('🔥 VALIDACIÓN 2 - Longitud del order:');
console.log('- Order:', order);
console.log('- Longitud:', order.length, 'caracteres');
console.log('- ¿Es exactamente 12?', order.length === 12 ? '✅ SÍ' : '❌ NO');
console.log('');

console.log('Parámetros ordenados:');
console.log(JSON.stringify(orderedParams, null, 2));
console.log('');

// Paso 1: Decodificar la clave secreta de Base64
console.log('Paso 1 - Clave decodificada (hex):', key.toString('hex'));
console.log('');

// Paso 2: Cifrar el número de orden con 3DES ECB
const cipher = crypto.createCipheriv('des-ede3', key, null);
cipher.setAutoPadding(true);

// 🔥 CORRECCIÓN: Usar salida binaria directa, NO Base64
let encrypted = cipher.update(order, 'utf8');
encrypted = Buffer.concat([encrypted, cipher.final()]);
console.log('Paso 2 - Order original:', order);
console.log('Paso 2 - Order cifrado (3DES ECB, hex):', encrypted.toString('hex'));
console.log('Paso 2 - Order cifrado (3DES ECB, base64):', encrypted.toString('base64'));
console.log('Paso 2 - Longitud del cifrado:', encrypted.length, 'bytes');
console.log('');

// Paso 3: Usar el resultado cifrado en binario como clave derivada
const derivedKey = encrypted;
console.log('Paso 3 - Clave derivada (hex):', derivedKey.toString('hex'));
console.log('Paso 3 - Longitud de clave derivada:', derivedKey.length, 'bytes');
console.log('');

// Paso 4: Convertir parámetros a JSON y luego a Base64
const merchantParametersJson = JSON.stringify(orderedParams);
const merchantParametersBase64 = Buffer.from(merchantParametersJson, 'utf8').toString('base64');

// 🔥 VALIDACIÓN 3: Verificar codificación UTF-8 y Base64
console.log('🔥 VALIDACIÓN 3 - Codificación de parámetros:');
console.log('- JSON original:', merchantParametersJson);
console.log('- Longitud JSON:', merchantParametersJson.length, 'caracteres');
console.log('- ¿Contiene saltos de línea?', merchantParametersJson.includes('\n') ? '❌ SÍ' : '✅ NO');
console.log('- ¿Contiene caracteres extraños?', /[^\x20-\x7E]/.test(merchantParametersJson) ? '❌ SÍ' : '✅ NO');
console.log('');

console.log('Paso 4 - JSON de parámetros:');
console.log(merchantParametersJson);
console.log('');
console.log('Paso 4 - Parámetros en Base64:');
console.log(merchantParametersBase64);
console.log('');

// Paso 5: Calcular HMAC-SHA256
const hmac = crypto.createHmac('sha256', derivedKey);
hmac.update(merchantParametersBase64);
const signature = hmac.digest('base64');

// 🔥 VALIDACIÓN 4: Verificar que se usa el cifrado 3DES como clave HMAC
console.log('🔥 VALIDACIÓN 4 - Uso correcto del cifrado 3DES:');
console.log('- ¿Se usa encrypted como derivedKey?', derivedKey === encrypted ? '✅ SÍ' : '❌ NO');
console.log('- ¿derivedKey es un Buffer?', Buffer.isBuffer(derivedKey) ? '✅ SÍ' : '❌ NO');
console.log('');

console.log('Paso 5 - Firma calculada:');
console.log(signature);
console.log('');

// Verificar si coincide con la firma del endpoint (nueva reserva)
const endpointSignature = 'H576jHKwPqKeBaniGJYS8RRlNGFSTkZDrqDgahMjdZs=';
console.log('🔍 COMPARACIÓN:');
console.log('Firma del endpoint:', endpointSignature);
console.log('Firma calculada:   ', signature);
console.log('¿Coinciden?', signature === endpointSignature ? '✅ SÍ' : '❌ NO');
console.log('');

// Si no coinciden, mostrar diferencias
if (signature !== endpointSignature) {
  console.log('❌ LAS FIRMAS NO COINCIDEN');
  console.log('Esto explica el error SIS0042');
  console.log('');
  console.log('Posibles causas:');
  console.log('1. Orden diferente de las claves en el JSON');
  console.log('2. Espacios o caracteres extra en el JSON');
  console.log('3. Codificación diferente');
  console.log('4. Implementación incorrecta del algoritmo');
  console.log('5. Problema con el padding de 3DES');
  console.log('6. Longitud incorrecta de la clave o order');
  console.log('');
  console.log('🔍 VERIFICACIÓN ADICIONAL:');
  console.log('Base64 del endpoint:', merchantParametersBase64);
  console.log('Base64 calculado:   ', merchantParametersBase64);
  console.log('¿Base64 coinciden?', 'SÍ' /* siempre debería ser igual */);
} else {
  console.log('🎉 ¡FIRMA CORRECTA!');
  console.log('El sistema está funcionando correctamente.');
  console.log('Si sigues teniendo SIS0042, el problema está en la configuración de Redsys.');
} 