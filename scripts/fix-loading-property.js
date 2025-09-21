const fs = require('fs');
const path = require('path');

// Función para buscar y reemplazar en un archivo
function fixLoadingProperty(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Reemplazar loading: authLoading por isLoading: authLoading
    if (content.includes('loading: authLoading')) {
      content = content.replace(/loading:\s*authLoading/g, 'isLoading: authLoading');
      modified = true;
    }

    // Reemplazar loading, por isLoading: loading,
    if (content.includes('const { user, loading,') && !content.includes('isLoading:')) {
      content = content.replace(
        /const\s*{\s*user,\s*loading,/g,
        'const { user, isLoading: loading,'
      );
      modified = true;
    }

    // Reemplazar loading } por isLoading: loading }
    if (content.includes('loading }') && !content.includes('isLoading:')) {
      content = content.replace(
        /const\s*{\s*([^}]*),\s*loading\s*}/g,
        'const { $1, isLoading: loading }'
      );
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

// Archivos específicos que sabemos que necesitan corrección
const specificFiles = [
  'app/admin/login/page.tsx',
  'app/admin/dashboard-direct/page.tsx',
  'components/admin/admin-guard.tsx',
  'components/admin/admin-guard-fixed.tsx',
  'components/admin/admin-guard-enhanced.tsx',
  'hooks/use-authorization.ts'
];

console.log('🔧 Fixing loading property issues...\n');

let totalFixed = 0;

// Procesar archivos específicos
for (const file of specificFiles) {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    if (fixLoadingProperty(fullPath)) {
      totalFixed++;
    }
  }
}

console.log(`\n✅ Fixed ${totalFixed} files`);
console.log('🎉 Loading property fixes completed!');
