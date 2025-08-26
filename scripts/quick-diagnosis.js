// =====================================================
// DIAGNÓSTICO RÁPIDO: CONFIGURACIÓN Y CONEXIÓN
// =====================================================

console.log('🔍 DIAGNÓSTICO RÁPIDO DE CONFIGURACIÓN\n')

// Verificar variables de entorno
console.log('📋 VARIABLES DE ENTORNO:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurado' : '❌ NO configurado')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ NO configurado')

// Verificar si estamos en el directorio correcto
const fs = require('fs')
const path = require('path')

console.log('\n📁 DIRECTORIO ACTUAL:', process.cwd())
console.log('📁 ARCHIVOS EN EL DIRECTORIO:')

try {
  const files = fs.readdirSync('.')
  const relevantFiles = files.filter(file => 
    file.includes('env') || 
    file.includes('package') || 
    file.includes('next.config') ||
    file.includes('supabase')
  )
  
  relevantFiles.forEach(file => {
    console.log(`   - ${file}`)
  })
} catch (error) {
  console.log('   ❌ Error leyendo directorio:', error.message)
}

// Verificar archivo .env
console.log('\n🔐 ARCHIVO .ENV:')
try {
  if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8')
    const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL')
    const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    
    console.log('   - Archivo .env existe:', '✅')
    console.log('   - NEXT_PUBLIC_SUPABASE_URL:', hasSupabaseUrl ? '✅' : '❌')
    console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY:', hasSupabaseKey ? '✅' : '❌')
  } else {
    console.log('   - Archivo .env:', '❌ NO existe')
  }
} catch (error) {
  console.log('   ❌ Error leyendo .env:', error.message)
}

// Verificar archivo .env.local
console.log('\n🔐 ARCHIVO .ENV.LOCAL:')
try {
  if (fs.existsSync('.env.local')) {
    const envLocalContent = fs.readFileSync('.env.local', 'utf8')
    const hasSupabaseUrl = envLocalContent.includes('NEXT_PUBLIC_SUPABASE_URL')
    const hasSupabaseKey = envLocalContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    
    console.log('   - Archivo .env.local existe:', '✅')
    console.log('   - NEXT_PUBLIC_SUPABASE_URL:', hasSupabaseUrl ? '✅' : '❌')
    console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY:', hasSupabaseKey ? '✅' : '❌')
  } else {
    console.log('   - Archivo .env.local:', '❌ NO existe')
  }
} catch (error) {
  console.log('   ❌ Error leyendo .env.local:', error.message)
}

// Verificar package.json
console.log('\n📦 PACKAGE.JSON:')
try {
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    console.log('   - Nombre del proyecto:', packageJson.name || 'No especificado')
    console.log('   - Versión:', packageJson.version || 'No especificada')
    console.log('   - Dependencias de Supabase:', packageJson.dependencies?.['@supabase/supabase-js'] ? '✅' : '❌')
  } else {
    console.log('   - Archivo package.json:', '❌ NO existe')
  }
} catch (error) {
  console.log('   ❌ Error leyendo package.json:', error.message)
}

console.log('\n🎯 RECOMENDACIONES:')
console.log('1. Verifica que tengas un archivo .env o .env.local con las variables de Supabase')
console.log('2. Asegúrate de que las variables empiecen con NEXT_PUBLIC_')
console.log('3. Reinicia tu aplicación después de configurar las variables')
console.log('4. Verifica que la URL y la clave de Supabase sean correctas')




