#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnóstico de Error de Webpack\n');

// 1. Verificar archivos problemáticos
console.log('1. Verificando archivos problemáticos...');

const problematicFiles = [
  'app/favicon.ico',
  'lib/dynamic-imports.tsx',
  'next.config.mjs',
  'package.json'
];

problematicFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file}: ${stats.isFile() ? 'archivo' : 'directorio'} (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${file}: No encontrado`);
  }
});

// 2. Verificar caché de Next.js
console.log('\n2. Verificando caché de Next.js...');
const nextCache = path.join(process.cwd(), '.next');
if (fs.existsSync(nextCache)) {
  console.log('⚠️  Caché de Next.js existe - puede estar corrupta');
  try {
    const files = fs.readdirSync(nextCache);
    console.log(`   Archivos en caché: ${files.length}`);
  } catch (error) {
    console.log(`   Error leyendo caché: ${error.message}`);
  }
} else {
  console.log('✅ Caché de Next.js no existe - limpia');
}

// 3. Verificar node_modules
console.log('\n3. Verificando node_modules...');
const nodeModules = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModules)) {
  console.log('✅ node_modules existe');
} else {
  console.log('❌ node_modules no existe - ejecutar npm install');
}

// 4. Verificar archivos de configuración
console.log('\n4. Verificando configuración...');

// Verificar next.config.mjs
const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
if (fs.existsSync(nextConfigPath)) {
  const content = fs.readFileSync(nextConfigPath, 'utf8');
  if (content.includes('splitChunks')) {
    console.log('⚠️  next.config.mjs contiene configuración de splitChunks');
  } else {
    console.log('✅ next.config.mjs simplificado');
  }
}

// 5. Verificar importaciones dinámicas
console.log('\n5. Verificando importaciones dinámicas...');
const dynamicImportsPath = path.join(process.cwd(), 'lib/dynamic-imports.tsx');
if (fs.existsSync(dynamicImportsPath)) {
  const content = fs.readFileSync(dynamicImportsPath, 'utf8');
  const dynamicImports = content.match(/dynamic\(/g);
  console.log(`   Importaciones dinámicas encontradas: ${dynamicImports ? dynamicImports.length : 0}`);
  
  if (content.includes('ChatWidget')) {
    console.log('⚠️  ChatWidget encontrado en importaciones dinámicas');
  }
}

// 6. Recomendaciones
console.log('\n6. Recomendaciones:');
console.log('   - Limpiar caché: rmdir /s /q .next');
console.log('   - Reinstalar dependencias: npm install');
console.log('   - Simplificar configuración de webpack');
console.log('   - Verificar archivos de favicon');

console.log('\n✅ Diagnóstico completado');
