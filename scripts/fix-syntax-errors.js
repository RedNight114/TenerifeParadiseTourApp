const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigiendo errores de sintaxis causados por la limpieza de console.log...\n');

// Función para corregir errores de sintaxis en un archivo
function fixSyntaxErrors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Patrón 1: Corregir console.log incompletos en funciones showToast
    const toastPattern = /(\}\s*else\s*{\s*\/\/\s*Fallback para SSR - solo log en consola\s*):\s*\$\{message\}`\)/g;
    if (toastPattern.test(content)) {
      content = content.replace(toastPattern, '$1\n    console.log(`[${type.toUpperCase()}]: ${message}`)');
      modified = true;
      console.log(`  ✅ Corregido patrón toast en: ${path.basename(filePath)}`);
    }
    
    // Patrón 2: Corregir console.error incompletos en logger
    const loggerPattern = /(if\s*\(\s*this\.config\.enableConsole\s*\)\s*{\s*);/g;
    if (loggerPattern.test(content)) {
      // Necesitamos contexto para saber qué tipo de log es
      const errorPattern = /(error\([^)]*\):\s*void\s*{\s*[^}]*if\s*\(\s*this\.config\.enableConsole\s*\)\s*{\s*);/g;
      const warnPattern = /(warn\([^)]*\):\s*void\s*{\s*[^}]*if\s*\(\s*this\.config\.enableConsole\s*\)\s*{\s*);/g;
      const infoPattern = /(info\([^)]*\):\s*void\s*{\s*[^}]*if\s*\(\s*this\.config\.enableConsole\s*\)\s*{\s*);/g;
      
      if (errorPattern.test(content)) {
        content = content.replace(errorPattern, '$1\n      console.error(this.formatMessage(\'error\', message), data);');
        modified = true;
        console.log(`  ✅ Corregido console.error en: ${path.basename(filePath)}`);
      }
      if (warnPattern.test(content)) {
        content = content.replace(warnPattern, '$1\n      console.warn(this.formatMessage(\'warn\', message), data);');
        modified = true;
        console.log(`  ✅ Corregido console.warn en: ${path.basename(filePath)}`);
      }
      if (infoPattern.test(content)) {
        content = content.replace(infoPattern, '$1\n      console.info(this.formatMessage(\'info\', message), data);');
        modified = true;
        console.log(`  ✅ Corregido console.info en: ${path.basename(filePath)}`);
      }
    }
    
    // Patrón 3: Verificar que los archivos terminen correctamente
    if (content.trim().endsWith('})') && !content.trim().endsWith('})\n')) {
      content = content.trim() + '\n';
      modified = true;
      console.log(`  ✅ Corregido final de archivo en: ${path.basename(filePath)}`);
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`  ❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

// Archivos específicos que sabemos que tienen problemas
const problemFiles = [
  'lib/logger.ts',
  'app/admin/login/page.tsx',
  'app/auth/forgot-password/page.tsx',
  'app/auth/login/page.tsx',
  'app/auth/register/page.tsx',
  'app/auth/reset-password/page.tsx'
];

let fixedCount = 0;

problemFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`🔧 Procesando: ${file}`);
    if (fixSyntaxErrors(fullPath)) {
      fixedCount++;
    }
  } else {
    console.log(`⚠️  Archivo no encontrado: ${file}`);
  }
});

console.log(`\n🎯 Resumen:`);
console.log(`   Archivos corregidos: ${fixedCount}`);
console.log(`✅ Corrección de sintaxis completada`);
