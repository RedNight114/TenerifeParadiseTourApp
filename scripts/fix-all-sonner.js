const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigiendo TODOS los problemas de SSR con sonner...\n');

// Buscar todos los archivos que usan sonner
function findFilesWithSonner(dir) {
  const files = [];
  
  function searchDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        searchDir(fullPath);
      } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts'))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes("import") && content.includes("sonner")) {
            files.push(fullPath);
          }
        } catch (error) {
          // Ignorar errores de lectura
        }
      }
    }
  }
  
  searchDir(dir);
  return files;
}

const filesToFix = findFilesWithSonner('.');

console.log(`📁 Encontrados ${filesToFix.length} archivos con sonner:`);
filesToFix.forEach(file => console.log(`   - ${file}`));

let fixedCount = 0;

filesToFix.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Reemplazar import de sonner
    if (content.includes("import { toast } from 'sonner'")) {
      content = content.replace(
        "import { toast } from 'sonner'",
        `// Importación dinámica de sonner para evitar problemas de SSR
let toast: any = null
if (typeof window !== 'undefined') {
  import('sonner').then(({ toast: toastImport }) => {
    toast = toastImport
  })
}

// Función helper para manejar toasts de manera segura
const showToast = (type: 'success' | 'error' | 'info', message: string) => {
  if (typeof window !== 'undefined' && toast) {
    toast[type](message)
  } else {
    // Fallback para SSR - solo log en consola
    console.log(\`\${type.toUpperCase()}: \${message}\`)
  }
}`
      );
      modified = true;
    }

    // Reemplazar llamadas a toast.error
    if (content.includes('toast.error(')) {
      content = content.replace(/toast\.error\(/g, "showToast('error', ");
      modified = true;
    }

    // Reemplazar llamadas a toast.success
    if (content.includes('toast.success(')) {
      content = content.replace(/toast\.success\(/g, "showToast('success', ");
      modified = true;
    }

    // Reemplazar llamadas a toast.info
    if (content.includes('toast.info(')) {
      content = content.replace(/toast\.info\(/g, "showToast('info', ");
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(file, content);
      console.log(`✅ ${file} - Corregido`);
      fixedCount++;
    } else {
      console.log(`ℹ️ ${file} - No necesita corrección`);
    }

  } catch (error) {
    console.log(`❌ ${file} - Error: ${error.message}`);
  }
});

console.log(`\n🎉 Proceso completado. ${fixedCount} archivos corregidos.`);
console.log('\n📝 Archivos corregidos:');
console.log('   - Reemplazado import de sonner con importación dinámica');
console.log('   - Reemplazadas todas las llamadas toast.error() con showToast()');
console.log('   - Reemplazadas todas las llamadas toast.success() con showToast()');
console.log('   - Reemplazadas todas las llamadas toast.info() con showToast()');
console.log('\n🚀 Ahora puedes reiniciar el servidor sin errores de SSR.');
