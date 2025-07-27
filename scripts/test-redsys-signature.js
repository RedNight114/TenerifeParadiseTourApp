// Script para probar la generación de firma de Redsys
const crypto = require('crypto');

console.log('🔐 PRUEBA DE FIRMA REDSYS');
console.log('==========================');

// Datos de prueba oficiales de Redsys
const testData = {
  order: '123456789',
  merchantParameters: {
    DS_MERCHANT_AMOUNT: '000000012500',
    DS_MERCHANT_ORDER: '123456789',
    DS_MERCHANT_MERCHANTCODE: '999008881',
    DS_MERCHANT_CURRENCY: '978',
    DS_MERCHANT_TRANSACTIONTYPE: '0',
    DS_MERCHANT_TERMINAL: '001',
    DS_MERCHANT_MERCHANTURL: 'https://www.miempresa.com/notificacion',
    DS_MERCHANT_URLOK: 'https://www.miempresa.com/ok',
    DS_MERCHANT_URLKO: 'https://www.miempresa.com/ko',
    DS_MERCHANT_PRODUCTDESCRIPTION: 'Compra de producto',
    DS_MERCHANT_MERCHANTNAME: 'Mi Empresa',
    DS_MERCHANT_CONSUMERLANGUAGE: '001',
    DS_MERCHANT_MERCHANTDATA: 'datos adicionales'
  },
  secretKey: 'sq7HjrUOBfKmC576ILgskD5srU870gJ7' // Clave de prueba de Redsys
};

// Función para generar firma
function generateSignature(order, merchantParameters, secretKey) {
  try {
    // Limpiar parámetros
    const cleanOrder = order.toString().trim();
    const cleanMerchantParameters = merchantParameters.toString().trim();
    const cleanSecretKey = secretKey.toString().trim();
    
    console.log('📝 Datos a firmar:', {
      order: cleanOrder,
      orderLength: cleanOrder.length,
      merchantParameters: cleanMerchantParameters,
      merchantParametersLength: cleanMerchantParameters.length
    });
    
    // Decodificar clave de base64
    const decodedKey = Buffer.from(cleanSecretKey, "base64");
    console.log('🔑 Clave decodificada:', {
      originalKey: cleanSecretKey,
      decodedKeyLength: decodedKey.length,
      decodedKeyHex: decodedKey.toString('hex')
    });
    
    // Crear HMAC
    const hmac = crypto.createHmac("sha256", decodedKey);
    
    // Concatenar order + merchantParameters
    const dataToSign = cleanOrder + cleanMerchantParameters;
    console.log('🔗 Datos concatenados:', {
      dataToSign: dataToSign,
      dataToSignLength: dataToSign.length
    });
    
    // Actualizar HMAC
    hmac.update(dataToSign, 'utf8');
    
    // Obtener firma
    const signature = hmac.digest("base64");
    
    console.log('✅ Firma generada:', {
      signature: signature,
      signatureLength: signature.length
    });
    
    return signature;
  } catch (error) {
    console.error('❌ Error generando firma:', error);
    throw error;
  }
}

// Función para probar con datos oficiales de Redsys
function testOfficialRedsysData() {
  console.log('\n🎯 PRUEBA CON DATOS OFICIALES DE REDSYS');
  console.log('========================================');
  
  // Convertir parámetros a JSON
  const merchantParametersJson = JSON.stringify(testData.merchantParameters);
  const merchantParametersBase64 = Buffer.from(merchantParametersJson, 'utf8').toString('base64');
  
  console.log('📊 Parámetros originales:', testData.merchantParameters);
  console.log('📄 JSON generado:', merchantParametersJson);
  console.log('🔢 Base64 generado:', merchantParametersBase64);
  
  // Generar firma
  const signature = generateSignature(testData.order, merchantParametersBase64, testData.secretKey);
  
  console.log('\n📋 RESULTADO FINAL:');
  console.log('===================');
  console.log('Order:', testData.order);
  console.log('MerchantParameters (Base64):', merchantParametersBase64);
  console.log('Signature:', signature);
  
  return { signature, merchantParametersBase64 };
}

// Función para probar con nuestros datos
function testOurData() {
  console.log('\n🔧 PRUEBA CON NUESTROS DATOS');
  console.log('============================');
  
  const ourData = {
    order: '175328124305',
    merchantParameters: {
      DS_MERCHANT_AMOUNT: '000000009000',
      DS_MERCHANT_ORDER: '175328124305',
      DS_MERCHANT_MERCHANTCODE: '367529286',
      DS_MERCHANT_CURRENCY: '978',
      DS_MERCHANT_TRANSACTIONTYPE: '1',
      DS_MERCHANT_TERMINAL: '001',
      DS_MERCHANT_MERCHANTURL: 'https://tenerifeparadisetoursexcursions.com/api/payment/webhook',
      DS_MERCHANT_URLOK: 'https://tenerifeparadisetoursexcursions.com/payment/success?reservationId=3563e348-7f8e-426e-bb54-6f3151b03ad0',
      DS_MERCHANT_URLKO: 'https://tenerifeparadisetoursexcursions.com/payment/error?reservationId=3563e348-7f8e-426e-bb54-6f3151b03ad0',
      DS_MERCHANT_PRODUCTDESCRIPTION: 'Reserva: Glamping',
      DS_MERCHANT_MERCHANTNAME: 'Tenerife Paradise Tours',
      DS_MERCHANT_CONSUMERLANGUAGE: '001',
      DS_MERCHANT_MERCHANTDATA: '3563e348-7f8e-426e-bb54-6f3151b03ad0'
    },
    secretKey: 'sq7HjrUOBfKmC576ILgskD5srU870gJ7'
  };
  
  // Convertir parámetros a JSON
  const merchantParametersJson = JSON.stringify(ourData.merchantParameters);
  const merchantParametersBase64 = Buffer.from(merchantParametersJson, 'utf8').toString('base64');
  
  console.log('📊 Nuestros parámetros:', ourData.merchantParameters);
  console.log('📄 Nuestro JSON:', merchantParametersJson);
  console.log('🔢 Nuestro Base64:', merchantParametersBase64);
  
  // Generar firma
  const signature = generateSignature(ourData.order, merchantParametersBase64, ourData.secretKey);
  
  console.log('\n📋 NUESTRO RESULTADO:');
  console.log('=====================');
  console.log('Order:', ourData.order);
  console.log('MerchantParameters (Base64):', merchantParametersBase64);
  console.log('Signature:', signature);
  
  return { signature, merchantParametersBase64 };
}

// Función para verificar la firma que Redsys está recibiendo
function verifyReceivedSignature() {
  console.log('\n🔍 VERIFICACIÓN DE FIRMA RECIBIDA');
  console.log('==================================');
  
  // Datos que Redsys está recibiendo según el log
  const receivedData = {
    order: '175328124305',
    merchantParametersBase64: 'eyJEU19NRVJDSEFOVF9BTU9VTlQiOiIwMDAwMDAwMDkwMDAiLCJEU19NRVJDSEFOVF9PUkRFUiI6IjE3NTMyODEyNDMwNSIsIkRTX01FUkNIQU5UX01FUkNIQU5UQ09ERSI6IjM2NzUyOTI4NiIsIkRTX01FUkNIQU5UX0NVUlJFTkNZIjoiOTc4IiwiRFNfTUVSQ0hBTlRfVFJBTlNBQ1RJT05UWVBFIjoiMSIsIkRTX01FUkNIQU5UX1RFUk1JTkFMIjoiMDAxIiwiRFNfTUVSQ0hBTlRfTUVSQ0hBTlRVUkwiOiJodHRwczpcL1wvdGVuZXJpZmVwYXJhZGlzZXRvdXJzZXhjdXJzaW9ucy5jb21cL2FwaVwvcGF5bWVudFwvd2ViaG9vayIsIkRTX01FUkNIQU5UX1VSTE9LIjoiaHR0cHM6XC9cL3RlbmVyaWZlcGFyYWRpc2V0b3Vyc2V4Y3Vyc2lvbnMuY29tXC9wYXltZW50XC9zdWNjZXNzP3Jlc2VydmF0aW9uSWQ9MzU2M2UzNDgtN2Y4ZS00MjZlLWJiNTQtNmYzMTUxYjAzYWQwIiwiRFNfTUVSQ0hBTlRfVVJMS08iOiJodHRwczpcL1wvdGVuZXJpZmVwYXJhZGlzZXRvdXJzZXhjdXJzaW9ucy5jb21cL3BheW1lbnRcL2Vycm9yP3Jlc2VydmF0aW9uSWQ9MzU2M2UzNDgtN2Y4ZS00MjZlLWJiNTQtNmYzMTUxYjAzYWQwIiwiRFNfTUVSQ0hBTlRfUFJPRFVDVERFU0NSSVBUSU9OIjoiUmVzZXJ2YTogR2xhbXBpbmciLCJEU19NRVJDSEFOVF9NRVJDSEFOVE5BTUUiOiJUZW5lcmlmZSBQYXJhZGlzZSBUb3VycyIsIkRTX01FUkNIQU5UX0NPTlNVTUVSTEFOR1VBR0UiOiIwMDEiLCJEU19NRVJDSEFOVF9NRVJDSEFOVERBVEEiOiIqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioifQ==',
    receivedSignature: '7wg/usce1TnAWFnkxFD0cdBMcnd0gUM1Rl92D1H0bdg=',
    secretKey: 'sq7HjrUOBfKmC576ILgskD5srU870gJ7'
  };
  
  console.log('📥 Datos recibidos por Redsys:');
  console.log('Order:', receivedData.order);
  console.log('MerchantParameters (Base64):', receivedData.merchantParametersBase64);
  console.log('Signature recibida:', receivedData.receivedSignature);
  
  // Decodificar los parámetros para ver el contenido
  try {
    const decodedParams = Buffer.from(receivedData.merchantParametersBase64, 'base64').toString('utf8');
    console.log('📄 Parámetros decodificados:', decodedParams);
    
    // Verificar si las URLs tienen caracteres escapados
    if (decodedParams.includes('\\/')) {
      console.log('⚠️  PROBLEMA DETECTADO: Las URLs tienen caracteres escapados (\\/)');
      console.log('🔧 Esto puede causar problemas en la validación de Redsys');
    }
    
  } catch (error) {
    console.error('❌ Error decodificando parámetros:', error);
  }
  
  // Generar firma con los mismos datos
  const calculatedSignature = generateSignature(
    receivedData.order, 
    receivedData.merchantParametersBase64, 
    receivedData.secretKey
  );
  
  console.log('\n🔍 COMPARACIÓN DE FIRMAS:');
  console.log('==========================');
  console.log('Firma recibida por Redsys:', receivedData.receivedSignature);
  console.log('Firma calculada por nosotros:', calculatedSignature);
  console.log('¿Coinciden?', receivedData.receivedSignature === calculatedSignature ? '✅ SÍ' : '❌ NO');
  
  if (receivedData.receivedSignature !== calculatedSignature) {
    console.log('\n🔍 ANÁLISIS DE DIFERENCIAS:');
    console.log('============================');
    console.log('Longitud firma recibida:', receivedData.receivedSignature.length);
    console.log('Longitud firma calculada:', calculatedSignature.length);
    
    // Verificar si hay diferencias en los caracteres
    for (let i = 0; i < Math.min(receivedData.receivedSignature.length, calculatedSignature.length); i++) {
      if (receivedData.receivedSignature[i] !== calculatedSignature[i]) {
        console.log(`Diferencia en posición ${i}: '${receivedData.receivedSignature[i]}' vs '${calculatedSignature[i]}'`);
      }
    }
  }
}

// Ejecutar pruebas
try {
  testOfficialRedsysData();
  testOurData();
  verifyReceivedSignature();
  
  console.log('\n🎉 PRUEBAS COMPLETADAS');
  console.log('======================');
  
} catch (error) {
  console.error('💥 Error en las pruebas:', error);
} 