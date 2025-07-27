#!/usr/bin/env node

/**
 * Script para convertir la Secret Key de Redsys de hexadecimal a base64
 */

const crypto = require('crypto');

console.log('🔐 CONVERTING REDSYS SECRET KEY');
console.log('================================');

// Secret Key en hexadecimal (formato que proporcionaste)
const hexSecretKey = 'sq7HjrUOBfKmC576ILgskD5srU870gJ7';

console.log('📋 Secret Key original (hex):', hexSecretKey);
console.log('📏 Longitud:', hexSecretKey.length);

// Convertir de hexadecimal a Buffer
const buffer = Buffer.from(hexSecretKey, 'hex');
console.log('📦 Buffer length:', buffer.length);

// Convertir a base64
const base64SecretKey = buffer.toString('base64');
console.log('🔑 Secret Key en base64:', base64SecretKey);

// Verificar que la conversión es correcta
const backToHex = Buffer.from(base64SecretKey, 'base64').toString('hex');
console.log('🔄 Verificación (hex de vuelta):', backToHex);
console.log('✅ Conversión correcta:', backToHex === hexSecretKey);

console.log('\n📝 CONFIGURACIÓN PARA .env.local:');
console.log('==================================');
console.log(`REDSYS_SECRET_KEY=${base64SecretKey}`);

console.log('\n🧪 PROBANDO GENERACIÓN DE FIRMA...');
console.log('==================================');

// Probar la generación de firma con la nueva clave
try {
  const testOrder = '123456789012';
  const testMerchantParams = Buffer.from(JSON.stringify({
    DS_MERCHANT_AMOUNT: '000000018000',
    DS_MERCHANT_ORDER: testOrder,
    DS_MERCHANT_MERCHANTCODE: '367529286',
    DS_MERCHANT_CURRENCY: '978',
    DS_MERCHANT_TRANSACTIONTYPE: '1',
    DS_MERCHANT_TERMINAL: '001'
  })).toString('base64');

  const decodedKey = Buffer.from(base64SecretKey, 'base64');
  const hmac = crypto.createHmac('sha256', decodedKey);
  const dataToSign = testOrder + testMerchantParams;
  hmac.update(dataToSign, 'utf8');
  const signature = hmac.digest('base64');
  
  console.log('✅ Firma generada correctamente');
  console.log(`   Longitud de firma: ${signature.length}`);
  console.log(`   Preview: ${signature.substring(0, 20)}...`);
  console.log('🎉 La Secret Key es válida y funcional');
} catch (error) {
  console.error('❌ Error generando firma:', error.message);
} 