/**
 * Script para limpiar datos de autenticación
 */

const fs = require('fs')
const path = require('path')

console.log('🧹 Limpiando datos de autenticación...')

// Rutas de archivos de caché y datos de autenticación
const pathsToClean = [
  '.next',
  'node_modules/.cache',
  'public/sw.js',
  'temp-images',
  'temp-images-migration'
]

// Función para eliminar directorios recursivamente
function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true })
    console.log(`✅ Eliminado: ${dirPath}`)
  }
}

// Función para eliminar archivos
function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
    console.log(`✅ Eliminado: ${filePath}`)
  }
}

// Limpiar rutas
pathsToClean.forEach(item => {
  const fullPath = path.resolve(__dirname, '..', item)
  
  if (fs.existsSync(fullPath)) {
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      removeDir(fullPath)
    } else {
      removeFile(fullPath)
    }
  }
})

console.log('\n📋 INSTRUCCIONES PARA LIMPIAR DATOS DEL NAVEGADOR:')
console.log('1. Abre las herramientas de desarrollador (F12)')
console.log('2. Ve a la pestaña "Application" o "Aplicación"')
console.log('3. En el panel izquierdo, expande "Storage" o "Almacenamiento"')
console.log('4. Haz clic derecho en "Local Storage" y selecciona "Clear" o "Limpiar"')
console.log('5. Haz lo mismo con "Session Storage"')
console.log('6. En "Cookies", elimina todas las cookies del dominio')
console.log('7. Recarga la página (Ctrl+F5)')

console.log('\n🔄 O ejecuta este código en la consola del navegador:')
console.log(`
// Limpiar localStorage
localStorage.clear();

// Limpiar sessionStorage  
sessionStorage.clear();

// Limpiar cookies específicas de Supabase
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

// Recargar página
window.location.reload();
`)

console.log('\n✅ Limpieza completada!')