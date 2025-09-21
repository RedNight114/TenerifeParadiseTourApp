// Script para resetear completamente el entorno de desarrollo
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔄 Reseteando entorno de desarrollo...')

// Función para eliminar directorio recursivamente
function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true })
      console.log(`✅ Eliminado: ${dirPath}`)
    } catch (error) {
      console.log(`❌ Error eliminando ${dirPath}: ${error.message}`)
    }
  }
}

// Directorios a limpiar
const dirsToClean = [
  '.next',
  'node_modules/.cache',
  '.webpack-cache'
]

console.log('\n🧹 Limpiando caché...')
dirsToClean.forEach(dir => {
  removeDir(dir)
})

// Limpiar caché de npm
console.log('\n📦 Limpiando caché de npm...')
try {
  execSync('npm cache clean --force', { stdio: 'inherit' })
  console.log('✅ Caché de npm limpiado')
} catch (error) {
  console.log('❌ Error limpiando caché de npm:', error.message)
}

console.log('\n✨ Entorno reseteado completamente')
console.log('\n📋 Próximos pasos:')
console.log('   1. Ejecutar: npm install')
console.log('   2. Ejecutar: npm run dev')
console.log('   3. La aplicación debería cargar mucho más rápido')
