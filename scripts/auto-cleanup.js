#!/usr/bin/env node

/**
 * 🧹 Limpieza Automática de Caché - Tenerife Paradise Tours
 * 
 * Este script limpia automáticamente el caché antes de iniciar el servidor.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 LIMPIEZA AUTOMÁTICA DE CACHÉ');
console.log('===============================
');

// 1. Limpiar caché de Next.js
console.log('📦 Limpiando caché de Next.js...');
try {
  execSync('npx next clean', { stdio: 'inherit' });
  console.log('✅ Caché de Next.js limpiado');
} catch (error) {
  console.log('⚠️ Error limpiando caché de Next.js:', error.message);
}

// 2. Limpiar archivos temporales
console.log('\n🗂️ Limpiando archivos temporales...');
const tempDirs = ['.next', '.vercel', 'out', 'node_modules/.cache'];
tempDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ ${dir} eliminado`);
    } catch (error) {
      console.log(`⚠️ Error eliminando ${dir}:`, error.message);
    }
  }
});

// 3. Limpiar logs
console.log('\n📝 Limpiando logs...');
const logFiles = ['npm-debug.log', 'yarn-error.log', 'pnpm-debug.log'];
logFiles.forEach(logFile => {
  const logPath = path.join(process.cwd(), logFile);
  if (fs.existsSync(logPath)) {
    try {
      fs.unlinkSync(logPath);
      console.log(`✅ ${logFile} eliminado`);
    } catch (error) {
      console.log(`⚠️ Error eliminando ${logFile}:`, error.message);
    }
  }
});

// 4. Limpiar caché de npm
console.log('\n📦 Limpiando caché de npm...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ Caché de npm limpiado');
} catch (error) {
  console.log('⚠️ Error limpiando caché de npm:', error.message);
}

console.log('\n🎯 RECOMENDACIONES POST-LIMPIEZA:');
console.log('==================================');
console.log('1. Reiniciar el servidor: npm run dev');
console.log('2. Limpiar caché del navegador (Ctrl+Shift+Delete)');
console.log('3. Probar en ventana de incógnito');
console.log('4. Verificar que los datos cargan correctamente');

console.log('\n✅ Limpieza automática completada');
