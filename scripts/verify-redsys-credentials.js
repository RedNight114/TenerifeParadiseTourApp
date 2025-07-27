#!/usr/bin/env node

/**
 * Script para verificar las credenciales de Redsys
 * Verifica que la clave SHA256 sea la correcta para el entorno y terminal específicos
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 VERIFICACIÓN DE CREDENCIALES REDSYS');
console.log('======================================');

// Configuración actual
const config = {
  merchantCode: process.env.REDSYS_MERCHANT_CODE,
  terminal: process.env.REDSYS_TERMINAL,
  secretKey: process.env.REDSYS_SECRET_KEY,
  environment: process.env.REDSYS_ENVIRONMENT,
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL
};

console.log('📋 CONFIGURACIÓN ACTUAL:');
console.log('=========================');
console.log(`   Merchant Code: ${config.merchantCode || '❌ No configurado'}`);
console.log(`   Terminal: ${config.terminal || '❌ No configurado'}`);
console.log(`   Secret Key: ${config.secretKey ? '✅ Configurada' : '❌ No configurada'}`);
console.log(`   Environment: ${config.environment || '❌ No configurado'}`);
console.log(`   Base URL: ${config.baseUrl || '❌ No configurado'}`);

// Verificar que todos los campos estén configurados
const missingFields = [];
if (!config.merchantCode) missingFields.push('REDSYS_MERCHANT_CODE');
if (!config.terminal) missingFields.push('REDSYS_TERMINAL');
if (!config.secretKey) missingFields.push('REDSYS_SECRET_KEY');
if (!config.environment) missingFields.push('REDSYS_ENVIRONMENT');
if (!config.baseUrl) missingFields.push('NEXT_PUBLIC_SITE_URL');

if (missingFields.length > 0) {
  console.log('\n❌ CAMPOS FALTANTES:');
  console.log('=====================');
  missingFields.forEach(field => {
    console.log(`   ❌ ${field}`);
  });
  console.log('\n📝 SOLUCIÓN:');
  console.log('=============');
  console.log('1. Accede a la web de Canales de Redsys');
  console.log('2. Obtén las credenciales para tu entorno específico');
  console.log('3. Actualiza tu archivo .env.local con los valores correctos');
  process.exit(1);
}

// Verificar el entorno
console.log('\n🌐 VERIFICACIÓN DEL ENTORNO:');
console.log('=============================');

const isTestEnvironment = config.environment.includes('sis-t.redsys.es');
const isProductionEnvironment = config.environment.includes('sis.redsys.es');

console.log(`   Environment URL: ${config.environment}`);
console.log(`   Es entorno de pruebas: ${isTestEnvironment ? '✅ SÍ' : '❌ NO'}`);
console.log(`   Es entorno de producción: ${isProductionEnvironment ? '✅ SÍ' : '❌ NO'}`);

if (!isTestEnvironment && !isProductionEnvironment) {
  console.log('   ⚠️  ADVERTENCIA: URL de entorno no reconocida');
}

// Verificar el formato de la clave
console.log('\n🔑 VERIFICACIÓN DE LA CLAVE:');
console.log('=============================');

if (config.secretKey) {
  const keyLength = config.secretKey.length;
  const isHex = /^[0-9a-fA-F]+$/.test(config.secretKey);
  const isBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(config.secretKey);
  
  console.log(`   Longitud de la clave: ${keyLength} caracteres`);
  console.log(`   Formato hexadecimal: ${isHex ? '✅ SÍ' : '❌ NO'}`);
  console.log(`   Formato Base64: ${isBase64 ? '✅ SÍ' : '❌ NO'}`);
  
  if (isHex) {
    console.log('   ✅ La clave está en formato hexadecimal (correcto para Redsys)');
  } else if (isBase64) {
    console.log('   ⚠️  La clave está en formato Base64 (debe convertirse a hexadecimal)');
  } else {
    console.log('   ❌ La clave no está en un formato reconocido');
  }
  
  // Mostrar preview de la clave
  console.log(`   Preview de la clave: ${config.secretKey.substring(0, 10)}...`);
}

// Verificar el terminal
console.log('\n🏪 VERIFICACIÓN DEL TERMINAL:');
console.log('=============================');

const terminalNumber = parseInt(config.terminal);
console.log(`   Terminal configurado: ${config.terminal}`);
console.log(`   Terminal como número: ${terminalNumber}`);

if (terminalNumber === 1) {
  console.log('   ✅ Terminal 1 (configuración estándar)');
} else if (terminalNumber > 1) {
  console.log('   ⚠️  Terminal múltiple - verificar que la clave sea para este terminal específico');
} else {
  console.log('   ❌ Terminal inválido');
}

// Verificar el merchant code
console.log('\n🏢 VERIFICACIÓN DEL MERCHANT CODE:');
console.log('===================================');

const merchantCodeLength = config.merchantCode.length;
console.log(`   Merchant Code: ${config.merchantCode}`);
console.log(`   Longitud: ${merchantCodeLength} caracteres`);

if (merchantCodeLength === 9) {
  console.log('   ✅ Longitud correcta para merchant code de Redsys');
} else {
  console.log('   ⚠️  Longitud inusual para merchant code de Redsys');
}

// Instrucciones para obtener la clave correcta
console.log('\n📋 INSTRUCCIONES PARA OBTENER LA CLAVE CORRECTA:');
console.log('==================================================');

console.log('1. 🖥️  Accede a la web de Canales de Redsys:');
console.log('   - Entorno de pruebas: https://canalespago.redsys.es/');
console.log('   - Entorno de producción: https://canales.redsys.es/');

console.log('\n2. 🔐 Inicia sesión con tus credenciales de comercio');

console.log('\n3. 📍 Navega a la sección de configuración:');
console.log('   - Busca "Configuración" o "Parámetros"');
console.log('   - Selecciona tu terminal específico');

console.log('\n4. 🔑 Obtén la clave SHA256:');
console.log('   - Busca "Clave SHA256" o "Clave de firma"');
console.log('   - Asegúrate de que sea para el terminal correcto');
console.log('   - Asegúrate de que sea para el entorno correcto (pruebas/producción)');

console.log('\n5. 📝 Verifica que la clave sea para:');
console.log(`   - Merchant Code: ${config.merchantCode}`);
console.log(`   - Terminal: ${config.terminal}`);
console.log(`   - Entorno: ${isTestEnvironment ? 'PRUEBAS' : isProductionEnvironment ? 'PRODUCCIÓN' : 'DESCONOCIDO'}`);

console.log('\n6. 🔄 Actualiza tu archivo .env.local:');
console.log('   REDSYS_SECRET_KEY=tu_clave_hexadecimal_aqui');

// Verificar si hay archivos de ejemplo
console.log('\n📁 ARCHIVOS DE CONFIGURACIÓN:');
console.log('==============================');

const fs = require('fs');
const path = require('path');

const envFiles = [
  '.env.local',
  '.env.example',
  '.env.production.example'
];

envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file} existe`);
  } else {
    console.log(`   ❌ ${file} no existe`);
  }
});

// Mostrar configuración actual del .env.local
console.log('\n📄 CONFIGURACIÓN ACTUAL EN .env.local:');
console.log('=======================================');

if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const redsysLines = envContent.split('\n').filter(line => 
    line.includes('REDSYS_') || line.includes('NEXT_PUBLIC_SITE_URL')
  );
  
  redsysLines.forEach(line => {
    if (line.trim()) {
      const [key, value] = line.split('=');
      if (key && value) {
        const displayValue = key.includes('SECRET_KEY') 
          ? value.substring(0, 10) + '...' 
          : value;
        console.log(`   ${key}=${displayValue}`);
      }
    }
  });
} else {
  console.log('   ❌ Archivo .env.local no encontrado');
}

console.log('\n✅ Verificación de credenciales completada');
console.log('\n🎯 PRÓXIMOS PASOS:');
console.log('===================');
console.log('1. Verifica las credenciales en la web de Canales de Redsys');
console.log('2. Asegúrate de que la clave sea para el terminal y entorno correctos');
console.log('3. Actualiza tu archivo .env.local si es necesario');
console.log('4. Reinicia el servidor de desarrollo');
console.log('5. Prueba una nueva reserva'); 