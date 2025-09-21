#!/usr/bin/env node

/**
 * Script de diagnóstico para errores de hidratación de React
 * Identifica problemas comunes en la configuración de Next.js
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Diagnóstico de Errores de Hidratación\n')

// 1. Verificar configuración de Next.js
console.log('1. Verificando configuración de Next.js...')
const nextConfigPath = path.join(process.cwd(), 'next.config.mjs')
if (fs.existsSync(nextConfigPath)) {
  const config = fs.readFileSync(nextConfigPath, 'utf8')
  
  // Verificar configuraciones problemáticas
  const issues = []
  
  if (config.includes('optimizeCss: true')) {
    issues.push('❌ optimizeCss puede causar problemas de hidratación')
  }
  
  if (config.includes('memoryBasedWorkersCount: true')) {
    issues.push('❌ memoryBasedWorkersCount puede causar problemas en desarrollo')
  }
  
  if (config.includes('staleTimes')) {
    issues.push('⚠️ staleTimes es experimental y puede causar problemas')
  }
  
  if (issues.length > 0) {
    console.log('   Problemas encontrados:')
    issues.forEach(issue => console.log(`   ${issue}`))
  } else {
    console.log('   ✅ Configuración básica OK')
  }
} else {
  console.log('   ❌ next.config.mjs no encontrado')
}

// 2. Verificar dependencias problemáticas
console.log('\n2. Verificando dependencias...')
const packageJsonPath = path.join(process.cwd(), 'package.json')
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  
  const problematicDeps = []
  
  // Verificar versiones de React
  if (packageJson.dependencies?.react && packageJson.dependencies?.react !== '^18') {
    problematicDeps.push(`React: ${packageJson.dependencies.react} (recomendado: ^18)`)
  }
  
  if (packageJson.dependencies?.['react-dom'] && packageJson.dependencies['react-dom'] !== '^18') {
    problematicDeps.push(`React DOM: ${packageJson.dependencies['react-dom']} (recomendado: ^18)`)
  }
  
  // Verificar Next.js
  if (packageJson.dependencies?.next && !packageJson.dependencies.next.startsWith('14')) {
    problematicDeps.push(`Next.js: ${packageJson.dependencies.next} (recomendado: 14.x)`)
  }
  
  if (problematicDeps.length > 0) {
    console.log('   Dependencias problemáticas:')
    problematicDeps.forEach(dep => console.log(`   ❌ ${dep}`))
  } else {
    console.log('   ✅ Dependencias OK')
  }
} else {
  console.log('   ❌ package.json no encontrado')
}

// 3. Verificar archivos de layout
console.log('\n3. Verificando archivos de layout...')
const layoutPath = path.join(process.cwd(), 'app', 'layout.tsx')
if (fs.existsSync(layoutPath)) {
  const layout = fs.readFileSync(layoutPath, 'utf8')
  
  const issues = []
  
  if (!layout.includes('suppressHydrationWarning')) {
    issues.push('❌ Falta suppressHydrationWarning en el elemento html')
  }
  
  if (layout.includes('useEffect') && !layout.includes('"use client"')) {
    issues.push('❌ useEffect en componente de servidor')
  }
  
  if (layout.includes('localStorage') && !layout.includes('"use client"')) {
    issues.push('❌ localStorage en componente de servidor')
  }
  
  if (issues.length > 0) {
    console.log('   Problemas encontrados:')
    issues.forEach(issue => console.log(`   ${issue}`))
  } else {
    console.log('   ✅ Layout OK')
  }
} else {
  console.log('   ❌ app/layout.tsx no encontrado')
}

// 4. Verificar providers
console.log('\n4. Verificando providers...')
const providersPath = path.join(process.cwd(), 'components', 'providers')
if (fs.existsSync(providersPath)) {
  const providers = fs.readdirSync(providersPath)
  
  providers.forEach(provider => {
    if (provider.endsWith('.tsx') || provider.endsWith('.ts')) {
      const providerPath = path.join(providersPath, provider)
      const content = fs.readFileSync(providerPath, 'utf8')
      
      const issues = []
      
      if (content.includes('useEffect') && !content.includes('"use client"')) {
        issues.push(`❌ useEffect en ${provider} sin "use client"`)
      }
      
      if (content.includes('localStorage') && !content.includes('"use client"')) {
        issues.push(`❌ localStorage en ${provider} sin "use client"`)
      }
      
      if (content.includes('window') && !content.includes('"use client"')) {
        issues.push(`❌ window en ${provider} sin "use client"`)
      }
      
      if (issues.length > 0) {
        console.log(`   ${provider}:`)
        issues.forEach(issue => console.log(`     ${issue}`))
      }
    }
  })
} else {
  console.log('   ❌ Directorio de providers no encontrado')
}

// 5. Verificar caché
console.log('\n5. Verificando sistema de caché...')
const cachePath = path.join(process.cwd(), 'lib', 'unified-cache-system.ts')
if (fs.existsSync(cachePath)) {
  const cache = fs.readFileSync(cachePath, 'utf8')
  
  const issues = []
  
  if (cache.includes('localStorage') && !cache.includes('typeof window')) {
    issues.push('❌ localStorage sin verificación de window')
  }
  
  if (cache.includes('Web Worker') && !cache.includes('typeof Worker')) {
    issues.push('❌ Web Worker sin verificación de soporte')
  }
  
  if (issues.length > 0) {
    console.log('   Problemas encontrados:')
    issues.forEach(issue => console.log(`   ${issue}`))
  } else {
    console.log('   ✅ Sistema de caché OK')
  }
} else {
  console.log('   ⚠️ Sistema de caché unificado no encontrado')
}

// 6. Recomendaciones
console.log('\n6. Recomendaciones:')
console.log('   🔧 Soluciones inmediatas:')
console.log('   - Deshabilitar configuraciones experimentales en next.config.mjs')
console.log('   - Verificar que todos los providers tengan "use client"')
console.log('   - Limpiar caché del navegador')
console.log('   - Reiniciar el servidor de desarrollo')
console.log('')
console.log('   🚀 Soluciones avanzadas:')
console.log('   - Implementar Error Boundary personalizado')
console.log('   - Usar Suspense para componentes lazy')
console.log('   - Verificar diferencias entre servidor y cliente')
console.log('')

console.log('✅ Diagnóstico completado')
