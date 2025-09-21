// Script para suprimir warnings específicos de webpack durante el desarrollo
const originalConsoleWarn = console.warn
const originalConsoleError = console.error

// Suprimir warnings específicos
const suppressedMessages = [
  'Serializing big strings',
  'impacts deserialization performance',
  'consider using Buffer instead',
  'Cannot destructure property \'protocol\' of \'window.location\'',
  'window.location\' as it is undefined'
]

function shouldSuppressMessage(message) {
  return suppressedMessages.some(suppressed => 
    message.includes(suppressed)
  )
}

console.warn = function(...args) {
  const message = args.join(' ')
  
  if (!shouldSuppressMessage(message)) {
    originalConsoleWarn.apply(console, args)
  }
}

console.error = function(...args) {
  const message = args.join(' ')
  
  if (!shouldSuppressMessage(message)) {
    originalConsoleError.apply(console, args)
  }
}

// También suprimir warnings de webpack en el proceso
process.on('warning', (warning) => {
  if (warning.name === 'ExperimentalWarning' && 
      warning.message.includes('Serializing big strings')) {
    // Suprimir este warning específico
    return
  }
  
  // Mostrar otros warnings normalmente
  console.warn(warning)
})

console.log('✅ Warnings de webpack suprimidos para desarrollo')
