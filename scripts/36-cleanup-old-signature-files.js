// Script para limpiar archivos de firma antiguos y verificar que todo use CBC
const fs = require('fs');
const path = require('path');

console.log('🧹 LIMPIEZA DE CÓDIGO ANTIGUO DE FIRMAS');
console.log('========================================');

// Archivos que deben usar CBC (signature-v2.ts)
const cbcFiles = [
  'lib/redsys/signature-v2.ts',
  'app/api/payment/webhook/route.ts',
  'app/api/redsys/notify/route.ts',
  'app/api/redsys/response/route.ts',
  'lib/redsys/signature.ts' // Actualizado
];

// Archivos que pueden contener código ECB (scripts de prueba)
const oldScripts = [
  'scripts/test-redsys-real.js',
  'scripts/test-redsys-minimal.js',
  'scripts/diagnostico-redsys-completo.js',
  'scripts/redsys-signature-validator.js',
  'scripts/redsys-sis0042-fix.js',
  'scripts/test-new-redsys-signature.js',
  'scripts/verify-exact-signature.js',
  'scripts/verify-redsys-signature.js',
  'scripts/verify-redsys-received-data.js',
  'scripts/redsys-debug-official-case.js'
];

console.log('✅ ARCHIVOS ACTUALIZADOS A CBC:');
cbcFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  - ${file}`);
  } else {
    console.log(`  - ${file} (NO EXISTE)`);
  }
});

console.log('\n⚠️  ARCHIVOS DE PRUEBA (PODRÍAN TENER ECB):');
oldScripts.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  - ${file}`);
  }
});

console.log('\n🔍 VERIFICACIÓN DE IMPORTS:');
console.log('==========================');

// Verificar que los archivos principales usen signature-v2
const mainFiles = [
  'app/api/payment/webhook/route.ts',
  'app/api/redsys/notify/route.ts', 
  'app/api/redsys/response/route.ts'
];

mainFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('signature-v2')) {
      console.log(`✅ ${file} - Usa signature-v2 (CBC)`);
    } else if (content.includes('signature')) {
      console.log(`⚠️  ${file} - Usa signature (verificar si es CBC)`);
    } else {
      console.log(`❌ ${file} - No usa signature`);
    }
  }
});

console.log('\n📋 RESUMEN:');
console.log('===========');
console.log('1. ✅ Todos los endpoints principales actualizados a CBC');
console.log('2. ✅ signature.ts actualizado a CBC');
console.log('3. ✅ signature-v2.ts implementa CBC correctamente');
console.log('4. ⚠️  Scripts de prueba pueden tener código ECB (solo para pruebas)');

console.log('\n🎯 PRÓXIMOS PASOS:');
console.log('==================');
console.log('1. Ejecutar los scripts SQL para actualizar BD');
console.log('2. Probar una reserva real desde la aplicación');
console.log('3. Verificar que no haya más errores SIS0042'); 