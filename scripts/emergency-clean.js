const { execSync } = require('child_process')
const fs = require('fs')

console.log('🚨 LIMPIEZA DE EMERGENCIA DEL SISTEMA DE AUTENTICACIÓN\n')

try {
  // 1. Detener TODOS los procesos de Node.js
  console.log('🛑 Deteniendo todos los procesos de Node.js...')
  try {
    execSync('taskkill /f /im node.exe', { stdio: 'inherit' })
    console.log('✅ Procesos de Node.js detenidos')
  } catch (error) {
    console.log('ℹ️ No había procesos de Node.js ejecutándose')
  }
  
  // 2. Detener procesos en puerto 3000
  console.log('🛑 Deteniendo procesos en puerto 3000...')
  try {
    execSync('npx kill-port 3000', { stdio: 'inherit' })
    console.log('✅ Puerto 3000 liberado')
  } catch (error) {
    console.log('ℹ️ No había procesos en puerto 3000')
  }
  
  // 3. Limpiar cache de Next.js
  console.log('🧹 Limpiando cache de Next.js...')
  if (fs.existsSync('.next')) {
    try {
      execSync('Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue', { stdio: 'inherit' })
      console.log('✅ Cache limpiado')
    } catch (error) {
      console.log('ℹ️ Cache ya estaba limpio')
    }
  }
  
  // 4. Limpiar node_modules (opcional)
  console.log('🗑️ Limpiando node_modules...')
  if (fs.existsSync('node_modules')) {
    try {
      execSync('Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue', { stdio: 'inherit' })
      console.log('✅ node_modules eliminado')
      
      console.log('📦 Reinstalando dependencias...')
      execSync('npm install', { stdio: 'inherit' })
      console.log('✅ Dependencias reinstaladas')
    } catch (error) {
      console.log('ℹ️ Error limpiando node_modules, continuando...')
    }
  }
  
  // 5. Verificar archivos críticos
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
  
  // 6. Verificar variables de entorno
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
  
  // 7. Instrucciones para el usuario
  console.log('\n📋 INSTRUCCIONES DE EMERGENCIA:')
  console.log('1. Cierra TODOS los navegadores')
  console.log('2. Ejecuta: npm run dev')
  console.log('3. Abre un NUEVO navegador en modo incógnito')
  console.log('4. Ve a: http://localhost:3000/auth/login')
  console.log('5. Usa las credenciales:')
  console.log('   Cliente: brian12guargacho@gmail.com / Claudia1712')
  console.log('   Admin: Tecnicos@tenerifeparadise.com / TenerifeparadiseTour2025')
  
  console.log('\n🎯 Si el problema persiste:')
  console.log('- Verifica que no haya múltiples instancias del servidor')
  console.log('- Usa un navegador diferente')
  console.log('- Limpia completamente el cache del navegador')
  console.log('- Verifica la conexión a internet')
  
} catch (error) {
  console.error('❌ Error durante la limpieza de emergencia:', error.message)
  console.log('\n🔧 Instrucciones manuales:')
  console.log('1. Cierra TODOS los navegadores y terminales')
  console.log('2. Abre una NUEVA terminal')
  console.log('3. Ejecuta: npm run dev')
  console.log('4. Usa un navegador en modo incógnito')
  console.log('5. Prueba el login con las credenciales proporcionadas')
} 