const fs = require('fs');
const path = require('path');

// Directorios a procesar
const directories = [
  'components',
  'hooks',
  'app',
  'lib'
];

// Extensiones a procesar
const extensions = ['.ts', '.tsx'];

// Función para procesar un archivo
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Eliminar console.log, console.warn, console.error, console.info
    let newContent = content
      .replace(/console\.log\([^)]*\);?\s*/g, '')
      .replace(/console\.warn\([^)]*\);?\s*/g, '')
      .replace(/console\.error\([^)]*\);?\s*/g, '')
      .replace(/console\.info\([^)]*\);?\s*/g, '');
    
    // Si el contenido cambió, escribir el archivo
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Limpiado: ${filePath}`);
      modified = true;
    }
    
    return modified;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

// Función para procesar un directorio recursivamente
function processDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    let totalModified = 0;
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Procesar subdirectorio
        totalModified += processDirectory(fullPath);
      } else if (stat.isFile()) {
        // Procesar archivo si tiene la extensión correcta
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          if (processFile(fullPath)) {
            totalModified++;
          }
        }
      }
    }
    
    return totalModified;
  } catch (error) {
    console.error(`❌ Error procesando directorio ${dirPath}:`, error.message);
    return 0;
  }
}

// Función principal
function main() {
  console.log('🧹 Iniciando limpieza de console.log...\n');
  
  let totalModified = 0;
  
  for (const dir of directories) {
    if (fs.existsSync(dir)) {
      console.log(`📁 Procesando directorio: ${dir}`);
      const modified = processDirectory(dir);
      totalModified += modified;
      console.log(`   ${modified} archivos modificados\n`);
    } else {
      console.log(`⚠️  Directorio no encontrado: ${dir}\n`);
    }
  }
  
  console.log('🎯 Resumen:');
  console.log(`   Total de archivos modificados: ${totalModified}`);
  console.log('✅ Limpieza completada');
}

// Ejecutar el script
main(); 