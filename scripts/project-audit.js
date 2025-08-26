const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔍 Iniciando auditoría completa del proyecto...\n')

const errors = []
const warnings = []
const info = []

// 1. Verificar estructura de archivos
console.log('📁 Verificando estructura de archivos...')

const requiredFiles = [
  'package.json',
  'next.config.mjs',
  'tsconfig.json',
  'eslint.config.mjs',
  'middleware.ts',
  'app/layout.tsx',
  'app/(main)/page.tsx'
]

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    info.push(`✅ ${file} existe`)
  } else {
    errors.push(`❌ ${file} no existe`)
  }
})

// 2. Verificar importaciones problemáticas
console.log('🔗 Verificando importaciones...')

const filesToCheck = [
  'components/optimized-service-card.tsx',
  'components/optimized-service-gallery.tsx',
  'components/featured-services.tsx',
  'components/services-grid.tsx',
  'app/(main)/services/page.tsx',
  'app/(main)/services/[serviceId]/page.tsx',
  'app/(main)/booking/[serviceId]/page.tsx'
]

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8')
    
    // Verificar importaciones de image-optimization
    if (content.includes('@/lib/image-optimization') && !content.includes('@/lib/image-optimization.tsx')) {
      errors.push(`❌ ${file}: Importación incorrecta de image-optimization (falta .tsx)`)
    }
    
    // Verificar console.log en producción
    if (content.includes('console.log')) {
      warnings.push(`⚠️ ${file}: Contiene console.log (debería removerse en producción)`)
    }
    
    // Verificar uso de 'any'
    const anyMatches = content.match(/:\s*any\b/g)
    if (anyMatches) {
      warnings.push(`⚠️ ${file}: Usa tipos 'any' (${anyMatches.length} ocurrencias)`)
    }
  } else {
    errors.push(`❌ ${file} no existe`)
  }
})

// 3. Verificar archivos de configuración
console.log('⚙️ Verificando configuraciones...')

// Verificar package.json
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  
  if (!packageJson.scripts.dev) {
    errors.push('❌ package.json: Falta script "dev"')
  }
  
  if (!packageJson.dependencies.next) {
    errors.push('❌ package.json: Falta dependencia "next"')
  }
  
  if (!packageJson.dependencies.react) {
    errors.push('❌ package.json: Falta dependencia "react"')
  }
  
  info.push('✅ package.json: Estructura válida')
} catch (e) {
  errors.push('❌ package.json: Error de sintaxis JSON')
}

// Verificar tsconfig.json
try {
  const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'))
  
  if (!tsconfig.compilerOptions.paths) {
    warnings.push('⚠️ tsconfig.json: No hay paths configurados')
  }
  
  info.push('✅ tsconfig.json: Estructura válida')
} catch (e) {
  errors.push('❌ tsconfig.json: Error de sintaxis JSON')
}

// 4. Verificar archivos duplicados o obsoletos
console.log('🗂️ Verificando archivos duplicados...')

const duplicateFiles = [
  'next.config.mjs.backup',
  'next.config.mjs.backup-full',
  'app/layout.tsx.backup',
  'app/layout.tsx.backup-full'
]

duplicateFiles.forEach(file => {
  if (fs.existsSync(file)) {
    warnings.push(`⚠️ ${file}: Archivo de backup encontrado (considerar eliminar)`)
  }
})

// 5. Verificar archivos de documentación
console.log('📚 Verificando documentación...')

const docFiles = fs.readdirSync('.').filter(file => file.endsWith('.md'))
info.push(`📚 Encontrados ${docFiles.length} archivos de documentación`)

// 6. Verificar scripts
console.log('🔧 Verificando scripts...')

const scriptsDir = 'scripts'
if (fs.existsSync(scriptsDir)) {
  const scripts = fs.readdirSync(scriptsDir).filter(file => file.endsWith('.js'))
  info.push(`🔧 Encontrados ${scripts.length} scripts de utilidad`)
}

// 7. Verificar componentes UI
console.log('🎨 Verificando componentes UI...')

const uiDir = 'components/ui'
if (fs.existsSync(uiDir)) {
  const uiComponents = fs.readdirSync(uiDir).filter(file => file.endsWith('.tsx'))
  info.push(`🎨 Encontrados ${uiComponents.length} componentes UI`)
}

// 8. Verificar hooks
console.log('🎣 Verificando hooks...')

const hooksDir = 'hooks'
if (fs.existsSync(hooksDir)) {
  const hooks = fs.readdirSync(hooksDir).filter(file => file.endsWith('.ts') || file.endsWith('.tsx'))
  info.push(`🎣 Encontrados ${hooks.length} hooks`)
}

// 9. Verificar APIs
console.log('🌐 Verificando APIs...')

const apiDir = 'app/api'
if (fs.existsSync(apiDir)) {
  const apis = []
  const scanApis = (dir) => {
    const items = fs.readdirSync(dir)
    items.forEach(item => {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
        scanApis(fullPath)
      } else if (item === 'route.ts') {
        apis.push(fullPath.replace('app/api/', '').replace('/route.ts', ''))
      }
    })
  }
  scanApis(apiDir)
  info.push(`🌐 Encontradas ${apis.length} rutas de API`)
}

// Mostrar resultados
console.log('\n📊 RESULTADOS DE LA AUDITORÍA\n')
console.log('=' * 50)

if (errors.length > 0) {
  console.log('\n❌ ERRORES CRÍTICOS:')
  errors.forEach(error => console.log(error))
}

if (warnings.length > 0) {
  console.log('\n⚠️ ADVERTENCIAS:')
  warnings.forEach(warning => console.log(warning))
}

if (info.length > 0) {
  console.log('\nℹ️ INFORMACIÓN:')
  info.forEach(item => console.log(item))
}

console.log('\n' + '=' * 50)
console.log(`📈 RESUMEN:`)
console.log(`   • Errores críticos: ${errors.length}`)
console.log(`   • Advertencias: ${warnings.length}`)
console.log(`   • Información: ${info.length}`)

if (errors.length === 0) {
  console.log('\n🎉 ¡Proyecto en buen estado! Solo hay advertencias menores.')
} else {
  console.log('\n🚨 Se encontraron errores críticos que deben corregirse.')
}

console.log('\n🔍 Auditoría completada.') 