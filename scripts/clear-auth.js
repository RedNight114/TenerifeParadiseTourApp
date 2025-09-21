/**
 * Script para limpiar tokens de autenticación inválidos
 */

const fs = require('fs')
const path = require('path')

console.log('🧹 Limpiando tokens de autenticación...')

// Limpiar localStorage simulado (para desarrollo)
const clearAuthData = () => {
  try {
    // Limpiar archivos de caché de autenticación si existen
    const cacheFiles = [
      '.next/cache',
      'node_modules/.cache'
    ]
    
    cacheFiles.forEach(cacheFile => {
      const fullPath = path.resolve(__dirname, '..', cacheFile)
      if (fs.existsSync(fullPath)) {
        console.log(`📁 Limpiando caché: ${cacheFile}`)
        fs.rmSync(fullPath, { recursive: true, force: true })
      }
    })
    
    console.log('✅ Tokens de autenticación limpiados')
    console.log('💡 Nota: También deberías limpiar el localStorage del navegador manualmente')
    
  } catch (error) {
    console.error('❌ Error limpiando autenticación:', error.message)
  }
}

clearAuthData()
