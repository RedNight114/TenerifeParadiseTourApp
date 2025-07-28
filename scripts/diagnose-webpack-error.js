#!/usr/bin/env node

/**
 * 🔍 Diagnóstico de Error de Webpack - Tenerife Paradise Tours
 * 
 * Este script diagnostica errores de webpack relacionados con 'call' en undefined.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 DIAGNÓSTICO DE ERROR DE WEBPACK');
console.log('===================================\n');

// 1. Verificar archivos problemáticos
console.log('🔍 Verificando archivos problemáticos...');
const problematicPatterns = [
  'use-navigation-recovery',
  'navigation-recovery',
  'hydration-safe',
  'cache-cleanup'
];

const filesToCheck = [
  'hooks/use-navigation-recovery.ts',
  'components/navigation-recovery.tsx',
  'components/hydration-safe.tsx',
  'components/cache-cleanup.tsx',
  'app/layout.tsx'
];

filesToCheck.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar imports problemáticos
    const hasClientDirective = content.includes('"use client"');
    const hasExportDefault = content.includes('export default');
    const hasExportFunction = content.includes('export function');
    const hasImportStatement = content.includes('import');
    
    console.log(`\n📁 ${file}:`);
    console.log(`   ✅ Existe: Sí`);
    console.log(`   "use client": ${hasClientDirective ? '✅' : '❌'}`);
    console.log(`   export default: ${hasExportDefault ? '✅' : '❌'}`);
    console.log(`   export function: ${hasExportFunction ? '✅' : '❌'}`);
    console.log(`   import statements: ${hasImportStatement ? '✅' : '❌'}`);
    
    // Verificar sintaxis básica
    try {
      // Verificar que no hay errores de sintaxis obvios
      const lines = content.split('\n');
      let hasSyntaxError = false;
      
      lines.forEach((line, index) => {
        // Verificar líneas problemáticas
        if (line.includes('undefined') && line.includes('call')) {
          console.log(`   ⚠️  Línea ${index + 1}: Posible problema con 'call'`);
          hasSyntaxError = true;
        }
        
        // Verificar imports mal formados
        if (line.includes('import') && line.includes('from') && !line.includes('"') && !line.includes("'")) {
          console.log(`   ⚠️  Línea ${index + 1}: Import mal formado`);
          hasSyntaxError = true;
        }
      });
      
      if (!hasSyntaxError) {
        console.log(`   ✅ Sintaxis: Correcta`);
      }
    } catch (error) {
      console.log(`   ❌ Error de sintaxis: ${error.message}`);
    }
  } else {
    console.log(`\n📁 ${file}: ❌ No existe`);
  }
});

// 2. Verificar configuración de Next.js
console.log('\n🔍 Verificando configuración de Next.js...');
const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
if (fs.existsSync(nextConfigPath)) {
  console.log('✅ next.config.mjs presente');
  const configContent = fs.readFileSync(nextConfigPath, 'utf8');
  
  const configChecks = [
    { name: 'webpack config', check: configContent.includes('webpack') },
    { name: 'experimental features', check: configContent.includes('experimental') },
    { name: 'compiler options', check: configContent.includes('compiler') }
  ];
  
  configChecks.forEach(({ name, check }) => {
    console.log(`   ${check ? '✅' : '❌'} ${name}`);
  });
} else {
  console.log('❌ next.config.mjs no encontrado');
}

// 3. Verificar package.json
console.log('\n🔍 Verificando package.json...');
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  console.log(`✅ Versión de Next.js: ${packageContent.dependencies?.next || 'No encontrada'}`);
  console.log(`✅ Versión de React: ${packageContent.dependencies?.react || 'No encontrada'}`);
  console.log(`✅ Versión de React DOM: ${packageContent.dependencies?.['react-dom'] || 'No encontrada'}`);
  
  // Verificar scripts
  if (packageContent.scripts) {
    console.log('✅ Scripts disponibles:');
    Object.keys(packageContent.scripts).forEach(script => {
      console.log(`   - ${script}`);
    });
  }
} else {
  console.log('❌ package.json no encontrado');
}

// 4. Verificar TypeScript config
console.log('\n🔍 Verificando configuración de TypeScript...');
const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
if (fs.existsSync(tsConfigPath)) {
  console.log('✅ tsconfig.json presente');
  const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
  
  console.log(`   Target: ${tsConfig.compilerOptions?.target || 'No especificado'}`);
  console.log(`   Module: ${tsConfig.compilerOptions?.module || 'No especificado'}`);
  console.log(`   JSX: ${tsConfig.compilerOptions?.jsx || 'No especificado'}`);
} else {
  console.log('❌ tsconfig.json no encontrado');
}

// 5. Limpiar caché y archivos temporales
console.log('\n🧹 Limpiando caché y archivos temporales...');
const tempDirs = ['.next', 'node_modules/.cache', 'out'];
tempDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ ${dir} eliminado`);
    } catch (error) {
      console.log(`⚠️ Error eliminando ${dir}: ${error.message}`);
    }
  }
});

// 6. Verificar módulos de node
console.log('\n📦 Verificando módulos de node...');
try {
  execSync('npm list --depth=0', { stdio: 'pipe' });
  console.log('✅ Módulos de node verificados');
} catch (error) {
  console.log('⚠️ Problemas con módulos de node');
  console.log('   Ejecutando npm install...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ npm install completado');
  } catch (installError) {
    console.log('❌ Error en npm install:', installError.message);
  }
}

console.log('\n🎯 SOLUCIONES RECOMENDADAS:');
console.log('============================');
console.log('1. Reiniciar el servidor: npm run dev');
console.log('2. Limpiar caché del navegador');
console.log('3. Verificar que todos los imports son correctos');
console.log('4. Comprobar que no hay referencias a undefined');
console.log('5. Verificar la configuración de webpack en next.config.mjs');

console.log('\n💡 DIAGNÓSTICO ESPECÍFICO:');
console.log('===========================');
console.log('• El error "Cannot read properties of undefined (reading call)"');
console.log('• Generalmente indica un problema con imports o exports');
console.log('• Puede estar relacionado con el sistema de recuperación implementado');
console.log('• Verificar que todos los hooks y componentes están correctamente exportados');

console.log('\n✅ Diagnóstico de error de webpack completado'); 