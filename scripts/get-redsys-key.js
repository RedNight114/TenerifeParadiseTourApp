#!/usr/bin/env node

/**
 * Script para obtener la clave correcta de Redsys
 * Te guía paso a paso para obtener la clave SHA256 correcta
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔑 OBTENER CLAVE CORRECTA DE REDSYS');
console.log('====================================');

// Configuración actual
const config = {
  merchantCode: process.env.REDSYS_MERCHANT_CODE || '367529286',
  terminal: process.env.REDSYS_TERMINAL || '1',
  environment: process.env.REDSYS_ENVIRONMENT || 'https://sis-t.redsys.es:25443/sis/realizarPago'
};

const isTestEnvironment = config.environment.includes('sis-t.redsys.es');

console.log('📋 CONFIGURACIÓN ACTUAL:');
console.log('=========================');
console.log(`   Merchant Code: ${config.merchantCode}`);
console.log(`   Terminal: ${config.terminal}`);
console.log(`   Entorno: ${isTestEnvironment ? 'PRUEBAS' : 'PRODUCCIÓN'}`);
console.log(`   URL: ${config.environment}`);

console.log('\n🎯 PASOS PARA OBTENER LA CLAVE CORRECTA:');
console.log('==========================================');

console.log('\n1️⃣  ACCEDE A LA WEB DE CANALES:');
console.log('===============================');
if (isTestEnvironment) {
  console.log('   🌐 URL: https://canalespago.redsys.es/');
  console.log('   📝 Entorno: PRUEBAS');
} else {
  console.log('   🌐 URL: https://canales.redsys.es/');
  console.log('   📝 Entorno: PRODUCCIÓN');
}

console.log('\n2️⃣  INICIA SESIÓN:');
console.log('==================');
console.log('   🔐 Usa tus credenciales de comercio de Redsys');
console.log('   📧 Usuario y contraseña de tu cuenta de comercio');

console.log('\n3️⃣  NAVEGA A CONFIGURACIÓN:');
console.log('===========================');
console.log('   📍 Busca "Configuración" o "Parámetros"');
console.log('   🏪 Selecciona tu terminal específico');
console.log(`   🔢 Terminal: ${config.terminal}`);

console.log('\n4️⃣  OBTÉN LA CLAVE SHA256:');
console.log('==========================');
console.log('   🔑 Busca "Clave SHA256" o "Clave de firma"');
console.log('   📋 Copia la clave completa');
console.log('   ⚠️  Asegúrate de que sea para:');
console.log(`      - Merchant Code: ${config.merchantCode}`);
console.log(`      - Terminal: ${config.terminal}`);
console.log(`      - Entorno: ${isTestEnvironment ? 'PRUEBAS' : 'PRODUCCIÓN'}`);

console.log('\n5️⃣  VERIFICA EL FORMATO:');
console.log('========================');
console.log('   🔍 La clave debe estar en formato hexadecimal');
console.log('   📏 Ejemplo: b2aec78eb50e05f2a60b9efa20b82c903e6cad4f3bd2027b');
console.log('   ❌ NO debe tener espacios ni caracteres especiales');

// Función para validar formato hexadecimal
function isValidHex(str) {
  return /^[0-9a-fA-F]+$/.test(str);
}

// Función para actualizar el archivo .env.local
function updateEnvFile(newKey) {
  try {
    const envPath = '.env.local';
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Buscar y reemplazar la línea REDSYS_SECRET_KEY
    const lines = envContent.split('\n');
    let keyUpdated = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('REDSYS_SECRET_KEY=')) {
        lines[i] = `REDSYS_SECRET_KEY=${newKey}`;
        keyUpdated = true;
        break;
      }
    }
    
    // Si no se encontró la línea, añadirla
    if (!keyUpdated) {
      lines.push(`REDSYS_SECRET_KEY=${newKey}`);
    }
    
    // Escribir el archivo actualizado
    fs.writeFileSync(envPath, lines.join('\n'));
    console.log('   ✅ Archivo .env.local actualizado correctamente');
    return true;
  } catch (error) {
    console.error('   ❌ Error actualizando archivo:', error.message);
    return false;
  }
}

// Función para solicitar la nueva clave
function askForNewKey() {
  console.log('\n🔑 INGRESA LA NUEVA CLAVE:');
  console.log('===========================');
  console.log('   📝 Pega aquí la clave SHA256 que obtuviste de Redsys:');
  
  rl.question('   Clave: ', (input) => {
    const key = input.trim();
    
    if (!key) {
      console.log('   ❌ No se ingresó ninguna clave');
      rl.close();
      return;
    }
    
    console.log('\n🔍 VALIDANDO CLAVE:');
    console.log('===================');
    console.log(`   Longitud: ${key.length} caracteres`);
    console.log(`   Formato hexadecimal: ${isValidHex(key) ? '✅ SÍ' : '❌ NO'}`);
    
    if (!isValidHex(key)) {
      console.log('   ❌ La clave no está en formato hexadecimal válido');
      console.log('   💡 Asegúrate de copiar solo los caracteres hexadecimales (0-9, a-f, A-F)');
      rl.close();
      return;
    }
    
    console.log('   ✅ Clave válida');
    
    console.log('\n📝 ACTUALIZANDO CONFIGURACIÓN:');
    console.log('===============================');
    
    if (updateEnvFile(key)) {
      console.log('\n🎉 ¡CONFIGURACIÓN ACTUALIZADA!');
      console.log('==============================');
      console.log('   ✅ Nueva clave guardada en .env.local');
      console.log('   🔄 Reinicia el servidor de desarrollo');
      console.log('   🧪 Prueba una nueva reserva');
      
      console.log('\n📋 RESUMEN DE CAMBIOS:');
      console.log('=======================');
      console.log(`   Merchant Code: ${config.merchantCode}`);
      console.log(`   Terminal: ${config.terminal}`);
      console.log(`   Entorno: ${isTestEnvironment ? 'PRUEBAS' : 'PRODUCCIÓN'}`);
      console.log(`   Nueva clave: ${key.substring(0, 10)}...`);
      
      console.log('\n🚀 PRÓXIMOS PASOS:');
      console.log('==================');
      console.log('1. 🔄 Reinicia el servidor de desarrollo');
      console.log('2. 🧪 Prueba una nueva reserva');
      console.log('3. ✅ Verifica que el pago funcione correctamente');
      console.log('4. 🎯 El error SIS0042 debería estar resuelto');
      
    } else {
      console.log('   ❌ No se pudo actualizar la configuración');
      console.log('   💡 Actualiza manualmente el archivo .env.local');
    }
    
    rl.close();
  });
}

// Preguntar si quiere continuar
console.log('\n❓ ¿Quieres continuar e ingresar la nueva clave?');
console.log('================================================');
console.log('   💡 Asegúrate de tener la clave SHA256 de Redsys lista');
console.log('   📋 Puedes copiarla de la web de Canales de Redsys');

rl.question('   ¿Continuar? (s/n): ', (answer) => {
  if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'si' || answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    askForNewKey();
  } else {
    console.log('\n📝 INSTRUCCIONES MANUALES:');
    console.log('===========================');
    console.log('1. Obtén la clave SHA256 de la web de Canales de Redsys');
    console.log('2. Abre el archivo .env.local');
    console.log('3. Actualiza la línea REDSYS_SECRET_KEY=tu_clave_aqui');
    console.log('4. Guarda el archivo');
    console.log('5. Reinicia el servidor de desarrollo');
    console.log('6. Prueba una nueva reserva');
    
    rl.close();
  }
}); 