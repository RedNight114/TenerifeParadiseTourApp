const crypto = require('crypto');

// Datos de prueba oficiales de Redsys
const MERCHANT_CODE = '999008881';
const TERMINAL = '1'; // 🔥 CORRECCIÓN: Cambiar de '001' a '1'
const SECRET_KEY = 'sq7HjrUOBfKmC576ILgskD5srU870gJ7';
const order = '123456789';
const amountCents = '000000001000';
const CURRENCY = '978';
const TRANSACTION_TYPE = '1'; // 🔥 CORRECCIÓN: Cambiar de '0' a '1' para pre-autorización

// Parámetros exactos que estamos enviando
const merchantParams = {
  DS_MERCHANT_AMOUNT: amountCents,
  DS_MERCHANT_ORDER: order,
  DS_MERCHANT_MERCHANTCODE: MERCHANT_CODE,
  DS_MERCHANT_CURRENCY: CURRENCY,
  DS_MERCHANT_TRANSACTIONTYPE: TRANSACTION_TYPE,
  DS_MERCHANT_TERMINAL: TERMINAL,
  DS_MERCHANT_MERCHANTURL: 'https://tenerifeparadisettoursexcursions.com/api/redsys/notify', // 🔥 CORRECCIÓN: URL correcta
  DS_MERCHANT_URLOK: 'https://tenerifeparadisettoursexcursions.com/reserva/estado', // 🔥 CORRECCIÓN: URL correcta
  DS_MERCHANT_URLKO: 'https://tenerifeparadisettoursexcursions.com/reserva/estado' // 🔥 CORRECCIÓN: URL correcta
};

// Ordenar parámetros como en el endpoint
const orderedKeys = [
  'DS_MERCHANT_AMOUNT',
  'DS_MERCHANT_ORDER', 
  'DS_MERCHANT_MERCHANTCODE',
  'DS_MERCHANT_CURRENCY',
  'DS_MERCHANT_TRANSACTIONTYPE',
  'DS_MERCHANT_TERMINAL',
  'DS_MERCHANT_MERCHANTURL',
  'DS_MERCHANT_URLOK',
  'DS_MERCHANT_URLKO'
];

const orderedParams = {};
for (const key of orderedKeys) {
  orderedParams[key] = merchantParams[key];
}

console.log('🔍 VERIFICACIÓN DE FIRMA REDSYS');
console.log('================================');
console.log('Datos de entrada:');
console.log('- Order:', order);
console.log('- Amount:', amountCents);
console.log('- Merchant Code:', MERCHANT_CODE);
console.log('- Terminal:', TERMINAL);
console.log('- Secret Key (base64):', SECRET_KEY);
console.log('');

console.log('Parámetros ordenados:');
console.log(JSON.stringify(orderedParams, null, 2));
console.log('');

// Paso 1: Decodificar la clave secreta de Base64
const key = Buffer.from(SECRET_KEY, 'base64');
console.log('Paso 1 - Clave decodificada (hex):', key.toString('hex'));
console.log('');

// Paso 2: Cifrar el número de orden con 3DES ECB
const cipher = crypto.createCipheriv('des-ede3', key, null);
cipher.setAutoPadding(true);
let encrypted = cipher.update(order, 'utf8', 'base64');
encrypted += cipher.final('base64');
console.log('Paso 2 - Order cifrado (3DES ECB):', encrypted);
console.log('');

// Paso 3: Usar el resultado cifrado como clave derivada
const derivedKey = Buffer.from(encrypted, 'base64');
console.log('Paso 3 - Clave derivada (hex):', derivedKey.toString('hex'));
console.log('');

// Paso 4: Convertir parámetros a JSON y luego a Base64
const merchantParametersJson = JSON.stringify(orderedParams);
const merchantParametersBase64 = Buffer.from(merchantParametersJson, 'utf8').toString('base64');
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
console.log('Paso 5 - Firma calculada:');
console.log(signature);
console.log('');

// Verificar si coincide con la firma del endpoint
const endpointSignature = 'G4bp1zOmLiUz4EoL2zdIniT3czX+VenCwj85B0q5afw=';
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
} 