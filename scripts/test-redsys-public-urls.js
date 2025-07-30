const crypto = require('crypto');

// 🔧 CONFIGURACIÓN CON URLs PÚBLICAS PARA PRUEBAS REDSYS
const TEST_CONFIG = {
  SECRET_KEY: 'sq7HjrUOBfKmC576ILgskD5srU870gJ7',
  MERCHANT_CODE: '999008881',
  TERMINAL: '001',
  ORDER: 'test12345678',
  AMOUNT: '000000018000',
  CURRENCY: '978',
  TRANSACTION_TYPE: '1',
  
  // URLs públicas temporales para pruebas (usando ngrok o similar)
  BASE_URL: 'https://tenerifeparadisetoursexcursions.com' // URL de producción temporal
};

/**
 * Genera firma Redsys con URLs públicas
 */
function generateRedsysSignatureWithPublicUrls() {
  console.log('🔍 GENERANDO FIRMA REDSYS CON URLs PÚBLICAS');
  console.log('============================================');
  
  // Parámetros con URLs públicas
  const merchantParams = {
    DS_MERCHANT_AMOUNT: TEST_CONFIG.AMOUNT,
    DS_MERCHANT_CURRENCY: TEST_CONFIG.CURRENCY,
    DS_MERCHANT_MERCHANTCODE: TEST_CONFIG.MERCHANT_CODE,
    DS_MERCHANT_ORDER: TEST_CONFIG.ORDER,
    DS_MERCHANT_TERMINAL: TEST_CONFIG.TERMINAL,
    DS_MERCHANT_TRANSACTIONTYPE: TEST_CONFIG.TRANSACTION_TYPE,
    DS_MERCHANT_MERCHANTURL: `${TEST_CONFIG.BASE_URL}/api/payment/webhook`,
    DS_MERCHANT_URLOK: `${TEST_CONFIG.BASE_URL}/reserva/estado`,
    DS_MERCHANT_URLKO: `${TEST_CONFIG.BASE_URL}/reserva/estado`
  };
  
  console.log('📋 Parámetros con URLs públicas:');
  console.log(JSON.stringify(merchantParams, null, 2));
  
  // Generar firma
  const secretKey = Buffer.from(TEST_CONFIG.SECRET_KEY, 'base64');
  const cipher = crypto.createCipheriv('des-ede3', secretKey, '');
  cipher.setAutoPadding(true);
  
  let encryptedOrder = cipher.update(TEST_CONFIG.ORDER, 'utf8');
  encryptedOrder = Buffer.concat([encryptedOrder, cipher.final()]);
  
  const orderedParams = Object.fromEntries(
    Object.entries(merchantParams).sort(([a], [b]) => a.localeCompare(b))
  );
  
  const merchantParamsJson = JSON.stringify(orderedParams);
  const merchantParamsBase64 = Buffer.from(merchantParamsJson, 'utf8').toString('base64');
  
  const hmac = crypto.createHmac('sha256', encryptedOrder);
  hmac.update(merchantParamsBase64);
  const signature = hmac.digest('base64');
  
  console.log('\n🔐 Firma generada:');
  console.log(`Firma: ${signature}`);
  console.log(`Base64: ${merchantParamsBase64}`);
  
  return { signature, merchantParamsBase64, merchantParams };
}

/**
 * Genera HTML de formulario para pruebas
 */
function generateTestForm() {
  const { signature, merchantParamsBase64 } = generateRedsysSignatureWithPublicUrls();
  
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Prueba Redsys con URLs Públicas</title>
</head>
<body>
  <h1>Prueba Redsys - URLs Públicas</h1>
  <p>Esta es una prueba con URLs públicas para evitar el error SIS0042.</p>
  
  <form id="redsysForm" action="https://sis-t.redsys.es:25443/sis/realizarPago" method="POST">
    <input type="hidden" name="Ds_SignatureVersion" value="HMAC_SHA256_V1" />
    <input type="hidden" name="Ds_MerchantParameters" value="${merchantParamsBase64}" />
    <input type="hidden" name="Ds_Signature" value="${signature}" />
  </form>
  
  <button onclick="document.getElementById('redsysForm').submit()">Probar Pago con URLs Públicas</button>
  
  <div style="margin-top: 20px; padding: 10px; background: #f0f0f0;">
    <h3>Datos de la prueba:</h3>
    <p><strong>Merchant Code:</strong> ${TEST_CONFIG.MERCHANT_CODE}</p>
    <p><strong>Terminal:</strong> ${TEST_CONFIG.TERMINAL}</p>
    <p><strong>Order:</strong> ${TEST_CONFIG.ORDER}</p>
    <p><strong>Amount:</strong> ${TEST_CONFIG.AMOUNT} (180.00 EUR)</p>
    <p><strong>Webhook URL:</strong> ${TEST_CONFIG.BASE_URL}/api/payment/webhook</p>
  </div>
</body>
</html>`;
  
  return html;
}

/**
 * Análisis del problema SIS0042
 */
function analyzeSis0042Problem() {
  console.log('\n🔍 ANÁLISIS DEL PROBLEMA SIS0042');
  console.log('==================================');
  
  console.log('❌ POSIBLES CAUSAS:');
  console.log('1. URLs de localhost no accesibles desde Redsys');
  console.log('2. Redsys requiere URLs públicas para validación');
  console.log('3. Configuración específica del entorno de pruebas');
  
  console.log('\n✅ SOLUCIONES PROPUESTAS:');
  console.log('1. Usar URLs públicas temporales para pruebas');
  console.log('2. Configurar ngrok para exponer localhost');
  console.log('3. Usar URLs de producción temporalmente');
  
  console.log('\n🎯 RECOMENDACIÓN:');
  console.log('Probar con URLs públicas para confirmar que el problema es de accesibilidad');
}

// Ejecutar análisis
analyzeSis0042Problem();

// Generar formulario de prueba
const testHtml = generateTestForm();

console.log('\n📄 FORMULARIO DE PRUEBA GENERADO:');
console.log('==================================');
console.log('Guarda el siguiente HTML en un archivo .html y ábrelo en el navegador:');
console.log('\n' + '='.repeat(50));
console.log(testHtml);
console.log('='.repeat(50));

console.log('\n🎯 INSTRUCCIONES:');
console.log('1. Guarda el HTML de arriba en test-redsys.html');
console.log('2. Abre el archivo en el navegador');
console.log('3. Haz clic en "Probar Pago con URLs Públicas"');
console.log('4. Verifica si el error SIS0042 desaparece'); 