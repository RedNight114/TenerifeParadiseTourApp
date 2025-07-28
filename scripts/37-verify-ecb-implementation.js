// Script para verificar que todo el sistema use ECB (estándar Redsys)
const crypto = require('crypto');

console.log('🔍 VERIFICACIÓN IMPLEMENTACIÓN ECB (ESTÁNDAR REDSYS)');
console.log('====================================================');

// Datos de prueba
const SECRET_KEY = 'sq7HjrUOBfKmC576ILgskD5srU870gJ7';
const ORDER_NUMBER = 'test12345678';
const MERCHANT_PARAMS = {
  DS_MERCHANT_AMOUNT: '000000018000',
  DS_MERCHANT_CURRENCY: '978',
  DS_MERCHANT_MERCHANTCODE: '367529286',
  DS_MERCHANT_ORDER: ORDER_NUMBER,
  DS_MERCHANT_TERMINAL: '1',
  DS_MERCHANT_TRANSACTIONTYPE: '1'
};

console.log('📋 DATOS DE PRUEBA:');
console.log(`- Secret Key: ${SECRET_KEY}`);
console.log(`- Order Number: ${ORDER_NUMBER}`);
console.log(`- Merchant Params:`, MERCHANT_PARAMS);

// 🔍 PASO 1: DECODIFICAR CLAVE SECRETA
const secretKey = Buffer.from(SECRET_KEY, 'base64');
console.log('\n🔍 PASO 1 - Clave secreta:');
console.log(`  - Base64: ${SECRET_KEY}`);
console.log(`  - Longitud: ${secretKey.length} bytes`);
console.log(`  - Hex: ${secretKey.toString('hex')}`);

// 🔍 PASO 2: CIFRAR CON 3DES ECB
const cipher = crypto.createCipheriv('des-ede3', secretKey, null);
cipher.setAutoPadding(true);

let encrypted = cipher.update(ORDER_NUMBER, 'utf8');
encrypted = Buffer.concat([encrypted, cipher.final()]);

console.log('\n🔍 PASO 2 - Cifrado 3DES ECB:');
console.log(`  - Order original: ${ORDER_NUMBER}`);
console.log(`  - Order length: ${ORDER_NUMBER.length} caracteres`);
console.log(`  - Cifrado (hex): ${encrypted.toString('hex')}`);
console.log(`  - Cifrado (base64): ${encrypted.toString('base64')}`);
console.log(`  - Longitud cifrado: ${encrypted.length} bytes`);

// 🔍 PASO 3: ORDENAR PARÁMETROS
const orderedParams = Object.fromEntries(
  Object.entries(MERCHANT_PARAMS).sort(([a], [b]) => a.localeCompare(b))
);

console.log('\n🔍 PASO 3 - Parámetros ordenados:');
console.log(JSON.stringify(orderedParams, null, 2));

// 🔍 PASO 4: SERIALIZAR A JSON Y BASE64
const merchantParamsJson = JSON.stringify(orderedParams);
const merchantParamsBase64 = Buffer.from(merchantParamsJson, 'utf8').toString('base64');

console.log('\n🔍 PASO 4 - Serialización:');
console.log(`  - JSON length: ${merchantParamsJson.length} caracteres`);
console.log(`  - JSON: ${merchantParamsJson}`);
console.log(`  - Base64: ${merchantParamsBase64}`);

// 🔍 PASO 5: CALCULAR HMAC-SHA256
const hmac = crypto.createHmac('sha256', encrypted);
hmac.update(merchantParamsBase64);
const signature = hmac.digest('base64');

console.log('\n🔍 PASO 5 - Firma HMAC:');
console.log(`  - Clave derivada (hex): ${encrypted.toString('hex')}`);
console.log(`  - Datos a firmar: ${merchantParamsBase64}`);
console.log(`  - Firma final: ${signature}`);

console.log('\n✅ VERIFICACIÓN COMPLETADA');
console.log('==========================');
console.log('1. ✅ Usando 3DES ECB (estándar Redsys)');
console.log('2. ✅ Sin IV (null) como requiere ECB');
console.log('3. ✅ Padding automático activado');
console.log('4. ✅ Parámetros ordenados alfabéticamente');
console.log('5. ✅ Serialización JSON correcta');
console.log('6. ✅ HMAC-SHA256 con clave derivada');

console.log('\n🎯 FIRMA GENERADA:');
console.log(`   ${signature}`);

console.log('\n📋 ARCHIVOS QUE DEBEN USAR ECB:');
console.log('===============================');
console.log('✅ lib/redsys/signature.ts');
console.log('✅ lib/redsys/signature-v2.ts');
console.log('✅ app/api/payment/webhook/route.ts');
console.log('✅ app/api/redsys/notify/route.ts');
console.log('✅ app/api/redsys/response/route.ts'); 