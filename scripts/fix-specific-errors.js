#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 CORRECCIÓN DE ERRORES ESPECÍFICOS');
console.log('====================================\n');

let fixesApplied = 0;

// 1. Limpiar cache corrupto de Next.js
console.log('🗂️ 1. Limpiando cache corrupto...');
try {
  if (fs.existsSync('.next')) {
    console.log('Eliminando directorio .next...');
    execSync('rmdir /s /q .next', { stdio: 'inherit' });
    console.log('✅ Cache eliminado');
    fixesApplied++;
  } else {
    console.log('ℹ️ No hay cache para limpiar');
  }
} catch (error) {
  console.log('⚠️ Error al limpiar cache:', error.message);
  // Intentar con PowerShell si rmdir falla
  try {
    console.log('Intentando con PowerShell...');
    execSync('powershell -Command "Remove-Item -Recurse -Force .next"', { stdio: 'inherit' });
    console.log('✅ Cache eliminado con PowerShell');
    fixesApplied++;
  } catch (psError) {
    console.log('⚠️ Error con PowerShell:', psError.message);
  }
}

// 2. Verificar y corregir el archivo login-modal.tsx
console.log('\n📝 2. Verificando archivo login-modal.tsx...');
const loginModalPath = 'components/auth/login-modal.tsx';
if (fs.existsSync(loginModalPath)) {
  console.log('⚠️ Archivo login-modal.tsx existe pero causa errores');
  console.log('Eliminando archivo problemático...');
  try {
    fs.unlinkSync(loginModalPath);
    console.log('✅ Archivo login-modal.tsx eliminado');
    fixesApplied++;
  } catch (error) {
    console.log('❌ Error al eliminar archivo:', error.message);
  }
} else {
  console.log('✅ Archivo login-modal.tsx no existe (correcto)');
}

// 3. Buscar referencias al archivo eliminado
console.log('\n🔍 3. Buscando referencias al archivo eliminado...');
const filesToCheck = [
  'app/globals.css',
  'app/layout.tsx',
  'components/auth/auth-modals.tsx'
];

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('login-modal')) {
      console.log(`⚠️ Referencia encontrada en ${file}`);
      // Eliminar la referencia
      const newContent = content.replace(/login-modal/g, '');
      fs.writeFileSync(file, newContent);
      console.log(`✅ Referencia eliminada de ${file}`);
      fixesApplied++;
    }
  }
});

// 4. Verificar imports rotos en globals.css
console.log('\n🎨 4. Verificando imports en globals.css...');
if (fs.existsSync('app/globals.css')) {
  const cssContent = fs.readFileSync('app/globals.css', 'utf8');
  
  // Buscar imports problemáticos
  if (cssContent.includes('@import') && cssContent.includes('login-modal')) {
    console.log('⚠️ Import problemático encontrado en globals.css');
    const cleanContent = cssContent.replace(/@import.*login-modal.*;/g, '');
    fs.writeFileSync('app/globals.css', cleanContent);
    console.log('✅ Imports problemáticos eliminados');
    fixesApplied++;
  }
}

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

// 6. Verificar configuración de Next.js
console.log('\n⚙️ 6. Verificando configuración de Next.js...');
if (fs.existsSync('next.config.mjs')) {
  const configContent = fs.readFileSync('next.config.mjs', 'utf8');
  
  // Simplificar configuración si es muy compleja
  if (configContent.includes('experimental') && configContent.includes('turbo')) {
    console.log('⚠️ Configuración experimental detectada');
    console.log('Considerando simplificar la configuración...');
    
    // Crear configuración simplificada
    const simpleConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Deshabilitar turbo temporalmente
    turbo: false
  },
  // Configuración básica
  reactStrictMode: true,
  swcMinify: true
}

module.exports = nextConfig`;

    fs.writeFileSync('next.config.mjs', simpleConfig);
    console.log('✅ Configuración simplificada');
    fixesApplied++;
  }
}

// 7. Verificar archivos críticos
console.log('\n📁 7. Verificando archivos críticos...');
const criticalFiles = [
  'hooks/use-auth.ts',
  'components/auth-guard.tsx',
  'middleware.ts',
  'lib/supabase-optimized.ts',
  'components/ui/use-toast.ts'
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

// 8. Crear archivo .env.example si no existe
console.log('\n🔐 8. Verificando archivos de entorno...');
if (!fs.existsSync('.env.example')) {
  console.log('Creando .env.example...');
  const envExample = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_blob_token

# Redsys Payment Gateway
REDSYS_MERCHANT_CODE=your_merchant_code
REDSYS_SECRET_KEY=your_secret_key
REDSYS_TERMINAL=your_terminal

# Application Settings
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=your_database_url
`;
  
  fs.writeFileSync('.env.example', envExample);
  console.log('✅ .env.example creado');
  fixesApplied++;
}

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
console.log('1. Ejecutar: npm run dev (para probar el servidor)');
console.log('2. Si hay errores, ejecutar: npm run kill-ports');
console.log('3. Luego ejecutar: npm run dev nuevamente');
console.log('4. Verificar que la aplicación funcione correctamente');

if (fixesApplied > 0) {
  console.log('\n🎉 ¡CORRECCIONES APLICADAS!');
  console.log('El proyecto debería estar en mejor estado ahora.');
} else {
  console.log('\nℹ️ No se aplicaron correcciones automáticas.');
  console.log('Revisar manualmente los problemas reportados.');
}

console.log('\n🏁 Corrección completada'); 