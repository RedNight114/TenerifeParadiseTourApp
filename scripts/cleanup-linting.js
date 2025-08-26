#!/usr/bin/env node

/**
 * Script de limpieza automática de problemas de linting
 * TenerifeParadiseTour&Excursions
 * 
 * Uso: node scripts/cleanup-linting.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Iniciando limpieza automática de linting...\n');

// Función para buscar y reemplazar en archivos
function replaceInFile(filePath, patterns) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    patterns.forEach(({ search, replace, description }) => {
      if (content.includes(search)) {
        content = content.replace(new RegExp(search, 'g'), replace);
        modified = true;
        console.log(`  ✅ ${description} en ${path.basename(filePath)}`);
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
    
    return modified;
  } catch (error) {
    console.error(`  ❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

// Patrones de limpieza
const cleanupPatterns = [
  // Eliminar console.log de producción
  {
    search: /console\.log\([^)]*\);?\s*\n/g,
    replace: '',
    description: 'Eliminando console.log'
  },
  {
    search: /console\.warn\([^)]*\);?\s*\n/g,
    replace: '',
    description: 'Eliminando console.warn'
  },
  {
    search: /console\.error\([^)]*\);?\s*\n/g,
    replace: '',
    description: 'Eliminando console.error'
  },
  {
    search: /console\.info\([^)]*\);?\s*\n/g,
    replace: '',
    description: 'Eliminando console.info'
  },
  {
    search: /console\.debug\([^)]*\);?\s*\n/g,
    replace: '',
    description: 'Eliminando console.debug'
  },
  
  // Corregir tipos any
  {
    search: /: any/g,
    replace: ': unknown',
    description: 'Reemplazando any por unknown'
  },
  
  // Corregir variables no utilizadas
  {
    search: /const ([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*[^;]+;\s*\/\/\s*unused/g,
    replace: '// const $1 = ...; // unused',
    description: 'Comentando variables no utilizadas'
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

// Función para procesar directorio recursivamente
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Ignorar node_modules y .next
      if (item !== 'node_modules' && item !== '.next' && item !== 'dist') {
        processDirectory(fullPath);
      }
    } else if (extensions.includes(path.extname(item))) {
      // Procesar archivo
      replaceInFile(fullPath, cleanupPatterns);
    }
  });
}

// Función principal
function main() {
  console.log('📁 Procesando directorios...\n');
  
  directories.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`🔍 Procesando ${dir}/`);
      processDirectory(dir);
    } else {
      console.log(`⚠️  Directorio ${dir}/ no encontrado`);
    }
  });
  
  console.log('\n🧹 Limpieza completada!');
  console.log('\n📋 Próximos pasos:');
  console.log('1. Ejecutar: npm run lint');
  console.log('2. Revisar warnings restantes manualmente');
  console.log('3. Ejecutar: npm run build');
  console.log('4. Probar funcionalidades críticas');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { main, replaceInFile, cleanupPatterns };
