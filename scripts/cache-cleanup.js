#!/usr/bin/env node

/**
 * 🧹 Limpieza de Caché - Tenerife Paradise Tours
 * 
 * Este script limpia el caché del navegador y Next.js para resolver
 * problemas de navegación y rendimiento.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 LIMPIEZA DE CACHÉ');
console.log('===================\n');

// 1. Limpiar caché de Next.js
console.log('📦 Limpiando caché de Next.js...');
try {
  execSync('npx next clean', { stdio: 'inherit' });
  console.log('✅ Caché de Next.js limpiado');
} catch (error) {
  console.log('⚠️ Error limpiando caché de Next.js:', error.message);
}

// 2. Limpiar node_modules (opcional)
console.log('\n📁 Limpiando node_modules...');
try {
  execSync('rm -rf node_modules', { stdio: 'inherit' });
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ node_modules limpiado y reinstalado');
} catch (error) {
  console.log('⚠️ Error limpiando node_modules:', error.message);
}

// 3. Limpiar archivos temporales
console.log('\n🗂️ Limpiando archivos temporales...');
const tempDirs = ['.next', '.vercel', 'out'];
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

// 4. Limpiar logs
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

console.log('\n🎯 RECOMENDACIONES POST-LIMPIEZA:');
console.log('==================================');
console.log('1. Reiniciar el servidor de desarrollo: npm run dev');
console.log('2. Limpiar caché del navegador (Ctrl+Shift+Delete)');
console.log('3. Probar navegación entre páginas');
console.log('4. Verificar que no hay errores en la consola');
console.log('5. Monitorear rendimiento con React DevTools');

console.log('\n✅ Limpieza de caché completada');
