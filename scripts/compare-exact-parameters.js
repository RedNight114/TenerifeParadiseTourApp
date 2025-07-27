#!/usr/bin/env node

/**
 * Script para comparar exactamente los parámetros del error real con los generados
 */

require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

console.log('🔍 COMPARACIÓN EXACTA DE PARÁMETROS');
console.log('====================================');

// Parámetros exactos del error real (decodificados)
const errorParameters = {
  DS_MERCHANT_AMOUNT: "000000018000",
  DS_MERCHANT_ORDER: "175328862176",
  DS_MERCHANT_MERCHANTCODE: "367529286",
  DS_MERCHANT_CURRENCY: "978",
  DS_MERCHANT_TRANSACTIONTYPE: "1",
  DS_MERCHANT_TERMINAL: "001",
  DS_MERCHANT_MERCHANTURL: "https://tenerifeparadisetoursexcursions.com/api/payment/webhook",
  DS_MERCHANT_URLOK: "https://tenerifeparadisetoursexcursions.com/payment/success?reservationId=4d7a591b-d143-4677-9c02-b5d81a2c89c2",
  DS_MERCHANT_URLKO: "https://tenerifeparadisetoursexcursions.com/payment/error?reservationId=4d7a591b-d143-4677-9c02-b5d81a2c89c2",
  DS_MERCHANT_PRODUCTDESCRIPTION: "Reserva: Glamping",
  DS_MERCHANT_MERCHANTNAME: "Tenerife Paradise Tours",
  DS_MERCHANT_CONSUMERLANGUAGE: "001",
  DS_MERCHANT_MERCHANTNAMER: "************************************"
};

// Parámetros que estamos generando
const config = {
  merchantCode: process.env.REDSYS_MERCHANT_CODE || '367529286',
  terminal: process.env.REDSYS_TERMINAL || '1',
  secretKey: process.env.REDSYS_SECRET_KEY,
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://tenerifeparadisetoursexcursions.com'
};

const generatedParameters = {
  DS_MERCHANT_AMOUNT: "000000018000",
  DS_MERCHANT_ORDER: "175328862176",
  DS_MERCHANT_MERCHANTCODE: config.merchantCode,
  DS_MERCHANT_CURRENCY: "978",
  DS_MERCHANT_TRANSACTIONTYPE: "1",
  DS_MERCHANT_TERMINAL: config.terminal.padStart(3, '0'),
  DS_MERCHANT_MERCHANTURL: `${config.baseUrl}/api/payment/webhook`,
  DS_MERCHANT_URLOK: `${config.baseUrl}/payment/success?reservationId=4d7a591b-d143-4677-9c02-b5d81a2c89c2`,
  DS_MERCHANT_URLKO: `${config.baseUrl}/payment/error?reservationId=4d7a591b-d143-4677-9c02-b5d81a2c89c2`,
  DS_MERCHANT_PRODUCTDESCRIPTION: "Reserva: Glamping",
  DS_MERCHANT_MERCHANTNAME: "Tenerife Paradise Tours",
  DS_MERCHANT_CONSUMERLANGUAGE: "001",
  DS_MERCHANT_MERCHANTNAMER: "************************************"
};

console.log('📊 COMPARANDO PARÁMETROS:');
console.log('==========================');

const allKeys = [...new Set([...Object.keys(errorParameters), ...Object.keys(generatedParameters)])];

allKeys.forEach(key => {
  const errorValue = errorParameters[key];
  const generatedValue = generatedParameters[key];
  const matches = errorValue === generatedValue;
  
  console.log(`   ${key}:`);
  console.log(`     Error:    ${errorValue}`);
  console.log(`     Generated: ${generatedValue}`);
  console.log(`     Match:    ${matches ? '✅' : '❌'}`);
  console.log('');
});

// Convertir ambos a JSON y comparar
console.log('📝 COMPARANDO JSON:');
console.log('===================');

const errorJson = JSON.stringify(errorParameters);
const generatedJson = JSON.stringify(generatedParameters);

console.log('   Error JSON length:', errorJson.length);
console.log('   Generated JSON length:', generatedJson.length);
console.log('   JSON match:', errorJson === generatedJson ? '✅' : '❌');

if (errorJson !== generatedJson) {
  console.log('\n🔍 DIFERENCIAS EN JSON:');
  console.log('========================');
  
  // Encontrar diferencias carácter por carácter
  const maxLength = Math.max(errorJson.length, generatedJson.length);
  for (let i = 0; i < maxLength; i++) {
    if (errorJson[i] !== generatedJson[i]) {
      console.log(`   Diferencia en posición ${i}:`);
      console.log(`     Error:    "${errorJson[i]}" (char code: ${errorJson.charCodeAt(i)})`);
      console.log(`     Generated: "${generatedJson[i]}" (char code: ${generatedJson.charCodeAt(i)})`);
      console.log(`     Contexto error:    "${errorJson.substring(Math.max(0, i-10), i+10)}"`);
      console.log(`     Contexto generated: "${generatedJson.substring(Math.max(0, i-10), i+10)}"`);
      break;
    }
  }
}

// Convertir a Base64 y comparar
console.log('\n🔍 COMPARANDO BASE64:');
console.log('=====================');

const errorBase64 = Buffer.from(errorJson, 'utf8').toString('base64');
const generatedBase64 = Buffer.from(generatedJson, 'utf8').toString('base64');

console.log('   Error Base64 length:', errorBase64.length);
console.log('   Generated Base64 length:', generatedBase64.length);
console.log('   Base64 match:', errorBase64 === generatedBase64 ? '✅' : '❌');

if (errorBase64 !== generatedBase64) {
  console.log('\n🔍 DIFERENCIAS EN BASE64:');
  console.log('==========================');
  console.log('   Error Base64 preview:', errorBase64.substring(0, 100) + '...');
  console.log('   Generated Base64 preview:', generatedBase64.substring(0, 100) + '...');
  
  // Encontrar primera diferencia
  const maxLength = Math.max(errorBase64.length, generatedBase64.length);
  for (let i = 0; i < maxLength; i++) {
    if (errorBase64[i] !== generatedBase64[i]) {
      console.log(`   Primera diferencia en posición ${i}:`);
      console.log(`     Error:    "${errorBase64[i]}"`);
      console.log(`     Generated: "${generatedBase64[i]}"`);
      break;
    }
  }
}

// Generar firmas con ambos conjuntos de parámetros
console.log('\n🔐 GENERANDO FIRMAS:');
console.log('=====================');

if (config.secretKey) {
  try {
    const decodedKey = Buffer.from(config.secretKey, "hex");
    
    // Firma con parámetros del error
    const hmac1 = crypto.createHmac("sha256", decodedKey);
    const errorDataToSign = "175328862176" + errorBase64;
    hmac1.update(errorDataToSign, 'utf8');
    const errorSignature = hmac1.digest("base64");
    
    // Firma con parámetros generados
    const hmac2 = crypto.createHmac("sha256", decodedKey);
    const generatedDataToSign = "175328862176" + generatedBase64;
    hmac2.update(generatedDataToSign, 'utf8');
    const generatedSignature = hmac2.digest("base64");
    
    // Firma real del error
    const realSignature = "JYJsqB3HH4+G5Qe/eaqfa8X+Qa4FqYdsCHD//q/sRiY=";
    
    console.log('   Firma con parámetros del error:', errorSignature);
    console.log('   Firma con parámetros generados:', generatedSignature);
    console.log('   Firma real del error:', realSignature);
    console.log('');
    console.log('   Error vs Real:', errorSignature === realSignature ? '✅' : '❌');
    console.log('   Generated vs Real:', generatedSignature === realSignature ? '✅' : '❌');
    console.log('   Error vs Generated:', errorSignature === generatedSignature ? '✅' : '❌');
    
    if (errorSignature === realSignature) {
      console.log('\n🎉 ¡ENCONTRADO!');
      console.log('===============');
      console.log('   Los parámetros del error generan la firma correcta');
      console.log('   El problema está en que nuestros parámetros generados son diferentes');
    } else {
      console.log('\n❌ PROBLEMA PERSISTE');
      console.log('=====================');
      console.log('   Ni siquiera los parámetros del error generan la firma correcta');
      console.log('   Esto indica que la clave secreta es diferente');
    }
    
  } catch (error) {
    console.error('   ❌ Error generando firmas:', error.message);
  }
} else {
  console.log('   ❌ No hay clave secreta configurada');
}

console.log('\n✅ Comparación completada'); 