const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Iniciando corrección del error de exports...\n');

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

// 2. Verificar package.json para configuración de módulos
console.log('\n📦 Verificando configuración de módulos...');
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Verificar si tiene type: module
    if (packageJson.type === 'module') {
      console.log('✅ package.json configurado como módulo ES6');
    } else {
      console.log('ℹ️ package.json no tiene type: module (usando CommonJS)');
    }
    
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

// 3. Verificar archivos de configuración
console.log('\n⚙️ Verificando archivos de configuración...');
const configFiles = [
  'next.config.mjs',
  'tsconfig.json',
  'jsconfig.json'
];

configFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} presente`);
    
    // Verificar contenido específico
    if (file === 'next.config.mjs') {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('globalObject') && content.includes('topLevelAwait')) {
        console.log('✅ Configuración de webpack para ES6 detectada');
      } else {
        console.log('⚠️ Configuración de webpack para ES6 no encontrada');
      }
    }
  } else {
    console.log(`❌ ${file} faltante`);
  }
});

// 4. Verificar archivos críticos que podrían causar el error
console.log('\n🔍 Verificando archivos críticos...');
const criticalFiles = [
  'middleware.ts',
  'app/layout.tsx',
  'lib/supabase-optimized.ts'
];

criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} presente`);
    
    // Verificar si usa exports
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('exports') && !content.includes('export default')) {
      console.log(`⚠️ ${file} usa exports (posible problema de módulos)`);
    }
  } else {
    console.log(`❌ ${file} faltante`);
  }
});

// 5. Reinstalar dependencias
console.log('\n📥 Reinstalando dependencias...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencias reinstaladas');
} catch (error) {
  console.log('❌ Error reinstalando dependencias:', error.message);
}

// 6. Limpiar logs
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

console.log('\n🎯 RECOMENDACIONES POST-FIX:');
console.log('============================');
console.log('1. Reiniciar el servidor: npm run dev');
console.log('2. Verificar que no hay errores de exports');
console.log('3. Comprobar que la configuración de turbo es correcta');
console.log('4. Si el error persiste, revisar archivos que usen exports');
console.log('5. Considerar convertir archivos .js a .mjs si usan ES6');

console.log('\n✅ Corrección completada. Ejecuta "npm run dev" para reiniciar el servidor.'); 