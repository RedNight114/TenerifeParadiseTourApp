// Script para suprimir warnings específicos de webpack durante el desarrollo
const originalConsoleWarn = console.warn

console.warn = function(...args) {
  const message = args.join(' ')
  
  // Suprimir warnings específicos de webpack
  const suppressedWarnings = [
    'Serializing big strings',
    'impacts deserialization performance',
    'consider using Buffer instead'
  ]
  
  // Verificar si el mensaje contiene alguno de los warnings a suprimir
  const shouldSuppress = suppressedWarnings.some(warning => 
    message.includes(warning)
  )
  
  if (!shouldSuppress) {
    originalConsoleWarn.apply(console, args)
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
