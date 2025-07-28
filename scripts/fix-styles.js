const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎨 Verificando y corrigiendo problemas de estilos...\n');

// 1. Verificar archivos de estilos críticos
console.log('📁 Verificando archivos de estilos...');
const styleFiles = [
  'app/globals.css',
  'styles/globals.css',
  'tailwind.config.ts',
  'postcss.config.mjs'
];

styleFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} presente`);
    
    // Verificar contenido específico
    if (file === 'app/globals.css' || file === 'styles/globals.css') {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('@tailwind')) {
        console.log(`  ✅ ${file} contiene directivas de Tailwind`);
      } else {
        console.log(`  ⚠️ ${file} no contiene directivas de Tailwind`);
      }
    }
  } else {
    console.log(`❌ ${file} faltante`);
  }
});

// 2. Verificar configuración de Tailwind
console.log('\n🎨 Verificando configuración de Tailwind...');
const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.ts');
if (fs.existsSync(tailwindConfigPath)) {
  console.log('✅ tailwind.config.ts presente');
  
  const content = fs.readFileSync(tailwindConfigPath, 'utf8');
  if (content.includes('content') && content.includes('app')) {
    console.log('✅ Configuración de contenido de Tailwind correcta');
  } else {
    console.log('⚠️ Configuración de contenido de Tailwind puede estar incompleta');
  }
} else {
  console.log('❌ tailwind.config.ts faltante');
}

// 3. Verificar configuración de PostCSS
console.log('\n🔧 Verificando configuración de PostCSS...');
const postcssConfigPath = path.join(process.cwd(), 'postcss.config.mjs');
if (fs.existsSync(postcssConfigPath)) {
  console.log('✅ postcss.config.mjs presente');
  
  const content = fs.readFileSync(postcssConfigPath, 'utf8');
  if (content.includes('tailwindcss') && content.includes('autoprefixer')) {
    console.log('✅ Plugins de PostCSS configurados correctamente');
  } else {
    console.log('⚠️ Plugins de PostCSS pueden estar faltantes');
  }
} else {
  console.log('❌ postcss.config.mjs faltante');
}

// 4. Verificar importación en layout
console.log('\n📄 Verificando importación en layout...');
const layoutPath = path.join(process.cwd(), 'app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  console.log('✅ app/layout.tsx presente');
  
  const content = fs.readFileSync(layoutPath, 'utf8');
  if (content.includes('./globals.css') || content.includes('globals.css')) {
    console.log('✅ Estilos globales importados en layout');
  } else {
    console.log('❌ Estilos globales no importados en layout');
  }
} else {
  console.log('❌ app/layout.tsx faltante');
}

// 5. Verificar dependencias de estilos
console.log('\n📦 Verificando dependencias de estilos...');
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const styleDeps = ['tailwindcss', 'autoprefixer', 'postcss'];
  const missingDeps = styleDeps.filter(dep => !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]);
  
  if (missingDeps.length > 0) {
    console.log(`⚠️ Dependencias faltantes: ${missingDeps.join(', ')}`);
  } else {
    console.log('✅ Todas las dependencias de estilos están presentes');
  }
}

// 6. Limpiar caché y reinstalar
console.log('\n🧹 Limpiando caché y reinstalando...');
try {
  // Limpiar directorio .next
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('✅ Directorio .next eliminado');
  }
  
  // Reinstalar dependencias
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencias reinstaladas');
  
} catch (error) {
  console.log('❌ Error durante la limpieza:', error.message);
}

console.log('\n🎯 RECOMENDACIONES POST-FIX:');
console.log('============================');
console.log('1. Reiniciar el servidor: npm run dev');
console.log('2. Verificar que los estilos se cargan correctamente');
console.log('3. Comprobar que Tailwind CSS funciona');
console.log('4. Verificar que no hay errores 404 en archivos CSS/JS');
console.log('5. Limpiar caché del navegador si es necesario');

console.log('\n✅ Verificación de estilos completada.'); 