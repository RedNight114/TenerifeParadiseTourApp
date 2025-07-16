const fs = require('fs');
const path = require('path');

// Función para limpiar console.log de un archivo
function cleanConsoleLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Remover console.log, console.error, console.warn, console.info
    content = content.replace(/console\.(log|error|warn|info)\s*\([^)]*\);?\s*/g, '');
    content = content.replace(/console\.(log|error|warn|info)\s*\([^)]*\)\s*/g, '');
    
    // Remover líneas vacías múltiples
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Limpiado: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

// Función para procesar directorios recursivamente
function processDirectory(dirPath, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = fs.readdirSync(dirPath);
  let cleanedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Ignorar node_modules y .next
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        cleanedCount += processDirectory(filePath, extensions);
      }
    } else if (extensions.includes(path.extname(file))) {
      if (cleanConsoleLogs(filePath)) {
        cleanedCount++;
      }
    }
  }
  
  return cleanedCount;
}

// Directorios a procesar
const directories = [
  './app',
  './components',
  './hooks',
  './lib'
];

console.log('🧹 Iniciando limpieza de console.log...\n');

let totalCleaned = 0;

for (const dir of directories) {
  if (fs.existsSync(dir)) {
    console.log(`📁 Procesando directorio: ${dir}`);
    totalCleaned += processDirectory(dir);
  }
}

console.log(`\n✅ Limpieza completada! ${totalCleaned} archivos procesados.`);
console.log('💡 Recuerda revisar manualmente los archivos para asegurar que no se rompió nada importante.'); 