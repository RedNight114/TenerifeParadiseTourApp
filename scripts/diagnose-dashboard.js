const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnosticando problemas del dashboard...\n');

// Verificar archivos críticos
const criticalFiles = [
  'app/admin/dashboard/page.tsx',
  'components/admin/admin-guard.tsx',
  'components/auth-provider.tsx',
  'hooks/use-auth.ts'
];

console.log('📁 Verificando archivos críticos:');
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Verificar problemas comunes
    const issues = [];
    
    if (content.includes('import { toast } from \'sonner\'')) {
      issues.push('❌ Usa import directo de sonner');
    }
    
    if (content.includes('document.createTextNode')) {
      issues.push('❌ Usa document.createTextNode');
    }
    
    if (content.includes('window.location') && !content.includes('typeof window')) {
      issues.push('⚠️ Usa window.location sin verificación');
    }
    
    if (issues.length === 0) {
      console.log(`✅ ${file} - Sin problemas detectados`);
    } else {
      console.log(`❌ ${file}:`);
      issues.forEach(issue => console.log(`   ${issue}`));
    }
  } else {
    console.log(`❌ ${file} - Archivo no encontrado`);
  }
});

// Verificar archivos compilados
console.log('\n🔧 Verificando archivos compilados:');
if (fs.existsSync('.next')) {
  console.log('✅ Directorio .next existe');
  
  // Verificar si hay archivos problemáticos
  const serverDir = '.next/server';
  if (fs.existsSync(serverDir)) {
    console.log('✅ Directorio .next/server existe');
    
    // Buscar archivos page.js problemáticos
    const findPageFiles = (dir) => {
      const files = [];
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...findPageFiles(fullPath));
        } else if (item === 'page.js') {
          files.push(fullPath);
        }
      }
      
      return files;
    };
    
    const pageFiles = findPageFiles(serverDir);
    console.log(`📄 Encontrados ${pageFiles.length} archivos page.js`);
    
    // Verificar si alguno tiene problemas de sintaxis
    pageFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('document.createTextNode')) {
          console.log(`❌ ${file} - Contiene document.createTextNode`);
        } else {
          console.log(`✅ ${file} - Sin problemas detectados`);
        }
      } catch (error) {
        console.log(`❌ ${file} - Error leyendo archivo: ${error.message}`);
      }
    });
  } else {
    console.log('❌ Directorio .next/server no existe');
  }
} else {
  console.log('❌ Directorio .next no existe');
}

// Verificar variables de entorno
console.log('\n🔧 Verificando variables de entorno:');
const envFiles = ['.env.local', '.env'];
envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} existe`);
  } else {
    console.log(`❌ ${file} no existe`);
  }
});

console.log('\n🎯 Recomendaciones:');
console.log('1. Si hay archivos con problemas, ejecuta: node scripts/fix-all-sonner.js');
console.log('2. Si hay archivos page.js problemáticos, elimina .next y reinicia');
console.log('3. Verifica que todas las variables de entorno estén configuradas');
console.log('4. Asegúrate de que el usuario tenga rol "admin" en la base de datos');

console.log('\n✅ Diagnóstico completado.');
