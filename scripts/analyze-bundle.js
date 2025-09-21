// Script para analizar el tamaño del bundle
const fs = require('fs')
const path = require('path')

console.log('📦 Analizando tamaño del bundle...')

// Función para obtener el tamaño de un archivo
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath)
    return stats.size
  } catch (error) {
    return 0
  }
}

// Función para formatear bytes a KB/MB
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Analizar directorio .next/static/chunks
function analyzeChunks() {
  const chunksDir = path.join('.next', 'static', 'chunks')
  
  if (!fs.existsSync(chunksDir)) {
    console.log('❌ Directorio de chunks no encontrado. Ejecuta "npm run build" primero.')
    return
  }

  const files = fs.readdirSync(chunksDir)
  let totalSize = 0
  const chunkAnalysis = []

  files.forEach(file => {
    if (file.endsWith('.js')) {
      const filePath = path.join(chunksDir, file)
      const size = getFileSize(filePath)
      totalSize += size
      
      chunkAnalysis.push({
        name: file,
        size: size,
        formatted: formatBytes(size)
      })
    }
  })

  // Ordenar por tamaño
  chunkAnalysis.sort((a, b) => b.size - a.size)

  console.log('\n📊 Análisis de Chunks:')
  console.log('=' .repeat(50))
  
  chunkAnalysis.forEach(chunk => {
    const percentage = ((chunk.size / totalSize) * 100).toFixed(1)
    console.log(`${chunk.name.padEnd(30)} ${chunk.formatted.padStart(10)} (${percentage}%)`)
  })

  console.log('=' .repeat(50))
  console.log(`Total JavaScript: ${formatBytes(totalSize)}`)
  
  return {
    totalSize,
    chunks: chunkAnalysis,
    formatted: formatBytes(totalSize)
  }
}

// Analizar dependencias en package.json
function analyzeDependencies() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    const dependencies = Object.keys(packageJson.dependencies || {})
    const devDependencies = Object.keys(packageJson.devDependencies || {})
    
    console.log('\n📋 Dependencias:')
    console.log('=' .repeat(50))
    console.log(`Dependencias de producción: ${dependencies.length}`)
    console.log(`Dependencias de desarrollo: ${devDependencies.length}`)
    
    // Identificar dependencias grandes comunes
    const largeDeps = [
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'react',
      'react-dom',
      'next'
    ]
    
    console.log('\n🔍 Dependencias principales:')
    largeDeps.forEach(dep => {
      if (dependencies.includes(dep)) {
        console.log(`✅ ${dep}`)
      }
    })
    
    return { dependencies, devDependencies }
  } catch (error) {
    console.log('❌ Error leyendo package.json:', error.message)
    return null
  }
}

// Generar recomendaciones
function generateRecommendations(analysis) {
  console.log('\n💡 Recomendaciones de Optimización:')
  console.log('=' .repeat(50))
  
  if (analysis && analysis.totalSize > 100000) { // > 100KB
    console.log('🔴 Bundle grande detectado (>100KB)')
    console.log('   - Implementar code splitting por rutas')
    console.log('   - Optimizar tree shaking')
    console.log('   - Considerar lazy loading de componentes')
  } else if (analysis && analysis.totalSize > 50000) { // > 50KB
    console.log('🟡 Bundle moderado (50-100KB)')
    console.log('   - Revisar dependencias no utilizadas')
    console.log('   - Optimizar imports')
  } else {
    console.log('🟢 Bundle optimizado (<50KB)')
  }
  
  console.log('\n📋 Acciones recomendadas:')
  console.log('   1. Ejecutar: npm run build')
  console.log('   2. Revisar: .next/static/chunks/')
  console.log('   3. Usar: @next/bundle-analyzer')
  console.log('   4. Implementar: lazy loading')
}

// Función principal
function main() {
  console.log('🚀 Iniciando análisis de bundle...\n')
  
  const chunkAnalysis = analyzeChunks()
  const depsAnalysis = analyzeDependencies()
  
  if (chunkAnalysis) {
    generateRecommendations(chunkAnalysis)
  }
  
  console.log('\n✨ Análisis completado')
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main()
}

module.exports = { analyzeChunks, analyzeDependencies, formatBytes }
