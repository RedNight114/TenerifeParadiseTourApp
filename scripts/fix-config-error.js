#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 CORRECCIÓN DE ERROR DE CONFIGURACIÓN');
console.log('=======================================\n');

let fixesApplied = 0;

// 1. Verificar y corregir next.config.mjs
console.log('⚙️ 1. Verificando next.config.mjs...');
if (fs.existsSync('next.config.mjs')) {
  const configContent = fs.readFileSync('next.config.mjs', 'utf8');
  
  if (configContent.includes('module.exports')) {
    console.log('⚠️ Error detectado: module.exports en archivo .mjs');
    
    // Corregir la configuración
    const correctedConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Deshabilitar turbo temporalmente
    turbo: false
  },
  // Configuración básica
  reactStrictMode: true,
  swcMinify: true
}

export default nextConfig`;

    fs.writeFileSync('next.config.mjs', correctedConfig);
    console.log('✅ Configuración corregida (module.exports -> export default)');
    fixesApplied++;
  } else {
    console.log('✅ Configuración correcta');
  }
} else {
  console.log('❌ Archivo next.config.mjs no encontrado');
}

// 2. Limpiar cache completamente
console.log('\n🗂️ 2. Limpiando cache completamente...');
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

// 3. Buscar y eliminar referencias a login-modal.tsx
console.log('\n🔍 3. Buscando referencias a login-modal.tsx...');
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

// 4. Verificar imports en archivos TypeScript/JavaScript
console.log('\n📝 4. Verificando imports problemáticos...');
const importFiles = [
  'app/layout.tsx',
  'app/page.tsx',
  'components/auth/auth-modals.tsx'
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

// 5. Reinstalar dependencias
console.log('\n📦 5. Reinstalando dependencias...');
try {
  console.log('Ejecutando npm install...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencias reinstaladas');
  fixesApplied++;
} catch (error) {
  console.log('⚠️ Error al reinstalar dependencias:', error.message);
}

// 6. Verificar que no haya procesos en puertos
console.log('\n🔌 6. Verificando puertos...');
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

// Resumen final
console.log('\n📋 RESUMEN DE CORRECCIONES');
console.log('==========================');
console.log(`🔧 Correcciones aplicadas: ${fixesApplied}`);

console.log('\n🔧 PRÓXIMOS PASOS RECOMENDADOS:');
console.log('1. Ejecutar: npm run dev (para probar el servidor)');
console.log('2. Si hay problemas de puertos: npm run kill-ports');
console.log('3. Luego: npm run dev nuevamente');

if (fixesApplied > 0) {
  console.log('\n🎉 ¡ERRORES CORREGIDOS!');
  console.log('El proyecto debería funcionar correctamente ahora.');
} else {
  console.log('\nℹ️ No se aplicaron correcciones.');
  console.log('El proyecto ya estaba en buen estado.');
}

console.log('\n🏁 Corrección completada'); 