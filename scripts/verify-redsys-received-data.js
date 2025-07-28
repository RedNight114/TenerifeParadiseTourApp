const crypto = require('crypto');

/**
 * 🔍 VERIFICACIÓN CON DATOS RECIBIDOS POR REDSYS
 * 
 * Este script verifica la firma con los datos exactos que Redsys recibió
 * según el log de error SIS0042
 */

// Datos exactos que Redsys recibió según el log
const SECRET_KEY = 'sq7HjrUOBfKmC576ILgskD5srU870gJ7';
const ORDER_NUMBER = 'd90449a05c72'; // El que Redsys recibió
const MERCHANT_PARAMS = {
  "DS_MERCHANT_AMOUNT": "000000018000",
  "DS_MERCHANT_CURRENCY": "978",
  "DS_MERCHANT_MERCHANTCODE": "367529286",
  "DS_MERCHANT_MERCHANTURL": "https://tenerifeparadisetoursexcursions.com/api/redsys/notify",
  "DS_MERCHANT_ORDER": "d90449a05c72",
  "DS_MERCHANT_TERMINAL": "1",
  "DS_MERCHANT_TRANSACTIONTYPE": "1",
  "DS_MERCHANT_URLKO": "https://tenerifeparadisetoursexcursions.com/reserva/estado",
  "DS_MERCHANT_URLOK": "https://tenerifeparadisetoursexcursions.com/reserva/estado"
};

// Firma que Redsys recibió
const RECEIVED_SIGNATURE = 'zgHeim3uCpPIgb+XRSbbVy6vDlZSIRXVv8QNhYE8frE=';

/**
 * Genera la firma HMAC_SHA256_V1 de Redsys
 */
function generateRedsysSignature(secretKeyBase64, orderNumber, merchantParams) {
  try {
    // 🔍 PASO 1: DECODIFICAR CLAVE SECRETA
    const secretKey = Buffer.from(secretKeyBase64, 'base64');
    console.log('🔍 PASO 1 - Clave secreta:');
    console.log(`  - Base64: ${secretKeyBase64}`);
    console.log(`  - Longitud: ${secretKey.length} bytes`);
    console.log(`  - Hex: ${secretKey.toString('hex')}`);

    // 🔍 PASO 2: CIFRAR NÚMERO DE ORDEN CON 3DES ECB
    const cipher = crypto.createCipheriv('des-ede3', secretKey, null);
    cipher.setAutoPadding(true);

    let encryptedOrder = cipher.update(orderNumber, 'utf8');
    encryptedOrder = Buffer.concat([encryptedOrder, cipher.final()]);

    console.log('🔍 PASO 2 - Cifrado 3DES:');
    console.log(`  - Order original: ${orderNumber}`);
    console.log(`  - Order length: ${orderNumber.length} caracteres`);
    console.log(`  - Cifrado (hex): ${encryptedOrder.toString('hex')}`);
    console.log(`  - Cifrado (base64): ${encryptedOrder.toString('base64')}`);
    console.log(`  - Longitud cifrado: ${encryptedOrder.length} bytes`);

    // 🔍 PASO 3: ORDENAR PARÁMETROS ALFABÉTICAMENTE
    const orderedParams = Object.fromEntries(
      Object.entries(merchantParams).sort(([a], [b]) => a.localeCompare(b))
    );

    console.log('🔍 PASO 3 - Parámetros ordenados:');
    console.log(JSON.stringify(orderedParams, null, 2));

    // 🔍 PASO 4: SERIALIZAR A JSON Y CODIFICAR
    const merchantParamsJson = JSON.stringify(orderedParams);
    const merchantParamsBase64 = Buffer.from(merchantParamsJson, 'utf8').toString('base64');

    console.log('🔍 PASO 4 - Serialización:');
    console.log(`  - JSON length: ${merchantParamsJson.length} caracteres`);
    console.log(`  - JSON: ${merchantParamsJson}`);
    console.log(`  - Base64: ${merchantParamsBase64}`);

    // 🔍 PASO 5: CALCULAR HMAC-SHA256
    const hmac = crypto.createHmac('sha256', encryptedOrder);
    hmac.update(merchantParamsBase64);
    const signature = hmac.digest('base64');

    console.log('🔍 PASO 5 - Firma HMAC:');
    console.log(`  - Clave derivada (hex): ${encryptedOrder.toString('hex')}`);
    console.log(`  - Datos a firmar: ${merchantParamsBase64}`);
    console.log(`  - Firma calculada: ${signature}`);

    return signature;

  } catch (error) {
    console.error('❌ ERROR EN GENERACIÓN DE FIRMA:', error);
    throw error;
  }
}

/**
 * Función principal
 */
function main() {
  console.log('🔍 VERIFICACIÓN CON DATOS RECIBIDOS POR REDSYS');
  console.log('=' .repeat(60));
  
  try {
    // Generar firma con los datos exactos
    const calculatedSignature = generateRedsysSignature(SECRET_KEY, ORDER_NUMBER, MERCHANT_PARAMS);
    
    console.log('\n🔍 COMPARACIÓN DE FIRMAS:');
    console.log(`  📤 Firma recibida por Redsys: ${RECEIVED_SIGNATURE}`);
    console.log(`  📥 Firma calculada por nosotros: ${calculatedSignature}`);
    
    const isValid = calculatedSignature === RECEIVED_SIGNATURE;
    console.log(`  ${isValid ? '✅' : '❌'} ¿Coinciden? ${isValid ? 'SÍ' : 'NO'}`);
    
    if (!isValid) {
      console.log('\n❌ ANÁLISIS DE DIFERENCIAS:');
      console.log('  Posibles causas:');
      console.log('  1. Diferente orden de parámetros en JSON');
      console.log('  2. Codificación diferente (UTF-8 vs Latin1)');
      console.log('  3. Padding diferente en 3DES');
      console.log('  4. Caracteres extra en JSON');
      console.log('  5. Implementación diferente del algoritmo');
      console.log('  6. Diferente versión de Node.js crypto');
    } else {
      console.log('\n🎉 ¡FIRMA VÁLIDA!');
      console.log('  El algoritmo está funcionando correctamente.');
      console.log('  El problema SIS0042 debe ser externo al código.');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR EN VERIFICACIÓN:', error.message);
  }
}

// Ejecutar verificación
main(); 