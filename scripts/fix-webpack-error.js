const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Iniciando corrección del error de webpack...\n');

// 1. Limpiar directorios de build
console.log('📁 Limpiando directorios de build...');
const dirsToClean = ['.next', 'node_modules/.cache', 'out', 'dist'];

dirsToClean.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ ${dir} eliminado`);
    } catch (error) {
      console.log(`⚠️ Error eliminando ${dir}:`, error.message);
    }
  } else {
    console.log(`ℹ️ ${dir} no existe`);
  }
});

// 2. Limpiar archivos de lock
console.log('\n🔒 Limpiando archivos de lock...');
const lockFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
lockFiles.forEach(lockFile => {
  const lockPath = path.join(process.cwd(), lockFile);
  if (fs.existsSync(lockPath)) {
    try {
      fs.unlinkSync(lockPath);
      console.log(`✅ ${lockFile} eliminado`);
    } catch (error) {
      console.log(`⚠️ Error eliminando ${lockFile}:`, error.message);
    }
  }
});

// 3. Verificar y corregir package.json
console.log('\n📦 Verificando package.json...');
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Verificar dependencias críticas
    const criticalDeps = ['next', 'react', 'react-dom'];
    const missingDeps = criticalDeps.filter(dep => !packageJson.dependencies?.[dep]);
    
    if (missingDeps.length > 0) {
      console.log(`⚠️ Dependencias faltantes: ${missingDeps.join(', ')}`);
    } else {
      console.log('✅ Todas las dependencias críticas están presentes');
    }
  } catch (error) {
    console.log('❌ Error leyendo package.json:', error.message);
  }
}

// 4. Reinstalar dependencias
console.log('\n📥 Reinstalando dependencias...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencias reinstaladas');
} catch (error) {
  console.log('❌ Error reinstalando dependencias:', error.message);
}

// 5. Verificar configuración de Next.js
console.log('\n⚙️ Verificando configuración de Next.js...');
const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
if (fs.existsSync(nextConfigPath)) {
  console.log('✅ next.config.mjs presente');
  
  // Verificar contenido básico
  const configContent = fs.readFileSync(nextConfigPath, 'utf8');
  if (configContent.includes('webpack') && configContent.includes('resolve.fallback')) {
    console.log('✅ Configuración de webpack detectada');
  } else {
    console.log('⚠️ Configuración de webpack no encontrada');
  }
} else {
  console.log('❌ next.config.mjs no encontrado');
}

// 6. Verificar archivos críticos
console.log('\n🔍 Verificando archivos críticos...');
const criticalFiles = [
  'app/layout.tsx',
  'components/hydration-safe.tsx',
  'lib/supabase-optimized.ts'
];

criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} presente`);
  } else {
    console.log(`❌ ${file} faltante`);
  }
});

// 7. Limpiar logs
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

// 8. Verificar variables de entorno
console.log('\n🌍 Verificando variables de entorno...');
const envFiles = ['.env.local', '.env.development', '.env'];
envFiles.forEach(envFile => {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    console.log(`✅ ${envFile} presente`);
  } else {
    console.log(`⚠️ ${envFile} no encontrado`);
  }
});

console.log('\n🎯 RECOMENDACIONES POST-FIX:');
console.log('============================');
console.log('1. Reiniciar el servidor: npm run dev');
console.log('2. Limpiar caché del navegador (Ctrl+Shift+Delete)');
console.log('3. Probar en ventana de incógnito');
console.log('4. Verificar que no hay errores de webpack');
console.log('5. Comprobar que la hidratación funciona correctamente');
console.log('6. Si el error persiste, revisar la consola del navegador');

console.log('\n✅ Corrección completada. Ejecuta "npm run dev" para reiniciar el servidor.'); 