// Script para probar firma con orden original de parámetros (estándar Redsys)
const crypto = require('crypto');

console.log('🔍 PRUEBA FIRMA CON ORDEN ORIGINAL (ESTÁNDAR REDSYS)');
console.log('====================================================');

// Datos de prueba - ORDEN ORIGINAL como los envía Redsys
const SECRET_KEY = 'sq7HjrUOBfKmC576ILgskD5srU870gJ7';
const ORDER_NUMBER = 'testreservat';

// Parámetros en el orden EXACTO que los envía Redsys
const MERCHANT_PARAMS = {
  DS_AUTHORISATIONCODE: '123456',
  DS_MERCHANT_AMOUNT: '000000018000',
  DS_MERCHANT_CURRENCY: '978',
  DS_MERCHANT_MERCHANTCODE: '367529286',
  DS_MERCHANT_ORDER: 'testreservat',
  DS_MERCHANT_TERMINAL: '1',
  DS_MERCHANT_TRANSACTIONTYPE: '1',
  DS_RESPONSE: '0000',
  DS_RESPONSE_TEXT: 'Transacción autorizada'
};

console.log('📋 DATOS DE PRUEBA (ORDEN ORIGINAL):');
console.log(`- Secret Key: ${SECRET_KEY}`);
console.log(`- Order Number: ${ORDER_NUMBER}`);
console.log(`- Merchant Params (orden original):`, MERCHANT_PARAMS);

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

// 🔍 PASO 3: MANTENER ORDEN ORIGINAL (NO ORDENAR)
const orderedParams = MERCHANT_PARAMS; // Mantener orden original

console.log('\n🔍 PASO 3 - Parámetros (orden original):');
console.log(JSON.stringify(orderedParams, null, 2));

// 🔍 PASO 4: SERIALIZAR A JSON Y BASE64 (ORDEN ORIGINAL)
const merchantParamsJson = JSON.stringify(orderedParams);
const merchantParamsBase64 = Buffer.from(merchantParamsJson, 'utf8').toString('base64');

console.log('\n🔍 PASO 4 - Serialización (orden original):');
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

// 🔍 COMPARACIÓN CON FIRMA RECIBIDA
const receivedSignature = 'Ra5i/tfm1fmkkuK0qU83Q+VAR6NlG9HgLBCnBkZsHfI=';
console.log('\n🔍 COMPARACIÓN DE FIRMAS:');
console.log(`  - Firma generada: ${signature}`);
console.log(`  - Firma recibida:  ${receivedSignature}`);
console.log(`  - ¿Coinciden?: ${signature === receivedSignature ? '✅ SÍ' : '❌ NO'}`);

console.log('\n✅ VERIFICACIÓN COMPLETADA');
console.log('==========================');
console.log('1. ✅ Usando 3DES ECB (estándar Redsys)');
console.log('2. ✅ Manteniendo orden original de parámetros');
console.log('3. ✅ Sin ordenamiento alfabético');
console.log('4. ✅ Serialización JSON directa');
console.log('5. ✅ HMAC-SHA256 con clave derivada');

console.log('\n🎯 FIRMA GENERADA (ORDEN ORIGINAL):');
console.log(`   ${signature}`);

console.log('\n📋 CAMBIOS APLICADOS:');
console.log('=====================');
console.log('✅ Eliminado ordenamiento alfabético');
console.log('✅ Mantenido orden original de parámetros');
console.log('✅ JSON.stringify() directo sin modificación'); 