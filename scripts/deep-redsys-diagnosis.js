#!/usr/bin/env node

/**
 * Diagnóstico profundo del problema SIS0042
 * Identifica problemas específicos de la cuenta de Redsys
 */

require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

console.log('🔍 DIAGNÓSTICO PROFUNDO REDSYS SIS0042');
console.log('=======================================');

// Configuración actual
const config = {
  merchantCode: process.env.REDSYS_MERCHANT_CODE || '367529286',
  terminal: process.env.REDSYS_TERMINAL || '1',
  secretKey: process.env.REDSYS_SECRET_KEY || 'c3E3SGpyVU9CZkttQzU3NklMZ3NrRDVzclU4NzBnSjc=',
  environment: process.env.REDSYS_ENVIRONMENT || 'https://sis-t.redsys.es:25443/sis/realizarPago',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://tenerifeparadisetoursexcursions.com'
};

console.log('📋 CONFIGURACIÓN ACTUAL:');
console.log(`   Merchant Code: ${config.merchantCode}`);
console.log(`   Terminal: ${config.terminal}`);
console.log(`   Secret Key: ${config.secretKey ? '✅ Configurada' : '❌ No configurada'}`);
console.log(`   Environment: ${config.environment}`);
console.log(`   Base URL: ${config.baseUrl}`);

// URLs conocidas de Redsys
const knownUrls = {
  test: 'https://sis-t.redsys.es:25443/sis/realizarPago',
  test_alt: 'https://sis-t.redsys.es:25443/sis/realizarPago.jsp',
  production: 'https://sis.redsys.es/realizarPago',
  production_alt: 'https://sis.redsys.es/realizarPago.jsp',
  sandbox: 'https://sis-d.redsys.es:25443/sis/realizarPago',
  sandbox_alt: 'https://sis-d.redsys.es:25443/sis/realizarPago.jsp'
};

console.log('\n🌐 URLs CONOCIDAS DE REDSYS:');
Object.entries(knownUrls).forEach(([name, url]) => {
  console.log(`   ${name}: ${url}`);
});

// Función para generar datos de prueba
function generateTestData() {
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

// Crear archivos HTML para todas las URLs
console.log('\n📝 CREANDO ARCHIVOS DE PRUEBA PARA TODAS LAS URLs:');
console.log('==================================================');

Object.entries(knownUrls).forEach(([name, url]) => {
  const paymentData = generateTestData();
  
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Test Redsys - ${name.toUpperCase()}</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .info { background: #f0f0f0; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .button { background: #0061A8; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        .button:hover { background: #004d8c; }
    </style>
</head>
<body>
    <h1>🔍 Test Redsys - ${name.toUpperCase()}</h1>
    
    <div class="info">
        <h3>📋 Información del Test:</h3>
        <p><strong>URL:</strong> ${url}</p>
        <p><strong>Order Number:</strong> ${paymentData.orderNumber}</p>
        <p><strong>Amount:</strong> ${paymentData.amount}€</p>
        <p><strong>Merchant Code:</strong> ${config.merchantCode}</p>
        <p><strong>Terminal:</strong> ${config.terminal}</p>
    </div>
    
    <form method="POST" action="${url}" id="redsysForm">
        <input type="hidden" name="Ds_SignatureVersion" value="${paymentData.formData.Ds_SignatureVersion}">
        <input type="hidden" name="Ds_MerchantParameters" value="${paymentData.formData.Ds_MerchantParameters}">
        <input type="hidden" name="Ds_Signature" value="${paymentData.formData.Ds_Signature}">
        <button type="submit" class="button">🚀 Probar Pago - ${name.toUpperCase()}</button>
    </form>
    
    <div class="info">
        <h3>📊 Datos Técnicos:</h3>
        <p><strong>Amount in cents:</strong> ${paymentData.debug.amountInCents}</p>
        <p><strong>Final amount:</strong> ${paymentData.debug.finalAmount}</p>
        <p><strong>Signature length:</strong> ${paymentData.formData.Ds_Signature.length}</p>
        <p><strong>Base URL:</strong> ${config.baseUrl}</p>
    </div>
    
    <script>
        console.log('🔍 Test Redsys - ${name.toUpperCase()}');
        console.log('URL:', '${url}');
        console.log('Order Number:', '${paymentData.orderNumber}');
        console.log('Amount:', ${paymentData.amount});
        
        // Auto-submit después de 5 segundos
        setTimeout(() => {
            console.log('🚀 Enviando formulario automáticamente...');
            document.getElementById('redsysForm').submit();
        }, 5000);
    </script>
</body>
</html>`;

  const fs = require('fs');
  const filename = `test-redsys-${name}.html`;
  fs.writeFileSync(filename, htmlContent);
  console.log(`   ✅ Creado: ${filename}`);
});

// Análisis de posibles problemas
console.log('\n🔍 ANÁLISIS DE POSIBLES PROBLEMAS:');
console.log('===================================');

const paymentData = generateTestData();

// 1. Verificar formato del importe
const amountCheck = paymentData.debug.finalAmount;
if (amountCheck === '000000000000') {
  console.log('❌ PROBLEMA CRÍTICO: Importe en cero');
} else if (amountCheck.length !== 12) {
  console.log('❌ PROBLEMA: Importe no tiene 12 dígitos');
} else {
  console.log('✅ Importe correcto:', amountCheck);
}

// 2. Verificar número de pedido
const orderCheck = paymentData.debug.finalOrder;
if (!orderCheck || orderCheck.length === 0) {
  console.log('❌ PROBLEMA CRÍTICO: Número de pedido vacío');
} else if (orderCheck.length > 12) {
  console.log('❌ PROBLEMA: Número de pedido muy largo');
} else {
  console.log('✅ Número de pedido correcto:', orderCheck);
}

// 3. Verificar terminal
const terminalCheck = config.terminal.padStart(3, '0');
if (terminalCheck !== '001') {
  console.log('❌ PROBLEMA: Terminal incorrecto:', terminalCheck);
} else {
  console.log('✅ Terminal correcto:', terminalCheck);
}

// 4. Verificar firma
if (paymentData.formData.Ds_Signature.length < 20) {
  console.log('❌ PROBLEMA: Firma demasiado corta');
} else {
  console.log('✅ Firma correcta:', paymentData.formData.Ds_Signature.length, 'caracteres');
}

// 5. Verificar URLs
const urlCheck = `${config.baseUrl}/payment/success`;
if (!urlCheck.includes('https://')) {
  console.log('❌ PROBLEMA: URL no es HTTPS');
} else {
  console.log('✅ URLs correctas');
}

// 6. Verificar Secret Key
try {
  const decodedKey = Buffer.from(config.secretKey, "base64");
  if (decodedKey.length === 0) {
    console.log('❌ PROBLEMA: Secret Key inválida');
  } else {
    console.log('✅ Secret Key válida:', decodedKey.length, 'bytes');
  }
} catch (error) {
  console.log('❌ PROBLEMA: Secret Key no es base64 válido');
}

console.log('\n🎯 RECOMENDACIONES:');
console.log('==================');
console.log('1. Prueba todos los archivos HTML creados');
console.log('2. El que funcione sin SIS0042 es el correcto');
console.log('3. Si todos fallan, contacta con Redsys con estos datos:');
console.log(`   - Merchant Code: ${config.merchantCode}`);
console.log(`   - Terminal: ${config.terminal}`);
console.log(`   - Environment: ${config.environment}`);
console.log(`   - Base URL: ${config.baseUrl}`);
console.log('4. Posibles causas del SIS0042:');
console.log('   - Configuración específica de tu cuenta');
console.log('   - Restricciones de IP o dominio');
console.log('   - Secret Key incorrecta para el entorno');
console.log('   - Problema temporal de Redsys');
console.log('   - Cuenta no activada para el entorno específico');

console.log('\n📋 ARCHIVOS CREADOS:');
Object.keys(knownUrls).forEach(name => {
  console.log(`   - test-redsys-${name}.html`);
}); 