#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 CORRECCIÓN AUTOMÁTICA DE PROBLEMAS COMUNES');
console.log('=============================================\n');

let fixesApplied = 0;

// 1. Limpiar cache de Next.js
console.log('🗂️ 1. Limpiando cache de Next.js...');
try {
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
    console.log('✅ Cache eliminado');
    fixesApplied++;
  } else {
    console.log('ℹ️ No hay cache para limpiar');
  }
} catch (error) {
  console.log('⚠️ Error al limpiar cache:', error.message);
}

// 2. Verificar y corregir imports rotos
console.log('\n🔗 2. Verificando imports rotos...');
const filesToFix = [
  'components/ui/toaster.tsx',
  'components/ui/image-upload.tsx',
  'components/admin/service-form.tsx'
];

filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Corregir import de use-toast
    if (content.includes('@/hooks/use-toast')) {
      content = content.replace(/@\/hooks\/use-toast/g, '@/components/ui/use-toast');
      modified = true;
      console.log(`✅ Corregido import en ${file}`);
    }
    
    if (modified) {
      fs.writeFileSync(file, content);
      fixesApplied++;
    }
  }
});

// 3. Verificar archivo use-toast.ts
console.log('\n📝 3. Verificando archivo use-toast.ts...');
if (!fs.existsSync('components/ui/use-toast.ts')) {
  console.log('❌ Archivo use-toast.ts faltante en components/ui/');
  console.log('⚠️ Este archivo debe existir para que funcionen las notificaciones');
} else {
  console.log('✅ Archivo use-toast.ts presente');
}

// 4. Reinstalar dependencias
console.log('\n📦 4. Reinstalando dependencias...');
try {
  console.log('Ejecutando npm install...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencias reinstaladas');
  fixesApplied++;
} catch (error) {
  console.log('⚠️ Error al reinstalar dependencias:', error.message);
}

// 5. Verificar configuración de Next.js
console.log('\n⚙️ 5. Verificando configuración de Next.js...');
if (fs.existsSync('next.config.mjs')) {
  const configContent = fs.readFileSync('next.config.mjs', 'utf8');
  
  // Simplificar configuración si es muy compleja
  if (configContent.includes('experimental') && configContent.includes('turbo')) {
    console.log('⚠️ Configuración experimental detectada - considerar simplificar');
  }
}

// 6. Verificar archivos críticos
console.log('\n📁 6. Verificando archivos críticos...');
const criticalFiles = [
  'hooks/use-auth.ts',
  'components/auth-guard.tsx',
  'middleware.ts',
  'lib/supabase-optimized.ts'
];

let missingCritical = false;
criticalFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`❌ CRÍTICO FALTANTE: ${file}`);
    missingCritical = true;
  } else {
    console.log(`✅ ${file}`);
  }
});

// 7. Verificar variables de entorno
console.log('\n🔐 7. Verificando variables de entorno...');
if (!fs.existsSync('.env.local')) {
  if (fs.existsSync('.env.example')) {
    console.log('⚠️ .env.local no encontrado - copiando desde .env.example');
    try {
      fs.copyFileSync('.env.example', '.env.local');
      console.log('✅ .env.local creado');
      fixesApplied++;
    } catch (error) {
      console.log('⚠️ Error al crear .env.local:', error.message);
    }
  } else {
    console.log('⚠️ No se encontró .env.example ni .env.local');
  }
} else {
  console.log('✅ .env.local presente');
}

// 8. Verificar estructura de carpetas
console.log('\n📂 8. Verificando estructura...');
const requiredDirs = ['app', 'components', 'hooks', 'lib', 'public'];
requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`❌ CARPETA FALTANTE: ${dir}/`);
  } else {
    console.log(`✅ ${dir}/`);
  }
});

// 9. Verificar package.json
console.log('\n📋 9. Verificando package.json...');
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Verificar scripts esenciales
  const requiredScripts = ['dev', 'build', 'start'];
  requiredScripts.forEach(script => {
    if (!packageJson.scripts[script]) {
      console.log(`⚠️ Script faltante: ${script}`);
    } else {
      console.log(`✅ Script: ${script}`);
    }
  });
  
  // Verificar dependencias críticas
  const criticalDeps = ['next', 'react', 'react-dom', '@supabase/supabase-js'];
  criticalDeps.forEach(dep => {
    if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
      console.log(`⚠️ Dependencia crítica faltante: ${dep}`);
    } else {
      console.log(`✅ Dependencia: ${dep}`);
    }
  });
}

// 10. Verificar TypeScript
console.log('\n🔷 10. Verificando TypeScript...');
if (fs.existsSync('tsconfig.json')) {
  console.log('✅ tsconfig.json presente');
} else {
  console.log('❌ tsconfig.json faltante');
}

// Resumen final
console.log('\n📋 RESUMEN DE CORRECCIONES');
console.log('==========================');
console.log(`🔧 Correcciones aplicadas: ${fixesApplied}`);

if (missingCritical) {
  console.log('\n🚨 PROBLEMAS CRÍTICOS:');
  console.log('- Algunos archivos críticos están faltantes');
  console.log('- El proyecto puede no funcionar correctamente');
  console.log('- Revisar la lista de archivos faltantes arriba');
} else {
  console.log('\n✅ ESTADO GENERAL:');
  console.log('- Archivos críticos presentes');
  console.log('- Estructura básica correcta');
}

console.log('\n🔧 PRÓXIMOS PASOS RECOMENDADOS:');
console.log('1. Ejecutar: npm run dev (para probar el servidor)');
console.log('2. Ejecutar: npm run build (para verificar el build)');
console.log('3. Revisar la consola del navegador para errores');
console.log('4. Verificar que todas las funcionalidades trabajen');

if (fixesApplied > 0) {
  console.log('\n🎉 ¡CORRECCIONES APLICADAS!');
  console.log('El proyecto debería estar en mejor estado ahora.');
} else {
  console.log('\nℹ️ No se aplicaron correcciones automáticas.');
  console.log('Revisar manualmente los problemas reportados.');
}

console.log('\n🏁 Corrección completada'); 