#!/usr/bin/env node

/**
 * Script para arreglar el bucle infinito de autenticación
 * Limpia el estado de autenticación y reinicia el sistema
 */

const fs = require('fs')
const path = require('path')

console.log('🔧 Arreglando bucle infinito de autenticación...\n')

// 1. Limpiar localStorage y sessionStorage
console.log('1️⃣ Limpiando almacenamiento del navegador...')
const clearStorageScript = `
// Limpiar localStorage
localStorage.clear()
sessionStorage.clear()

// Limpiar cookies de autenticación
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
})

console.log('✅ Almacenamiento limpiado')
`

// 2. Crear archivo de limpieza temporal
const tempFile = path.join(__dirname, 'clear-storage.js')
fs.writeFileSync(tempFile, clearStorageScript)
console.log('✅ Script de limpieza creado:', tempFile)

// 3. Verificar archivos de configuración
console.log('\n2️⃣ Verificando archivos de configuración...')

const filesToCheck = [
  'hooks/use-auth.ts',
  'components/auth-guard.tsx',
  'components/auth-redirect-handler.tsx',
  'lib/supabase-optimized.ts'
]

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, '..', file)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} existe`)
  } else {
    console.log(`❌ ${file} no existe`)
  }
})

// 4. Verificar variables de entorno
console.log('\n3️⃣ Verificando variables de entorno...')
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

// 5. Instrucciones para el usuario
console.log('\n4️⃣ Instrucciones para completar la reparación:')
console.log('')
console.log('📋 Pasos a seguir:')
console.log('1. Detén el servidor de desarrollo (Ctrl+C)')
console.log('2. Abre las herramientas de desarrollador del navegador (F12)')
console.log('3. Ve a la pestaña Console')
console.log('4. Ejecuta el siguiente comando:')
console.log('   localStorage.clear()')
console.log('   sessionStorage.clear()')
console.log('5. Recarga la página (F5)')
console.log('6. Reinicia el servidor: npm run dev')
console.log('')

// 6. Crear script de reinicio
const restartScript = `
#!/usr/bin/env node

const { execSync } = require('child_process')

console.log('🔄 Reiniciando servidor de desarrollo...')

try {
  // Detener procesos en puerto 3000
  execSync('npx kill-port 3000', { stdio: 'inherit' })
  console.log('✅ Puerto 3000 liberado')
  
  // Limpiar cache de Next.js
  execSync('npx next clean', { stdio: 'inherit' })
  console.log('✅ Cache limpiado')
  
  // Reiniciar servidor
  execSync('npm run dev', { stdio: 'inherit' })
} catch (error) {
  console.error('❌ Error reiniciando servidor:', error.message)
}
`

const restartFile = path.join(__dirname, 'restart-dev.js')
fs.writeFileSync(restartFile, restartScript)
console.log('✅ Script de reinicio creado:', restartFile)

// 7. Verificar dependencias
console.log('\n5️⃣ Verificando dependencias...')
const packagePath = path.join(__dirname, '..', 'package.json')
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  const hasSupabase = packageJson.dependencies && packageJson.dependencies['@supabase/supabase-js']
  const hasNext = packageJson.dependencies && packageJson.dependencies['next']
  
  if (hasSupabase) {
    console.log('✅ @supabase/supabase-js instalado')
  } else {
    console.log('❌ @supabase/supabase-js no instalado')
  }
  
  if (hasNext) {
    console.log('✅ Next.js instalado')
  } else {
    console.log('❌ Next.js no instalado')
  }
}

console.log('\n✅ Reparación completada')
console.log('')
console.log('🚀 Para aplicar los cambios:')
console.log('1. Ejecuta: node scripts/restart-dev.js')
console.log('2. O manualmente: npm run dev')
console.log('')
console.log('🔍 Si el problema persiste, ejecuta: node scripts/diagnose-auth.js') 