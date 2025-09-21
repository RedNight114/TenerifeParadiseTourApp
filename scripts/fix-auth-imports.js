const fs = require('fs');
const path = require('path');

// Función para buscar y reemplazar en un archivo
function fixAuthImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Reemplazar import de useAuthContext
    if (content.includes('import { useAuthContext } from "@/components/auth-provider"')) {
      content = content.replace(
        'import { useAuthContext } from "@/components/auth-provider"',
        'import { useAuth } from "@/hooks/use-auth"'
      );
      modified = true;
    }

    // Reemplazar uso de useAuthContext
    if (content.includes('useAuthContext()')) {
      content = content.replace(/useAuthContext\(\)/g, 'useAuth()');
      modified = true;
    }

    // Remover signOut si existe (no está disponible en useAuth)
    if (content.includes('signOut')) {
      content = content.replace(/,?\s*signOut\s*/g, '');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Función recursiva para buscar archivos
function findFiles(dir, extensions = ['.tsx', '.ts']) {
  let files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files = files.concat(findFiles(fullPath, extensions));
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return files;
}

// Archivos específicos que sabemos que necesitan corrección
const specificFiles = [
  'app/auth/register/page.tsx',
  'app/auth/login/page.tsx',
  'app/admin/login/page.tsx',
  'app/chat/page.tsx',
  'app/(main)/reservations/page.tsx',
  'app/(main)/profile/page.tsx',
  'app/dashboard/page.tsx',
  'components/navbar.tsx',
  'components/auth-provider.tsx'
];

console.log('🔧 Fixing auth imports...\n');

let totalFixed = 0;

// Procesar archivos específicos
for (const file of specificFiles) {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    if (fixAuthImports(fullPath)) {
      totalFixed++;
    }
  }
}

console.log(`\n✅ Fixed ${totalFixed} files`);
console.log('🎉 Auth import fixes completed!');
