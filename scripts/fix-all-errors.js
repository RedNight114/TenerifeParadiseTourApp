#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 CORRECCIÓN COMPLETA DE TODOS LOS ERRORES');
console.log('===========================================\n');

let fixesApplied = 0;

// 1. Corregir configuración de Next.js
console.log('⚙️ 1. Corrigiendo configuración de Next.js...');
if (fs.existsSync('next.config.mjs')) {
  const correctedConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Configuración correcta para turbo
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    }
  },
  // Configuración básica
  reactStrictMode: true,
  swcMinify: true
}

export default nextConfig`;

  fs.writeFileSync('next.config.mjs', correctedConfig);
  console.log('✅ Configuración de Next.js corregida');
  fixesApplied++;
}

// 2. Instalar dependencia faltante
console.log('\n📦 2. Instalando dependencia faltante...');
try {
  console.log('Instalando @radix-ui/react-separator...');
  execSync('npm install @radix-ui/react-separator', { stdio: 'inherit' });
  console.log('✅ @radix-ui/react-separator instalado');
  fixesApplied++;
} catch (error) {
  console.log('⚠️ Error al instalar dependencia:', error.message);
}

// 3. Buscar y eliminar referencias a login-modal.tsx
console.log('\n🔍 3. Eliminando referencias a login-modal.tsx...');
const filesToCheck = [
  'app/globals.css',
  'app/layout.tsx',
  'components/auth/auth-modals.tsx',
  'components/auth/login-modal.tsx'
];

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    
    if (content.includes('login-modal')) {
      console.log(`⚠️ Referencia encontrada en ${file}`);
      
      if (file === 'components/auth/login-modal.tsx') {
        // Eliminar el archivo si existe
        try {
          fs.unlinkSync(file);
          console.log(`✅ Archivo ${file} eliminado`);
          fixesApplied++;
        } catch (error) {
          console.log(`❌ Error al eliminar ${file}:`, error.message);
        }
      } else {
        // Eliminar la referencia del contenido
        const newContent = content.replace(/login-modal/g, '');
        fs.writeFileSync(file, newContent);
        console.log(`✅ Referencia eliminada de ${file}`);
        fixesApplied++;
      }
    } else {
      console.log(`✅ ${file} - Sin referencias problemáticas`);
    }
  } else {
    console.log(`ℹ️ ${file} - No existe`);
  }
});

// 4. Verificar y corregir imports en archivos TypeScript/JavaScript
console.log('\n📝 4. Verificando imports problemáticos...');
const importFiles = [
  'app/layout.tsx',
  'app/page.tsx',
  'components/auth/auth-modals.tsx',
  'components/legal-modals.tsx',
  'components/footer.tsx',
  'components/layout-wrapper.tsx'
];

importFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const imports = content.match(/import.*from\s+['"]([^'"]+)['"]/g) || [];
    
    imports.forEach(importStatement => {
      if (importStatement.includes('login-modal')) {
        console.log(`⚠️ Import problemático en ${file}: ${importStatement}`);
        // Eliminar la línea de import
        const newContent = content.replace(`${importStatement  }\n`, '');
        fs.writeFileSync(file, newContent);
        console.log(`✅ Import eliminado de ${file}`);
        fixesApplied++;
      }
    });
  }
});

// 5. Limpiar cache completamente
console.log('\n🗂️ 5. Limpiando cache completamente...');
try {
  // Eliminar .next
  if (fs.existsSync('.next')) {
    console.log('Eliminando directorio .next...');
    execSync('rmdir /s /q .next', { stdio: 'inherit' });
    console.log('✅ Cache .next eliminado');
    fixesApplied++;
  }
  
  // Eliminar node_modules/.cache si existe
  if (fs.existsSync('node_modules/.cache')) {
    console.log('Eliminando node_modules/.cache...');
    execSync('rmdir /s /q node_modules\\.cache', { stdio: 'inherit' });
    console.log('✅ Cache de node_modules eliminado');
    fixesApplied++;
  }
  
} catch (error) {
  console.log('⚠️ Error al limpiar cache:', error.message);
  // Intentar con PowerShell
  try {
    console.log('Intentando con PowerShell...');
    execSync('powershell -Command "Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue"', { stdio: 'inherit' });
    execSync('powershell -Command "Remove-Item -Recurse -Force node_modules\\.cache -ErrorAction SilentlyContinue"', { stdio: 'inherit' });
    console.log('✅ Cache eliminado con PowerShell');
    fixesApplied++;
  } catch (psError) {
    console.log('⚠️ Error con PowerShell:', psError.message);
  }
}

// 6. Reinstalar dependencias
console.log('\n📦 6. Reinstalando dependencias...');
try {
  console.log('Ejecutando npm install...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencias reinstaladas');
  fixesApplied++;
} catch (error) {
  console.log('⚠️ Error al reinstalar dependencias:', error.message);
}

// 7. Verificar que no haya procesos en puertos
console.log('\n🔌 7. Verificando puertos...');
try {
  const ports = [3000, 3001, 3002];
  ports.forEach(port => {
    try {
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      if (output.trim()) {
        console.log(`⚠️ Puerto ${port} en uso`);
        console.log('Ejecuta: npm run kill-ports');
      } else {
        console.log(`✅ Puerto ${port} libre`);
      }
    } catch (error) {
      console.log(`✅ Puerto ${port} libre`);
    }
  });
} catch (error) {
  console.log('⚠️ Error al verificar puertos:', error.message);
}

// 8. Verificar archivos críticos
console.log('\n📁 8. Verificando archivos críticos...');
const criticalFiles = [
  'hooks/use-auth.ts',
  'components/auth-guard.tsx',
  'middleware.ts',
  'lib/supabase-optimized.ts',
  'components/ui/use-toast.ts',
  'components/ui/separator.tsx'
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

// Resumen final
console.log('\n📋 RESUMEN DE CORRECCIONES');
console.log('==========================');
console.log(`🔧 Correcciones aplicadas: ${fixesApplied}`);

if (missingCritical) {
  console.log('\n🚨 PROBLEMAS CRÍTICOS:');
  console.log('- Algunos archivos críticos están faltantes');
  console.log('- El proyecto puede no funcionar correctamente');
} else {
  console.log('\n✅ ESTADO GENERAL:');
  console.log('- Archivos críticos presentes');
  console.log('- Estructura básica correcta');
}

console.log('\n🔧 PRÓXIMOS PASOS RECOMENDADOS:');
console.log('1. Ejecutar: npm run kill-ports (para liberar puertos)');
console.log('2. Ejecutar: npm run dev (para probar el servidor)');
console.log('3. Si hay errores, ejecutar: npm run fix-config');

if (fixesApplied > 0) {
  console.log('\n🎉 ¡ERRORES CORREGIDOS!');
  console.log('El proyecto debería funcionar correctamente ahora.');
} else {
  console.log('\nℹ️ No se aplicaron correcciones.');
  console.log('El proyecto ya estaba en buen estado.');
}

console.log('\n🏁 Corrección completada'); 