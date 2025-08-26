#!/usr/bin/env node

/**
 * Script de limpieza para Windows
 * Ejecutar con: node scripts/cleanup-windows.js
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🧹 Limpiando archivos temporales (Windows)...')

// Directorios a limpiar
const dirsToClean = [
  '.next',
  'node_modules/.cache',
  '.turbo',
  'dist',
  'build',
  'out'
]

dirsToClean.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir)
  if (fs.existsSync(dirPath)) {
    try {
      // Usar rimraf para Windows
      execSync(`npx rimraf "${dirPath}"`, { stdio: 'inherit' })
      console.log(`✅ Limpiado: ${dir}`)
    } catch (error) {
      console.log(`⚠️ Error limpiando ${dir}: ${error.message}`)
    }
  } else {
    console.log(`ℹ️ No existe: ${dir}`)
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