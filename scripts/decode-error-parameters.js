#!/usr/bin/env node

/**
 * Script para decodificar los parámetros del error SIS0042 real
 * Extrae los datos exactos que se enviaron a Redsys desde el error
 */

require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

console.log('🔍 DECODIFICANDO PARÁMETROS DEL ERROR SIS0042');
console.log('=============================================');

// Datos del error real
const errorData = {
  orderNumber: '175328862176',
  amount: '000000018000',
  signature: 'JYJsqB3HH4+G5Qe/eaqfa8X+Qa4FqYdsCHD//q/sRiY=',
  merchantParametersBase64: 'eyJEU19NRVJDSEFOVF9BTU9VTlQiOiIwMDAwMDAwMTgwMDAiLCJEU19NRVJDSEFOVF9PUkRFUiI6IjE3NTMyODg2MjE3NiIsIkRTX01FUkNIQU5UX01FUkNIQU5UQ09ERSI6IjM2NzUyOTI4NiIsIkRTX01FUkNIQU5UX0NVUlJFTkNZIjoiOTc4IiwiRFNfTUVSQ0hBTlRfVFJBTlNBQ1RJT05UWVBFIjoiMSIsIkRTX01FUkNIQU5UX1RFUk1JTkFMIjoiMDAxIiwiRFNfTUVSQ0hBTlRfTUVSQ0hBTlRVUkwiOiJodHRwczpcL1wvdGVuZXJpZmVwYXJhZGlzZXRvdXJzZXhjdXJzaW9ucy5jb21cL2FwaVwvcGF5bWVudFwvd2ViaG9vayIsIkRTX01FUkNIQU5UX1VSTE9LIjoiaHR0cHM6XC9cL3RlbmVyaWZlcGFyYWRpc2V0b3Vyc2V4Y3Vyc2lvbnMuY29tXC9wYXltZW50XC9zdWNjZXNzP3Jlc2VydmF0aW9uSWQ9NGQ3YTU5MWItZDE0My00Njc3LTljMDItYjVkODFhMmM4OWMyIiwiRFNfTUVSQ0hBTlRfVVJMS08iOiJodHRwczpcL1wvdGVuZXJpZmVwYXJhZGlzZXRvdXJzZXhjdXJzaW9ucy5jb21cL3BheW1lbnRcL2Vycm9yP3Jlc2VydmF0aW9uSWQ9NGQ3YTU5MWItZDE0My00Njc3LTljMDItYjVkODFhMmM4OWMyIiwiRFNfTUVSQ0hBTlRfUFJPRFVDVERFU0NSSVBUSU9OIjoiUmVzZXJ2YTogR2xhbXBpbmciLCJEU19NRVJDSEFOVF9NRVJDSEFOVE5BTUUiOiJUZW5lcmlmZSBQYXJhZGlzZSBUb3VycyIsIkRTX01FUkNIQU5UX0NPTlNVTUVSTEFOR1VBR0UiOiIwMDEiLCJEU19NRVJDSEFOVF9NRVJDSEFOVE5BTUVSIjoiKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioifQ=='
};

console.log('📊 DATOS DEL ERROR REAL:');
console.log('=========================');
console.log('   Order Number:', errorData.orderNumber);
console.log('   Amount:', errorData.amount);
console.log('   Signature:', errorData.signature);
console.log('   Merchant Parameters Base64 length:', errorData.merchantParametersBase64.length);

// Decodificar los parámetros del comercio
console.log('\n🔍 DECODIFICANDO PARÁMETROS DEL COMERCIO:');
console.log('==========================================');

try {
  const decodedParameters = Buffer.from(errorData.merchantParametersBase64, 'base64').toString('utf-8');
  const parameters = JSON.parse(decodedParameters);
  
  console.log('   ✅ Parámetros decodificados exitosamente');
  console.log('   JSON length:', decodedParameters.length);
  console.log('   Número de campos:', Object.keys(parameters).length);
  
  console.log('\n📋 PARÁMETROS DECODIFICADOS:');
  console.log('=============================');
  
  Object.entries(parameters).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
  
  // Extraer información clave
  console.log('\n🔑 INFORMACIÓN CLAVE:');
  console.log('======================');
  console.log('   DS_MERCHANT_ORDER:', parameters.DS_MERCHANT_ORDER);
  console.log('   DS_MERCHANT_AMOUNT:', parameters.DS_MERCHANT_AMOUNT);
  console.log('   DS_MERCHANT_MERCHANTCODE:', parameters.DS_MERCHANT_MERCHANTCODE);
  console.log('   DS_MERCHANT_TERMINAL:', parameters.DS_MERCHANT_TERMINAL);
  console.log('   DS_MERCHANT_CURRENCY:', parameters.DS_MERCHANT_CURRENCY);
  console.log('   DS_MERCHANT_TRANSACTIONTYPE:', parameters.DS_MERCHANT_TRANSACTIONTYPE);
  console.log('   DS_MERCHANT_PRODUCTDESCRIPTION:', parameters.DS_MERCHANT_PRODUCTDESCRIPTION);
  console.log('   DS_MERCHANT_MERCHANTNAME:', parameters.DS_MERCHANT_MERCHANTNAME);
  console.log('   DS_MERCHANT_MERCHANTDATA:', parameters.DS_MERCHANT_MERCHANTDATA);
  
  // Verificar URLs
  console.log('\n🌐 URLs ENVIADAS:');
  console.log('==================');
  console.log('   DS_MERCHANT_MERCHANTURL:', parameters.DS_MERCHANT_MERCHANTURL);
  console.log('   DS_MERCHANT_URLOK:', parameters.DS_MERCHANT_URLOK);
  console.log('   DS_MERCHANT_URLKO:', parameters.DS_MERCHANT_URLKO);
  
  // Comparar con la configuración actual
  console.log('\n🔍 COMPARACIÓN CON CONFIGURACIÓN ACTUAL:');
  console.log('=========================================');
  
  const currentConfig = {
    merchantCode: process.env.REDSYS_MERCHANT_CODE || '367529286',
    terminal: process.env.REDSYS_TERMINAL || '1',
    secretKey: process.env.REDSYS_SECRET_KEY,
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://tenerifeparadisetoursexcursions.com'
  };
  
  console.log('   Merchant Code - Error:', parameters.DS_MERCHANT_MERCHANTCODE);
  console.log('   Merchant Code - Actual:', currentConfig.merchantCode);
  console.log('   Terminal - Error:', parameters.DS_MERCHANT_TERMINAL);
  console.log('   Terminal - Actual:', currentConfig.terminal.padStart(3, '0'));
  console.log('   Base URL - Error:', parameters.DS_MERCHANT_MERCHANTURL?.split('/api/')[0]);
  console.log('   Base URL - Actual:', currentConfig.baseUrl);
  
  // Verificar si hay diferencias
  const merchantCodeMatches = parameters.DS_MERCHANT_MERCHANTCODE === currentConfig.merchantCode;
  const terminalMatches = parameters.DS_MERCHANT_TERMINAL === currentConfig.terminal.padStart(3, '0');
  const baseUrlMatches = parameters.DS_MERCHANT_MERCHANTURL?.includes(currentConfig.baseUrl);
  
  console.log('\n📊 RESULTADOS DE LA COMPARACIÓN:');
  console.log('=================================');
  console.log(`   Merchant Code coincide: ${merchantCodeMatches ? '✅' : '❌'}`);
  console.log(`   Terminal coincide: ${terminalMatches ? '✅' : '❌'}`);
  console.log(`   Base URL coincide: ${baseUrlMatches ? '✅' : '❌'}`);
  
  // Intentar generar la firma con los parámetros exactos del error
  console.log('\n🔐 INTENTANDO GENERAR FIRMA CON PARÁMETROS EXACTOS:');
  console.log('===================================================');
  
  if (currentConfig.secretKey) {
    try {
      const decodedKey = Buffer.from(currentConfig.secretKey, "hex");
      const hmac = crypto.createHmac("sha256", decodedKey);
      const dataToSign = errorData.orderNumber + errorData.merchantParametersBase64;
      hmac.update(dataToSign, 'utf8');
      const calculatedSignature = hmac.digest("base64");
      
      console.log('   Firma del error real:', errorData.signature);
      console.log('   Firma calculada:', calculatedSignature);
      console.log('   ¿Coinciden?:', calculatedSignature === errorData.signature ? '✅ SÍ' : '❌ NO');
      
      if (calculatedSignature !== errorData.signature) {
        console.log('\n🔍 ANÁLISIS DE LA DIFERENCIA:');
        console.log('==============================');
        console.log('   La firma no coincide, lo que indica que:');
        console.log('   1. La clave secreta usada en el error es diferente');
        console.log('   2. Los parámetros del comercio son ligeramente diferentes');
        console.log('   3. Hay diferencias en el formato de los datos');
        
        console.log('\n   Datos que se firmaron:');
        console.log(`   Order: ${errorData.orderNumber}`);
        console.log(`   Merchant Parameters: ${errorData.merchantParametersBase64.substring(0, 100)}...`);
        console.log(`   Data to sign length: ${dataToSign.length}`);
      } else {
        console.log('\n✅ ¡FIRMA CORRECTA!');
        console.log('===================');
        console.log('   El cálculo de la firma es correcto');
        console.log('   La configuración actual es válida');
      }
    } catch (error) {
      console.error('   ❌ Error generando firma:', error.message);
    }
  } else {
    console.log('   ❌ No hay clave secreta configurada para comparar');
  }
  
} catch (error) {
  console.error('❌ Error decodificando parámetros:', error.message);
}

console.log('\n✅ Decodificación completada'); 