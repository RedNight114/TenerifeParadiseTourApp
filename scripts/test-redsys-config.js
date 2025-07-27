#!/usr/bin/env node

/**
 * Script para probar la configuración de Redsys
 * Detecta problemas comunes que causan el error SIS0042
 */

const crypto = require('crypto');

console.log('🔍 TESTING REDSYS CONFIGURATION');
console.log('================================');

// Cargar variables de entorno desde .env.local
require('dotenv').config({ path: '.env.local' });

// Simular variables de entorno
const testConfig = {
  REDSYS_MERCHANT_CODE: process.env.REDSYS_MERCHANT_CODE || '367529286',
  REDSYS_TERMINAL: process.env.REDSYS_TERMINAL || '1',
  REDSYS_SECRET_KEY: process.env.REDSYS_SECRET_KEY || 'test_key',
  REDSYS_ENVIRONMENT: process.env.REDSYS_ENVIRONMENT || 'https://sis-t.redsys.es:25443/sis/realizarPago',
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://tenerifeparadisetoursexcursions.com'
};

console.log('📋 Configuración actual:');
console.log(`   Merchant Code: ${testConfig.REDSYS_MERCHANT_CODE}`);
console.log(`   Terminal: ${testConfig.REDSYS_TERMINAL}`);
console.log(`   Environment: ${testConfig.REDSYS_ENVIRONMENT}`);
console.log(`   Site URL: ${testConfig.NEXT_PUBLIC_SITE_URL}`);
console.log(`   Secret Key: ${testConfig.REDSYS_SECRET_KEY ? '✅ Configurada' : '❌ No configurada'}`);

// Validaciones
let errors = [];

// 1. Validar Merchant Code
if (!testConfig.REDSYS_MERCHANT_CODE || testConfig.REDSYS_MERCHANT_CODE.length === 0) {
  errors.push('❌ Merchant Code está vacío');
} else if (!/^\d+$/.test(testConfig.REDSYS_MERCHANT_CODE)) {
  errors.push('❌ Merchant Code debe ser numérico');
} else if (testConfig.REDSYS_MERCHANT_CODE.length > 9) {
  errors.push('❌ Merchant Code no puede exceder 9 dígitos');
} else {
  console.log('✅ Merchant Code válido');
}

// 2. Validar Terminal
if (!testConfig.REDSYS_TERMINAL || testConfig.REDSYS_TERMINAL.length === 0) {
  errors.push('❌ Terminal está vacío');
} else if (!/^\d+$/.test(testConfig.REDSYS_TERMINAL)) {
  errors.push('❌ Terminal debe ser numérico');
} else if (testConfig.REDSYS_TERMINAL.length > 3) {
  errors.push('❌ Terminal no puede exceder 3 dígitos');
} else {
  console.log('✅ Terminal válido');
}

// 3. Validar Secret Key
if (!testConfig.REDSYS_SECRET_KEY || testConfig.REDSYS_SECRET_KEY === 'test_key') {
  errors.push('❌ Secret Key no está configurada correctamente');
} else {
  try {
    const decodedKey = Buffer.from(testConfig.REDSYS_SECRET_KEY, 'base64');
    if (decodedKey.length === 0) {
      errors.push('❌ Secret Key no es un base64 válido');
    } else {
      console.log('✅ Secret Key válida (base64)');
    }
  } catch (error) {
    errors.push('❌ Secret Key no es un base64 válido');
  }
}

// 4. Validar Environment URL
if (!testConfig.REDSYS_ENVIRONMENT || !testConfig.REDSYS_ENVIRONMENT.startsWith('https://')) {
  errors.push('❌ Environment URL inválida');
} else {
  console.log('✅ Environment URL válida');
}

// 5. Probar generación de firma
console.log('\n🔐 Probando generación de firma...');

try {
  const testOrder = '123456789012';
  const testMerchantParams = Buffer.from(JSON.stringify({
    DS_MERCHANT_AMOUNT: '000000018000',
    DS_MERCHANT_ORDER: testOrder,
    DS_MERCHANT_MERCHANTCODE: testConfig.REDSYS_MERCHANT_CODE,
    DS_MERCHANT_CURRENCY: '978',
    DS_MERCHANT_TRANSACTIONTYPE: '1',
    DS_MERCHANT_TERMINAL: testConfig.REDSYS_TERMINAL.padStart(3, '0')
  })).toString('base64');

  const testSecretKey = testConfig.REDSYS_SECRET_KEY;
  
  if (testSecretKey && testSecretKey !== 'test_key') {
    const decodedKey = Buffer.from(testSecretKey, 'base64');
    const hmac = crypto.createHmac('sha256', decodedKey);
    const dataToSign = testOrder + testMerchantParams;
    hmac.update(dataToSign, 'utf8');
    const signature = hmac.digest('base64');
    
    console.log('✅ Firma generada correctamente');
    console.log(`   Longitud de firma: ${signature.length}`);
    console.log(`   Preview: ${signature.substring(0, 20)}...`);
  } else {
    console.log('⚠️  No se puede probar la firma sin Secret Key válida');
  }
} catch (error) {
  errors.push(`❌ Error generando firma: ${error.message}`);
}

// 6. Validar formato de parámetros
console.log('\n📊 Probando formato de parámetros...');

const testAmount = 180;
const amountInCents = Math.round(testAmount * 100);
const formattedAmount = amountInCents.toString().padStart(12, '0');

console.log(`   Importe original: ${testAmount}€`);
console.log(`   Importe en céntimos: ${amountInCents}`);
console.log(`   Formato Redsys: ${formattedAmount}`);

if (formattedAmount.length !== 12) {
  errors.push('❌ Formato de importe incorrecto');
} else {
  console.log('✅ Formato de importe correcto');
}

// Resultado final
console.log('\n📋 RESULTADO DEL TEST');
console.log('=====================');

if (errors.length === 0) {
  console.log('✅ Configuración válida - No se detectaron errores');
  console.log('💡 Si sigues teniendo problemas, verifica:');
  console.log('   1. Que la Secret Key sea la correcta para tu entorno');
  console.log('   2. Que el Merchant Code y Terminal coincidan con tu cuenta');
  console.log('   3. Que estés usando el entorno correcto (test/producción)');
} else {
  console.log('❌ Se detectaron errores:');
  errors.forEach(error => console.log(`   ${error}`));
  console.log('\n🔧 CORRECCIONES NECESARIAS:');
  console.log('   1. Verifica las variables de entorno en .env.local');
  console.log('   2. Asegúrate de que REDSYS_SECRET_KEY esté en base64');
  console.log('   3. Confirma que REDSYS_MERCHANT_CODE y REDSYS_TERMINAL sean correctos');
}

console.log('\n📞 Si necesitas ayuda, contacta con Redsys con los siguientes datos:');
console.log(`   Merchant Code: ${testConfig.REDSYS_MERCHANT_CODE}`);
console.log(`   Terminal: ${testConfig.REDSYS_TERMINAL}`);
console.log(`   Environment: ${testConfig.REDSYS_ENVIRONMENT}`); 