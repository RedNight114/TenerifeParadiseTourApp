#!/usr/bin/env node

/**
 * 🔧 Fix Completo de Hidratación - Tenerife Paradise Tours
 * 
 * Este script realiza una limpieza completa y reinicia todo para solucionar
 * problemas de hidratación de React.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 FIX COMPLETO DE HIDRATACIÓN');
console.log('==============================\n');

// 1. Detener procesos en puertos
console.log('🛑 Deteniendo procesos en puertos...');
try {
  execSync('npx kill-port 3000 3001 3002', { stdio: 'ignore' });
  console.log('✅ Procesos detenidos');
} catch (error) {
  console.log('⚠️ No se pudieron detener procesos:', error.message);
}

// 2. Limpiar caché de Next.js
console.log('\n📦 Limpiando caché de Next.js...');
try {
  execSync('npx next clean', { stdio: 'inherit' });
  console.log('✅ Caché de Next.js limpiado');
} catch (error) {
  console.log('⚠️ Error limpiando caché de Next.js:', error.message);
}

// 3. Limpiar archivos temporales
console.log('\n🗂️ Limpiando archivos temporales...');
const tempDirs = ['.next', '.vercel', 'out', 'node_modules/.cache', 'dist'];
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
const logFiles = ['npm-debug.log', 'yarn-error.log', 'pnpm-debug.log', '.next/error.log'];
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

// 5. Verificar archivos críticos
console.log('\n🔍 Verificando archivos críticos...');
const criticalFiles = [
  'components/hydration-safe.tsx',
  'components/featured-services.tsx',
  'app/(main)/page.tsx',
  'hooks/use-services-advanced.ts'
];

criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} presente`);
  } else {
    console.log(`❌ ${file} faltante`);
  }
});

// 6. Verificar variables de entorno
console.log('\n🌍 Verificando variables de entorno...');
const envFiles = ['.env.local', '.env'];
envFiles.forEach(envFile => {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    console.log(`✅ ${envFile} presente`);
  } else {
    console.log(`⚠️ ${envFile} no encontrado`);
  }
});

// 7. Limpiar caché de npm
console.log('\n📦 Limpiando caché de npm...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ Caché de npm limpiado');
} catch (error) {
  console.log('⚠️ Error limpiando caché de npm:', error.message);
}

// 8. Reinstalar dependencias si es necesario
console.log('\n📦 Verificando dependencias...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencias verificadas');
} catch (error) {
  console.log('⚠️ Error verificando dependencias:', error.message);
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
console.log('• Si persisten los errores, verificar que todos los componentes usen SuppressHydrationWarning');
console.log('• Asegurar que los iconos SVG no se rendericen en el servidor');
console.log('• Verificar que los hooks de estado solo se usen en componentes cliente');
console.log('• Comprobar que no hay diferencias entre SSR y CSR');
console.log('• Usar AfterHydration para contenido que depende del cliente');

console.log('\n🔧 COMANDOS ÚTILES:');
console.log('==================');
console.log('• npm run dev:fix - Fix + reinicio automático');
console.log('• npm run fix:hydration - Solo fix de hidratación');
console.log('• npm run clean:cache - Limpieza de caché');
console.log('• npm run dev - Reinicio manual');

console.log('\n✅ Fix completo de hidratación completado');
console.log('🚀 Ejecuta "npm run dev" para reiniciar el servidor'); 