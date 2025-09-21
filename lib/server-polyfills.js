/**
 * Polyfills para el servidor Node.js
 * Este archivo se ejecuta antes que cualquier otro código en el servidor
 */

// Definir self como globalThis para compatibilidad con SSR
if (typeof globalThis !== 'undefined' && typeof globalThis.self === 'undefined') {
  globalThis.self = globalThis
}

// Definir window como globalThis si no existe
if (typeof globalThis !== 'undefined' && typeof globalThis.window === 'undefined') {
  globalThis.window = globalThis
}

// Exportar para uso en otros archivos
module.exports = {
  isServer: typeof window === 'undefined',
  isClient: typeof window !== 'undefined',
  isDocument: typeof document !== 'undefined'
}
