#!/usr/bin/env node

/**
 * Script para analizar el tamaño del bundle y identificar dependencias pesadas
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

function analyzePackageJson() {
  log('📦 Analizando dependencias del package.json...', 'info');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Analizar dependencias de Radix UI
    const radixDeps = Object.keys(packageJson.dependencies || {})
      .filter(dep => dep.startsWith('@radix-ui/'));
    
    log(`🔍 Dependencias Radix UI encontradas: ${radixDeps.length}`, 'info');
    radixDeps.forEach(dep => {
      log(`  - ${dep}`, 'info');
    });
    
    // Analizar otras dependencias pesadas
    const heavyDeps = [
      '@tanstack/react-query',
      '@tanstack/react-virtual',
      'recharts',
      'stripe',
      'zustand',
      'react-window',
      'browser-image-compression'
    ];
    
    const foundHeavyDeps = heavyDeps.filter(dep => 
      packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
    );
    
    log(`⚖️  Dependencias pesadas encontradas: ${foundHeavyDeps.length}`, 'warning');
    foundHeavyDeps.forEach(dep => {
      log(`  - ${dep}`, 'warning');
    });
    
    return { radixDeps, foundHeavyDeps };
    
  } catch (error) {
    log(`❌ Error analizando package.json: ${error.message}`, 'error');
    return { radixDeps: [], foundHeavyDeps: [] };
  }
}

function checkUnusedDependencies() {
  log('🔍 Verificando dependencias no utilizadas...', 'info');
  
  try {
    // Verificar si depcheck está instalado
    try {
      execSync('npx depcheck --version', { stdio: 'pipe' });
      
      log('📊 Ejecutando análisis de dependencias no utilizadas...', 'info');
      const result = execSync('npx depcheck --json', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const analysis = JSON.parse(result);
      
      if (analysis.dependencies && analysis.dependencies.length > 0) {
        log(`⚠️  Dependencias no utilizadas encontradas: ${analysis.dependencies.length}`, 'warning');
        analysis.dependencies.forEach(dep => {
          log(`  - ${dep}`, 'warning');
        });
      } else {
        log('✅ No se encontraron dependencias no utilizadas', 'success');
      }
      
      if (analysis.devDependencies && analysis.devDependencies.length > 0) {
        log(`⚠️  Dev Dependencias no utilizadas: ${analysis.devDependencies.length}`, 'warning');
        analysis.devDependencies.forEach(dep => {
          log(`  - ${dep}`, 'warning');
        });
      }
      
    } catch (error) {
      log('💡 Instala depcheck para análisis automático: npm install -g depcheck', 'info');
    }
    
  } catch (error) {
    log(`❌ Error verificando dependencias: ${error.message}`, 'error');
  }
}

function generateOptimizationReport() {
  log('📋 Generando reporte de optimización...', 'info');
  
  const report = {
    timestamp: new Date().toISOString(),
    recommendations: [
      {
        category: 'Bundle Size',
        priority: 'high',
        items: [
          'Considerar tree-shaking para Radix UI',
          'Implementar lazy loading para componentes pesados',
          'Optimizar imports de Lucide React',
          'Revisar uso de recharts vs alternativas más ligeras'
        ]
      },
      {
        category: 'Dependencies',
        priority: 'medium',
        items: [
          'Auditar dependencias de Radix UI no utilizadas',
          'Considerar alternativas más ligeras para algunas librerías',
          'Implementar dynamic imports para librerías pesadas'
        ]
      },
      {
        category: 'Performance',
        priority: 'high',
        items: [
          'Implementar Service Worker para caché offline',
          'Optimizar imágenes con WebP/AVIF',
          'Implementar virtualización para listas largas',
          'Usar React.memo en componentes que se re-renderizan frecuentemente'
        ]
      }
    ]
  };
  
  fs.writeFileSync('bundle-optimization-report.json', JSON.stringify(report, null, 2));
  log('✅ Reporte guardado en bundle-optimization-report.json', 'success');
}

function main() {
  log('📊 Análisis de Bundle Size - Tenerife Paradise Tour', 'info');
  log('==================================================', 'info');
  
  try {
    // Verificar que estemos en el directorio correcto
    if (!fs.existsSync('package.json')) {
      log('❌ No se encontró package.json. Ejecuta este script desde la raíz del proyecto.', 'error');
      process.exit(1);
    }
    
    // Analizar package.json
    const analysis = analyzePackageJson();
    log('');
    
    // Verificar dependencias no utilizadas
    checkUnusedDependencies();
    log('');
    
    // Generar reporte
    generateOptimizationReport();
    log('');
    
    log('🎉 Análisis completado', 'success');
    log('📈 Revisa bundle-optimization-report.json para recomendaciones detalladas', 'info');
    
  } catch (error) {
    log(`❌ Error inesperado: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Ejecutar script
if (require.main === module) {
  main();
}

module.exports = { main, analyzePackageJson, checkUnusedDependencies };


