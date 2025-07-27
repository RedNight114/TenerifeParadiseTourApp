#!/usr/bin/env node

/**
 * Script para actualizar automáticamente la clave secreta de Redsys en .env.local
 * Convierte de Base64 a Hexadecimal para solucionar el error SIS0042
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

console.log('🔧 ACTUALIZACIÓN AUTOMÁTICA DE CLAVE REDSYS');
console.log('==========================================');

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

try {
  // Convertir de Base64 a Hexadecimal
  const base64Buffer = Buffer.from(currentSecretKey, 'base64');
  const hexKey = base64Buffer.toString('hex');
  
  console.log('\n🔑 CLAVE CONVERTIDA:');
  console.log(`   Valor: ${hexKey}`);
  console.log(`   Longitud: ${hexKey.length} caracteres`);
  
  // Leer el archivo .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('\n📁 Archivo .env.local encontrado');
  } else {
    console.log('\n📁 Creando nuevo archivo .env.local');
  }
  
  // Buscar y reemplazar la línea REDSYS_SECRET_KEY
  const newLine = `REDSYS_SECRET_KEY=${hexKey}`;
  
  if (envContent.includes('REDSYS_SECRET_KEY=')) {
    // Reemplazar la línea existente
    envContent = envContent.replace(
      /REDSYS_SECRET_KEY=.*/g,
      newLine
    );
    console.log('✅ Línea REDSYS_SECRET_KEY actualizada');
  } else {
    // Añadir la nueva línea
    envContent += `\n${newLine}`;
    console.log('✅ Nueva línea REDSYS_SECRET_KEY añadida');
  }
  
  // Escribir el archivo actualizado
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ ARCHIVO .env.local ACTUALIZADO');
  console.log('==================================');
  console.log(`   Archivo: ${envPath}`);
  console.log(`   Nueva clave: ${hexKey}`);
  
  // Verificar que la actualización fue exitosa
  const updatedContent = fs.readFileSync(envPath, 'utf8');
  if (updatedContent.includes(hexKey)) {
    console.log('✅ Verificación exitosa: clave actualizada correctamente');
  } else {
    console.error('❌ ERROR: La clave no se actualizó correctamente');
    process.exit(1);
  }
  
  console.log('\n🎯 PRÓXIMOS PASOS:');
  console.log('==================');
  console.log('1. ✅ Clave actualizada automáticamente');
  console.log('2. 🔄 Reinicia el servidor de desarrollo');
  console.log('3. 🧪 Prueba una nueva reserva');
  console.log('4. ✅ El error SIS0042 debería estar resuelto');
  
  console.log('\n📝 CONFIGURACIÓN ACTUALIZADA:');
  console.log('=============================');
  console.log(`REDSYS_SECRET_KEY=${hexKey}`);
  
} catch (error) {
  console.error('❌ ERROR durante la actualización:', error.message);
  console.log('\n📝 SOLUCIÓN MANUAL:');
  console.log('1. Abre tu archivo .env.local');
  console.log('2. Cambia la línea REDSYS_SECRET_KEY por:');
  console.log(`   REDSYS_SECRET_KEY=${Buffer.from(currentSecretKey, 'base64').toString('hex')}`);
  console.log('3. Guarda el archivo');
  console.log('4. Reinicia el servidor');
}

console.log('\n✅ Proceso completado'); 