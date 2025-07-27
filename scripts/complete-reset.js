const { execSync } = require('child_process')
const fs = require('fs')

console.log('🔄 REINICIO COMPLETO DEL SISTEMA\n')

try {
  // 1. Detener TODOS los procesos
  console.log('🛑 Deteniendo todos los procesos...')
  try {
    execSync('taskkill /f /im node.exe', { stdio: 'inherit' })
    console.log('✅ Procesos detenidos')
  } catch (error) {
    console.log('ℹ️ No había procesos ejecutándose')
  }
  
  // 2. Limpiar cache
  console.log('🧹 Limpiando cache...')
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
    'app/(main)/profile/page.tsx',
    'middleware.ts',
    'lib/supabase-optimized.ts'
  ]
  
  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`)
    } else {
      console.log(`❌ ${file} - NO ENCONTRADO`)
    }
  })
  
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
    }
  } else {
    console.log('❌ Archivo .env.local no encontrado')
  }
  
  // 5. Reiniciar servidor
  console.log('\n🚀 Reiniciando servidor...')
  console.log('📋 INSTRUCCIONES PARA PROBAR:')
  console.log('1. El servidor se está iniciando...')
  console.log('2. Abre un navegador en modo incógnito')
  console.log('3. Ve a: http://localhost:3000/auth/login')
  console.log('4. Usa las credenciales:')
  console.log('   Cliente: brian12guargacho@gmail.com / Claudia1712')
  console.log('   Admin: Tecnicos@tenerifeparadise.com / TenerifeparadiseTour2025')
  console.log('5. Debería redirigir a /profile sin problemas')
  
  // 6. Ejecutar el servidor
  execSync('npm run dev', { stdio: 'inherit' })
  
} catch (error) {
  console.error('❌ Error durante el reinicio:', error.message)
  console.log('\n🔧 Instrucciones manuales:')
  console.log('1. Cierra TODOS los navegadores')
  console.log('2. Abre una NUEVA terminal')
  console.log('3. Ejecuta: npm run dev')
  console.log('4. Usa un navegador en modo incógnito')
  console.log('5. Prueba el login con las credenciales proporcionadas')
} 