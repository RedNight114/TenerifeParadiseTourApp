const fs = require('fs')
const path = require('path')

console.log('🔍 Verificando entorno de desarrollo...\n')

// Verificar archivos importantes
const filesToCheck = [
  '.env.local',
  'package.json',
  'next.config.mjs',
  'tsconfig.json'
]

console.log('📁 Archivos del proyecto:')
filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, '..', file)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - NO ENCONTRADO`)
  }
})

// Verificar variables de entorno
console.log('\n🔧 Variables de entorno:')
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8')
  const lines = content.split('\n')
  
  const envVars = {
    'NEXT_PUBLIC_SUPABASE_URL': false,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': false
  }
  
  lines.forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      envVars['NEXT_PUBLIC_SUPABASE_URL'] = true
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = true
    }
  })
  
  Object.entries(envVars).forEach(([key, exists]) => {
    console.log(`${exists ? '✅' : '❌'} ${key}`)
  })
} else {
  console.log('❌ Archivo .env.local no encontrado')
}

// Verificar configuración de Next.js
console.log('\n⚙️  Configuración de Next.js:')
const nextConfigPath = path.join(__dirname, '..', 'next.config.mjs')
if (fs.existsSync(nextConfigPath)) {
  const content = fs.readFileSync(nextConfigPath, 'utf8')
  console.log('✅ next.config.mjs encontrado')
  
  if (content.includes('experimental')) {
    console.log('⚠️  Configuración experimental detectada')
  }
  
  if (content.includes('headers')) {
    console.log('✅ Headers personalizados configurados')
  }
} else {
  console.log('❌ next.config.mjs no encontrado')
}

// Verificar middleware
console.log('\n🛡️  Middleware:')
const middlewarePath = path.join(__dirname, '..', 'middleware.ts')
if (fs.existsSync(middlewarePath)) {
  const content = fs.readFileSync(middlewarePath, 'utf8')
  console.log('✅ middleware.ts encontrado')
  
  if (content.includes('CORS')) {
    console.log('✅ CORS configurado en middleware')
  }
  
  if (content.includes('rate-limit')) {
    console.log('✅ Rate limiting configurado')
  }
} else {
  console.log('❌ middleware.ts no encontrado')
}

// Verificar dependencias
console.log('\n📦 Dependencias:')
const packagePath = path.join(__dirname, '..', 'package.json')
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  
  const requiredDeps = ['@supabase/supabase-js', 'next', 'react']
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      console.log(`✅ ${dep}`)
    } else {
      console.log(`❌ ${dep} - NO INSTALADO`)
    }
  })
  
  console.log(`📋 Versión de Next.js: ${packageJson.dependencies?.next || 'No encontrada'}`)
  console.log(`📋 Versión de Supabase: ${packageJson.dependencies?.['@supabase/supabase-js'] || 'No encontrada'}`)
} else {
  console.log('❌ package.json no encontrado')
}

console.log('\n🏁 Verificación completada') 