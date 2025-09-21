const fs = require('fs');
const { execSync } = require('child_process');

console.log('🧹 Limpieza final del sistema...\n');

try {
  // 1. Eliminar todos los caches
  console.log('🗑️ Eliminando caches...');
  
  const cacheDirs = ['.next', 'node_modules/.cache', '.turbo'];
  cacheDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        execSync(`Remove-Item -Recurse -Force "${dir}" -ErrorAction SilentlyContinue`, { stdio: 'inherit' });
        console.log(`✅ ${dir} eliminado`);
      } catch (error) {
        console.log(`ℹ️ ${dir} ya estaba limpio`);
      }
    }
  });

  // 2. Verificar que no queden archivos problemáticos
  console.log('\n🔍 Verificando archivos problemáticos...');
  
  const problemFiles = [];
  function searchProblemFiles(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = `${dir}/${item}`;
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        searchProblemFiles(fullPath);
      } else if (stat.isFile() && item.endsWith('.js') && fullPath.includes('.next')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('document.createTextNode')) {
            problemFiles.push(fullPath);
          }
        } catch (error) {
          // Ignorar errores de lectura
        }
      }
    }
  }
  
  searchProblemFiles('.next');
  
  if (problemFiles.length > 0) {
    console.log(`❌ Encontrados ${problemFiles.length} archivos problemáticos:`);
    problemFiles.forEach(file => console.log(`   - ${file}`));
    console.log('🔄 Eliminando directorio .next completamente...');
    execSync('Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue', { stdio: 'inherit' });
  } else {
    console.log('✅ No se encontraron archivos problemáticos');
  }

  // 3. Verificar archivos fuente
  console.log('\n📝 Verificando archivos fuente...');
  
  const sourceFiles = [
    'app/admin/dashboard/page.tsx',
    'components/admin/admin-guard.tsx',
    'components/hero-section.tsx',
    'app/auth/login/page.tsx'
  ];
  
  let allClean = true;
  sourceFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('import { toast } from \'sonner\'')) {
        console.log(`❌ ${file} - Aún usa import directo de sonner`);
        allClean = false;
      } else {
        console.log(`✅ ${file} - Limpio`);
      }
    } else {
      console.log(`❌ ${file} - No encontrado`);
      allClean = false;
    }
  });

  if (!allClean) {
    console.log('\n🔧 Ejecutando corrección automática...');
    execSync('node scripts/fix-all-sonner.js', { stdio: 'inherit' });
  }

  // 4. Verificar variables de entorno
  console.log('\n🔧 Verificando configuración...');
  
  const envFile = '.env.local';
  if (fs.existsSync(envFile)) {
    const envContent = fs.readFileSync(envFile, 'utf8');
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    let missingVars = [];
    requiredVars.forEach(varName => {
      if (!envContent.includes(varName)) {
        missingVars.push(varName);
      }
    });
    
    if (missingVars.length > 0) {
      console.log('❌ Variables de entorno faltantes:', missingVars.join(', '));
    } else {
      console.log('✅ Variables de entorno configuradas');
    }
  } else {
    console.log('❌ Archivo .env.local no encontrado');
  }

  console.log('\n🎉 Limpieza completada!');
  console.log('\n📋 Próximos pasos:');
  console.log('1. Ejecuta: npm run dev');
  console.log('2. Accede a: http://localhost:3000/admin/dashboard');
  console.log('3. Si persisten errores, verifica que el usuario tenga rol "admin"');
  
} catch (error) {
  console.error('❌ Error durante la limpieza:', error.message);
  process.exit(1);
}
