#!/usr/bin/env node

/**
 * Script de diagnóstico para el error SIS0042 de Redsys
 * Identifica por qué se está enviando importe 0,00 y número de pedido vacío
 */

const crypto = require('crypto');

// Configuración de prueba
const config = {
  merchantCode: process.env.REDSYS_MERCHANT_CODE || '999008881',
  terminal: process.env.REDSYS_TERMINAL || '1',
  secretKey: process.env.REDSYS_SECRET_KEY || 'sq7HjrUOBfKmC576ILgskD5srU870gJ7',
  environment: process.env.REDSYS_ENVIRONMENT || 'https://sis-t.redsys.es:25443/sis/realizarPago',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
};

console.log('🔍 DIAGNÓSTICO DEL ERROR SIS0042 DE REDSYS');
console.log('==========================================\n');

// 1. Verificar variables de entorno
console.log('1️⃣ VERIFICANDO VARIABLES DE ENTORNO:');
console.log('   REDSYS_MERCHANT_CODE:', config.merchantCode);
console.log('   REDSYS_TERMINAL:', config.terminal);
console.log('   REDSYS_SECRET_KEY:', config.secretKey ? '✅ Configurada' : '❌ No configurada');
console.log('   REDSYS_ENVIRONMENT:', config.environment);
console.log('   NEXT_PUBLIC_SITE_URL:', config.baseUrl);
console.log('');

// 2. Simular datos de entrada problemáticos
console.log('2️⃣ SIMULANDO DATOS DE ENTRADA:');

// Caso 1: Datos válidos
const validData = {
  reservationId: 'test-reservation-123',
  amount: 125.50,
  description: 'Excursión a Teide'
};

// Caso 2: Datos problemáticos (como los que podrían estar llegando)
const problematicData = {
  reservationId: 'test-reservation-123',
  amount: 0, // ⚠️ Importe 0
  description: 'Excursión a Teide'
};

// Caso 3: Datos con amount como string
const stringAmountData = {
  reservationId: 'test-reservation-123',
  amount: '0', // ⚠️ Importe como string
  description: 'Excursión a Teide'
};

// Caso 4: Datos con amount undefined
const undefinedAmountData = {
  reservationId: 'test-reservation-123',
  amount: undefined, // ⚠️ Importe undefined
  description: 'Excursión a Teide'
};

function testDataProcessing(testData, testName) {
  console.log(`\n   📋 ${testName}:`);
  console.log(`      Datos de entrada:`, testData);
  
  // Simular el procesamiento de la API
  const amount = testData.amount;
  const amountInCents = Math.round(amount * 100);
  const orderNumber = `${Date.now()}${testData.reservationId.slice(-4)}`.slice(0, 12);
  
  console.log(`      amount (original): ${amount} (tipo: ${typeof amount})`);
  console.log(`      amountInCents: ${amountInCents}`);
  console.log(`      orderNumber: ${orderNumber}`);
  
  // Verificar si los datos son válidos para Redsys
  const isValid = amountInCents > 0 && orderNumber.length > 0;
  console.log(`      ✅ Válido para Redsys: ${isValid ? 'SÍ' : '❌ NO'}`);
  
  if (!isValid) {
    console.log(`      ⚠️  PROBLEMA: ${amountInCents === 0 ? 'Importe 0' : ''} ${orderNumber.length === 0 ? 'Número de pedido vacío' : ''}`);
  }
  
  return { isValid, amountInCents, orderNumber };
}

// Probar todos los casos
const results = {
  valid: testDataProcessing(validData, 'Datos válidos'),
  problematic: testDataProcessing(problematicData, 'Datos con amount = 0'),
  stringAmount: testDataProcessing(stringAmountData, 'Datos con amount como string "0"'),
  undefinedAmount: testDataProcessing(undefinedAmountData, 'Datos con amount undefined')
};

console.log('\n3️⃣ ANÁLISIS DE RESULTADOS:');
console.log('   ✅ Casos válidos:', Object.values(results).filter(r => r.isValid).length);
console.log('   ❌ Casos problemáticos:', Object.values(results).filter(r => !r.isValid).length);

// 4. Verificar el esquema de validación
console.log('\n4️⃣ VERIFICANDO ESQUEMA DE VALIDACIÓN:');
console.log('   El esquema debería validar que:');
console.log('   - amount es un número mayor que 0');
console.log('   - reservationId es una cadena no vacía');
console.log('   - description es una cadena no vacía');

// 5. Generar ejemplo de datos correctos para Redsys
console.log('\n5️⃣ EJEMPLO DE DATOS CORRECTOS PARA REDSYS:');
const correctExample = {
  DS_MERCHANT_AMOUNT: '000000012550', // 125.50 EUR en céntimos
  DS_MERCHANT_ORDER: '175268908804', // Número de pedido
  DS_MERCHANT_MERCHANTCODE: config.merchantCode,
  DS_MERCHANT_CURRENCY: '978',
  DS_MERCHANT_TRANSACTIONTYPE: '1',
  DS_MERCHANT_TERMINAL: config.terminal,
  DS_MERCHANT_MERCHANTURL: `${config.baseUrl}/api/payment/webhook`,
  DS_MERCHANT_URLOK: `${config.baseUrl}/payment/success?reservationId=test-reservation-123`,
  DS_MERCHANT_URLKO: `${config.baseUrl}/payment/error?reservationId=test-reservation-123`,
  DS_MERCHANT_PRODUCTDESCRIPTION: 'Excursión a Teide',
  DS_MERCHANT_MERCHANTNAME: 'Tenerife Paradise Tours',
  DS_MERCHANT_CONSUMERLANGUAGE: '001',
  DS_MERCHANT_MERCHANTDATA: 'test-reservation-123'
};

console.log('   Parámetros correctos:');
Object.entries(correctExample).forEach(([key, value]) => {
  console.log(`      ${key}: ${value}`);
});

// 6. Recomendaciones
console.log('\n6️⃣ RECOMENDACIONES PARA SOLUCIONAR EL ERROR:');
console.log('   1. Verificar que el frontend envía amount como número > 0');
console.log('   2. Verificar que reservationId no esté vacío');
console.log('   3. Revisar logs del servidor para ver qué datos llegan');
console.log('   4. Verificar que las variables de entorno estén configuradas');
console.log('   5. Probar con datos hardcodeados para aislar el problema');

// 7. Script de prueba con datos hardcodeados
console.log('\n7️⃣ SCRIPT DE PRUEBA CON DATOS HARCODEADOS:');
console.log('   Ejecuta este comando para probar con datos conocidos:');
console.log('   node scripts/test-preauthorization-flow.js');

console.log('\n🔍 DIAGNÓSTICO COMPLETADO');
console.log('==========================');

// Exportar para uso en otros scripts
module.exports = {
  config,
  testDataProcessing,
  correctExample
}; 