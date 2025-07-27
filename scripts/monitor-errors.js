#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('👁️ MONITOR DE ERRORES EN TIEMPO REAL');
console.log('====================================\n');

console.log('🚀 Iniciando monitoreo...');
console.log('Presiona Ctrl+C para detener\n');

// Función para analizar errores
function analyzeError(error) {
  const errorStr = error.toString();
  
  // Categorizar errores
  if (errorStr.includes('ENOENT')) {
    return {
      type: 'MISSING_FILE',
      severity: 'HIGH',
      message: 'Archivo no encontrado',
      details: errorStr.match(/ENOENT: no such file or directory, (.*)/)?.[1] || errorStr
    };
  }
  
  if (errorStr.includes('Cannot find module')) {
    return {
      type: 'MODULE_NOT_FOUND',
      severity: 'HIGH',
      message: 'Módulo no encontrado',
      details: errorStr.match(/Cannot find module '(.*)'/)?.[1] || errorStr
    };
  }
  
  if (errorStr.includes('Failed to read source code')) {
    return {
      type: 'SOURCE_READ_ERROR',
      severity: 'MEDIUM',
      message: 'Error al leer código fuente',
      details: errorStr.match(/Failed to read source code from (.*)/)?.[1] || errorStr
    };
  }
  
  if (errorStr.includes('webpack.cache.PackFileCacheStrategy')) {
    return {
      type: 'WEBPACK_CACHE_ERROR',
      severity: 'LOW',
      message: 'Error de cache de webpack',
      details: 'Cache corrupto - limpiar .next'
    };
  }
  
  if (errorStr.includes('Fast Refresh')) {
    return {
      type: 'FAST_REFRESH_ERROR',
      severity: 'MEDIUM',
      message: 'Error de Fast Refresh',
      details: 'Recarga completa requerida'
    };
  }
  
  return {
    type: 'UNKNOWN',
    severity: 'MEDIUM',
    message: 'Error desconocido',
    details: errorStr
  };
}

// Función para sugerir soluciones
function suggestSolution(error) {
  switch (error.type) {
    case 'MISSING_FILE':
      return [
        '🔧 Soluciones:',
        '1. Verificar que el archivo existe',
        '2. Corregir la ruta del import',
        '3. Ejecutar: node scripts/fix-common-issues.js'
      ];
    
    case 'MODULE_NOT_FOUND':
      return [
        '🔧 Soluciones:',
        '1. Verificar que la dependencia está instalada',
        '2. Ejecutar: npm install',
        '3. Verificar el nombre del módulo'
      ];
    
    case 'SOURCE_READ_ERROR':
      return [
        '🔧 Soluciones:',
        '1. Verificar permisos del archivo',
        '2. Verificar que el archivo no esté corrupto',
        '3. Limpiar cache: rm -rf .next'
      ];
    
    case 'WEBPACK_CACHE_ERROR':
      return [
        '🔧 Soluciones:',
        '1. Limpiar cache: rm -rf .next',
        '2. Reiniciar el servidor de desarrollo',
        '3. Verificar espacio en disco'
      ];
    
    case 'FAST_REFRESH_ERROR':
      return [
        '🔧 Soluciones:',
        '1. Recargar la página manualmente',
        '2. Verificar errores de sintaxis',
        '3. Reiniciar el servidor de desarrollo'
      ];
    
    default:
      return [
        '🔧 Soluciones generales:',
        '1. Revisar la consola del navegador',
        '2. Verificar logs del servidor',
        '3. Ejecutar: node scripts/diagnose-all-issues.js'
      ];
  }
}

// Función para mostrar estadísticas
let errorStats = {
  total: 0,
  byType: {},
  bySeverity: {}
};

function updateStats(error) {
  errorStats.total++;
  errorStats.byType[error.type] = (errorStats.byType[error.type] || 0) + 1;
  errorStats.bySeverity[error.severity] = (errorStats.bySeverity[error.severity] || 0) + 1;
}

function showStats() {
  console.log('\n📊 ESTADÍSTICAS DE ERRORES:');
  console.log(`Total: ${errorStats.total}`);
  console.log('Por tipo:');
  Object.entries(errorStats.byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  console.log('Por severidad:');
  Object.entries(errorStats.bySeverity).forEach(([severity, count]) => {
    console.log(`  ${severity}: ${count}`);
  });
}

// Función para iniciar el servidor de desarrollo
function startDevServer() {
  console.log('🚀 Iniciando servidor de desarrollo...\n');
  
  const devProcess = spawn('npm', ['run', 'dev'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true
  });
  
  // Capturar stdout (logs normales)
  devProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);
  });
  
  // Capturar stderr (errores)
  devProcess.stderr.on('data', (data) => {
    const error = data.toString();
    const analyzedError = analyzeError(error);
    
    updateStats(analyzedError);
    
    // Mostrar error con formato
    console.log('\n🚨 ERROR DETECTADO:');
    console.log('==================');
    console.log(`Tipo: ${analyzedError.type}`);
    console.log(`Severidad: ${analyzedError.severity}`);
    console.log(`Mensaje: ${analyzedError.message}`);
    console.log(`Detalles: ${analyzedError.details}`);
    
    // Mostrar soluciones
    const solutions = suggestSolution(analyzedError);
    solutions.forEach(solution => console.log(solution));
    
    console.log('\n' + '='.repeat(50) + '\n');
  });
  
  // Manejar cierre del proceso
  devProcess.on('close', (code) => {
    console.log(`\n🏁 Servidor cerrado con código: ${code}`);
    showStats();
  });
  
  // Manejar errores del proceso
  devProcess.on('error', (error) => {
    console.log('❌ Error al iniciar el servidor:', error.message);
  });
  
  // Manejar interrupción
  process.on('SIGINT', () => {
    console.log('\n🛑 Deteniendo monitoreo...');
    devProcess.kill();
    showStats();
    process.exit(0);
  });
  
  return devProcess;
}

// Función para monitorear archivos
function watchFiles() {
  console.log('👀 Monitoreando cambios en archivos...\n');
  
  const filesToWatch = [
    'hooks/use-auth.ts',
    'components/auth-guard.tsx',
    'middleware.ts',
    'lib/supabase-optimized.ts',
    'components/ui/use-toast.ts'
  ];
  
  filesToWatch.forEach(file => {
    if (fs.existsSync(file)) {
      fs.watch(file, (eventType, filename) => {
        console.log(`📝 Archivo modificado: ${file} (${eventType})`);
      });
    }
  });
}

// Función principal
function main() {
  console.log('🔍 Iniciando monitoreo completo...\n');
  
  // Iniciar monitoreo de archivos
  watchFiles();
  
  // Iniciar servidor de desarrollo
  const devProcess = startDevServer();
  
  // Mostrar estadísticas cada 30 segundos
  setInterval(() => {
    if (errorStats.total > 0) {
      showStats();
    }
  }, 30000);
}

// Ejecutar si es el script principal
if (require.main === module) {
  main();
}

module.exports = {
  analyzeError,
  suggestSolution,
  updateStats,
  showStats
}; 