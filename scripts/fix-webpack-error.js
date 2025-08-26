#!/usr/bin/env node

/**
 * Script para solucionar errores de webpack
 * Ejecutar con: node scripts/fix-webpack-error.js
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔧 Solucionando error de webpack...\n')

// Función para verificar si existe un archivo
function fileExists(filePath) {
  return fs.existsSync(filePath)
}

// Función para eliminar directorio de forma segura
function removeDirectory(dirPath) {
  if (fileExists(dirPath)) {
    try {
      execSync(`npx rimraf "${dirPath}"`, { stdio: 'inherit' })
      console.log(`✅ Eliminado: ${dirPath}`)
      return true
    } catch (error) {
      console.log(`⚠️ Error eliminando ${dirPath}: ${error.message}`)
      return false
    }
  } else {
    console.log(`ℹ️ No existe: ${dirPath}`)
    return true
  }
}

// 1. Detener procesos Node.js
console.log('🛑 Deteniendo procesos Node.js...')
try {
  execSync('taskkill /f /im node.exe', { stdio: 'ignore' })
  console.log('✅ Procesos Node.js detenidos')
} catch (error) {
  console.log('ℹ️ No había procesos Node.js ejecutándose')
}

// 2. Limpiar directorios de caché
console.log('\n🧹 Limpiando caché...')

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
  removeDirectory(dirPath)
})

// 3. Limpiar caché de npm
console.log('\n📦 Limpiando caché de npm...')
try {
  execSync('npm cache clean --force', { stdio: 'inherit' })
  console.log('✅ Caché de npm limpiado')
} catch (error) {
  console.log('⚠️ Error limpiando caché de npm')
}

// 4. Reinstalar dependencias
console.log('\n📥 Reinstalando dependencias...')
try {
  execSync('npm install', { stdio: 'inherit' })
  console.log('✅ Dependencias reinstaladas')
} catch (error) {
  console.log('❌ Error reinstalando dependencias')
  process.exit(1)
}

// 5. Verificar archivos críticos
console.log('\n🔍 Verificando archivos críticos...')

const criticalFiles = [
  'package.json',
  'next.config.mjs',
  '.env.local',
  'app/layout.tsx'
]

criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file)
  if (fileExists(filePath)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ Faltante: ${file}`)
  }
})

// 6. Verificar configuración de webpack
console.log('\n⚙️ Verificando configuración de webpack...')

const nextConfigPath = path.join(process.cwd(), 'next.config.mjs')
if (fileExists(nextConfigPath)) {
  const config = fs.readFileSync(nextConfigPath, 'utf8')
  
  if (config.includes('webpack')) {
    console.log('✅ Configuración de webpack encontrada')
  } else {
    console.log('⚠️ Configuración de webpack no encontrada')
  }
  
  if (config.includes('experimental')) {
    console.log('✅ Configuración experimental encontrada')
  } else {
    console.log('⚠️ Configuración experimental no encontrada')
  }
} else {
  console.log('❌ next.config.mjs no encontrado')
}

console.log('\n🎉 Solución completada')
console.log('\n📋 Próximos pasos:')
console.log('1. Ejecuta: npm run start:fresh:windows')
console.log('2. Si persiste el error, ejecuta: npm run build')
console.log('3. Verifica que no haya errores de sintaxis en el código')

console.log('\n💡 Si el error persiste:')
console.log('- Revisa la consola del navegador para más detalles')
console.log('- Verifica que todas las importaciones sean correctas')
console.log('- Asegúrate de que no haya componentes con errores de sintaxis') 