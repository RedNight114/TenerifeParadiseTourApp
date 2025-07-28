#!/usr/bin/env node

/**
 * 🔧 Fix de Hidratación - Tenerife Paradise Tours
 * 
 * Este script limpia el caché y reinicia el servidor para solucionar
 * problemas de hidratación de React.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 FIX DE HIDRATACIÓN');
console.log('=====================\n');

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

// 4. Verificar archivos críticos
console.log('\n🔍 Verificando archivos críticos...');
const criticalFiles = [
  'components/hydration-safe.tsx',
  'components/featured-services.tsx',
  'app/(main)/page.tsx'
];

criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} presente`);
  } else {
    console.log(`❌ ${file} faltante`);
  }
});

// 5. Verificar variables de entorno
console.log('\n🌍 Verificando variables de entorno...');
const envFile = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envFile)) {
  console.log('✅ .env.local presente');
} else {
  console.log('⚠️ .env.local no encontrado');
}

console.log('\n🎯 RECOMENDACIONES POST-FIX:');
console.log('============================');
console.log('1. Reiniciar el servidor: npm run dev');
console.log('2. Limpiar caché del navegador (Ctrl+Shift+Delete)');
console.log('3. Probar en ventana de incógnito');
console.log('4. Verificar que no hay errores de hidratación');
console.log('5. Comprobar que los iconos SVG se renderizan correctamente');

console.log('\n💡 SOLUCIONES ADICIONALES:');
console.log('==========================');
console.log('• Si persisten los errores, verificar que todos los componentes usen ClientOnly');
console.log('• Asegurar que los iconos SVG no se rendericen en el servidor');
console.log('• Verificar que los hooks de estado solo se usen en componentes cliente');
console.log('• Comprobar que no hay diferencias entre SSR y CSR');

console.log('\n✅ Fix de hidratación completado'); 