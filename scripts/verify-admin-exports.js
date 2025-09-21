#!/usr/bin/env node

/**
 * Script para verificar que todos los componentes admin tienen exportaciones correctas
 * y detectar posibles problemas de imports dinámicos
 */

const fs = require('fs');
const path = require('path');

// Componentes que deben tener export default
const ADMIN_COMPONENTS = [
  'components/admin/services-management.tsx',
  'components/admin/reservations-management-simple.tsx',
  'components/admin/audit-dashboard-simple.tsx',
  'components/admin/age-pricing-manager.tsx',
  'components/admin/tab-loading.tsx',
  'components/chat/admin-chat-dashboard-simple.tsx'
];

// Componentes que pueden tener named exports
const NAMED_EXPORT_COMPONENTS = [
  'components/admin/admin-guard.tsx',
  'components/admin/stat-card.tsx',
  'components/admin/status-card.tsx',
  'components/admin/dashboard-fallback.tsx',
  'components/admin/dashboard-stats-simple.tsx'
];

function checkFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Archivo no encontrado: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Verificar que tiene "use client"
  if (!content.includes('"use client"')) {
    console.log(`⚠️  ${filePath} no tiene "use client"`);
  }

  // Verificar export default
  const hasDefaultExport = content.includes('export default');
  const hasNamedExport = content.includes('export function') || content.includes('export const');

  if (ADMIN_COMPONENTS.some(comp => filePath.includes(comp))) {
    if (!hasDefaultExport) {
      console.log(`❌ ${filePath} debería tener export default`);
      return false;
    }
  }

  if (NAMED_EXPORT_COMPONENTS.some(comp => filePath.includes(comp))) {
    if (!hasNamedExport) {
      console.log(`❌ ${filePath} debería tener named export`);
      return false;
    }
  }

  console.log(`✅ ${filePath} - OK`);
  return true;
}

function main() {
  console.log('🔍 Verificando exportaciones de componentes admin...\n');

  let allGood = true;

  // Verificar componentes admin
  ADMIN_COMPONENTS.forEach(filePath => {
    if (!checkFile(filePath)) {
      allGood = false;
    }
  });

  console.log('\n🔍 Verificando componentes con named exports...\n');

  // Verificar componentes con named exports
  NAMED_EXPORT_COMPONENTS.forEach(filePath => {
    if (!checkFile(filePath)) {
      allGood = false;
    }
  });

  console.log('\n📋 Resumen:');
  if (allGood) {
    console.log('✅ Todos los componentes tienen las exportaciones correctas');
  } else {
    console.log('❌ Se encontraron problemas en las exportaciones');
    process.exit(1);
  }
}

main();






