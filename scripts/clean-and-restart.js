const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🧹 Limpieza completa y reinicio del sistema...\n')

try {
  // 1. Detener procesos en puerto 3000
  console.log('🛑 Deteniendo procesos en puerto 3000...')
  execSync('npx kill-port 3000', { stdio: 'inherit' })
  console.log('✅ Puerto 3000 liberado')
  
  // 2. Limpiar cache de Next.js
  console.log('🧹 Limpiando cache de Next.js...')
  if (fs.existsSync('.next')) {
    execSync('npx next clean', { stdio: 'inherit' })
    console.log('✅ Cache limpiado')
  }
  
  // 3. Limpiar node_modules (opcional)
  console.log('🗑️ Limpiando node_modules...')
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' })
    console.log('✅ node_modules eliminado')
    
    console.log('📦 Reinstalando dependencias...')
    execSync('npm install', { stdio: 'inherit' })
    console.log('✅ Dependencias reinstaladas')
  }
  
  // 4. Verificar archivos críticos
  console.log('🔍 Verificando archivos críticos...')
  const criticalFiles = [
    'hooks/use-auth.ts',
    'components/auth-guard.tsx',
    'components/auth-redirect-handler.tsx',
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
  
  // 5. Verificar variables de entorno
  console.log('\n🔧 Verificando variables de entorno...')
  const envPath = path.join(__dirname, '..', '.env.local')
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
  
  // 6. Reiniciar servidor
  console.log('\n🚀 Reiniciando servidor...')
  execSync('npm run dev', { stdio: 'inherit' })
  
} catch (error) {
  console.error('❌ Error durante la limpieza:', error.message)
  console.log('\n🔧 Instrucciones manuales:')
  console.log('1. Detén el servidor manualmente (Ctrl+C)')
  console.log('2. Ejecuta: npx kill-port 3000')
  console.log('3. Ejecuta: npx next clean')
  console.log('4. Ejecuta: npm run dev')
  console.log('5. Limpia localStorage en el navegador:')
  console.log('   - Abre DevTools (F12)')
  console.log('   - En la consola ejecuta: localStorage.clear()')
  console.log('   - Recarga la página (F5)')
} 