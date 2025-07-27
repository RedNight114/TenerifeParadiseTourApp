#!/usr/bin/env node

/**
 * Script final para verificar que la corrección del campo DS_MERCHANT_MERCHANTNAMER resuelve el problema SIS0042
 */

require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

console.log('✅ PRUEBA FINAL - CORRECCIÓN DS_MERCHANT_MERCHANTNAMER');
console.log('=====================================================');

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

// Datos del error real
const errorData = {
  orderNumber: '175328862176',
  amount: '000000018000',
  signature: 'JYJsqB3HH4+G5Qe/eaqfa8X+Qa4FqYdsCHD//q/sRiY=',
  reservationId: '4d7a591b-d143-4677-9c02-b5d81a2c89c2',
  description: 'Reserva: Glamping'
};

console.log('\n📊 DATOS DEL ERROR REAL:');
console.log('=========================');
console.log('   Order Number:', errorData.orderNumber);
console.log('   Amount:', errorData.amount);
console.log('   Signature:', errorData.signature);
console.log('   Reservation ID:', errorData.reservationId);
console.log('   Description:', errorData.description);

// Crear parámetros del comercio con la corrección
console.log('\n🔧 CREANDO PARÁMETROS CON CORRECCIÓN:');
console.log('======================================');

const merchantParameters = {
  DS_MERCHANT_AMOUNT: errorData.amount,
  DS_MERCHANT_ORDER: errorData.orderNumber,
  DS_MERCHANT_MERCHANTCODE: config.merchantCode,
  DS_MERCHANT_CURRENCY: '978',
  DS_MERCHANT_TRANSACTIONTYPE: '1',
  DS_MERCHANT_TERMINAL: config.terminal.padStart(3, '0'),
  DS_MERCHANT_MERCHANTURL: `${config.baseUrl}/api/payment/webhook`,
  DS_MERCHANT_URLOK: `${config.baseUrl}/payment/success?reservationId=${errorData.reservationId}`,
  DS_MERCHANT_URLKO: `${config.baseUrl}/payment/error?reservationId=${errorData.reservationId}`,
  DS_MERCHANT_PRODUCTDESCRIPTION: errorData.description,
  DS_MERCHANT_MERCHANTNAME: 'Tenerife Paradise Tours',
  DS_MERCHANT_CONSUMERLANGUAGE: '001',
  DS_MERCHANT_MERCHANTNAMER: '************************************' // Campo corregido
};

console.log('   Merchant Parameters creados:', Object.keys(merchantParameters).length, 'campos');
console.log('   Campo DS_MERCHANT_MERCHANTNAMER:', merchantParameters.DS_MERCHANT_MERCHANTNAMER);

// Convertir a JSON y Base64
console.log('\n📝 CONVIRTIENDO A JSON Y BASE64:');
console.log('==================================');

const merchantParametersJson = JSON.stringify(merchantParameters);
const merchantParametersBase64 = Buffer.from(merchantParametersJson, 'utf8').toString('base64');

console.log('   JSON length:', merchantParametersJson.length);
console.log('   Base64 length:', merchantParametersBase64.length);
console.log('   JSON preview:', merchantParametersJson.substring(0, 100) + '...');

// Verificar caracteres escapados
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

// Generar firma con la corrección
console.log('\n🔐 GENERANDO FIRMA CON CORRECCIÓN:');
console.log('===================================');

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

const calculatedSignature = generateSignature(errorData.orderNumber, finalMerchantParametersBase64, config.secretKey);

// Comparar firmas
console.log('\n🔍 COMPARACIÓN DE FIRMAS:');
console.log('==========================');

console.log('   Firma del error real:', errorData.signature);
console.log('   Firma calculada:', calculatedSignature);
console.log('   ¿Coinciden?:', calculatedSignature === errorData.signature ? '✅ SÍ' : '❌ NO');

if (calculatedSignature === errorData.signature) {
  console.log('\n🎉 ¡PROBLEMA SIS0042 RESUELTO!');
  console.log('===============================');
  console.log('✅ La corrección del campo DS_MERCHANT_MERCHANTNAMER funciona');
  console.log('✅ El cálculo de la firma es correcto');
  console.log('✅ El sistema está listo para procesar pagos');
  
  console.log('\n📝 RESUMEN DE LA CORRECCIÓN:');
  console.log('=============================');
  console.log('   Campo incorrecto: DS_MERCHANT_MERCHANTDATA');
  console.log('   Campo correcto: DS_MERCHANT_MERCHANTNAMER');
  console.log('   Valor correcto: ************************************');
  console.log('   Razón: Los parámetros del error real usaban DS_MERCHANT_MERCHANTNAMER');
  
} else {
  console.log('\n❌ PROBLEMA PERSISTE');
  console.log('=====================');
  console.log('   La firma aún no coincide');
  console.log('   Posibles causas adicionales:');
  console.log('   1. La clave secreta es diferente');
  console.log('   2. Hay otros parámetros diferentes');
  console.log('   3. El formato de los datos es diferente');
  
  console.log('\n🔍 ANÁLISIS ADICIONAL:');
  console.log('=======================');
  console.log('   Longitud firma real:', errorData.signature.length);
  console.log('   Longitud firma calculada:', calculatedSignature.length);
  console.log('   Primeros 20 caracteres - Real:', errorData.signature.substring(0, 20));
  console.log('   Primeros 20 caracteres - Calculada:', calculatedSignature.substring(0, 20));
}

// Crear datos del formulario
console.log('\n📋 DATOS DEL FORMULARIO FINAL:');
console.log('===============================');

const formData = {
  Ds_SignatureVersion: "HMAC_SHA256_V1",
  Ds_MerchantParameters: finalMerchantParametersBase64,
  Ds_Signature: calculatedSignature,
};

console.log('   Ds_SignatureVersion:', formData.Ds_SignatureVersion);
console.log('   Ds_MerchantParameters length:', formData.Ds_MerchantParameters.length);
console.log('   Ds_Signature length:', formData.Ds_Signature.length);

console.log('\n✅ Prueba final completada'); 