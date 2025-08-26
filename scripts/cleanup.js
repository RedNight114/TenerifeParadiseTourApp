#!/usr/bin/env node

/**
 * Script de limpieza para Next.js
 * Ejecutar con: node scripts/cleanup.js
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🧹 Limpiando archivos temporales...')

// Directorios a limpiar
const dirsToClean = [
  '.next',
  'node_modules/.cache',
  '.turbo',
  'dist',
  'build'
]

dirsToClean.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir)
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true })
      console.log(`✅ Limpiado: ${dir}`)
    } catch (error) {
      console.log(`⚠️ Error limpiando ${dir}: ${error.message}`)
    }
  }
})

// Limpiar caché de npm
try {
  execSync('npm cache clean --force', { stdio: 'inherit' })
  console.log('✅ Caché de npm limpiado')
} catch (error) {
  console.log('⚠️ Error limpiando caché de npm')
}

console.log('🎉 Limpieza completada')
