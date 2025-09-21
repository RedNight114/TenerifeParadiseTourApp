#!/usr/bin/env node

/**
 * Script de monitoreo de rendimiento para Tenerife Paradise Tour
 * Monitorea métricas en tiempo real
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function getFileSize(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return stats.size;
    }
    return 0;
  } catch (error) {
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  try {
    if (fs.existsSync(dirPath)) {
      const items = fs.readdirSync(dirPath);
      
      items.forEach(item => {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          totalSize += getDirectorySize(itemPath);
        } else {
          totalSize += stats.size;
        }
      });
    }
  } catch (error) {
    // Ignorar errores de permisos
  }
  
  return totalSize;
}

function checkBuildFiles() {
  log('📁 Verificando archivos de construcción...', 'info');
  
  const buildFiles = [
    '.next',
    'out',
    'node_modules'
  ];
  
  buildFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const size = getDirectorySize(file);
      log(`  📦 ${file}: ${formatBytes(size)}`, 'info');
    } else {
      log(`  ❌ ${file}: No encontrado`, 'warning');
    }
  });
}

function checkConfigFiles() {
  log('⚙️  Verificando archivos de configuración...', 'info');
  
  const configFiles = [
    'next.config.mjs',
    'next.config.performance.mjs',
    'next.config.optimized.mjs',
    'tailwind.config.ts',
    'tsconfig.json'
  ];
  
  configFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const size = getFileSize(file);
      log(`  📄 ${file}: ${formatBytes(size)}`, 'info');
    } else {
      log(`  ❌ ${file}: No encontrado`, 'warning');
    }
  });
}

function checkSourceFiles() {
  log('📝 Verificando archivos fuente...', 'info');
  
  const sourceDirs = [
    'app',
    'components',
    'lib',
    'hooks'
  ];
  
  let totalFiles = 0;
  let totalSize = 0;
  
  sourceDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        const files = getAllFiles(dir);
        const dirSize = files.reduce((acc, file) => acc + getFileSize(file), 0);
        
        log(`  📁 ${dir}: ${files.length} archivos, ${formatBytes(dirSize)}`, 'info');
        
        totalFiles += files.length;
        totalSize += dirSize;
      } catch (error) {
        log(`  ❌ ${dir}: Error al leer`, 'error');
      }
    } else {
      log(`  ❌ ${dir}: No encontrado`, 'warning');
    }
  });
  
  log(`  📊 Total: ${totalFiles} archivos, ${formatBytes(totalSize)}`, 'success');
}

function getAllFiles(dirPath) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        files.push(...getAllFiles(itemPath));
      } else {
        files.push(itemPath);
      }
    });
  } catch (error) {
    // Ignorar errores de permisos
  }
  
  return files;
}

function checkDependencies() {
  log('📦 Verificando dependencias...', 'info');
  
  try {
    if (fs.existsSync('package.json')) {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      const deps = Object.keys(packageJson.dependencies || {}).length;
      const devDeps = Object.keys(packageJson.devDependencies || {}).length;
      
      log(`  🔧 Dependencias: ${deps}`, 'info');
      log(`  🛠️  Dev Dependencias: ${devDeps}`, 'info');
      
      // Verificar node_modules
      if (fs.existsSync('node_modules')) {
        const nodeModulesSize = getDirectorySize('node_modules');
        log(`  📁 node_modules: ${formatBytes(nodeModulesSize)}`, 'info');
      }
    }
  } catch (error) {
    log(`  ❌ Error leyendo package.json: ${error.message}`, 'error');
  }
}

function checkPerformanceMetrics() {
  log('⚡ Métricas de rendimiento...', 'info');
  
  try {
    // Verificar si existe el directorio .next
    if (fs.existsSync('.next')) {
      const nextSize = getDirectorySize('.next');
      log(`  📊 Tamaño de build: ${formatBytes(nextSize)}`, 'info');
      
      // Verificar archivos específicos de rendimiento
      const performanceFiles = [
        '.next/static/chunks',
        '.next/static/css',
        '.next/static/js'
      ];
      
      performanceFiles.forEach(file => {
        if (fs.existsSync(file)) {
          const size = getDirectorySize(file);
          log(`    📁 ${path.basename(file)}: ${formatBytes(size)}`, 'info');
        }
      });
    } else {
      log(`  ⚠️  No se encontró directorio .next - Ejecuta 'npm run build' primero`, 'warning');
    }
  } catch (error) {
    log(`  ❌ Error verificando métricas: ${error.message}`, 'error');
  }
}

function showRecommendations() {
  log('💡 Recomendaciones de optimización:', 'info');
  
  const recommendations = [
    '🔍 Ejecuta "npm run build:performance" para construir con optimizaciones',
    '🧹 Ejecuta "npm run cache:clear" para limpiar caché',
    '📊 Usa el componente PerformanceMonitor en desarrollo',
    '⚡ Implementa lazy loading en componentes pesados',
    '🗜️  Utiliza el sistema de caché comprimido para datos',
    '📜 Implementa virtualización para listas largas'
  ];
  
  recommendations.forEach(rec => {
    log(`  ${rec}`, 'info');
  });
}

function main() {
  log('📊 Monitor de Rendimiento - Tenerife Paradise Tour', 'info');
  log('==================================================', 'info');
  
  try {
    // Verificar que estemos en el directorio correcto
    if (!fs.existsSync('package.json')) {
      log('❌ No se encontró package.json. Ejecuta este script desde la raíz del proyecto.', 'error');
      process.exit(1);
    }
    
    log('🚀 Iniciando análisis de rendimiento...\n', 'info');
    
    // Verificar archivos de construcción
    checkBuildFiles();
    log('');
    
    // Verificar archivos de configuración
    checkConfigFiles();
    log('');
    
    // Verificar archivos fuente
    checkSourceFiles();
    log('');
    
    // Verificar dependencias
    checkDependencies();
    log('');
    
    // Verificar métricas de rendimiento
    checkPerformanceMetrics();
    log('');
    
    // Mostrar recomendaciones
    showRecommendations();
    log('');
    
    log('🎉 Análisis de rendimiento completado', 'success');
    log('📈 El proyecto está listo para optimizaciones', 'info');
    
  } catch (error) {
    log(`❌ Error inesperado: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Ejecutar script
if (require.main === module) {
  main();
}

module.exports = { 
  main, 
  checkBuildFiles, 
  checkConfigFiles, 
  checkSourceFiles, 
  checkDependencies, 
  checkPerformanceMetrics 
};


