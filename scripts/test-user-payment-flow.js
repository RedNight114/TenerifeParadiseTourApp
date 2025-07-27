#!/usr/bin/env node

/**
 * Script para probar el flujo completo de pago del usuario
 * Simula exactamente lo que hace el usuario cuando hace clic en "Procesar pago"
 */

require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

console.log('🧪 PRUEBA DEL FLUJO DE PAGO DEL USUARIO');
console.log('========================================');

// Configuración actual
const config = {
  merchantCode: process.env.REDSYS_MERCHANT_CODE || '367529286',
  terminal: process.env.REDSYS_TERMINAL || '1',
  secretKey: process.env.REDSYS_SECRET_KEY,
  environment: process.env.REDSYS_ENVIRONMENT || 'https://sis-t.redsys.es:25443/sis/realizarPago',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://tenerifeparadisetoursexcursions.com'
};

console.log('📋 CONFIGURACIÓN ACTUAL:');
console.log(`   Merchant Code: ${config.merchantCode}`);
console.log(`   Terminal: ${config.terminal}`);
console.log(`   Secret Key: ${config.secretKey ? '✅ Configurada' : '❌ No configurada'}`);
console.log(`   Environment: ${config.environment}`);
console.log(`   Base URL: ${config.baseUrl}`);

if (!config.secretKey) {
  console.error('❌ ERROR: REDSYS_SECRET_KEY no está configurada');
  process.exit(1);
}

// Simular datos del usuario (idénticos al error real)
console.log('\n👤 SIMULANDO DATOS DEL USUARIO:');
console.log('=================================');

const userData = {
  reservationId: '4d7a591b-d143-4677-9c02-b5d81a2c89c2',
  amount: 180,
  description: 'Reserva: Glamping'
};

console.log('   Reservation ID:', userData.reservationId);
console.log('   Amount:', userData.amount, 'EUR');
console.log('   Description:', userData.description);

// Simular la creación de parámetros del comercio (como lo hace la API)
console.log('\n🔧 SIMULANDO CREACIÓN DE PARÁMETROS:');
console.log('=====================================');

const timestamp = Date.now();
const reservationSuffix = userData.reservationId.replace(/-/g, '').slice(-4);
const orderNumber = `${timestamp}${reservationSuffix}`.slice(0, 12);
const amountInCents = Math.round(userData.amount * 100);

console.log('   Timestamp:', timestamp);
console.log('   Reservation Suffix:', reservationSuffix);
console.log('   Order Number:', orderNumber);
console.log('   Amount in cents:', amountInCents);

// Crear parámetros del comercio (idénticos a la API)
const merchantParameters = {
  DS_MERCHANT_AMOUNT: amountInCents.toString().padStart(12, '0'),
  DS_MERCHANT_ORDER: orderNumber,
  DS_MERCHANT_MERCHANTCODE: config.merchantCode,
  DS_MERCHANT_CURRENCY: '978',
  DS_MERCHANT_TRANSACTIONTYPE: '1',
  DS_MERCHANT_TERMINAL: config.terminal.padStart(3, '0'),
  DS_MERCHANT_MERCHANTURL: `${config.baseUrl}/api/payment/webhook`,
  DS_MERCHANT_URLOK: `${config.baseUrl}/payment/success?reservationId=${userData.reservationId}`,
  DS_MERCHANT_URLKO: `${config.baseUrl}/payment/error?reservationId=${userData.reservationId}`,
  DS_MERCHANT_PRODUCTDESCRIPTION: userData.description,
  DS_MERCHANT_MERCHANTNAME: 'Tenerife Paradise Tours',
  DS_MERCHANT_CONSUMERLANGUAGE: '001',
  DS_MERCHANT_MERCHANTDATA: userData.reservationId
};

console.log('   Merchant Parameters creados:', Object.keys(merchantParameters).length, 'campos');

// Convertir a JSON y Base64 (como lo hace la API)
console.log('\n📝 CONVIRTIENDO A JSON Y BASE64:');
console.log('==================================');

const merchantParametersJson = JSON.stringify(merchantParameters);
const merchantParametersBase64 = Buffer.from(merchantParametersJson, 'utf8').toString('base64');

console.log('   JSON length:', merchantParametersJson.length);
console.log('   Base64 length:', merchantParametersBase64.length);
console.log('   JSON preview:', merchantParametersJson.substring(0, 100) + '...');

// Verificar caracteres escapados (como lo hace la API)
console.log('\n🔍 VERIFICANDO CARACTERES ESCAPADOS:');
console.log('=====================================');

let correctedJson = merchantParametersJson;
if (merchantParametersJson.includes('\\/')) {
  console.log('   ⚠️  Detectados caracteres escapados, corrigiendo...');
  const escapedCount = (merchantParametersJson.match(/\\\//g) || []).length;
  console.log('   Caracteres escapados encontrados:', escapedCount);
  correctedJson = merchantParametersJson.replace(/\\\//g, '/');
  console.log('   ✅ Caracteres escapados corregidos');
} else {
  console.log('   ✅ No se detectaron caracteres escapados');
}

// Reconvertir si hubo correcciones
let finalMerchantParametersBase64 = merchantParametersBase64;
if (correctedJson !== merchantParametersJson) {
  finalMerchantParametersBase64 = Buffer.from(correctedJson, 'utf8').toString('base64');
  console.log('   Base64 recalculado:', finalMerchantParametersBase64.length, 'caracteres');
}

// Generar firma (como lo hace la API)
console.log('\n🔐 GENERANDO FIRMA:');
console.log('===================');

function generateSignature(order, merchantParameters, secretKey) {
  try {
    // Limpiar parámetros
    const cleanOrder = order.toString().trim();
    const cleanMerchantParameters = merchantParameters.toString().trim();
    const cleanSecretKey = secretKey.toString().trim();
    
    console.log('   Order (clean):', cleanOrder);
    console.log('   Merchant Parameters (clean):', cleanMerchantParameters.substring(0, 50) + '...');
    console.log('   Secret Key (clean):', cleanSecretKey.substring(0, 10) + '...');
    
    // Decodificar clave
    let decodedKey;
    try {
      decodedKey = Buffer.from(cleanSecretKey, "hex");
      console.log('   ✅ Clave decodificada como Hexadecimal');
    } catch (hexError) {
      try {
        decodedKey = Buffer.from(cleanSecretKey, "base64");
        console.log('   ⚠️  Clave decodificada como Base64');
      } catch (base64Error) {
        decodedKey = Buffer.from(cleanSecretKey, "utf8");
        console.log('   ⚠️  Clave usada como texto plano');
      }
    }
    
    // Crear HMAC
    const hmac = crypto.createHmac("sha256", decodedKey);
    const dataToSign = cleanOrder + cleanMerchantParameters;
    hmac.update(dataToSign, 'utf8');
    const signature = hmac.digest("base64");
    
    console.log('   Data to sign length:', dataToSign.length);
    console.log('   Signature length:', signature.length);
    console.log('   Signature preview:', signature.substring(0, 20) + '...');
    
    return signature;
  } catch (error) {
    console.error('   ❌ Error generando firma:', error.message);
    throw error;
  }
}

const signature = generateSignature(orderNumber, finalMerchantParametersBase64, config.secretKey);

// Crear datos del formulario (como lo hace la API)
console.log('\n📋 CREANDO DATOS DEL FORMULARIO:');
console.log('==================================');

const formData = {
  Ds_SignatureVersion: "HMAC_SHA256_V1",
  Ds_MerchantParameters: finalMerchantParametersBase64,
  Ds_Signature: signature,
};

console.log('   Ds_SignatureVersion:', formData.Ds_SignatureVersion);
console.log('   Ds_MerchantParameters length:', formData.Ds_MerchantParameters.length);
console.log('   Ds_Signature length:', formData.Ds_Signature.length);

// Verificar que todos los campos estén presentes
console.log('\n✅ VERIFICACIÓN FINAL:');
console.log('======================');

const requiredFields = ['Ds_SignatureVersion', 'Ds_MerchantParameters', 'Ds_Signature'];
const missingFields = requiredFields.filter(field => !formData[field]);

if (missingFields.length > 0) {
  console.error('   ❌ Campos faltantes:', missingFields);
} else {
  console.log('   ✅ Todos los campos requeridos están presentes');
}

// Simular el envío del formulario
console.log('\n🚀 SIMULANDO ENVÍO DEL FORMULARIO:');
console.log('====================================');

console.log('   URL destino:', config.environment);
console.log('   Método: POST');
console.log('   Campos del formulario:');

Object.entries(formData).forEach(([key, value]) => {
  console.log(`     ${key}: ${typeof value === 'string' ? value.substring(0, 50) + '...' : value}`);
});

// Comparar con los datos del error real
console.log('\n🔍 COMPARACIÓN CON ERROR REAL:');
console.log('==============================');

const errorData = {
  orderNumber: '175328862176',
  amount: '000000018000',
  signature: 'JYJsqB3HH4+G5Qe/eaqfa8X+Qa4FqYdsCHD//q/sRiY='
};

console.log('   Error real - Order Number:', errorData.orderNumber);
console.log('   Error real - Amount:', errorData.amount);
console.log('   Error real - Signature:', errorData.signature);
console.log('   Simulado - Order Number:', orderNumber);
console.log('   Simulado - Amount:', merchantParameters.DS_MERCHANT_AMOUNT);
console.log('   Simulado - Signature:', signature);

// Verificar si hay diferencias
const orderMatches = orderNumber === errorData.orderNumber;
const amountMatches = merchantParameters.DS_MERCHANT_AMOUNT === errorData.amount;
const signatureMatches = signature === errorData.signature;

console.log('\n📊 RESULTADOS DE LA COMPARACIÓN:');
console.log('=================================');
console.log(`   Order Number coincide: ${orderMatches ? '✅' : '❌'}`);
console.log(`   Amount coincide: ${amountMatches ? '✅' : '❌'}`);
console.log(`   Signature coincide: ${signatureMatches ? '✅' : '❌'}`);

if (!signatureMatches) {
  console.log('\n🔍 ANÁLISIS DE LA FIRMA:');
  console.log('=========================');
  console.log('   La firma no coincide, esto indica que:');
  console.log('   1. Los parámetros del comercio son diferentes');
  console.log('   2. La clave secreta es diferente');
  console.log('   3. El algoritmo de firma es diferente');
  console.log('   4. Hay diferencias en el formato de los datos');
  
  console.log('\n   Datos que se firmaron:');
  console.log(`   Order: ${orderNumber}`);
  console.log(`   Merchant Parameters: ${finalMerchantParametersBase64.substring(0, 100)}...`);
}

console.log('\n✅ Prueba del flujo completada'); 