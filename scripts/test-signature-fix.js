const crypto = require('crypto');

// 🔧 CONFIGURACIÓN DE PRUEBA REDSYS
const TEST_CONFIG = {
  SECRET_KEY: 'sq7HjrUOBfKmC576ILgskD5srU870gJ7',
  MERCHANT_CODE: '999008881',
  TERMINAL: '001',
  ORDER: 'cddeff62fd59',
  AMOUNT: '000000018000',
  CURRENCY: '978',
  TRANSACTION_TYPE: '1'
};

/**
 * Genera firma Redsys HMAC_SHA256_V1
 */
function generateRedsysSignature(secretKeyBase64, orderNumber, merchantParams) {
  console.log('🔍 GENERANDO FIRMA REDSYS');
  console.log('========================');
  
  // PASO 1: Decodificar clave secreta
  const secretKey = Buffer.from(secretKeyBase64, 'base64');
  console.log('PASO 1 - Clave secreta:');
  console.log(`  - Base64: ${secretKeyBase64}`);
  console.log(`  - Longitud: ${secretKey.length} bytes`);
  console.log(`  - Hex: ${secretKey.toString('hex')}`);
  
  // PASO 2: Cifrar número de orden con 3DES ECB
  const cipher = crypto.createCipheriv('des-ede3', secretKey, '');
  cipher.setAutoPadding(true);
  
  let encryptedOrder = cipher.update(orderNumber, 'utf8');
  encryptedOrder = Buffer.concat([encryptedOrder, cipher.final()]);
  
  console.log('PASO 2 - Cifrado 3DES ECB:');
  console.log(`  - Order: ${orderNumber}`);
  console.log(`  - Cifrado (hex): ${encryptedOrder.toString('hex')}`);
  console.log(`  - Cifrado (base64): ${encryptedOrder.toString('base64')}`);
  
  // PASO 3: Ordenar parámetros alfabéticamente
  const orderedParams = Object.fromEntries(
    Object.entries(merchantParams).sort(([a], [b]) => a.localeCompare(b))
  );
  
  console.log('PASO 3 - Parámetros ordenados:');
  console.log(JSON.stringify(orderedParams, null, 2));
  
  // PASO 4: Serializar a JSON y codificar
  const merchantParamsJson = JSON.stringify(orderedParams);
  const merchantParamsBase64 = Buffer.from(merchantParamsJson, 'utf8').toString('base64');
  
  console.log('PASO 4 - Serialización:');
  console.log(`  - JSON: ${merchantParamsJson}`);
  console.log(`  - Base64: ${merchantParamsBase64}`);
  
  // PASO 5: Calcular HMAC-SHA256
  const hmac = crypto.createHmac('sha256', encryptedOrder);
  hmac.update(merchantParamsBase64);
  const signature = hmac.digest('base64');
  
  console.log('PASO 5 - Firma HMAC:');
  console.log(`  - Clave derivada: ${encryptedOrder.toString('hex')}`);
  console.log(`  - Datos a firmar: ${merchantParamsBase64}`);
  console.log(`  - Firma final: ${signature}`);
  
  return signature;
}

/**
 * Prueba la generación de firma
 */
function testSignatureGeneration() {
  console.log('🧪 PRUEBA DE GENERACIÓN DE FIRMA REDSYS');
  console.log('========================================');
  
  // Parámetros de prueba
  const merchantParams = {
    DS_MERCHANT_AMOUNT: TEST_CONFIG.AMOUNT,
    DS_MERCHANT_CURRENCY: TEST_CONFIG.CURRENCY,
    DS_MERCHANT_MERCHANTCODE: TEST_CONFIG.MERCHANT_CODE,
    DS_MERCHANT_ORDER: TEST_CONFIG.ORDER,
    DS_MERCHANT_TERMINAL: TEST_CONFIG.TERMINAL,
    DS_MERCHANT_TRANSACTIONTYPE: TEST_CONFIG.TRANSACTION_TYPE,
    DS_MERCHANT_MERCHANTURL: 'http://localhost:3000/api/payment/webhook',
    DS_MERCHANT_URLOK: 'http://localhost:3000/reserva/estado',
    DS_MERCHANT_URLKO: 'http://localhost:3000/reserva/estado'
  };
  
  try {
    const signature = generateRedsysSignature(
      TEST_CONFIG.SECRET_KEY,
      TEST_CONFIG.ORDER,
      merchantParams
    );
    
    console.log('\n✅ FIRMA GENERADA EXITOSAMENTE');
    console.log(`Firma: ${signature}`);
    
    // Verificar que la firma no esté vacía
    if (signature && signature.length > 0) {
      console.log('✅ La firma tiene contenido válido');
    } else {
      console.log('❌ La firma está vacía');
    }
    
    // Verificar formato Base64
    try {
      Buffer.from(signature, 'base64');
      console.log('✅ La firma tiene formato Base64 válido');
    } catch (error) {
      console.log('❌ La firma no tiene formato Base64 válido');
    }
    
  } catch (error) {
    console.error('❌ ERROR GENERANDO FIRMA:');
    console.error(error.message);
  }
}

/**
 * Compara con la implementación anterior
 */
function compareWithPrevious() {
  console.log('\n🔄 COMPARACIÓN CON IMPLEMENTACIÓN ANTERIOR');
  console.log('==========================================');
  
  // Implementación anterior (sin IV)
  const secretKey = Buffer.from(TEST_CONFIG.SECRET_KEY, 'base64');
  const cipherOld = crypto.createCipheriv('des-ede3', secretKey, null);
  cipherOld.setAutoPadding(true);
  
  let encryptedOrderOld = cipherOld.update(TEST_CONFIG.ORDER, 'utf8');
  encryptedOrderOld = Buffer.concat([encryptedOrderOld, cipherOld.final()]);
  
  // Implementación nueva (sin IV)
  const cipherNew = crypto.createCipheriv('des-ede3', secretKey, '');
  cipherNew.setAutoPadding(true);
  
  let encryptedOrderNew = cipherNew.update(TEST_CONFIG.ORDER, 'utf8');
  encryptedOrderNew = Buffer.concat([encryptedOrderNew, cipherNew.final()]);
  
  console.log('Comparación de cifrado:');
  console.log(`  - Sin IV (anterior): ${encryptedOrderOld.toString('hex')}`);
  console.log(`  - Con IV (nueva):    ${encryptedOrderNew.toString('hex')}`);
  console.log(`  - ¿Son iguales?: ${encryptedOrderOld.equals(encryptedOrderNew) ? '✅ SÍ' : '❌ NO'}`);
}

// Ejecutar pruebas
testSignatureGeneration();
compareWithPrevious();

console.log('\n🎯 PRÓXIMOS PASOS:');
console.log('1. Reinicia el servidor de desarrollo');
console.log('2. Prueba un pago con la nueva implementación');
console.log('3. Verifica que el error SIS0042 desaparezca'); 