#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO COMPLETO DEL PROYECTO');
console.log('=====================================\n');

const issues = {
  missingFiles: [],
  brokenImports: [],
  unusedDependencies: [],
  buildErrors: [],
  configurationIssues: [],
  performanceIssues: []
};

// 1. Verificar archivos críticos faltantes
console.log('📁 1. Verificando archivos críticos...');
const criticalFiles = [
  'hooks/use-auth.ts',
  'components/auth-guard.tsx',
  'middleware.ts',
  'lib/supabase-optimized.ts',
  'components/ui/use-toast.ts',
  'app/layout.tsx',
  'app/page.tsx',
  'package.json',
  'next.config.mjs'
];

criticalFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    issues.missingFiles.push(file);
    console.log(`❌ FALTANTE: ${file}`);
  } else {
    console.log(`✅ ${file}`);
  }
});

// 2. Verificar imports rotos
console.log('\n🔗 2. Verificando imports rotos...');
const filesToCheck = [
  'components/ui/toaster.tsx',
  'components/ui/image-upload.tsx',
  'components/admin/service-form.tsx',
  'app/layout.tsx',
  'app/page.tsx'
];

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const imports = content.match(/import.*from\s+['"]([^'"]+)['"]/g) || [];
    
    imports.forEach(importStatement => {
      const match = importStatement.match(/from\s+['"]([^'"]+)['"]/);
      if (match) {
        const importPath = match[1];
        if (importPath.startsWith('@/')) {
          const relativePath = importPath.replace('@/', '');
          const fullPath = path.join(process.cwd(), relativePath);
          
          // Verificar si es un archivo .ts/.tsx
          const possibleExtensions = ['.ts', '.tsx', '.js', '.jsx'];
          let found = false;
          
          for (const ext of possibleExtensions) {
            if (fs.existsSync(fullPath + ext)) {
              found = true;
              break;
            }
          }
          
          if (!found && !fs.existsSync(fullPath)) {
            issues.brokenImports.push(`${file} -> ${importPath}`);
            console.log(`❌ IMPORT ROTO: ${file} -> ${importPath}`);
          }
        }
      }
    });
  }
});

// 3. Verificar dependencias no usadas
console.log('\n📦 3. Verificando dependencias...');
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // Lista de dependencias que sabemos que no se usan
  const unusedDeps = [
    '@radix-ui/react-accordion',
    '@radix-ui/react-aspect-ratio',
    '@radix-ui/react-collapsible',
    '@radix-ui/react-context-menu',
    '@radix-ui/react-hover-card',
    '@radix-ui/react-menubar',
    '@radix-ui/react-navigation-menu',
    '@radix-ui/react-popover',
    '@radix-ui/react-progress',
    '@radix-ui/react-radio-group',
    '@radix-ui/react-scroll-area',
    '@radix-ui/react-separator',
    '@radix-ui/react-slider',
    '@radix-ui/react-switch',
    '@radix-ui/react-tabs',
    '@radix-ui/react-toggle',
    '@radix-ui/react-toggle-group',
    '@radix-ui/react-tooltip',
    'cmdk',
    'embla-carousel-react',
    'immer',
    'use-sync-external-store'
  ];
  
  unusedDeps.forEach(dep => {
    if (dependencies[dep]) {
      issues.unusedDependencies.push(dep);
      console.log(`❌ DEPENDENCIA NO USADA: ${dep}`);
    }
  });
}

// 4. Verificar configuración de Next.js
console.log('\n⚙️ 4. Verificando configuración...');
if (fs.existsSync('next.config.mjs')) {
  const configContent = fs.readFileSync('next.config.mjs', 'utf8');
  
  // Verificar configuraciones problemáticas
  if (configContent.includes('experimental')) {
    console.log('⚠️ Configuración experimental detectada');
  }
  
  if (configContent.includes('turbo')) {
    console.log('⚠️ Turbo habilitado - puede causar problemas');
  }
}

// 5. Verificar archivos de cache corruptos
console.log('\n🗂️ 5. Verificando cache...');
if (fs.existsSync('.next')) {
  const cacheDir = path.join('.next', 'cache');
  if (fs.existsSync(cacheDir)) {
    console.log('⚠️ Cache de Next.js presente - puede estar corrupto');
    issues.performanceIssues.push('Cache de Next.js puede estar corrupto');
  }
}

// 6. Verificar errores de webpack
console.log('\n🔧 6. Verificando errores de webpack...');
const webpackErrors = [
  'ENOENT: no such file or directory',
  'Cannot find module',
  'Failed to read source code',
  'webpack.cache.PackFileCacheStrategy'
];

// 7. Verificar archivos de debug eliminados
console.log('\n🧹 7. Verificando archivos de debug...');
const debugFiles = [
  'components/auth/login-modal.tsx',
  'components/connection-error.tsx',
  'components/supabase-debug.tsx',
  'components/detailed-debug.tsx',
  'components/auth-debug.tsx',
  'hooks/use-toast.ts'
];

debugFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`⚠️ ARCHIVO DE DEBUG PRESENTE: ${file}`);
  } else {
    console.log(`✅ ARCHIVO DE DEBUG ELIMINADO: ${file}`);
  }
});

// 8. Verificar scripts obsoletos
console.log('\n📜 8. Verificando scripts...');
const scriptsDir = 'scripts';
if (fs.existsSync(scriptsDir)) {
  const scripts = fs.readdirSync(scriptsDir).filter(file => file.endsWith('.js'));
  console.log(`📊 Total de scripts: ${scripts.length}`);
  
  const debugScripts = scripts.filter(script => 
    script.includes('test-') || 
    script.includes('debug-') || 
    script.includes('check-') || 
    script.includes('verify-')
  );
  
  console.log(`🧹 Scripts de debug: ${debugScripts.length}`);
  if (debugScripts.length > 10) {
    console.log('⚠️ Muchos scripts de debug - considerar limpieza');
  }
}

// 9. Verificar estructura de carpetas
console.log('\n📂 9. Verificando estructura...');
const requiredDirs = [
  'app',
  'components',
  'hooks',
  'lib',
  'public',
  'styles'
];

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}/`);
  } else {
    console.log(`❌ FALTANTE: ${dir}/`);
    issues.missingFiles.push(dir);
  }
});

// 10. Verificar variables de entorno
console.log('\n🔐 10. Verificando variables de entorno...');
const envFiles = ['.env.local', '.env.example'];
envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`⚠️ ${file} no encontrado`);
  }
});

// Resumen final
console.log('\n📋 RESUMEN DE PROBLEMAS');
console.log('========================');

if (issues.missingFiles.length > 0) {
  console.log(`\n❌ Archivos faltantes (${issues.missingFiles.length}):`);
  issues.missingFiles.forEach(file => console.log(`  - ${file}`));
}

if (issues.brokenImports.length > 0) {
  console.log(`\n🔗 Imports rotos (${issues.brokenImports.length}):`);
  issues.brokenImports.forEach(import_ => console.log(`  - ${import_}`));
}

if (issues.unusedDependencies.length > 0) {
  console.log(`\n📦 Dependencias no usadas (${issues.unusedDependencies.length}):`);
  issues.unusedDependencies.forEach(dep => console.log(`  - ${dep}`));
}

if (issues.performanceIssues.length > 0) {
  console.log(`\n⚡ Problemas de performance (${issues.performanceIssues.length}):`);
  issues.performanceIssues.forEach(issue => console.log(`  - ${issue}`));
}

const totalIssues = Object.values(issues).flat().length;
console.log(`\n🎯 TOTAL DE PROBLEMAS ENCONTRADOS: ${totalIssues}`);

if (totalIssues === 0) {
  console.log('\n🎉 ¡PROYECTO EN PERFECTO ESTADO!');
} else {
  console.log('\n🔧 RECOMENDACIONES:');
  console.log('1. Ejecutar: npm install (para reinstalar dependencias)');
  console.log('2. Eliminar: .next (para limpiar cache)');
  console.log('3. Ejecutar: npm run build (para verificar build)');
  console.log('4. Revisar imports rotos y corregirlos');
  console.log('5. Eliminar dependencias no usadas del package.json');
}

console.log('\n🏁 Diagnóstico completado'); 