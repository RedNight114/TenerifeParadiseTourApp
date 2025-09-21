/**
 * Script simple para iniciar Next.js sin interferir con su funcionamiento interno
 */

const { spawn } = require('child_process')
const path = require('path')

console.log('🚀 Iniciando Next.js con configuración simple...')

// Solo interceptar console.error para suprimir errores específicos
const originalConsoleError = console.error
console.error = function(...args) {
  const message = args.join(' ')
  
  // Suprimir solo errores específicos de window.location
  const suppressedMessages = [
    'TypeError: Cannot destructure property \'protocol\' of \'window.location\' as it is undefined',
    'at getLocationOrigin',
    'at parseRelativeUrl',
    'at parseUrl'
  ]
  
  const shouldSuppress = suppressedMessages.some(suppressed => 
    message.includes(suppressed)
  )
  
  if (!shouldSuppress) {
    originalConsoleError.apply(console, args)
  }
}

// Interceptar también console.warn para suprimir warnings de webpack
const originalConsoleWarn = console.warn
console.warn = function(...args) {
  const message = args.join(' ')
  
  const suppressedMessages = [
    'Serializing big strings',
    'impacts deserialization performance',
    'consider using Buffer instead'
  ]
  
  const shouldSuppress = suppressedMessages.some(suppressed => 
    message.includes(suppressed)
  )
  
  if (!shouldSuppress) {
    originalConsoleWarn.apply(console, args)
  }
}

// Iniciar Next.js directamente
const nextProcess = spawn('next', ['dev'], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit',
  shell: true
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
