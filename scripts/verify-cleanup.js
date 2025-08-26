#!/usr/bin/env node

/**
 * Script para verificar que todas las referencias a archivos eliminados estén corregidas
 * Ejecutar con: node scripts/verify-cleanup.js
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Verificando referencias a archivos eliminados...\n')

// Archivos que fueron eliminados
const deletedFiles = [
  'hooks/use-services.ts',
  'hooks/use-services-simple.ts',
  'components/service-card.tsx',
  'components/services-with-advanced-handling.tsx'
]

// Referencias que deben ser corregidas
const oldReferences = [
  'from "@/hooks/use-services"',
  'from "@/hooks/use-services-simple"',
  'from "@/components/service-card"',
  'useServices()',
  'import { ServiceCard }'
]

// Nuevas referencias correctas
const newReferences = [
  'from "@/hooks/use-services-optimized"',
  'from "@/hooks/use-services-optimized"',
  'from "@/components/optimized-service-card"',
  'useServicesOptimized()',
  'import { OptimizedServiceCard }'
]

// Función para buscar referencias en archivos
function findReferencesInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const issues = []
    
    oldReferences.forEach((oldRef, index) => {
      if (content.includes(oldRef)) {
        // Excluir casos donde es parte de un comentario, documentación o nombres de componentes locales
        const lines = content.split('\n')
        const lineIndex = lines.findIndex(line => line.includes(oldRef))
        if (lineIndex !== -1) {
          const line = lines[lineIndex]
          // Excluir si es un comentario o un nombre de componente local
          if (!line.trim().startsWith('//') && 
              !line.trim().startsWith('/*') && 
              !line.includes('ServiceCardSkeleton') &&
              !line.includes('function ServiceCard') &&
              !line.includes('interface ServiceCard')) {
            issues.push({
              oldRef,
              newRef: newReferences[index],
              line: lineIndex + 1
            })
          }
        }
      }
    })
    
    return issues
  } catch (error) {
    return []
  }
}

// Función para buscar en directorios
function searchInDirectory(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const issues = []
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir)
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        // Excluir node_modules y .next
        if (!item.startsWith('.') && item !== 'node_modules') {
          traverse(fullPath)
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        // Excluir el script de verificación
        if (!fullPath.includes('verify-cleanup.js')) {
          const fileIssues = findReferencesInFile(fullPath)
          if (fileIssues.length > 0) {
            issues.push({
              file: fullPath,
              issues: fileIssues
            })
          }
        }
      }
    }
  }
  
  traverse(dir)
  return issues
}

// Verificar archivos eliminados
console.log('📋 Verificando archivos eliminados:')
deletedFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file)
  if (fs.existsSync(filePath)) {
    console.log(`❌ ${file} - AÚN EXISTE`)
  } else {
    console.log(`✅ ${file} - Eliminado correctamente`)
  }
})

console.log('\n🔍 Buscando referencias obsoletas...')
const allIssues = searchInDirectory(process.cwd())

if (allIssues.length === 0) {
  console.log('✅ No se encontraron referencias obsoletas')
} else {
  console.log(`❌ Se encontraron ${allIssues.length} archivos con referencias obsoletas:`)
  
  allIssues.forEach(({ file, issues }) => {
    console.log(`\n📁 ${file}:`)
    issues.forEach(issue => {
      console.log(`   Línea ${issue.line}: "${issue.oldRef}" → "${issue.newRef}"`)
    })
  })
}

// Verificar archivos optimizados
console.log('\n✅ Verificando archivos optimizados:')
const optimizedFiles = [
  'hooks/use-services-optimized.ts',
  'components/optimized-service-card.tsx',
  'components/services-grid.tsx',
  'components/featured-services.tsx'
]

optimizedFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - Existe`)
  } else {
    console.log(`❌ ${file} - FALTANTE`)
  }
})

// Verificar imports correctos
console.log('\n🔍 Verificando imports correctos...')
const correctImports = [
  { file: 'components/featured-services.tsx', import: 'OptimizedServiceCard' },
  { file: 'components/services-grid.tsx', import: 'OptimizedServiceCard' },
  { file: 'components/admin/services-management.tsx', import: 'useServicesOptimized' }
]

correctImports.forEach(({ file, import: importName }) => {
  const filePath = path.join(process.cwd(), file)
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8')
    if (content.includes(importName)) {
      console.log(`✅ ${file} - Importa ${importName} correctamente`)
    } else {
      console.log(`❌ ${file} - NO importa ${importName}`)
    }
  } else {
    console.log(`❌ ${file} - Archivo no encontrado`)
  }
})

console.log('\n🎉 Verificación completada!')

if (allIssues.length > 0) {
  console.log('\n⚠️  ACCIONES REQUERIDAS:')
  console.log('1. Corregir las referencias obsoletas encontradas')
  console.log('2. Reemplazar imports antiguos por los nuevos')
  console.log('3. Ejecutar este script nuevamente para verificar')
  process.exit(1)
} else {
  console.log('\n✅ Todas las referencias están correctas')
  console.log('✅ La limpieza se completó exitosamente')
} 