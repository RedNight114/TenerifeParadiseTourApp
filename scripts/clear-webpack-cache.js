// Script para limpiar el caché de webpack
const fs = require('fs')
const path = require('path')

console.log('🧹 Limpiando caché de webpack...')

const cacheDirs = [
  '.next/cache',
  '.next/static',
  'node_modules/.cache',
  '.webpack-cache'
]

let cleanedCount = 0

cacheDirs.forEach(dir => {
  const fullPath = path.resolve(dir)
  
  if (fs.existsSync(fullPath)) {
    try {
      // Eliminar directorio recursivamente
      fs.rmSync(fullPath, { recursive: true, force: true })
      console.log(`✅ Eliminado: ${dir}`)
      cleanedCount++
    } catch (error) {
      console.log(`❌ Error eliminando ${dir}: ${error.message}`)
    }
  } else {
    console.log(`ℹ️  No existe: ${dir}`)
  }
})

if (cleanedCount > 0) {
  console.log(`\n🎉 Caché limpiado exitosamente (${cleanedCount} directorios)`)
  console.log('\n📋 Próximos pasos:')
  console.log('   1. Reinicia el servidor de desarrollo: npm run dev')
  console.log('   2. El warning de webpack debería desaparecer')
  console.log('   3. La aplicación debería compilar más rápido')
} else {
  console.log('\nℹ️  No se encontraron directorios de caché para limpiar')
}

console.log('\n💡 Consejos adicionales:')
console.log('   - Si el warning persiste, considera reducir el tamaño de los datos en caché')
console.log('   - Usa la configuración de webpack optimizada en next.config.mjs')
console.log('   - Monitorea el tamaño de los chunks en el navegador')
