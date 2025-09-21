#!/usr/bin/env node

/**
 * Script para construir la aplicación con configuración de rendimiento
 * Maneja automáticamente el cambio de configuración y restauración
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG_FILES = {
  original: 'next.config.mjs',
  performance: 'next.config.performance.simple.mjs', // Usar versión simplificada
  optimized: 'next.config.performance.simple.mjs'
};

const BACKUP_FILE = 'next.config.backup.mjs';

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m',   // Red
    reset: '\x1b[0m'     // Reset
  };
  
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function backupConfig() {
  if (checkFileExists(CONFIG_FILES.original)) {
    fs.copyFileSync(CONFIG_FILES.original, BACKUP_FILE);
    log(`✅ Configuración original respaldada en ${BACKUP_FILE}`, 'success');
    return true;
  }
  return false;
}

function restoreConfig() {
  if (checkFileExists(BACKUP_FILE)) {
    fs.copyFileSync(BACKUP_FILE, CONFIG_FILES.original);
    fs.unlinkSync(BACKUP_FILE);
    log(`✅ Configuración original restaurada`, 'success');
    return true;
  }
  return false;
}

function switchToPerformanceConfig() {
  if (!checkFileExists(CONFIG_FILES.performance)) {
    log(`❌ Archivo de configuración de rendimiento no encontrado: ${CONFIG_FILES.performance}`, 'error');
    log(`💡 Creando configuración de rendimiento básica...`, 'info');
    
    // Crear configuración básica si no existe
    createBasicPerformanceConfig();
  }
  
  fs.copyFileSync(CONFIG_FILES.performance, CONFIG_FILES.original);
  log(`✅ Cambiado a configuración de rendimiento`, 'success');
  return true;
}

function createBasicPerformanceConfig() {
  const basicConfig = `// Configuración básica de rendimiento generada automáticamente
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    optimizeCss: true,
    optimizeFonts: true,
  },
  
  images: {
    formats: ['image/webp', 'image/avif'],
    quality: 85,
  },
  
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\\\/]node_modules[\\\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
`;

  fs.writeFileSync(CONFIG_FILES.performance, basicConfig);
  log(`✅ Configuración básica creada: ${CONFIG_FILES.performance}`, 'success');
}

function runBuild() {
  try {
    log('🚀 Iniciando construcción con configuración de rendimiento...', 'info');
    
    // Ejecutar el build
    execSync('npm run build', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
    });
    
    log('✅ Construcción completada exitosamente', 'success');
    return true;
  } catch (error) {
    log(`❌ Error durante la construcción: ${error.message}`, 'error');
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const configType = args[0] || 'performance';
  
  log(`🔧 Constructor de rendimiento para Tenerife Paradise Tour`, 'info');
  log(`📁 Tipo de configuración: ${configType}`, 'info');
  
  try {
    // Verificar que estemos en el directorio correcto
    if (!checkFileExists('package.json')) {
      log('❌ No se encontró package.json. Ejecuta este script desde la raíz del proyecto.', 'error');
      process.exit(1);
    }
    
    // Respaldar configuración original
    if (!backupConfig()) {
      log('⚠️  No se pudo respaldar la configuración original', 'warning');
    }
    
    // Cambiar a configuración de rendimiento
    if (!switchToPerformanceConfig()) {
      log('❌ No se pudo cambiar a la configuración de rendimiento', 'error');
      process.exit(1);
    }
    
    // Ejecutar build
    if (!runBuild()) {
      log('❌ La construcción falló', 'error');
      process.exit(1);
    }
    
    // Restaurar configuración original
    restoreConfig();
    
    log('🎉 ¡Proceso completado exitosamente!', 'success');
    log('📊 La aplicación se construyó con optimizaciones de rendimiento', 'info');
    
  } catch (error) {
    log(`❌ Error inesperado: ${error.message}`, 'error');
    
    // Intentar restaurar configuración en caso de error
    try {
      restoreConfig();
      log('✅ Configuración restaurada después del error', 'success');
    } catch (restoreError) {
      log(`⚠️  No se pudo restaurar la configuración: ${restoreError.message}`, 'warning');
    }
    
    process.exit(1);
  }
}

// Ejecutar script
if (require.main === module) {
  main();
}

module.exports = { main, backupConfig, restoreConfig, switchToPerformanceConfig };
