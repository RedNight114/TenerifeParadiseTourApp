require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

console.log('🧪 PRUEBA WEBHOOK - Simulando notificación de Redsys');
console.log('==================================================');

// Configuración de prueba
const config = {
  merchantCode: process.env.REDSYS_MERCHANT_CODE || '367529286',
  terminal: process.env.REDSYS_TERMINAL || '1',
  secretKey: process.env.REDSYS_SECRET_KEY,
  environment: process.env.REDSYS_ENVIRONMENT || 'https://sis-t.redsys.es:25443/sis/realizarPago'
};

if (!config.secretKey) {
  console.error('❌ ERROR: REDSYS_SECRET_KEY no está configurada');
  process.exit(1);
}

// Función para cifrar con 3DES-ECB (copiada de lib/redsys-signature.ts)
function encrypt3DES_ECB(data, key) {
  try {
    let keyBuffer = key;
    if (key.length < 24) {
      keyBuffer = Buffer.concat([key, Buffer.alloc(24 - key.length, 0)]);
    } else if (key.length > 24) {
      keyBuffer = key.slice(0, 24);
    }

    const cipher = crypto.createCipheriv('des-ede3', keyBuffer, null);
    cipher.setAutoPadding(true);
    
    const encrypted = Buffer.concat([
      cipher.update(data, 'utf8'),
      cipher.final()
    ]);
    
    return encrypted;
  } catch (error) {
    console.error('❌ Error en encrypt3DES_ECB:', error);
    throw new Error(`Error cifrando con 3DES-ECB: ${error.message}`);
  }
}

// Función para generar firma de Redsys (copiada de lib/redsys-signature.ts)
function generateRedsysSignature(secretKeyBase64, orderNumber, merchantParams) {
  try {
    const decodedSecretKey = Buffer.from(secretKeyBase64, 'base64');
    const derivedKey = encrypt3DES_ECB(orderNumber, decodedSecretKey);
    const merchantParametersJson = JSON.stringify(merchantParams);
    const merchantParametersBase64 = Buffer.from(merchantParametersJson, 'utf8').toString('base64');
    
    const hmac = crypto.createHmac('sha256', derivedKey);
    hmac.update(merchantParametersBase64, 'utf8');
    const signature = hmac.digest('base64');
    
    return signature;
  } catch (error) {
    console.error('❌ Error generando firma:', error);
    throw error;
  }
}

// Datos de prueba del webhook
const testWebhookData = {
  orderNumber: '175328862176',
  amount: 1800, // 18.00€ en céntimos
  responseCode: '0000', // Preautorización exitosa
  authCode: '123456',
  transactionType: '1', // Preautorización
  merchantCode: config.merchantCode,
  terminal: '001'
};

// Crear parámetros del webhook (formato que envía Redsys)
const webhookParams = {
  DS_ORDER: testWebhookData.orderNumber,
  DS_AMOUNT: testWebhookData.amount.toString().padStart(12, '0'),
  DS_CURRENCY: '978',
  DS_RESPONSE: testWebhookData.responseCode,
  DS_AUTHORISATIONCODE: testWebhookData.authCode,
  DS_TRANSACTIONTYPE: testWebhookData.transactionType,
  DS_MERCHANTCODE: testWebhookData.merchantCode,
  DS_TERMINAL: testWebhookData.terminal,
  DS_LANGUAGE: '001'
};

console.log('📋 DATOS DEL WEBHOOK:');
console.log(`   Order Number: ${testWebhookData.orderNumber}`);
console.log(`   Amount: ${testWebhookData.amount} céntimos`);
console.log(`   Response Code: ${testWebhookData.responseCode}`);
console.log(`   Auth Code: ${testWebhookData.authCode}`);
console.log(`   Transaction Type: ${testWebhookData.transactionType}`);

// Generar firma para el webhook
console.log('\n🔐 GENERANDO FIRMA:');
try {
  const signature = generateRedsysSignature(
    config.secretKey,
    testWebhookData.orderNumber,
    webhookParams
  );
  
  console.log('   ✅ Firma generada:', signature.length, 'caracteres');
  
  // Convertir parámetros a Base64
  const merchantParametersBase64 = Buffer.from(JSON.stringify(webhookParams), 'utf8').toString('base64');
  
  console.log('\n📤 DATOS PARA ENVIAR AL WEBHOOK:');
  console.log('   URL: POST /api/payment/webhook');
  console.log('   Content-Type: application/x-www-form-urlencoded');
  console.log('   Body:');
  console.log(`     Ds_SignatureVersion: HMAC_SHA256_V1`);
  console.log(`     Ds_MerchantParameters: ${merchantParametersBase64}`);
  console.log(`     Ds_Signature: ${signature}`);
  
  console.log('\n✅ WEBHOOK LISTO PARA PRUEBA');
  console.log('============================');
  console.log('Para probar el webhook:');
  console.log('1. Asegúrate de que el servidor esté corriendo (npm run dev)');
  console.log('2. Usa Postman o curl para enviar una petición POST a:');
  console.log('   http://localhost:3000/api/payment/webhook');
  console.log('3. Con el body form-data:');
  console.log(`   Ds_SignatureVersion: HMAC_SHA256_V1`);
  console.log(`   Ds_MerchantParameters: ${merchantParametersBase64}`);
  console.log(`   Ds_Signature: ${signature}`);
  
} catch (error) {
  console.error('❌ Error generando datos del webhook:', error.message);
} 