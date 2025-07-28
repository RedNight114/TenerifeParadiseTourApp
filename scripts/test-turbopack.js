const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 Probando Turbopack de manera segura...\n');

// 1. Verificar configuración actual
console.log('⚙️ Verificando configuración actual...');
const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
if (fs.existsSync(nextConfigPath)) {
  const configContent = fs.readFileSync(nextConfigPath, 'utf8');
  
  if (configContent.includes('turbo: false')) {
    console.log('✅ Turbopack deshabilitado en configuración');
  } else if (configContent.includes('turbo: {')) {
    console.log('⚠️ Turbopack habilitado en configuración');
  } else {
    console.log('ℹ️ Configuración de turbo no encontrada');
  }
} else {
  console.log('❌ next.config.mjs no encontrado');
}

// 2. Crear configuración de prueba para Turbopack
console.log('\n🔧 Creando configuración de prueba para Turbopack...');
const testConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    // Configuración de prueba para Turbopack
    turbo: {
      resolveAlias: {
        '@': '.',
        '@/components': './components',
        '@/lib': './lib',
        '@/hooks': './hooks',
        '@/app': './app',
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kykyyqga68e5j72o.public.blob.vercel-storage.com',
        port: '',
        pathname: '/uploads/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '.',
      '@/components': './components',
      '@/lib': './lib',
      '@/hooks': './hooks',
      '@/app': './app',
    }
    return config
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
}

export default nextConfig`;

// Guardar configuración de prueba
fs.writeFileSync('next.config.turbo.mjs', testConfig);
console.log('✅ Configuración de prueba creada: next.config.turbo.mjs');

// 3. Crear script de prueba
console.log('\n📝 Creando script de prueba...');
const testScript = `#!/bin/bash
echo "🧪 Probando Turbopack..."

# Hacer backup de la configuración actual
cp next.config.mjs next.config.backup.mjs

# Usar configuración de prueba
cp next.config.turbo.mjs next.config.mjs

# Limpiar caché
rm -rf .next

# Probar Turbopack
echo "🚀 Iniciando servidor con Turbopack..."
timeout 30s npm run dev:turbo || echo "⏰ Timeout alcanzado"

# Restaurar configuración original
cp next.config.backup.mjs next.config.mjs

echo "✅ Prueba completada"
`;

fs.writeFileSync('scripts/test-turbopack.sh', testScript);
console.log('✅ Script de prueba creado: scripts/test-turbopack.sh');

// 4. Crear script de PowerShell para Windows
const testScriptPs = `Write-Host "🧪 Probando Turbopack..." -ForegroundColor Yellow

# Hacer backup de la configuración actual
if (Test-Path "next.config.mjs") {
    Copy-Item "next.config.mjs" "next.config.backup.mjs"
    Write-Host "✅ Backup creado" -ForegroundColor Green
}

# Usar configuración de prueba
if (Test-Path "next.config.turbo.mjs") {
    Copy-Item "next.config.turbo.mjs" "next.config.mjs"
    Write-Host "✅ Configuración de prueba aplicada" -ForegroundColor Green
}

# Limpiar caché
if (Test-Path ".next") {
    Remove-Item ".next" -Recurse -Force
    Write-Host "✅ Caché limpiado" -ForegroundColor Green
}

# Probar Turbopack
Write-Host "🚀 Iniciando servidor con Turbopack..." -ForegroundColor Cyan
try {
    Start-Process -FilePath "npm" -ArgumentList "run", "dev:turbo" -NoNewWindow -Wait -TimeoutSec 30
} catch {
    Write-Host "⏰ Timeout alcanzado o error" -ForegroundColor Yellow
}

# Restaurar configuración original
if (Test-Path "next.config.backup.mjs") {
    Copy-Item "next.config.backup.mjs" "next.config.mjs"
    Write-Host "✅ Configuración original restaurada" -ForegroundColor Green
}

Write-Host "✅ Prueba completada" -ForegroundColor Green`;

fs.writeFileSync('scripts/test-turbopack.ps1', testScriptPs);
console.log('✅ Script de PowerShell creado: scripts/test-turbopack.ps1');

// 5. Instrucciones
console.log('\n🎯 INSTRUCCIONES PARA PROBAR TURBOPACK:');
console.log('========================================');
console.log('1. Para probar Turbopack manualmente:');
console.log('   - Ejecuta: powershell -ExecutionPolicy Bypass -File scripts/test-turbopack.ps1');
console.log('');
console.log('2. Para usar Turbopack directamente:');
console.log('   - Copia: next.config.turbo.mjs a next.config.mjs');
console.log('   - Ejecuta: npm run dev:turbo');
console.log('');
console.log('3. Para volver a configuración normal:');
console.log('   - Restaura: next.config.backup.mjs a next.config.mjs');
console.log('   - Ejecuta: npm run dev');
console.log('');
console.log('⚠️ NOTAS:');
console.log('========');
console.log('• Turbopack es experimental y puede tener problemas');
console.log('• Si hay errores, usa la configuración normal');
console.log('• Los scripts de prueba tienen timeout de 30 segundos');
console.log('• Siempre se restaura la configuración original');

console.log('\n✅ Scripts de prueba creados. Usa los comandos arriba para probar Turbopack.'); 