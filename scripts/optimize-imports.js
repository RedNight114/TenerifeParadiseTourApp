// Script para optimizar importaciones y eliminar dependencias no utilizadas
const fs = require('fs')
const path = require('path')

console.log('🔍 Analizando importaciones y dependencias...')

// Función para leer archivos recursivamente
function readFilesRecursively(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = []
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir)
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath)
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath)
      }
    })
  }
  
  traverse(dir)
  return files
}

// Función para extraer importaciones de un archivo
function extractImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const imports = []
    
    // Regex para diferentes tipos de importaciones
    const importRegexes = [
      /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
      /import\s+['"]([^'"]+)['"]/g,
      /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
    ]
    
    importRegexes.forEach(regex => {
      let match
      while ((match = regex.exec(content)) !== null) {
        imports.push({
          path: match[1],
          line: content.substring(0, match.index).split('\n').length,
          file: filePath
        })
      }
    })
    
    return imports
  } catch (error) {
    console.log(`❌ Error leyendo ${filePath}: ${error.message}`)
    return []
  }
}

// Función para analizar dependencias de package.json
function analyzeDependencies() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    const dependencies = Object.keys(packageJson.dependencies || {})
    const devDependencies = Object.keys(packageJson.devDependencies || {})
    
    return { dependencies, devDependencies }
  } catch (error) {
    console.log('❌ Error leyendo package.json:', error.message)
    return { dependencies: [], devDependencies: [] }
  }
}

// Función para encontrar dependencias no utilizadas
function findUnusedDependencies(allImports, dependencies) {
  const usedDependencies = new Set()
  
  // Extraer nombres de paquetes de las importaciones
  allImports.forEach(imp => {
    const packageName = imp.path.split('/')[0]
    if (packageName.startsWith('@')) {
      // Para scoped packages como @tanstack/react-query
      const scopedPackage = imp.path.split('/').slice(0, 2).join('/')
      usedDependencies.add(scopedPackage)
    } else {
      usedDependencies.add(packageName)
    }
  })
  
  // Encontrar dependencias no utilizadas
  const unusedDependencies = dependencies.filter(dep => !usedDependencies.has(dep))
  
  return { usedDependencies: Array.from(usedDependencies), unusedDependencies }
}

// Función para generar recomendaciones de optimización
function generateOptimizationRecommendations(analysis) {
  console.log('\n💡 Recomendaciones de Optimización:')
  console.log('=' .repeat(60))
  
  if (analysis.unusedDependencies.length > 0) {
    console.log('\n🗑️  Dependencias no utilizadas:')
    analysis.unusedDependencies.forEach(dep => {
      console.log(`   - ${dep}`)
    })
    console.log('\n   Comando para eliminar:')
    console.log(`   npm uninstall ${analysis.unusedDependencies.join(' ')}`)
  }
  
  console.log('\n📦 Optimizaciones de importación:')
  console.log('   1. Usar importaciones específicas:')
  console.log('      ❌ import * as React from "react"')
  console.log('      ✅ import { useState, useEffect } from "react"')
  
  console.log('\n   2. Usar dynamic imports para code splitting:')
  console.log('      ✅ const Component = dynamic(() => import("./Component"))')
  
  console.log('\n   3. Optimizar importaciones de librerías grandes:')
  console.log('      ❌ import { everything } from "large-library"')
  console.log('      ✅ import { specificFunction } from "large-library/specific"')
  
  console.log('\n   4. Usar tree shaking friendly imports:')
  console.log('      ✅ import { Button } from "@/components/ui/button"')
  console.log('      ❌ import Button from "@/components/ui/button"')
}

// Función principal
function main() {
  console.log('🚀 Iniciando análisis de importaciones...\n')
  
  // Leer todos los archivos del proyecto
  const files = readFilesRecursively('.', ['.ts', '.tsx', '.js', '.jsx'])
  console.log(`📁 Analizando ${files.length} archivos...`)
  
  // Extraer todas las importaciones
  const allImports = []
  files.forEach(file => {
    const imports = extractImports(file)
    allImports.push(...imports)
  })
  
  console.log(`📊 Total de importaciones encontradas: ${allImports.length}`)
  
  // Analizar dependencias
  const { dependencies } = analyzeDependencies()
  console.log(`📦 Dependencias en package.json: ${dependencies.length}`)
  
  // Encontrar dependencias no utilizadas
  const analysis = findUnusedDependencies(allImports, dependencies)
  
  console.log(`✅ Dependencias utilizadas: ${analysis.usedDependencies.length}`)
  console.log(`❌ Dependencias no utilizadas: ${analysis.unusedDependencies.length}`)
  
  // Mostrar dependencias no utilizadas
  if (analysis.unusedDependencies.length > 0) {
    console.log('\n🗑️  Dependencias no utilizadas:')
    analysis.unusedDependencies.forEach(dep => {
      console.log(`   - ${dep}`)
    })
  }
  
  // Generar recomendaciones
  generateOptimizationRecommendations(analysis)
  
  console.log('\n✨ Análisis completado')
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main()
}

module.exports = { 
  readFilesRecursively, 
  extractImports, 
  analyzeDependencies, 
  findUnusedDependencies 
}
