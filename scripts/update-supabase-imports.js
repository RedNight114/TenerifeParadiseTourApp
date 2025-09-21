#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Archivos que necesitan ser actualizados
const filesToUpdate = [
  'app/(main)/profile/page.tsx',
  'app/(main)/reservations/page.tsx',
  'app/(main)/booking/[serviceId]/page.tsx',
  'app/auth/forgot-password/page.tsx',
  'app/auth/reset-password/page.tsx',
  'app/admin/test-users/page.tsx',
  'components/admin/age-pricing-manager.tsx',
  'components/admin/audit-dashboard.tsx',
  'components/admin/integrated-age-pricing.tsx',
  'components/admin/reservations-management.tsx',
  'components/admin/services-management.tsx',
  'components/ui/image-upload.tsx',
  'hooks/use-dashboard-data.ts',
  'hooks/use-reservations.ts',
  'hooks/use-services-optimized.ts',
  'hooks/use-unified-data.ts'
];

console.log('🔄 Actualizando imports de Supabase a cliente unificado...\n');

let updatedCount = 0;
let errorCount = 0;

filesToUpdate.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Archivo no encontrado: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Actualizar imports
    content = content.replace(
      /import\s+\{\s*getSupabaseClient\s*\}\s+from\s+['"]@\/lib\/supabase['"]/g,
      "import { getSupabaseClient } from '@/lib/supabase-unified'"
    );

    content = content.replace(
      /import\s+\{\s*getSupabaseClient\s*\}\s+from\s+['"]@\/lib\/supabase-optimized['"]/g,
      "import { getSupabaseClient } from '@/lib/supabase-unified'"
    );

    // Actualizar llamadas getClient()
    content = content.replace(
      /const\s+supabaseClient\s*=\s*getSupabaseClient\(\)\s*\n\s*const\s+client\s*=\s*await\s+supabaseClient\.getClient\(\)/g,
      'const client = await getSupabaseClient()'
    );

    content = content.replace(
      /const\s+supabase\s*=\s*await\s+supabaseClient\.getClient\(\)/g,
      'const supabase = await getSupabaseClient()'
    );

    // Actualizar llamadas individuales
    content = content.replace(
      /await\s+supabaseClient\.getClient\(\)/g,
      'await getSupabaseClient()'
    );

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Actualizado: ${filePath}`);
      updatedCount++;
    } else {
      console.log(`ℹ️  Sin cambios: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error actualizando ${filePath}:`, error.message);
    errorCount++;
  }
});

console.log(`\n🎉 Actualización completada!`);
console.log(`✅ Archivos actualizados: ${updatedCount}`);
console.log(`❌ Errores: ${errorCount}`);

if (errorCount === 0) {
  console.log('\n🚀 Todos los archivos han sido actualizados exitosamente!');
} else {
  console.log('\n⚠️  Algunos archivos tuvieron errores. Revisa los logs arriba.');
}
