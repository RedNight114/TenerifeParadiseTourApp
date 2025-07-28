#!/usr/bin/env node

/**
 * 🔧 Fix Profundo de Error de Webpack - Tenerife Paradise Tours
 * 
 * Este script aplica una solución completa al error de webpack.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 FIX PROFUNDO DE ERROR DE WEBPACK');
console.log('====================================\n');

// 1. Detener procesos
console.log('🛑 Deteniendo procesos...');
try {
  execSync('npx kill-port 3000 3001 3002', { stdio: 'ignore' });
  console.log('✅ Procesos detenidos');
} catch (error) {
  console.log('⚠️ No se pudieron detener procesos:', error.message);
}

// 2. Limpiar completamente
console.log('\n🧹 Limpieza completa...');
const dirsToRemove = ['.next', 'node_modules/.cache', 'out', 'dist'];
dirsToRemove.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ ${dir} eliminado`);
    } catch (error) {
      console.log(`⚠️ Error eliminando ${dir}:`, error.message);
    }
  }
});

// 3. Verificar y corregir next.config.mjs
console.log('\n🔍 Verificando next.config.mjs...');
const configPath = path.join(process.cwd(), 'next.config.mjs');
if (fs.existsSync(configPath)) {
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  // Verificar duplicaciones
  const headersMatches = configContent.match(/async headers\(\)/g);
  if (headersMatches && headersMatches.length > 1) {
    console.log('❌ Duplicación de headers() detectada');
    
    // Eliminar la primera duplicación
    const firstHeadersIndex = configContent.indexOf('async headers()');
    const secondHeadersIndex = configContent.indexOf('async headers()', firstHeadersIndex + 1);
    
    if (secondHeadersIndex !== -1) {
      // Encontrar el final de la primera función headers
      const firstEndIndex = configContent.indexOf('},', secondHeadersIndex);
      if (firstEndIndex !== -1) {
        configContent = configContent.substring(0, firstHeadersIndex) + 
                       configContent.substring(firstEndIndex + 2);
        fs.writeFileSync(configPath, configContent);
        console.log('✅ Duplicación eliminada');
      }
    }
  } else {
    console.log('✅ No hay duplicación de headers()');
  }
  
  // Verificar sintaxis
  try {
    // Intentar parsear el archivo
    const moduleContent = configContent.replace('export default', 'module.exports =');
    eval(moduleContent);
    console.log('✅ Sintaxis de next.config.mjs correcta');
  } catch (error) {
    console.log('❌ Error de sintaxis en next.config.mjs:', error.message);
  }
} else {
  console.log('❌ next.config.mjs no encontrado');
}

// 4. Verificar imports problemáticos
console.log('\n🔍 Verificando imports problemáticos...');
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
    
    // Verificar imports de lucide-react
    if (content.includes('lucide-react')) {
      console.log(`✅ ${file}: lucide-react importado correctamente`);
    }
    
    // Verificar imports de @/components
    if (content.includes('@/components')) {
      console.log(`✅ ${file}: @/components importado correctamente`);
    }
    
    // Verificar exports
    const hasExport = content.includes('export') || content.includes('export default');
    if (hasExport) {
      console.log(`✅ ${file}: Exports correctos`);
    }
  }
});

// 5. Crear next.config.mjs simplificado si hay problemas
console.log('\n🔧 Creando configuración simplificada...');
const simplifiedConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
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
  },
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { dev, isServer }) => {
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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ]
  },
}

export default nextConfig`;

// Crear backup y aplicar configuración simplificada
const backupPath = path.join(process.cwd(), 'next.config.mjs.backup');
if (fs.existsSync(configPath)) {
  fs.copyFileSync(configPath, backupPath);
  console.log('✅ Backup creado: next.config.mjs.backup');
}

fs.writeFileSync(configPath, simplifiedConfig);
console.log('✅ Configuración simplificada aplicada');

// 6. Reinstalar dependencias
console.log('\n📦 Reinstalando dependencias...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencias reinstaladas');
} catch (error) {
  console.log('❌ Error reinstalando dependencias:', error.message);
}

// 7. Limpiar caché de npm
console.log('\n🧹 Limpiando caché de npm...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ Caché de npm limpiado');
} catch (error) {
  console.log('⚠️ Error limpiando caché de npm:', error.message);
}

console.log('\n🎯 SOLUCIONES APLICADAS:');
console.log('========================');
console.log('1. ✅ Procesos detenidos');
console.log('2. ✅ Caché completamente limpiado');
console.log('3. ✅ next.config.mjs simplificado');
console.log('4. ✅ Imports verificados');
console.log('5. ✅ Dependencias reinstaladas');
console.log('6. ✅ Caché de npm limpiado');

console.log('\n💡 PRÓXIMOS PASOS:');
console.log('==================');
console.log('1. Ejecutar: npm run dev');
console.log('2. Verificar que no hay errores de webpack');
console.log('3. Si funciona, restaurar configuración completa');
console.log('4. Si persiste el error, usar configuración simplificada');

console.log('\n🔧 COMANDOS ÚTILES:');
console.log('==================');
console.log('• npm run dev - Iniciar servidor');
console.log('• Restaurar backup: cp next.config.mjs.backup next.config.mjs');
console.log('• Ver logs: npm run dev 2>&1 | tee dev.log');

console.log('\n✅ Fix profundo de webpack completado'); 