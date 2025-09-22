/**
 * Script simple para iniciar Next.js sin polyfills complejos
 */

const { spawn } = require('child_process')
const path = require('path')

console.log('🚀 Iniciando Next.js (modo simple)...')

// Configurar variables de entorno básicas
process.env.NODE_OPTIONS = '--max-old-space-size=4096'
process.env.NEXT_TELEMETRY_DISABLED = '1'

// Iniciar Next.js directamente
const nextProcess = spawn('next', ['dev'], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
})

nextProcess.on('close', (code) => {
  console.log(`Next.js cerrado con código ${code}`)
})

nextProcess.on('error', (error) => {
  console.error('Error iniciando Next.js:', error)
})

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...')
  nextProcess.kill('SIGINT')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor...')
  nextProcess.kill('SIGTERM')
  process.exit(0)
})