#!/usr/bin/env node

/**
 * Script corregido para eliminar console.log de todos los archivos
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
    
    // Patrones para eliminar (usando strings simples para buscar)
    const patterns = [
      { search: 'console.log(', replace: '', name: 'console.log' },
      { search: 'console.warn(', replace: '', name: 'console.warn' },
      { search: 'console.error(', replace: '', name: 'console.error' },
      { search: 'console.info(', replace: '', name: 'console.info' },
      { search: 'console.debug(', replace: '', name: 'console.debug' }
    ];
    
    patterns.forEach(pattern => {
      // Contar ocurrencias antes
      const beforeCount = (content.match(new RegExp(pattern.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      
      if (beforeCount > 0) {
        // Reemplazar usando regex más específico
        const regex = new RegExp(`\\s*${pattern.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^)]*\\);?\\s*\\n?`, 'g');
        content = content.replace(regex, '\n');
        
        removedCount += beforeCount;
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

