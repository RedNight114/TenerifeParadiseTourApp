const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando sintaxis de archivos...\n');

// Archivos críticos a verificar
const criticalFiles = [
  'app/admin/dashboard/page.tsx',
  'components/admin/admin-guard.tsx',
  'components/auth-provider.tsx',
  'hooks/use-auth.ts',
  'middleware.ts'
];

let hasErrors = false;

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Verificar problemas comunes de sintaxis
      const issues = [];
      
      // Verificar paréntesis balanceados
      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        issues.push(`Paréntesis desbalanceados: ${openParens} abiertos, ${closeParens} cerrados`);
      }
      
      // Verificar llaves balanceadas
      const openBraces = (content.match(/\{/g) || []).length;
      const closeBraces = (content.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        issues.push(`Llaves desbalanceadas: ${openBraces} abiertas, ${closeBraces} cerradas`);
      }
      
      // Verificar comillas balanceadas
      const singleQuotes = (content.match(/'/g) || []).length;
      const doubleQuotes = (content.match(/"/g) || []).length;
      if (singleQuotes % 2 !== 0) {
        issues.push('Comillas simples desbalanceadas');
      }
      if (doubleQuotes % 2 !== 0) {
        issues.push('Comillas dobles desbalanceadas');
      }
      
      // Verificar imports problemáticos
      if (content.includes('import(') && !content.includes('await import(')) {
        issues.push('Importaciones dinámicas sin await');
      }
      
      // Verificar eval problemático
      if (content.includes('eval(')) {
        issues.push('Uso de eval() detectado');
      }
      
      if (issues.length > 0) {
        console.log(`❌ ${file}:`);
        issues.forEach(issue => console.log(`   - ${issue}`));
        hasErrors = true;
      } else {
        console.log(`✅ ${file} - Sin problemas de sintaxis`);
      }
      
    } catch (error) {
      console.log(`❌ ${file} - Error leyendo archivo: ${error.message}`);
      hasErrors = true;
    }
  } else {
    console.log(`❌ ${file} - Archivo no encontrado`);
    hasErrors = true;
  }
});

// Verificar archivos de configuración
console.log('\n🔧 Verificando archivos de configuración...');

const configFiles = [
  'next.config.mjs',
  'tsconfig.json',
  'package.json'
];

configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Verificar JSON válido para package.json y tsconfig.json
      if (file.endsWith('.json')) {
        JSON.parse(content);
        console.log(`✅ ${file} - JSON válido`);
      } else {
        console.log(`✅ ${file} - Archivo encontrado`);
      }
    } catch (error) {
      console.log(`❌ ${file} - Error: ${error.message}`);
      hasErrors = true;
    }
  } else {
    console.log(`❌ ${file} - Archivo no encontrado`);
    hasErrors = true;
  }
});

if (hasErrors) {
  console.log('\n❌ Se encontraron problemas de sintaxis. Por favor, corrígelos antes de continuar.');
  process.exit(1);
} else {
  console.log('\n✅ Todos los archivos tienen sintaxis correcta.');
}
