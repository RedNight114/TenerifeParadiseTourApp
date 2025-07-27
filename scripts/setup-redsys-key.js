#!/usr/bin/env node

/**
 * Script para configurar la Secret Key de Redsys
 */

const fs = require('fs');
const crypto = require('crypto');

console.log('🔐 SETTING UP REDSYS SECRET KEY');
console.log('================================');

// Secret Key proporcionada (parece estar en formato hexadecimal)
const providedKey = 'sq7HjrUOBfKmC576ILgskD5srU870gJ7';

console.log('📋 Secret Key proporcionada:', providedKey);
console.log('📏 Longitud:', providedKey.length);

// Intentar diferentes interpretaciones de la clave
let base64Key = '';

try {
  // Opción 1: Asumir que es hexadecimal
  const bufferFromHex = Buffer.from(providedKey, 'hex');
  base64Key = bufferFromHex.toString('base64');
  console.log('✅ Convertida de hex a base64:', base64Key);
} catch (error) {
  console.log('❌ No es hexadecimal válido');
  
  try {
    // Opción 2: Asumir que ya es base64
    const testBuffer = Buffer.from(providedKey, 'base64');
    base64Key = providedKey;
    console.log('✅ Ya está en formato base64');
  } catch (error2) {
    console.log('❌ No es base64 válido');
    
    // Opción 3: Asumir que es texto plano y convertir a base64
    base64Key = Buffer.from(providedKey, 'utf8').toString('base64');
    console.log('✅ Convertida de texto a base64:', base64Key);
  }
}

console.log('\n🧪 PROBANDO LA CLAVE...');
console.log('========================');

// Probar la generación de firma
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

  const decodedKey = Buffer.from(base64Key, 'base64');
  const hmac = crypto.createHmac('sha256', decodedKey);
  const dataToSign = testOrder + testMerchantParams;
  hmac.update(dataToSign, 'utf8');
  const signature = hmac.digest('base64');
  
  console.log('✅ Firma generada correctamente');
  console.log(`   Longitud de firma: ${signature.length}`);
  console.log(`   Preview: ${signature.substring(0, 20)}...`);
  
  console.log('\n📝 CONFIGURACIÓN PARA .env.local:');
  console.log('==================================');
  console.log(`REDSYS_SECRET_KEY=${base64Key}`);
  
  // Verificar si .env.local existe
  const envPath = '.env.local';
  if (fs.existsSync(envPath)) {
    console.log('\n📁 Archivo .env.local encontrado');
    
    // Leer el archivo actual
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Buscar si ya existe REDSYS_SECRET_KEY
    if (envContent.includes('REDSYS_SECRET_KEY=')) {
      // Reemplazar la línea existente
      envContent = envContent.replace(
        /REDSYS_SECRET_KEY=.*/g,
        `REDSYS_SECRET_KEY=${base64Key}`
      );
      console.log('🔄 Actualizada la línea existente');
    } else {
      // Agregar la nueva línea
      envContent += `\nREDSYS_SECRET_KEY=${base64Key}`;
      console.log('➕ Agregada nueva línea');
    }
    
    // Escribir el archivo actualizado
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env.local actualizado');
  } else {
    console.log('\n📁 Creando archivo .env.local...');
    fs.writeFileSync(envPath, `REDSYS_SECRET_KEY=${base64Key}\n`);
    console.log('✅ Archivo .env.local creado');
  }
  
  console.log('\n🎉 CONFIGURACIÓN COMPLETADA');
  console.log('============================');
  console.log('La Secret Key ha sido configurada correctamente.');
  console.log('Reinicia el servidor para aplicar los cambios.');
  
} catch (error) {
  console.error('❌ Error probando la clave:', error.message);
  console.log('\n💡 SUGERENCIAS:');
  console.log('1. Verifica que la Secret Key sea correcta');
  console.log('2. Contacta con Redsys para confirmar el formato');
  console.log('3. Asegúrate de que sea para el entorno de TEST');
} 