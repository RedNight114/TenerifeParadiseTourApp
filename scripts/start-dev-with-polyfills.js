/**
 * Script para iniciar Next.js con polyfills robustos
 */

const { spawn } = require('child_process')
const path = require('path')

console.log('🚀 Iniciando Next.js con polyfills robustos...')

// Aplicar polyfills antes de importar Next.js
require('../lib/nextjs-server-polyfills.js')

// Interceptar console.error para suprimir errores específicos
const originalConsoleError = console.error
console.error = function(...args) {
  const message = args.join(' ')
  
  // Suprimir errores específicos de window.location
  const suppressedMessages = [
    'TypeError: Cannot destructure property \'protocol\' of \'window.location\' as it is undefined',
    'at getLocationOrigin',
    'at parseRelativeUrl',
    'at parseUrl',
    'at DevServer.handleRequestImpl',
    'at async DevServer.handleRequest',
    'at async handleRoute',
    'at async resolveRoutes',
    'at async handleRequest',
    'at async requestHandlerImpl',
    'at async Server.requestListener'
  ]
  
  const shouldSuppress = suppressedMessages.some(suppressed => 
    message.includes(suppressed)
  )
  
  if (!shouldSuppress) {
    originalConsoleError.apply(console, args)
  }
}

// Iniciar Next.js
const nextProcess = spawn('next', ['dev'], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    // Variables de entorno adicionales si es necesario
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
