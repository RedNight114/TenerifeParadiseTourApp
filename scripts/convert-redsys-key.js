#!/usr/bin/env node

/**
 * Script para convertir la Secret Key de Redsys de Base64 a Hexadecimal
 * Soluciona el error SIS0042 "Error en el cálculo de la firma"
 */

require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

console.log('🔐 CONVERSIÓN DE CLAVE SECRETA REDSYS');
console.log('=====================================');

// Obtener la clave actual
const currentSecretKey = process.env.REDSYS_SECRET_KEY;

if (!currentSecretKey) {
  console.error('❌ ERROR: REDSYS_SECRET_KEY no está configurada');
  console.log('\n📝 SOLUCIÓN:');
  console.log('1. Añade tu clave secreta al archivo .env.local');
  console.log('2. Ejecuta este script nuevamente');
  process.exit(1);
}

console.log('📋 CLAVE ACTUAL:');
console.log(`   Valor: ${currentSecretKey}`);
console.log(`   Longitud: ${currentSecretKey.length} caracteres`);

// Probar diferentes formatos
console.log('\n🧪 ANALIZANDO FORMATO ACTUAL:');
console.log('==============================');

try {
  // Intentar decodificar como Base64
  const base64Buffer = Buffer.from(currentSecretKey, 'base64');
  console.log(`   Base64: ✅ Válido (${base64Buffer.length} bytes)`);
  console.log(`   Hex: ${base64Buffer.toString('hex')}`);
  
  // Convertir a hexadecimal
  const hexKey = base64Buffer.toString('hex');
  console.log(`\n🔑 CLAVE EN FORMATO HEXADECIMAL:`);
  console.log(`   ${hexKey}`);
  console.log(`   Longitud: ${hexKey.length} caracteres`);
  
  // Verificar que la conversión es correcta
  const backToBase64 = Buffer.from(hexKey, 'hex').toString('base64');
  console.log(`\n🔄 VERIFICACIÓN:`);
  console.log(`   Conversión correcta: ${backToBase64 === currentSecretKey ? '✅ Sí' : '❌ No'}`);
  
  if (backToBase64 === currentSecretKey) {
    console.log('\n✅ CONVERSIÓN EXITOSA');
    console.log('=====================');
    
    console.log('\n📝 CONFIGURACIÓN ACTUALIZADA PARA .env.local:');
    console.log('==============================================');
    console.log(`REDSYS_SECRET_KEY=${hexKey}`);
    
    console.log('\n🧪 PROBANDO GENERACIÓN DE FIRMA CON NUEVA CLAVE:');
    console.log('=================================================');
    
    // Probar la nueva clave con datos reales
    const testData = {
      orderNumber: '175328862176',
      merchantParameters: {
        DS_MERCHANT_AMOUNT: '000000018000',
        DS_MERCHANT_ORDER: '175328862176',
        DS_MERCHANT_MERCHANTCODE: '367529286',
        DS_MERCHANT_CURRENCY: '978',
        DS_MERCHANT_TRANSACTIONTYPE: '1',
        DS_MERCHANT_TERMINAL: '001'
      }
    };
    
    const merchantParametersJson = JSON.stringify(testData.merchantParameters);
    const merchantParametersBase64 = Buffer.from(merchantParametersJson).toString('base64');
    
    // Generar firma con la nueva clave hexadecimal
    const decodedKey = Buffer.from(hexKey, 'hex');
    const hmac = crypto.createHmac("sha256", decodedKey);
    const dataToSign = testData.orderNumber + merchantParametersBase64;
    hmac.update(dataToSign, 'utf8');
    const signature = hmac.digest("base64");
    
    console.log('   ✅ Firma generada exitosamente');
    console.log(`   📏 Longitud de firma: ${signature.length}`);
    console.log(`   🔍 Preview: ${signature.substring(0, 20)}...`);
    console.log(`   📊 Datos firmados: ${dataToSign.length} caracteres`);
    
    console.log('\n🎯 PRÓXIMOS PASOS:');
    console.log('==================');
    console.log('1. Actualiza tu archivo .env.local con la nueva clave hexadecimal');
    console.log('2. Reinicia el servidor de desarrollo');
    console.log('3. Prueba una nueva reserva');
    console.log('4. El error SIS0042 debería estar resuelto');
    
  } else {
    console.error('❌ ERROR: La conversión no es correcta');
    console.log('   Esto indica que la clave original no está en formato Base64 válido');
  }
  
} catch (error) {
  console.error('❌ ERROR: No se pudo procesar la clave actual');
  console.log(`   Error: ${error.message}`);
  console.log('\n📝 POSIBLES SOLUCIONES:');
  console.log('1. Verifica que la clave esté en formato Base64 válido');
  console.log('2. Contacta con Redsys para obtener la clave en formato hexadecimal');
  console.log('3. Asegúrate de que no haya espacios o caracteres extra');
}

console.log('\n✅ Proceso completado'); 