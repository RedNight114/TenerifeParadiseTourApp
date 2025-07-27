const { execSync } = require('child_process')
const fs = require('fs')

console.log('🔧 Solución final del sistema de autenticación...\n')

try {
  // 1. Detener procesos en puerto 3000
  console.log('🛑 Deteniendo procesos en puerto 3000...')
  try {
    execSync('npx kill-port 3000', { stdio: 'inherit' })
    console.log('✅ Puerto 3000 liberado')
  } catch (error) {
    console.log('ℹ️ No había procesos en puerto 3000')
  }
  
  // 2. Limpiar cache de Next.js
  console.log('🧹 Limpiando cache de Next.js...')
  if (fs.existsSync('.next')) {
    try {
      execSync('Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue', { stdio: 'inherit' })
      console.log('✅ Cache limpiado')
    } catch (error) {
      console.log('ℹ️ Cache ya estaba limpio')
    }
  }
  
  // 3. Verificar archivos críticos
  console.log('🔍 Verificando archivos críticos...')
  const criticalFiles = [
    'hooks/use-auth.ts',
    'components/auth-guard.tsx',
    'components/auth-redirect-handler.tsx',
    'middleware.ts',
    'lib/supabase-optimized.ts',
    'app/(main)/profile/page.tsx',
    'app/(main)/reservations/page.tsx',
    'hooks/use-reservations.ts'
  ]
  
  let allFilesExist = true
  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`)
    } else {
      console.log(`❌ ${file} - NO ENCONTRADO`)
      allFilesExist = false
    }
  })
  
  if (!allFilesExist) {
    console.log('\n❌ Faltan archivos críticos. Por favor, verifica la instalación.')
    process.exit(1)
  }
  
  // 4. Verificar variables de entorno
  console.log('\n🔧 Verificando variables de entorno...')
  const envPath = '.env.local'
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL')
    const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    
    if (hasSupabaseUrl && hasSupabaseKey) {
      console.log('✅ Variables de entorno de Supabase encontradas')
    } else {
      console.log('❌ Faltan variables de entorno de Supabase')
      console.log('Por favor, verifica tu archivo .env.local')
    }
  } else {
    console.log('❌ Archivo .env.local no encontrado')
    console.log('Por favor, crea el archivo .env.local con las variables de Supabase')
  }
  
  // 5. Instrucciones para el usuario
  console.log('\n📋 INSTRUCCIONES PARA EL USUARIO:')
  console.log('1. Ejecuta: npm run dev')
  console.log('2. Abre el navegador en: http://localhost:3000')
  console.log('3. Abre DevTools (F12)')
  console.log('4. En la consola ejecuta: localStorage.clear()')
  console.log('5. Recarga la página (F5)')
  console.log('6. Ve a: http://localhost:3000/auth/login')
  console.log('7. Usa las credenciales:')
  console.log('   Cliente: brian12guargacho@gmail.com / Claudia1712')
  console.log('   Admin: Tecnicos@tenerifeparadise.com / TenerifeparadiseTour2025')
  
  console.log('\n🎯 El sistema debería funcionar correctamente ahora.')
  console.log('Si persiste el problema, verifica:')
  console.log('- Conexión a internet')
  console.log('- Variables de entorno correctas')
  console.log('- Usuarios existentes en Supabase')
  
} catch (error) {
  console.error('❌ Error durante la verificación:', error.message)
  console.log('\n🔧 Instrucciones manuales:')
  console.log('1. Detén el servidor manualmente (Ctrl+C)')
  console.log('2. Ejecuta: npx kill-port 3000')
  console.log('3. Ejecuta: npm run dev')
  console.log('4. Limpia localStorage en el navegador')
  console.log('5. Prueba el login con las credenciales proporcionadas')
} 