#!/usr/bin/env node

/**
 * Script para diagnosticar y corregir el problema SIS0042 de Redsys
 * Error en el cálculo de la firma
 */

require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

console.log('🔍 DIAGNÓSTICO Y CORRECCIÓN REDSYS SIS0042');
console.log('==========================================');

// Configuración actual
const config = {
  merchantCode: process.env.REDSYS_MERCHANT_CODE || '367529286',
  terminal: process.env.REDSYS_TERMINAL || '1',
  secretKey: process.env.REDSYS_SECRET_KEY,
  environment: process.env.REDSYS_ENVIRONMENT || 'https://sis.redsys.es/realizarPago',
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
  console.log('\n📝 SOLUCIÓN:');
  console.log('1. Obtén tu Secret Key de Redsys (formato hexadecimal)');
  console.log('2. Añádela a tu archivo .env.local:');
  console.log('   REDSYS_SECRET_KEY=tu_clave_hexadecimal_aqui');
  process.exit(1);
}

// Función para probar diferentes formatos de clave
function testKeyFormats(secretKey) {
  console.log('\n🧪 PROBANDO FORMATOS DE CLAVE:');
  console.log('================================');
  
  const formats = [
    { name: 'Hexadecimal', encoding: 'hex' },
    { name: 'Base64', encoding: 'base64' },
    { name: 'UTF-8', encoding: 'utf8' }
  ];
  
  const results = [];
  
  formats.forEach(format => {
    try {
      const decodedKey = Buffer.from(secretKey, format.encoding);
      const isValid = decodedKey.length > 0;
      
      console.log(`   ${format.name}: ${isValid ? '✅ Válido' : '❌ Inválido'} (${decodedKey.length} bytes)`);
      
      results.push({
        format: format.name,
        encoding: format.encoding,
        isValid,
        length: decodedKey.length,
        preview: decodedKey.toString('hex').substring(0, 16) + '...'
      });
    } catch (error) {
      console.log(`   ${format.name}: ❌ Error - ${error.message}`);
      results.push({
        format: format.name,
        encoding: format.encoding,
        isValid: false,
        error: error.message
      });
    }
  });
  
  return results;
}

// Función para generar firma de prueba
function generateTestSignature(order, merchantParameters, secretKey, encoding = 'hex') {
  try {
    const decodedKey = Buffer.from(secretKey, encoding);
    const hmac = crypto.createHmac("sha256", decodedKey);
    const dataToSign = order + merchantParameters;
    hmac.update(dataToSign, 'utf8');
    const signature = hmac.digest("base64");
    
    return {
      success: true,
      signature,
      signatureLength: signature.length,
      dataToSignLength: dataToSign.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Probar formatos de clave
const keyResults = testKeyFormats(config.secretKey);

// Generar datos de prueba basados en el error real
console.log('\n🧪 GENERANDO DATOS DE PRUEBA:');
console.log('==============================');

const testData = {
  orderNumber: '175328862176',
  amount: 180,
  amountInCents: 18000,
  merchantParameters: {
    DS_MERCHANT_AMOUNT: '000000018000',
    DS_MERCHANT_ORDER: '175328862176',
    DS_MERCHANT_MERCHANTCODE: '367529286',
    DS_MERCHANT_CURRENCY: '978',
    DS_MERCHANT_TRANSACTIONTYPE: '1',
    DS_MERCHANT_TERMINAL: '001',
    DS_MERCHANT_MERCHANTURL: 'https://tenerifeparadisetoursexcursions.com/api/payment/webhook',
    DS_MERCHANT_URLOK: 'https://tenerifeparadisetoursexcursions.com/payment/success?reservationId=4d7a591b-d143-4677-9c02-b5d81a2c89c2',
    DS_MERCHANT_URLKO: 'https://tenerifeparadisetoursexcursions.com/payment/error?reservationId=4d7a591b-d143-4677-9c02-b5d81a2c89c2',
    DS_MERCHANT_PRODUCTDESCRIPTION: 'Reserva: Glamping',
    DS_MERCHANT_MERCHANTNAME: 'Tenerife Paradise Tours',
    DS_MERCHANT_CONSUMERLANGUAGE: '001',
    DS_MERCHANT_MERCHANTDATA: '************************************'
  }
};

const merchantParametersJson = JSON.stringify(testData.merchantParameters);
const merchantParametersBase64 = Buffer.from(merchantParametersJson).toString('base64');

console.log('   Order Number:', testData.orderNumber);
console.log('   Amount:', testData.amount, 'EUR');
console.log('   Amount in cents:', testData.amountInCents);
console.log('   Merchant Parameters JSON length:', merchantParametersJson.length);
console.log('   Merchant Parameters Base64 length:', merchantParametersBase64.length);

// Probar generación de firma con diferentes formatos
console.log('\n🔐 PROBANDO GENERACIÓN DE FIRMA:');
console.log('==================================');

const validFormats = keyResults.filter(r => r.isValid);

if (validFormats.length === 0) {
  console.error('❌ ERROR: No se encontró ningún formato válido para la clave secreta');
  console.log('\n📝 SOLUCIONES POSIBLES:');
  console.log('1. Verifica que la clave secreta esté en formato hexadecimal');
  console.log('2. Asegúrate de que no tenga espacios o caracteres extra');
  console.log('3. Contacta con Redsys para confirmar el formato de tu clave');
  process.exit(1);
}

validFormats.forEach(format => {
  console.log(`\n   Probando formato: ${format.name}`);
  const result = generateTestSignature(
    testData.orderNumber,
    merchantParametersBase64,
    config.secretKey,
    format.encoding
  );
  
  if (result.success) {
    console.log(`   ✅ Firma generada exitosamente`);
    console.log(`   📏 Longitud de firma: ${result.signatureLength}`);
    console.log(`   🔍 Preview: ${result.signature.substring(0, 20)}...`);
    console.log(`   📊 Datos firmados: ${result.dataToSignLength} caracteres`);
  } else {
    console.log(`   ❌ Error: ${result.error}`);
  }
});

// Recomendación final
console.log('\n📝 RECOMENDACIÓN FINAL:');
console.log('========================');

const hexFormat = keyResults.find(r => r.format === 'Hexadecimal' && r.isValid);
const base64Format = keyResults.find(r => r.format === 'Base64' && r.isValid);

if (hexFormat) {
  console.log('✅ Usa el formato Hexadecimal (recomendado para Redsys)');
  console.log('   La clave debe estar en formato hexadecimal sin espacios');
} else if (base64Format) {
  console.log('⚠️  Usa el formato Base64 (funciona pero no es el estándar de Redsys)');
} else {
  console.log('❌ Problema con el formato de la clave');
}

console.log('\n🔧 CONFIGURACIÓN RECOMENDADA PARA .env.local:');
console.log('=============================================');
console.log(`REDSYS_MERCHANT_CODE=${config.merchantCode}`);
console.log(`REDSYS_TERMINAL=${config.terminal}`);
console.log(`REDSYS_SECRET_KEY=${config.secretKey}`);
console.log(`REDSYS_ENVIRONMENT=${config.environment}`);
console.log(`NEXT_PUBLIC_SITE_URL=${config.baseUrl}`);

console.log('\n🎯 PRÓXIMOS PASOS:');
console.log('==================');
console.log('1. Verifica que la clave secreta esté en formato hexadecimal');
console.log('2. Reinicia el servidor de desarrollo');
console.log('3. Prueba una nueva reserva');
console.log('4. Si el problema persiste, contacta con Redsys');

console.log('\n✅ Diagnóstico completado'); 