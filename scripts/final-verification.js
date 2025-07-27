const fs = require('fs')
const path = require('path')

console.log('🔍 VERIFICACIÓN FINAL DEL SISTEMA')
console.log('==================================\n')

// Verificar archivos críticos
const criticalFiles = [
  'app/api/payment/create/route.ts',
  'app/api/payment/webhook/route.ts',
  'lib/redsys-signature.ts',
  'middleware.ts',
  'package.json',
  'next.config.mjs',
  'vercel.json'
]

console.log('📁 VERIFICANDO ARCHIVOS CRÍTICOS:')
console.log('==================================')

let allFilesExist = true
criticalFiles.forEach(file => {
  const exists = fs.existsSync(file)
  console.log(`${exists ? '✅' : '❌'} ${file}`)
  if (!exists) allFilesExist = false
})

// Verificar dependencias críticas
console.log('\n📦 VERIFICANDO DEPENDENCIAS:')
console.log('============================')

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const criticalDeps = [
  'next',
  '@supabase/supabase-js',
  'crypto'
]

criticalDeps.forEach(dep => {
  const hasDep = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
  console.log(`${hasDep ? '✅' : '❌'} ${dep}`)
})

// Verificar configuración de Next.js
console.log('\n⚙️  VERIFICANDO CONFIGURACIÓN:')
console.log('=============================')

const nextConfig = fs.existsSync('next.config.mjs')
const vercelConfig = fs.existsSync('vercel.json')
const envExample = fs.existsSync('env.example')

console.log(`${nextConfig ? '✅' : '❌'} next.config.mjs`)
console.log(`${vercelConfig ? '✅' : '❌'} vercel.json`)
console.log(`${envExample ? '✅' : '❌'} env.example`)

// Verificar estructura de directorios
console.log('\n📂 VERIFICANDO ESTRUCTURA:')
console.log('==========================')

const criticalDirs = [
  'app/api/payment',
  'app/api/auth',
  'components',
  'lib',
  'hooks'
]

criticalDirs.forEach(dir => {
  const exists = fs.existsSync(dir)
  console.log(`${exists ? '✅' : '❌'} ${dir}/`)
})

// Verificar scripts de build
console.log('\n🔧 VERIFICANDO SCRIPTS:')
console.log('=======================')

const scripts = packageJson.scripts || {}
const criticalScripts = ['build', 'dev', 'start']

criticalScripts.forEach(script => {
  const hasScript = scripts[script]
  console.log(`${hasScript ? '✅' : '❌'} npm run ${script}`)
})

// Verificar variables de entorno requeridas
console.log('\n🔐 VERIFICANDO VARIABLES DE ENTORNO:')
console.log('=====================================')

const envExampleContent = fs.existsSync('env.example') ? fs.readFileSync('env.example', 'utf8') : ''
const requiredVars = [
  'REDSYS_MERCHANT_CODE',
  'REDSYS_TERMINAL', 
  'REDSYS_SECRET_KEY',
  'REDSYS_ENVIRONMENT',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SITE_URL'
]

requiredVars.forEach(varName => {
  const hasVar = envExampleContent.includes(varName)
  console.log(`${hasVar ? '✅' : '❌'} ${varName}`)
})

// Resumen final
console.log('\n🎯 RESUMEN FINAL:')
console.log('==================')

const checks = [
  allFilesExist,
  criticalDeps.every(dep => packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]),
  nextConfig,
  vercelConfig,
  envExample,
  criticalDirs.every(dir => fs.existsSync(dir)),
  criticalScripts.every(script => scripts[script]),
  requiredVars.every(varName => envExampleContent.includes(varName))
]

const allChecksPassed = checks.every(check => check)

if (allChecksPassed) {
  console.log('✅ TODAS LAS VERIFICACIONES PASARON')
  console.log('🚀 SISTEMA LISTO PARA DESPLIEGUE')
  console.log('\n📋 PRÓXIMOS PASOS:')
  console.log('1. Configurar variables de entorno en Vercel')
  console.log('2. Conectar repositorio a Vercel')
  console.log('3. Desplegar aplicación')
  console.log('4. Configurar dominio personalizado')
  console.log('5. Verificar funcionalidades en producción')
} else {
  console.log('❌ ALGUNAS VERIFICACIONES FALLARON')
  console.log('🔧 REVISAR CONFIGURACIÓN ANTES DEL DESPLIEGUE')
}

console.log('\n📊 ESTADÍSTICAS:')
console.log(`- Archivos críticos: ${criticalFiles.filter(f => fs.existsSync(f)).length}/${criticalFiles.length}`)
console.log(`- Dependencias: ${criticalDeps.filter(dep => packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]).length}/${criticalDeps.length}`)
console.log(`- Directorios: ${criticalDirs.filter(dir => fs.existsSync(dir)).length}/${criticalDirs.length}`)
console.log(`- Scripts: ${criticalScripts.filter(script => scripts[script]).length}/${criticalScripts.length}`)
console.log(`- Variables de entorno: ${requiredVars.filter(varName => envExampleContent.includes(varName)).length}/${requiredVars.length}`)

console.log('\n🎉 VERIFICACIÓN COMPLETADA') 