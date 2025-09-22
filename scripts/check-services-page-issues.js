/**
 * Script para verificar problemas específicos en la página de servicios
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Verificando posibles problemas en la página de servicios...')

// 1. Verificar archivos críticos
const criticalFiles = [
  'app/(main)/services/page.tsx',
  'components/services-grid.tsx',
  'hooks/use-unified-cache.ts',
  'components/advanced-service-card.tsx',
  'components/simple-service-card.tsx'
]

console.log('\n1️⃣ Verificando archivos críticos...')
criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - ARCHIVO FALTANTE`)
  }
})

// 2. Verificar imports en la página de servicios
console.log('\n2️⃣ Verificando imports en la página de servicios...')
try {
  const servicesPagePath = path.join(__dirname, '..', 'app/(main)/services/page.tsx')
  const servicesPageContent = fs.readFileSync(servicesPagePath, 'utf8')
  
  const requiredImports = [
    'useServices',
    'useCategories', 
    'useSubcategories',
    'ServicesGrid',
    'AdvancedLoading',
    'AdvancedError'
  ]
  
  requiredImports.forEach(importName => {
    if (servicesPageContent.includes(importName)) {
      console.log(`✅ Import ${importName} encontrado`)
    } else {
      console.log(`❌ Import ${importName} FALTANTE`)
    }
  })
} catch (error) {
  console.log(`❌ Error leyendo página de servicios: ${error.message}`)
}

// 3. Verificar hooks de caché unificado
console.log('\n3️⃣ Verificando hooks de caché...')
try {
  const cacheHookPath = path.join(__dirname, '..', 'hooks/use-unified-cache.ts')
  const cacheHookContent = fs.readFileSync(cacheHookPath, 'utf8')
  
  const requiredHooks = [
    'useServices',
    'useCategories',
    'useSubcategories'
  ]
  
  requiredHooks.forEach(hookName => {
    if (cacheHookContent.includes(`export function ${hookName}`)) {
      console.log(`✅ Hook ${hookName} exportado`)
    } else {
      console.log(`❌ Hook ${hookName} NO EXPORTADO`)
    }
  })
} catch (error) {
  console.log(`❌ Error leyendo hooks de caché: ${error.message}`)
}

// 4. Verificar componentes de servicios
console.log('\n4️⃣ Verificando componentes de servicios...')
const serviceComponents = [
  'components/services-grid.tsx',
  'components/advanced-service-card.tsx',
  'components/simple-service-card.tsx'
]

serviceComponents.forEach(component => {
  try {
    const componentPath = path.join(__dirname, '..', component)
    if (fs.existsSync(componentPath)) {
      const content = fs.readFileSync(componentPath, 'utf8')
      
      // Verificar que el componente esté exportado
      if (content.includes('export function') || content.includes('export default')) {
        console.log(`✅ ${component} exportado correctamente`)
      } else {
        console.log(`❌ ${component} NO EXPORTADO`)
      }
      
      // Verificar imports críticos
      if (content.includes('import') && content.includes('from')) {
        console.log(`✅ ${component} tiene imports`)
      } else {
        console.log(`❌ ${component} SIN IMPORTS`)
      }
    }
  } catch (error) {
    console.log(`❌ Error verificando ${component}: ${error.message}`)
  }
})

// 5. Verificar configuración de caché
console.log('\n5️⃣ Verificando configuración de caché...')
const cacheFiles = [
  'lib/unified-cache-system.ts',
  'lib/cache-config.ts',
  'lib/supabase-unified.ts'
]

cacheFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - ARCHIVO FALTANTE`)
  }
})

// 6. Verificar tipos TypeScript
console.log('\n6️⃣ Verificando tipos TypeScript...')
const typeFiles = [
  'lib/types.ts',
  'lib/supabase.ts'
]

typeFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - ARCHIVO FALTANTE`)
  }
})

console.log('\n🎉 Verificación completada!')
console.log('\n📝 Si ves errores ❌, esos son los archivos que necesitan ser corregidos.')
console.log('📝 Si todos están ✅, el problema podría estar en:')
console.log('   - Variables de entorno de Supabase')
console.log('   - Errores de JavaScript en el navegador')
console.log('   - Problemas de red o conexión')
console.log('   - Errores en la consola del navegador')
