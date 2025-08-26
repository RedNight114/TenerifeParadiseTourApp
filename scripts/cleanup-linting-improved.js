#!/usr/bin/env node

/**
 * Script de limpieza mejorado para problemas de linting
 * TenerifeParadiseTour&Excursions
 * 
 * Uso: node scripts/cleanup-linting-improved.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Iniciando limpieza mejorada de linting...\n');

// Función para buscar y reemplazar en archivos con mejor manejo de errores
function replaceInFile(filePath, patterns) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let changes = [];
    
    patterns.forEach(({ search, replace, description }) => {
      if (content.includes(search)) {
        const beforeCount = (content.match(new RegExp(search, 'g')) || []).length;
        content = content.replace(new RegExp(search, 'g'), replace);
        const afterCount = (content.match(new RegExp(replace, 'g')) || []).length;
        
        if (beforeCount > 0) {
          modified = true;
          changes.push(`${description}: ${beforeCount} → ${afterCount}`);
        }
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ ${path.basename(filePath)}: ${changes.join(', ')}`);
    }
    
    return { modified, changes };
  } catch (error) {
    console.error(`  ❌ Error procesando ${filePath}:`, error.message);
    return { modified: false, changes: [] };
  }
}

// Patrones de limpieza mejorados
const cleanupPatterns = [
  // Eliminar console.log de producción (más específicos)
  {
    search: /console\.log\([^)]*\);?\s*\n/g,
    replace: '\n',
    description: 'Eliminando console.log'
  },
  {
    search: /console\.warn\([^)]*\);?\s*\n/g,
    replace: '\n',
    description: 'Eliminando console.warn'
  },
  {
    search: /console\.error\([^)]*\);?\s*\n/g,
    replace: '\n',
    description: 'Eliminando console.error'
  },
  {
    search: /console\.info\([^)]*\);?\s*\n/g,
    replace: '\n',
    description: 'Eliminando console.info'
  },
  {
    search: /console\.debug\([^)]*\);?\s*\n/g,
    replace: '\n',
    description: 'Eliminando console.debug'
  },
  
  // Corregir tipos any más específicamente
  {
    search: /: any(?=\s*[=,;\)\]]|$)/g,
    replace: ': unknown',
    description: 'Reemplazando any por unknown'
  },
  {
    search: /: any\[\]/g,
    replace: ': unknown[]',
    description: 'Reemplazando any[] por unknown[]'
  },
  
  // Corregir variables no utilizadas
  {
    search: /const ([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*[^;]+;\s*\/\/\s*unused/g,
    replace: '// const $1 = ...; // unused',
    description: 'Comentando variables no utilizadas'
  },
  
  // Eliminar imports no utilizados
  {
    search: /import\s+\{[^}]*\}\s+from\s+['"][^'"]+['"]\s*;?\s*\/\/\s*unused/g,
    replace: '// import { ... } from "..."; // unused',
    description: 'Comentando imports no utilizados'
  },
  
  // Corregir tipos any en parámetros de función
  {
    search: /\([^)]*: any[^)]*\)/g,
    replace: (match) => match.replace(/: any/g, ': unknown'),
    description: 'Corrigiendo any en parámetros de función'
  }
];

// Directorios a procesar
const directories = [
  'components',
  'hooks', 
  'lib',
  'app'
];

// Extensiones de archivo a procesar
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

// Archivos específicos a procesar primero (prioridad alta)
const priorityFiles = [
  'lib/chat-service.ts',
  'lib/advanced-logger.ts',
  'lib/supabase-client.ts',
  'lib/supabase-optimized.ts',
  'hooks/use-chat.ts',
  'hooks/use-services-optimized.ts',
  'components/ui/image-upload.tsx',
  'components/ui/optimized-image.tsx'
];

// Función para procesar archivo individual
function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  Archivo no encontrado: ${filePath}`);
    return { modified: false, changes: [] };
  }
  
  return replaceInFile(filePath, cleanupPatterns);
}

// Función para procesar directorio recursivamente
function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`  ⚠️  Directorio no encontrado: ${dirPath}`);
    return;
  }
  
  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Ignorar directorios del sistema
      if (item !== 'node_modules' && item !== '.next' && item !== 'dist' && item !== '.git') {
        processDirectory(fullPath);
      }
    } else if (extensions.includes(path.extname(item))) {
      // Procesar archivo
      replaceInFile(fullPath, cleanupPatterns);
    }
  });
}

// Función principal mejorada
function main() {
  console.log('📁 Procesando archivos de prioridad alta...\n');
  
  // Procesar archivos de prioridad alta primero
  let totalChanges = 0;
  priorityFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const result = processFile(file);
      if (result.modified) {
        totalChanges += result.changes.length;
      }
    }
  });
  
  console.log('\n📁 Procesando directorios...\n');
  
  // Procesar directorios
  directories.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`🔍 Procesando ${dir}/`);
      processDirectory(dir);
    } else {
      console.log(`⚠️  Directorio ${dir}/ no encontrado`);
    }
  });
  
  console.log('\n🧹 Limpieza completada!');
  console.log(`📊 Total de cambios realizados: ${totalChanges}`);
  console.log('\n📋 Próximos pasos:');
  console.log('1. Ejecutar: npm run lint');
  console.log('2. Revisar warnings restantes manualmente');
  console.log('3. Ejecutar: npm run build');
  console.log('4. Probar funcionalidades críticas');
  
  // Generar reporte de limpieza
  generateCleanupReport();
}

// Función para generar reporte de limpieza
function generateCleanupReport() {
  const report = {
    timestamp: new Date().toISOString(),
    patterns: cleanupPatterns.map(p => p.description),
    directories: directories,
    priorityFiles: priorityFiles,
    totalFiles: 0,
    modifiedFiles: 0
  };
  
  try {
    fs.writeFileSync('cleanup-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Reporte de limpieza guardado en: cleanup-report.json');
  } catch (error) {
    console.log('\n⚠️  No se pudo generar reporte:', error.message);
  }
}

// Función para limpiar archivo específico
function cleanSpecificFile(filePath) {
  console.log(`🧹 Limpiando archivo específico: ${filePath}`);
  return processFile(filePath);
}

// Función para limpiar directorio específico
function cleanSpecificDirectory(dirPath) {
  console.log(`🧹 Limpiando directorio específico: ${dirPath}`);
  if (fs.existsSync(dirPath)) {
    processDirectory(dirPath);
  } else {
    console.log(`❌ Directorio no encontrado: ${dirPath}`);
  }
}

// Exportar funciones para uso externo
module.exports = { 
  main, 
  processFile, 
  processDirectory, 
  cleanSpecificFile, 
  cleanSpecificDirectory,
  cleanupPatterns 
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}
