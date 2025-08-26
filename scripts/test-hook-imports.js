#!/usr/bin/env node

/**
 * Script para verificar que el hook unificado se puede importar correctamente
 * y que no hay errores de compilación
 */

const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

console.log(`${colors.bold}${colors.blue}🧪 TESTEO DE IMPORTS DEL HOOK UNIFICADO${colors.reset}\n`);

// Verificar que el archivo existe
const hookPath = path.join(process.cwd(), 'hooks/use-services-unified.ts');
if (!fs.existsSync(hookPath)) {
  console.log(`${colors.red}❌ El archivo use-services-unified.ts no existe${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.green}✅ Archivo use-services-unified.ts encontrado${colors.reset}`);

// Verificar que se puede leer
try {
  const content = fs.readFileSync(hookPath, 'utf8');
  console.log(`${colors.green}✅ Archivo se puede leer correctamente${colors.reset}`);
  
  // Verificar que tiene el contenido esperado
  if (content.includes('export function useServicesUnified')) {
    console.log(`${colors.green}✅ Función exportada correctamente${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Función no encontrada en el archivo${colors.reset}`);
  }
  
  if (content.includes('getSupabaseClient')) {
    console.log(`${colors.green}✅ Import de Supabase correcto${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Import de Supabase no encontrado${colors.reset}`);
  }
  
  if (content.includes('Service')) {
    console.log(`${colors.green}✅ Tipo Service importado correctamente${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Tipo Service no encontrado${colors.reset}`);
  }
  
} catch (error) {
  console.log(`${colors.red}❌ Error leyendo el archivo: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Verificar que no hay hooks antiguos en uso
const componentsToCheck = [
  'components/admin/services-management.tsx',
  'app/(main)/services/page.tsx',
  'app/(main)/services/[serviceId]/page.tsx',
  'components/featured-services.tsx',
  'components/services-grid.tsx',
  'app/(main)/booking/[serviceId]/page.tsx'
];

console.log(`\n${colors.yellow}🔍 Verificando componentes...${colors.reset}`);

let allComponentsOk = true;

componentsToCheck.forEach(componentPath => {
  const fullPath = path.join(process.cwd(), componentPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`${colors.red}❌ Componente no encontrado: ${componentPath}${colors.reset}`);
    allComponentsOk = false;
    return;
  }
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    if (content.includes('useServicesUnified')) {
      console.log(`${colors.green}✅ ${componentPath} - Hook unificado en uso${colors.reset}`);
    } else if (content.includes('useServicesSimple') || content.includes('useServicesOptimized') || content.includes('useServicesSimpleFixed')) {
      console.log(`${colors.red}❌ ${componentPath} - Aún usa hook antiguo${colors.reset}`);
      allComponentsOk = false;
    } else {
      console.log(`${colors.yellow}⚠️  ${componentPath} - No se detectó hook de servicios${colors.reset}`);
    }
    
  } catch (error) {
    console.log(`${colors.red}❌ Error leyendo ${componentPath}: ${error.message}${colors.reset}`);
    allComponentsOk = false;
  }
});

// Resumen
console.log(`\n${colors.bold}${colors.blue}📊 RESUMEN${colors.reset}`);
if (allComponentsOk) {
  console.log(`${colors.green}🎉 ¡Excelente! Todos los componentes usan el hook unificado${colors.reset}`);
  console.log(`${colors.blue}💡 El problema de logs excesivos debería estar resuelto${colors.reset}`);
} else {
  console.log(`${colors.red}❌ Algunos componentes aún usan hooks antiguos${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Necesitas actualizar los componentes marcados con ❌${colors.reset}`);
}

console.log(`\n${colors.bold}${colors.green}🧪 Test completado${colors.reset}`);

