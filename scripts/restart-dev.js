/**
 * Script para reiniciar el servidor de desarrollo con polyfills
 */

const { spawn } = require('child_process')
const path = require('path')

console.log('🔄 Reiniciando servidor de desarrollo con polyfills...')

// Matar procesos existentes de Next.js
const { exec } = require('child_process')

exec('taskkill /F /IM node.exe', (error) => {
  if (error && !error.message.includes('not found')) {
    console.log('⚠️ No se pudieron matar procesos existentes:', error.message)
  }
  
  // Esperar un momento y luego iniciar el servidor
  setTimeout(() => {
    console.log('🚀 Iniciando servidor de desarrollo...')
    
    const devProcess = spawn('npm', ['run', 'dev'], {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
      shell: true
    })
    
    devProcess.on('close', (code) => {
      console.log(`Servidor cerrado con código ${code}`)
    })
    
    devProcess.on('error', (error) => {
      console.error('Error iniciando servidor:', error)
    })
  }, 2000)
})