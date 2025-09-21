const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Solucionando errores del dashboard de administración...\n');

try {
  // 1. Detener procesos en puerto 3000
  console.log('🛑 Deteniendo procesos en puerto 3000...');
  try {
    execSync('npx kill-port 3000', { stdio: 'inherit' });
    console.log('✅ Puerto 3000 liberado');
  } catch (error) {
    console.log('ℹ️ No había procesos en puerto 3000');
  }
  
  // 2. Limpiar cache de Next.js
  console.log('🧹 Limpiando cache de Next.js...');
  if (fs.existsSync('.next')) {
    try {
      execSync('Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue', { stdio: 'inherit' });
      console.log('✅ Cache limpiado');
    } catch (error) {
      console.log('ℹ️ Cache ya estaba limpio');
    }
  }
  
  // 3. Limpiar node_modules y reinstalar
  console.log('📦 Limpiando node_modules...');
  if (fs.existsSync('node_modules')) {
    try {
      execSync('Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue', { stdio: 'inherit' });
      console.log('✅ node_modules eliminado');
    } catch (error) {
      console.log('ℹ️ Error eliminando node_modules');
    }
  }
  
  // 4. Reinstalar dependencias
  console.log('📦 Reinstalando dependencias...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencias reinstaladas');
  
  // 5. Verificar archivos críticos del dashboard
  console.log('🔍 Verificando archivos críticos del dashboard...');
  const criticalFiles = [
    'app/admin/dashboard/page.tsx',
    'components/admin/admin-guard.tsx',
    'components/auth-provider.tsx',
    'hooks/use-auth.ts',
    'middleware.ts'
  ];
  
  let allFilesExist = true;
  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - NO ENCONTRADO`);
      allFilesExist = false;
    }
  });
  
  if (!allFilesExist) {
    console.log('\n❌ Faltan archivos críticos. Por favor, verifica la instalación.');
    process.exit(1);
  }
  
  // 6. Verificar variables de entorno
  console.log('\n🔧 Verificando variables de entorno...');
  const envPath = '.env.local';
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
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
      console.log('Por favor, configura las variables de entorno necesarias.');
    } else {
      console.log('✅ Variables de entorno configuradas correctamente');
    }
  } else {
    console.log('❌ Archivo .env.local no encontrado');
    console.log('Por favor, crea el archivo .env.local con las variables necesarias.');
  }
  
  // 7. Hacer build de prueba
  console.log('\n🔨 Haciendo build de prueba...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build exitoso');
  } catch (error) {
    console.log('❌ Error en el build:', error.message);
    process.exit(1);
  }
  
  console.log('\n🎉 ¡Problemas del dashboard solucionados!');
  console.log('Ahora puedes ejecutar: npm run dev');
  
} catch (error) {
  console.error('❌ Error durante la solución:', error.message);
  process.exit(1);
}
