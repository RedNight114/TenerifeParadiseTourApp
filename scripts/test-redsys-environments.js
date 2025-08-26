#!/usr/bin/env node

/**
 * Script para probar ambos entornos de Redsys
 * Determina si el problema es el entorno TEST vs PRODUCCIÓN
 */

require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

console.log('🔍 TESTING REDSYS ENVIRONMENTS');
console.log('==============================');

// Configuración
const config = {
  merchantCode: process.env.REDSYS_MERCHANT_CODE || '367529286',
  terminal: process.env.REDSYS_TERMINAL || '1',
  secretKey: process.env.REDSYS_SECRET_KEY || 'c3E3SGpyVU9CZkttQzU3NklMZ3NrRDVzclU4NzBnSjc=',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://tenerifeparadisetoursexcursions.com'
};

// Entornos a probar
const environments = {
  test: 'https://sis-t.redsys.es:25443/sis/realizarPago',
  production: 'https://sis.redsys.es/realizarPago'
};

console.log('📋 Configuración:');
console.log(`   Merchant Code: ${config.merchantCode}`);
console.log(`   Terminal: ${config.terminal}`);
console.log(`   Secret Key: ${config.secretKey ? '✅ Configurada' : '❌ No configurada'}`);
console.log(`   Base URL: ${config.baseUrl}`);

// Función para generar datos de pago
function generatePaymentData(environment) {
  const reservationData = {
    reservationId: 'test-reservation-123',
    amount: 180,
    description: 'Reserva: Test Service'
  };

  const amountInCents = reservationData.amount * 100;
  const timestamp = Date.now();
  const reservationSuffix = reservationData.reservationId.replace(/-/g, '').slice(-4);
  const orderNumber = `${timestamp}${reservationSuffix}`.slice(0, 12);

  const merchantParameters = {
    DS_MERCHANT_AMOUNT: amountInCents.toString().padStart(12, '0'),
    DS_MERCHANT_ORDER: orderNumber,
    DS_MERCHANT_MERCHANTCODE: config.merchantCode,
    DS_MERCHANT_CURRENCY: '978',
    DS_MERCHANT_TRANSACTIONTYPE: '1',
    DS_MERCHANT_TERMINAL: config.terminal.padStart(3, '0'),
    DS_MERCHANT_MERCHANTURL: `${config.baseUrl}/api/payment/webhook`,
    DS_MERCHANT_URLOK: `${config.baseUrl}/payment/success?reservationId=${reservationData.reservationId}`,
    DS_MERCHANT_URLKO: `${config.baseUrl}/payment/error?reservationId=${reservationData.reservationId}`,
    DS_MERCHANT_PRODUCTDESCRIPTION: reservationData.description,
    DS_MERCHANT_MERCHANTNAME: 'Tenerife Paradise Tours',
    DS_MERCHANT_CONSUMERLANGUAGE: '001',
    DS_MERCHANT_MERCHANTDATA: reservationData.reservationId
  };

  const merchantParametersJson = JSON.stringify(merchantParameters);
  const merchantParametersBase64 = Buffer.from(merchantParametersJson).toString('base64');

  // Generar firma
  const cleanOrder = orderNumber.toString().trim();
  const cleanMerchantParameters = merchantParametersBase64.toString().trim();
  const cleanSecretKey = config.secretKey.toString().trim();
  const decodedKey = Buffer.from(cleanSecretKey, "base64");
  const hmac = crypto.createHmac("sha256", decodedKey);
  const dataToSign = cleanOrder + cleanMerchantParameters;
  hmac.update(dataToSign, 'utf8');
  const signature = hmac.digest("base64");

  return {
    environment,
    formData: {
      Ds_SignatureVersion: "HMAC_SHA256_V1",
      Ds_MerchantParameters: merchantParametersBase64,
      Ds_Signature: signature,
    },
    orderNumber,
    amount: reservationData.amount,
    reservationId: reservationData.reservationId,
    debug: {
      amountInCents,
      finalAmount: merchantParameters.DS_MERCHANT_AMOUNT,
      finalOrder: merchantParameters.DS_MERCHANT_ORDER
    }
  };
}

// Probar cada entorno
console.log('\n🔍 PROBANDO ENTORNOS:');
console.log('=====================');

Object.entries(environments).forEach(([name, url]) => {
  console.log(`\n📋 Entorno: ${name.toUpperCase()}`);
  console.log(`   URL: ${url}`);
  
  const paymentData = generatePaymentData(url);
  
  console.log(`   Order Number: ${paymentData.orderNumber}`);
  console.log(`   Amount: ${paymentData.amount}€`);
  console.log(`   Amount in cents: ${paymentData.debug.amountInCents}`);
  console.log(`   Final amount: ${paymentData.debug.finalAmount}`);
  console.log(`   Signature length: ${paymentData.formData.Ds_Signature.length}`);
  
  // Verificar datos críticos
  const amountCheck = paymentData.debug.finalAmount;
  const orderCheck = paymentData.debug.finalOrder;
  const terminalCheck = config.terminal.padStart(3, '0');
  
  const issues = [];
  
  if (amountCheck === '000000000000') {
    issues.push('Importe en cero');
  }
  if (!orderCheck || orderCheck.length === 0) {
    issues.push('Número de pedido vacío');
  }
  if (terminalCheck !== '001') {
    issues.push('Terminal incorrecto');
  }
  if (paymentData.formData.Ds_Signature.length < 20) {
    issues.push('Firma demasiado corta');
  }
  
  if (issues.length === 0) {
    console.log('   ✅ Datos correctos');
  } else {
    console.log(`   ❌ Problemas: ${issues.join(', ')}`);
  }
});

// Crear archivos HTML de prueba
console.log('\n📝 CREANDO ARCHIVOS HTML DE PRUEBA:');
console.log('===================================');

Object.entries(environments).forEach(([name, url]) => {
  const paymentData = generatePaymentData(url);
  
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Test Redsys - ${name.toUpperCase()}</title>
    <meta charset="UTF-8">
</head>
<body>
    <h1>Test Redsys - ${name.toUpperCase()}</h1>
    <p>Entorno: ${url}</p>
    <p>Order Number: ${paymentData.orderNumber}</p>
    <p>Amount: ${paymentData.amount}€</p>
    
    <form method="POST" action="${url}" id="redsysForm">
        <input type="hidden" name="Ds_SignatureVersion" value="${paymentData.formData.Ds_SignatureVersion}">
        <input type="hidden" name="Ds_MerchantParameters" value="${paymentData.formData.Ds_MerchantParameters}">
        <input type="hidden" name="Ds_Signature" value="${paymentData.formData.Ds_Signature}">
        <button type="submit">Probar Pago - ${name.toUpperCase()}</button>
    </form>
    
    <script>
        // Auto-submit después de 3 segundos
        setTimeout(() => {
            document.getElementById('redsysForm').submit();
        }, 3000);
    </script>
</body>
</html>`;

  const fs = require('fs');
  const filename = `test-redsys-${name}.html`;
  fs.writeFileSync(filename, htmlContent);
  console.log(`   ✅ Creado: ${filename}`);
});

console.log('\n🎯 INSTRUCCIONES:');
console.log('=================');
console.log('1. Abre los archivos HTML creados en tu navegador');
console.log('2. Cada archivo probará un entorno diferente');
console.log('3. El que funcione sin SIS0042 es el correcto');
console.log('4. Actualiza REDSYS_ENVIRONMENT en .env.local con la URL correcta');
console.log('');
console.log('📋 URLs de prueba:');
console.log(`   TEST: ${environments.test}`);
console.log(`   PRODUCCIÓN: ${environments.production}`);
console.log('');
console.log('💡 Si ambos fallan, el problema puede ser:');
console.log('   - Configuración específica de tu cuenta de Redsys');
console.log('   - Restricciones de IP o dominio');
console.log('   - Secret Key incorrecta para el entorno');
console.log('   - Problema temporal de Redsys'); 