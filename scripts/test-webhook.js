const crypto = require('crypto');
require('dotenv').config({path: '.env.local'});

// Función para generar firma CBC (igual que en signature-v2.ts)
function generateRedsysSignatureCBC(secretKeyBase64, orderNumber, merchantParams) {
  const secretKey = Buffer.from(secretKeyBase64, 'base64');
  const iv = Buffer.alloc(8, 0);
  const cipher = crypto.createCipheriv('des-ede3-cbc', secretKey, iv);
  cipher.setAutoPadding(true);
  
  let encryptedOrder = cipher.update(orderNumber, 'utf8');
  encryptedOrder = Buffer.concat([encryptedOrder, cipher.final()]);
  
  const orderedParams = Object.fromEntries(
    Object.entries(merchantParams).sort(([a], [b]) => a.localeCompare(b))
  );
  
  const merchantParamsJson = JSON.stringify(orderedParams);
  const merchantParamsBase64 = Buffer.from(merchantParamsJson, 'utf8').toString('base64');
  
  const hmac = crypto.createHmac('sha256', encryptedOrder);
  hmac.update(merchantParamsBase64);
  const signature = hmac.digest('base64');
  
  return { signature, merchantParamsBase64, merchantParams: orderedParams };
}

// Simular datos de respuesta de Redsys
const testWebhookData = {
  order: 'testreservat',
  responseCode: '0000', // Pago exitoso
  responseText: 'Transacción autorizada',
  authCode: '123456',
  amount: '000000018000'
};

// Parámetros que Redsys enviaría al webhook
const webhookParams = {
  DS_MERCHANT_AMOUNT: testWebhookData.amount,
  DS_MERCHANT_CURRENCY: '978',
  DS_MERCHANT_MERCHANTCODE: '367529286',
  DS_MERCHANT_ORDER: testWebhookData.order,
  DS_MERCHANT_TERMINAL: '1',
  DS_MERCHANT_TRANSACTIONTYPE: '1',
  DS_RESPONSE: testWebhookData.responseCode,
  DS_RESPONSE_TEXT: testWebhookData.responseText,
  DS_AUTHORISATIONCODE: testWebhookData.authCode
};

// Generar firma para los parámetros del webhook
const { signature, merchantParamsBase64 } = generateRedsysSignatureCBC(
  process.env.REDSYS_SECRET_KEY,
  testWebhookData.order,
  webhookParams
);

console.log('🧪 PRUEBA DE WEBHOOK');
console.log('====================');
console.log('URL del webhook:', `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/webhook`);
console.log('');
console.log('Datos que se enviarían al webhook:');
console.log('- Ds_MerchantParameters:', merchantParamsBase64);
console.log('- Ds_Signature:', signature);
console.log('');
console.log('Parámetros decodificados:');
console.log(JSON.stringify(webhookParams, null, 2));
console.log('');

// Simular petición POST al webhook
async function testWebhook() {
  const formData = new FormData();
  formData.append('Ds_MerchantParameters', merchantParamsBase64);
  formData.append('Ds_Signature', signature);
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/webhook`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    console.log('📡 RESPUESTA DEL WEBHOOK:');
    console.log('Status:', response.status);
    console.log('Response:', result);
    
    if (response.ok) {
      console.log('✅ Webhook funcionando correctamente');
    } else {
      console.log('❌ Error en el webhook');
    }
    
  } catch (error) {
    console.error('❌ Error al probar webhook:', error.message);
  }
}

// Ejecutar prueba si estamos en un entorno con fetch
if (typeof fetch !== 'undefined') {
  testWebhook();
} else {
  console.log('📋 Para probar el webhook, ejecuta:');
  console.log('curl -X POST \\');
  console.log(`  -d "Ds_MerchantParameters=${merchantParamsBase64}" \\`);
  console.log(`  -d "Ds_Signature=${signature}" \\`);
  console.log(`  ${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/webhook`);
} 