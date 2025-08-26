#!/usr/bin/env node

/**
 * Script para corregir automáticamente todos los logs problemáticos
 * Reemplaza logs excesivos con versiones optimizadas
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

console.log(`${colors.bold}${colors.blue}🔧 CORRECTOR AUTOMÁTICO DE LOGS${colors.reset}\n`);

// Definir las correcciones
const fixes = [
  {
    file: 'hooks/use-services-simple.ts',
    search: /console\.log\('🔄 useServicesSimple: Datos actualizados:', \{[\s\S]*?\}\);/,
    replace: `// Log solo en desarrollo y solo cuando cambian los datos importantes
  const prevServicesCount = useRef(services.length)
  const prevLoading = useRef(loading)
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && 
        (prevServicesCount.current !== services.length || prevLoading.current !== loading)) {
      console.log('🔄 useServicesSimple: Datos actualizados:', { 
        servicesCount: services.length, 
        loading, 
        error, 
        featuredCount: featuredServices.length 
      })
      prevServicesCount.current = services.length
      prevLoading.current = loading
    }
  }, [services.length, loading, error, featuredServices.length])`,
    description: 'Reemplazar log en cada renderizado con log condicional'
  },
  {
    file: 'hooks/use-services-optimized.ts',
    search: /console\.log\(`🔄 Retry attempt \$\{i \+ 1\}\/\$\{attempts\} in \$\{delay\}ms\.\.\.`\)/,
    replace: `if (process.env.NODE_ENV === 'development') {
        console.log(\`🔄 Retry attempt \${i + 1}/\${attempts} in \${delay}ms...\`)
      }`,
    description: 'Envolver log de retry en condicional de desarrollo'
  },
  {
    file: 'components/admin/services-management.tsx',
    search: /console\.log\(`🔄 \$\{service\.available \? 'Desactivando' : 'Activando'\} servicio:`, service\.title\)[\s\S]*?console\.log\('🔄 New available status:', !service\.available\)/,
    replace: `if (process.env.NODE_ENV === 'development') {
        console.log(\`🔄 \${service.available ? 'Desactivando' : 'Activando'} servicio:\`, service.title)
        console.log('🔄 Service ID:', service.id)
        console.log('🔄 Current available status:', service.available)
        console.log('🔄 New available status:', !service.available)
      }`,
    description: 'Envolver logs de toggle en condicional de desarrollo'
  }
];

let totalFixes = 0;
let filesModified = 0;

console.log(`${colors.yellow}🔍 Aplicando correcciones...${colors.reset}\n`);

fixes.forEach((fix, index) => {
  const filePath = path.join(process.cwd(), fix.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`${colors.red}❌ Archivo no encontrado: ${fix.file}${colors.reset}`);
    return;
  }

  console.log(`${colors.cyan}📄 ${fix.file}${colors.reset}`);
  console.log(`   ${colors.blue}💡 ${fix.description}${colors.reset}`);

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Aplicar la corrección
    if (fix.search.test(content)) {
      content = content.replace(fix.search, fix.replace);
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`   ${colors.green}✅ Corregido${colors.reset}`);
        totalFixes++;
        filesModified++;
      } else {
        console.log(`   ${colors.yellow}⚠️  No se pudo aplicar la corrección${colors.reset}`);
      }
    } else {
      console.log(`   ${colors.green}✅ Ya corregido o no aplicable${colors.reset}`);
    }
  } catch (error) {
    console.log(`   ${colors.red}❌ Error: ${error.message}${colors.reset}`);
  }
  
  console.log('');
});

// Resumen
console.log(`${colors.bold}${colors.blue}📊 RESUMEN${colors.reset}`);
console.log(`Archivos procesados: ${fixes.length}`);
console.log(`Archivos modificados: ${filesModified}`);
console.log(`Total de correcciones: ${totalFixes}`);

if (totalFixes === 0) {
  console.log(`\n${colors.green}🎉 ¡Excelente! Todos los logs ya están optimizados.${colors.reset}`);
} else {
  console.log(`\n${colors.green}✨ Se aplicaron ${totalFixes} correcciones exitosamente.${colors.reset}`);
}

console.log(`\n${colors.bold}${colors.green}🔧 Script completado${colors.reset}`);
console.log(`${colors.blue}💡 Recomendación: Ejecuta 'node scripts/cleanup-excessive-logs.js' para verificar.${colors.reset}`);
