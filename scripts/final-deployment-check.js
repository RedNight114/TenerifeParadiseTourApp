#!/usr/bin/env node

/**
 * Script de Verificación Final para Despliegue
 * Verifica que todo esté listo antes de subir a producción
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 VERIFICACIÓN FINAL DE DESPLIEGUE')
console.log('=====================================\n')

let allChecksPassed = true

// Función para verificar archivos
function checkFile(filePath, description) {
  try {
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${description}`)
      return true
    } else {
      console.log(`❌ ${description} - ARCHIVO FALTANTE`)
      return false
    }
  } catch (error) {
    console.log(`❌ ${description} - ERROR: ${error.message}`)
    return false
  }
}

// Función para verificar contenido de archivos
function checkFileContent(filePath, requiredContent, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    if (content.includes(requiredContent)) {
      console.log(`✅ ${description}`)
      return true
    } else {
      console.log(`❌ ${description} - CONTENIDO FALTANTE`)
      return false
    }
  } catch (error) {
    console.log(`❌ ${description} - ERROR: ${error.message}`)
    return false
  }
}

// 1. Verificar archivos de configuración críticos
console.log('📋 ARCHIVOS DE CONFIGURACIÓN:')
allChecksPassed &= checkFile('package.json', 'package.json')
allChecksPassed &= checkFile('next.config.mjs', 'next.config.mjs')
allChecksPassed &= checkFile('vercel.json', 'vercel.json')
allChecksPassed &= checkFile('tsconfig.json', 'tsconfig.json')
allChecksPassed &= checkFile('tailwind.config.ts', 'tailwind.config.ts')
allChecksPassed &= checkFile('env.example', 'env.example')
allChecksPassed &= checkFile('env.production.example', 'env.production.example')

console.log('')

// 2. Verificar archivos de base de datos
console.log('🗄️ ARCHIVOS DE BASE DE DATOS:')
allChecksPassed &= checkFile('scripts/01-create-tables-updated.sql', 'Script de creación de tablas')
allChecksPassed &= checkFile('scripts/02-insert-categories.sql', 'Script de categorías')
allChecksPassed &= checkFile('scripts/03-rls-policies-updated.sql', 'Script de políticas RLS')
allChecksPassed &= checkFile('scripts/27-create-audit-logs-table.sql', 'Script de auditoría')
allChecksPassed &= checkFile('scripts/29-create-contact-messages-table.sql', 'Script de mensajes')

console.log('')

// 3. Verificar archivos de autenticación
console.log('🔐 ARCHIVOS DE AUTENTICACIÓN:')
allChecksPassed &= checkFile('hooks/use-auth-final.ts', 'Hook de autenticación')
allChecksPassed &= checkFile('lib/supabase-optimized.ts', 'Cliente Supabase optimizado')
allChecksPassed &= checkFile('components/auth-guard.tsx', 'Componente AuthGuard')
allChecksPassed &= checkFile('middleware.ts', 'Middleware')

console.log('')

// 4. Verificar archivos de pagos
console.log('💳 ARCHIVOS DE PAGOS:')
allChecksPassed &= checkFile('lib/redsys-signature.ts', 'Firma Redsys')
allChecksPassed &= checkFile('app/api/payment/create/route.ts', 'API de creación de pago')
allChecksPassed &= checkFile('app/api/payment/confirm/route.ts', 'API de confirmación')
allChecksPassed &= checkFile('app/api/payment/webhook/route.ts', 'API de webhook')

console.log('')

// 5. Verificar archivos de administración
console.log('⚙️ ARCHIVOS DE ADMINISTRACIÓN:')
allChecksPassed &= checkFile('app/admin/dashboard/page.tsx', 'Dashboard admin')
allChecksPassed &= checkFile('components/admin/admin-guard.tsx', 'AdminGuard')
allChecksPassed &= checkFile('components/admin/services-management.tsx', 'Gestión de servicios')
allChecksPassed &= checkFile('components/admin/reservations-management.tsx', 'Gestión de reservas')

console.log('')

// 6. Verificar archivos de SEO y PWA
console.log('📱 ARCHIVOS DE SEO Y PWA:')
allChecksPassed &= checkFile('public/manifest.json', 'Manifest PWA')
allChecksPassed &= checkFile('app/api/sitemap/route.ts', 'API de sitemap')
allChecksPassed &= checkFile('app/api/robots/route.ts', 'API de robots.txt')
allChecksPassed &= checkFile('app/layout.tsx', 'Layout principal')

console.log('')

// 7. Verificar contenido crítico
console.log('📄 CONTENIDO CRÍTICO:')
allChecksPassed &= checkFileContent('package.json', '"build": "next build"', 'Script de build en package.json')
allChecksPassed &= checkFileContent('next.config.mjs', 'experimental:', 'Configuración experimental en Next.js')
allChecksPassed &= checkFileContent('middleware.ts', 'NextResponse', 'Middleware configurado')
allChecksPassed &= checkFileContent('env.example', 'NEXT_PUBLIC_SUPABASE_URL', 'Variables de Supabase en env.example')

console.log('')

// 8. Verificar estructura de directorios
console.log('📁 ESTRUCTURA DE DIRECTORIOS:')
const requiredDirs = [
  'app',
  'components',
  'hooks',
  'lib',
  'public',
  'scripts',
  'styles'
]

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ Directorio ${dir}/`)
  } else {
    console.log(`❌ Directorio ${dir}/ - FALTANTE`)
    allChecksPassed = false
  }
})

console.log('')

// 9. Verificar dependencias críticas
console.log('📦 DEPENDENCIAS CRÍTICAS:')
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const criticalDeps = [
  'next',
  'react',
  'react-dom',
  '@supabase/supabase-js',
  '@supabase/auth-helpers-nextjs',
  'tailwindcss',
  'typescript'
]

criticalDeps.forEach(dep => {
  if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
    console.log(`✅ ${dep}`)
  } else {
    console.log(`❌ ${dep} - FALTANTE`)
    allChecksPassed = false
  }
})

console.log('')

// 10. Verificar scripts de utilidad
console.log('🛠️ SCRIPTS DE UTILIDAD:')
const utilityScripts = [
  'scripts/clean-prevention.js',
  'scripts/final-verification.js',
  'scripts/optimize-for-production.js'
]

utilityScripts.forEach(script => {
  allChecksPassed &= checkFile(script, script)
})

console.log('')

// Resultado final
console.log('=====================================')
if (allChecksPassed) {
  console.log('🎉 ¡TODAS LAS VERIFICACIONES PASARON!')
  console.log('✅ El proyecto está listo para despliegue')
  console.log('')
  console.log('📋 PRÓXIMOS PASOS:')
  console.log('1. Ejecutar: npm run build')
  console.log('2. Configurar variables de entorno en Vercel')
  console.log('3. Ejecutar scripts SQL en Supabase')
  console.log('4. Desplegar en Vercel')
  console.log('5. Configurar dominio personalizado')
  console.log('6. Realizar pruebas de integración')
} else {
  console.log('❌ ALGUNAS VERIFICACIONES FALLARON')
  console.log('🔧 Por favor, corrige los errores antes del despliegue')
  process.exit(1)
}

console.log('')
console.log('🚀 ¡BUENA SUERTE CON EL DESPLIEGUE!') 