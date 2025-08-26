#!/usr/bin/env node

/**
 * Script simple para eliminar console.log de todos los archivos
 * TenerifeParadiseTour&Excursions
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Eliminando console.log de todos los archivos...\n');

// Función para eliminar console.log de un archivo
function removeConsoleLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let removedCount = 0;
    
    // Patrones para eliminar
    const patterns = [
      { regex: /console\.log\([^)]*\);?\s*\n/g, name: 'console.log' },
      { regex: /console\.warn\([^)]*\);?\s*\n/g, name: 'console.warn' },
      { regex: /console\.error\([^)]*\);?\s*\n/g, name: 'console.error' },
      { regex: /console\.info\([^)]*\);?\s*\n/g, name: 'console.info' },
      { regex: /console\.debug\([^)]*\);?\s*\n/g, name: 'console.debug' }
    ];
    
    patterns.forEach(pattern => {
      const matches = content.match(pattern.regex);
      if (matches) {
        content = content.replace(pattern.regex, '\n');
        removedCount += matches.length;
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ ${path.basename(filePath)}: ${removedCount} console statements eliminados`);
    }
    
    return { modified, removedCount };
  } catch (error) {
    console.error(`  ❌ Error en ${filePath}:`, error.message);
    return { modified: false, removedCount: 0 };
  }
}

// Función para procesar directorio recursivamente
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  let totalRemoved = 0;
  
  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (item !== 'node_modules' && item !== '.next' && item !== 'dist' && item !== '.git') {
        totalRemoved += processDirectory(fullPath);
      }
    } else if (['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(item))) {
      const result = removeConsoleLogs(fullPath);
      totalRemoved += result.removedCount;
    }
  });
  
  return totalRemoved;
}

// Directorios a procesar
const directories = ['components', 'hooks', 'lib', 'app'];
let grandTotal = 0;

console.log('📁 Procesando directorios...\n');

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`🔍 Procesando ${dir}/`);
    const removed = processDirectory(dir);
    grandTotal += removed;
  }
});

console.log(`\n🧹 Limpieza completada!`);
console.log(`📊 Total de console statements eliminados: ${grandTotal}`);
console.log('\n📋 Próximos pasos:');
console.log('1. Ejecutar: npm run lint');
console.log('2. Verificar que se redujeron los warnings');
console.log('3. Ejecutar: npm run build');
