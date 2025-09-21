#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🧹 Limpiando caché de desarrollo...')

// Limpiar directorio .next
const nextDir = path.join(__dirname, '..', '.next')
if (fs.existsSync(nextDir)) {
  console.log('📁 Eliminando directorio .next...')
  try {
    fs.rmSync(nextDir, { recursive: true, force: true })
    console.log('✅ Directorio .next eliminado')
  } catch (error) {
    console.log('⚠️  Error eliminando .next:', error.message)
  }
}

// Limpiar node_modules/.cache si existe
const cacheDir = path.join(__dirname, '..', 'node_modules', '.cache')
if (fs.existsSync(cacheDir)) {
  console.log('📁 Eliminando caché de node_modules...')
  try {
    fs.rmSync(cacheDir, { recursive: true, force: true })
    console.log('✅ Caché de node_modules eliminado')
  } catch (error) {
    console.log('⚠️  Error eliminando caché:', error.message)
  }
}

// Limpiar caché de npm
console.log('📦 Limpiando caché de npm...')
try {
  execSync('npm cache clean --force', { stdio: 'inherit' })
  console.log('✅ Caché de npm limpiado')
} catch (error) {
  console.log('⚠️  Error limpiando caché de npm:', error.message)
}

console.log('🎉 Limpieza completada. Puedes ejecutar "npm run dev" nuevamente.')
