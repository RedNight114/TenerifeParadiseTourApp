const crypto = require('crypto');

/**
 * 🔐 VALIDADOR COMPLETO DE FIRMAS REDSYS HMAC_SHA256_V1
 * 
 * Este script valida paso a paso el algoritmo de firma de Redsys
 * y proporciona debugging detallado para identificar problemas.
 */

// ============================================================================
// CONFIGURACIÓN DE PRUEBAS
// ============================================================================

const TEST_CASES = [
  {
    name: 'Caso Real - Última Reserva',
    secretKey: 'sq7HjrUOBfKmC576ILgskD5srU870gJ7',
    orderNumber: 'd117b7c8c3c5',
    merchantParams: {
      DS_MERCHANT_AMOUNT: '000000018000',
      DS_MERCHANT_CURRENCY: '978',
      DS_MERCHANT_MERCHANTCODE: '367529286',
      DS_MERCHANT_MERCHANTURL: 'https://tenerifeparadisetoursexcursions.com/api/redsys/notify',
      DS_MERCHANT_ORDER: 'd117b7c8c3c5',
      DS_MERCHANT_TERMINAL: '1',
      DS_MERCHANT_TRANSACTIONTYPE: '1',
      DS_MERCHANT_URLKO: 'https://tenerifeparadisetoursexcursions.com/reserva/estado',
      DS_MERCHANT_URLOK: 'https://tenerifeparadisetoursexcursions.com/reserva/estado'
    },
    expectedSignature: 'H576jHKwPqKeBaniGJYS8RRlNGFSTkZDrqDgahMjdZs='
  },
  {
    name: 'Caso de Prueba Oficial Redsys',
    secretKey: 'sq7HjrUOBfKmC576ILgskD5srU870gJ7',
    orderNumber: '123456789',
    merchantParams: {
      DS_MERCHANT_AMOUNT: '000000001000',
      DS_MERCHANT_CURRENCY: '978',
      DS_MERCHANT_MERCHANTCODE: '999008881',
      DS_MERCHANT_MERCHANTURL: 'https://tenerifeparadisetoursexcursions.com/api/redsys/notify',
      DS_MERCHANT_ORDER: '123456789',
      DS_MERCHANT_TERMINAL: '001',
      DS_MERCHANT_TRANSACTIONTYPE: '0',
      DS_MERCHANT_URLKO: 'https://tenerifeparadisetoursexcursions.com/reserva/estado',
      DS_MERCHANT_URLOK: 'https://tenerifeparadisetoursexcursions.com/reserva/estado'
    },
    expectedSignature: 'pzH+6j2IKYuFxh3h6AyKXQHFFE7mZUH/zBfnE4RkNnE='
  }
];

// ============================================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================================

/**
 * Valida la clave secreta
 */
function validateSecretKey(secretKeyBase64) {
  console.log('🔍 VALIDACIÓN DE CLAVE SECRETA:');
  
  try {
    const key = Buffer.from(secretKeyBase64, 'base64');
    console.log(`  ✅ Longitud: ${key.length} bytes`);
    console.log(`  ✅ Hex: ${key.toString('hex')}`);
    console.log(`  ✅ Base64: ${secretKeyBase64}`);
    
    if (key.length !== 24) {
      throw new Error(`❌ Longitud incorrecta: ${key.length} bytes (debe ser 24)`);
    }
    
    return key;
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    throw error;
  }
}

/**
 * Valida el número de orden
 */
function validateOrderNumber(orderNumber) {
  console.log('🔍 VALIDACIÓN DE NÚMERO DE ORDEN:');
  console.log(`  ✅ Order: ${orderNumber}`);
  console.log(`  ✅ Longitud: ${orderNumber.length} caracteres`);
  
  if (orderNumber.length > 12) {
    throw new Error(`❌ Longitud incorrecta: ${orderNumber.length} caracteres (máximo 12)`);
  }
  
  if (!/^[a-zA-Z0-9]+$/.test(orderNumber)) {
    throw new Error(`❌ Caracteres inválidos: solo alfanuméricos permitidos`);
  }
  
  return orderNumber;
}

/**
 * Valida los parámetros del comercio
 */
function validateMerchantParams(merchantParams) {
  console.log('🔍 VALIDACIÓN DE PARÁMETROS:');
  
  const requiredFields = [
    'DS_MERCHANT_AMOUNT',
    'DS_MERCHANT_ORDER',
    'DS_MERCHANT_MERCHANTCODE',
    'DS_MERCHANT_CURRENCY',
    'DS_MERCHANT_TRANSACTIONTYPE',
    'DS_MERCHANT_TERMINAL'
  ];
  
  for (const field of requiredFields) {
    if (!merchantParams[field]) {
      throw new Error(`❌ Campo requerido faltante: ${field}`);
    }
    console.log(`  ✅ ${field}: ${merchantParams[field]}`);
  }
  
  // Validar formato del monto
  if (!/^\d{12}$/.test(merchantParams.DS_MERCHANT_AMOUNT)) {
    throw new Error(`❌ Formato de monto incorrecto: ${merchantParams.DS_MERCHANT_AMOUNT}`);
  }
  
  return merchantParams;
}

/**
 * Genera la firma paso a paso con debugging completo
 */
function generateSignatureWithDebug(secretKeyBase64, orderNumber, merchantParams) {
  console.log('\n🔐 GENERACIÓN DE FIRMA PASO A PASO:');
  console.log('=' .repeat(50));
  
  // PASO 1: Validar entradas
  const secretKey = validateSecretKey(secretKeyBase64);
  const validOrder = validateOrderNumber(orderNumber);
  const validParams = validateMerchantParams(merchantParams);
  
  // PASO 2: Cifrar orden con 3DES ECB
  console.log('\n🔐 PASO 2 - CIFRADO 3DES ECB:');
  const cipher = crypto.createCipheriv('des-ede3', secretKey, null);
  cipher.setAutoPadding(true);
  
  let encryptedOrder = cipher.update(validOrder, 'utf8');
  encryptedOrder = Buffer.concat([encryptedOrder, cipher.final()]);
  
  console.log(`  ✅ Order original: ${validOrder}`);
  console.log(`  ✅ Cifrado (hex): ${encryptedOrder.toString('hex')}`);
  console.log(`  ✅ Cifrado (base64): ${encryptedOrder.toString('base64')}`);
  console.log(`  ✅ Longitud: ${encryptedOrder.length} bytes`);
  
  // PASO 3: Ordenar parámetros alfabéticamente
  console.log('\n🔐 PASO 3 - ORDENACIÓN DE PARÁMETROS:');
  const orderedParams = Object.fromEntries(
    Object.entries(validParams).sort(([a], [b]) => a.localeCompare(b))
  );
  
  console.log('  ✅ Parámetros ordenados:');
  Object.entries(orderedParams).forEach(([key, value]) => {
    console.log(`    ${key}: ${value}`);
  });
  
  // PASO 4: Serializar a JSON
  console.log('\n🔐 PASO 4 - SERIALIZACIÓN JSON:');
  const merchantParamsJson = JSON.stringify(orderedParams);
  console.log(`  ✅ JSON length: ${merchantParamsJson.length} caracteres`);
  console.log(`  ✅ JSON: ${merchantParamsJson}`);
  
  // PASO 5: Codificar a Base64
  console.log('\n🔐 PASO 5 - CODIFICACIÓN BASE64:');
  const merchantParamsBase64 = Buffer.from(merchantParamsJson, 'utf8').toString('base64');
  console.log(`  ✅ Base64: ${merchantParamsBase64}`);
  
  // PASO 6: Calcular HMAC-SHA256
  console.log('\n🔐 PASO 6 - CÁLCULO HMAC-SHA256:');
  const hmac = crypto.createHmac('sha256', encryptedOrder);
  hmac.update(merchantParamsBase64);
  const signature = hmac.digest('base64');
  
  console.log(`  ✅ Clave derivada (hex): ${encryptedOrder.toString('hex')}`);
  console.log(`  ✅ Datos a firmar: ${merchantParamsBase64}`);
  console.log(`  ✅ Firma final: ${signature}`);
  
  return {
    signature,
    debug: {
      secretKeyLength: secretKey.length,
      orderLength: validOrder.length,
      derivedKeyLength: encryptedOrder.length,
      merchantParamsLength: merchantParamsJson.length,
      merchantParamsBase64,
      merchantParamsJson,
      derivedKeyHex: encryptedOrder.toString('hex'),
      derivedKeyBase64: encryptedOrder.toString('base64')
    }
  };
}

/**
 * Ejecuta un caso de prueba
 */
function runTestCase(testCase) {
  console.log(`\n🧪 EJECUTANDO: ${testCase.name}`);
  console.log('=' .repeat(60));
  
  try {
    const result = generateSignatureWithDebug(
      testCase.secretKey,
      testCase.orderNumber,
      testCase.merchantParams
    );
    
    console.log('\n🔍 COMPARACIÓN DE FIRMAS:');
    console.log(`  📤 Firma esperada: ${testCase.expectedSignature}`);
    console.log(`  📥 Firma calculada: ${result.signature}`);
    
    const isValid = result.signature === testCase.expectedSignature;
    console.log(`  ${isValid ? '✅' : '❌'} ¿Coinciden? ${isValid ? 'SÍ' : 'NO'}`);
    
    if (!isValid) {
      console.log('\n❌ ANÁLISIS DE DIFERENCIAS:');
      console.log('  Posibles causas:');
      console.log('  1. Orden diferente de parámetros en JSON');
      console.log('  2. Codificación incorrecta (UTF-8 vs Latin1)');
      console.log('  3. Padding incorrecto en 3DES');
      console.log('  4. Caracteres extra o espacios en JSON');
      console.log('  5. Implementación incorrecta del algoritmo');
    } else {
      console.log('\n🎉 ¡FIRMA VÁLIDA!');
      console.log('  El algoritmo está funcionando correctamente.');
    }
    
    return { isValid, result };
    
  } catch (error) {
    console.error(`\n❌ ERROR EN CASO DE PRUEBA: ${error.message}`);
    return { isValid: false, error: error.message };
  }
}

/**
 * Función principal
 */
function main() {
  console.log('🔐 VALIDADOR COMPLETO DE FIRMAS REDSYS HMAC_SHA256_V1');
  console.log('=' .repeat(70));
  console.log('Este script valida paso a paso el algoritmo de firma de Redsys');
  console.log('y proporciona debugging detallado para identificar problemas.\n');
  
  let passedTests = 0;
  let totalTests = TEST_CASES.length;
  
  for (const testCase of TEST_CASES) {
    const result = runTestCase(testCase);
    if (result.isValid) {
      passedTests++;
    }
  }
  
  console.log('\n📊 RESUMEN DE PRUEBAS:');
  console.log('=' .repeat(30));
  console.log(`  ✅ Pruebas pasadas: ${passedTests}/${totalTests}`);
  console.log(`  ❌ Pruebas fallidas: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON!');
    console.log('  El sistema de firma está funcionando correctamente.');
  } else {
    console.log('\n⚠️  ALGUNAS PRUEBAS FALLARON');
    console.log('  Revisa los errores arriba para identificar problemas.');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = {
  generateSignatureWithDebug,
  validateSecretKey,
  validateOrderNumber,
  validateMerchantParams,
  runTestCase,
  TEST_CASES
}; 