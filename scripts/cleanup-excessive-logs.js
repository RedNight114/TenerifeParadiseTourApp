#!/usr/bin/env node

/**
 * Script para limpiar logs excesivos en el proyecto
 * Identifica y sugiere correcciones para logs que se ejecutan en cada renderizado
 */

const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

console.log(`${colors.bold}${colors.blue}🔍 ANALIZADOR DE LOGS EXCESIVOS${colors.reset}\n`);

// Patrones de logs problemáticos
const problematicPatterns = [
  {
    name: 'Logs en cada renderizado',
    pattern: /console\.log.*\{.*\}/,
    description: 'Logs que muestran objetos en cada renderizado del componente'
  },
  {
    name: 'Logs de estado en hooks',
    pattern: /console\.log.*use[A-Z][a-zA-Z]*.*renderizando/i,
    description: 'Logs que se ejecutan en cada renderizado de hooks'
  },
  {
    name: 'Logs de datos en cada ciclo',
    pattern: /console\.log.*datos.*actualizados/i,
    description: 'Logs que muestran datos en cada actualización'
  }
];

// Archivos a revisar
const filesToCheck = [
  'hooks/use-services-simple.ts',
  'hooks/use-services-optimized.ts',
  'hooks/use-age-pricing.ts',
  'components/admin/services-management.tsx',
  'components/admin/dashboard/page.tsx',
  'app/admin/dashboard/page.tsx'
];

let totalIssues = 0;
let filesWithIssues = 0;

console.log(`${colors.yellow}📁 Revisando archivos...${colors.reset}\n`);

filesToCheck.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`${colors.red}❌ Archivo no encontrado: ${filePath}${colors.reset}`);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  let fileIssues = 0;
  let fileHasIssues = false;

  console.log(`${colors.cyan}📄 ${filePath}${colors.reset}`);

  lines.forEach((line, index) => {
    problematicPatterns.forEach(pattern => {
      if (pattern.pattern.test(line)) {
        if (!fileHasIssues) {
          fileHasIssues = true;
          filesWithIssues++;
        }
        fileIssues++;
        totalIssues++;
        
        console.log(`  ${colors.yellow}⚠️  Línea ${index + 1}:${colors.reset} ${pattern.name}`);
        console.log(`     ${colors.red}${line.trim()}${colors.reset}`);
        console.log(`     ${colors.blue}💡 ${pattern.description}${colors.reset}\n`);
      }
    });
  });

  if (fileIssues === 0) {
    console.log(`  ${colors.green}✅ Sin problemas detectados${colors.reset}\n`);
  } else {
    console.log(`  ${colors.red}❌ ${fileIssues} problemas encontrados${colors.reset}\n`);
  }
});

// Resumen
console.log(`${colors.bold}${colors.blue}📊 RESUMEN${colors.reset}`);
console.log(`Total de archivos revisados: ${filesToCheck.length}`);
console.log(`Archivos con problemas: ${filesWithIssues}`);
console.log(`Total de problemas: ${totalIssues}`);

if (totalIssues === 0) {
  console.log(`\n${colors.green}🎉 ¡Excelente! No se encontraron logs problemáticos.${colors.reset}`);
} else {
  console.log(`\n${colors.yellow}⚠️  Se encontraron ${totalIssues} problemas de logs.${colors.reset}`);
  console.log(`${colors.blue}💡 Recomendaciones:${colors.reset}`);
  console.log(`   1. Mover logs a useEffect con dependencias específicas`);
  console.log(`   2. Usar useRef para evitar logs en cada renderizado`);
  console.log(`   3. Envolver logs en condicionales de desarrollo`);
  console.log(`   4. Usar logs solo cuando cambien datos importantes`);
}

// Sugerencias de corrección
console.log(`\n${colors.bold}${colors.magenta}🔧 SUGERENCIAS DE CORRECCIÓN${colors.reset}`);

const correctionExamples = [
  {
    problem: 'Log en cada renderizado:',
    example: 'console.log("Estado:", { data, loading })',
    solution: 'useEffect(() => {\n  console.log("Estado actualizado:", { data, loading })\n}, [data, loading])'
  },
  {
    problem: 'Log de hook en cada ciclo:',
    example: 'console.log("Hook renderizado con:", services.length)',
    solution: 'const prevCount = useRef(services.length)\nuseEffect(() => {\n  if (prevCount.current !== services.length) {\n    console.log("Servicios actualizados:", services.length)\n    prevCount.current = services.length\n  }\n}, [services.length])'
  }
];

correctionExamples.forEach((item, index) => {
  console.log(`\n${colors.cyan}${index + 1}. ${item.problem}${colors.reset}`);
  console.log(`   ${colors.red}❌ ${item.example}${colors.reset}`);
  console.log(`   ${colors.green}✅ ${item.solution}${colors.reset}`);
});

console.log(`\n${colors.bold}${colors.green}✨ Script completado${colors.reset}`);
