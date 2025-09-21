/**
 * Polyfills globales para el servidor Node.js
 * Este archivo se ejecuta antes que cualquier otro código en el servidor
 */

// Verificar si estamos en el servidor
const isServer = typeof window === 'undefined'

if (isServer) {
  // Definir self como globalThis para compatibilidad con SSR
  if (typeof globalThis !== 'undefined' && typeof globalThis.self === 'undefined') {
    globalThis.self = globalThis
  }

  // Definir window como globalThis si no existe
  if (typeof globalThis !== 'undefined' && typeof globalThis.window === 'undefined') {
    globalThis.window = globalThis
  }

  // Definir document como un objeto vacío para el servidor
  if (typeof globalThis !== 'undefined' && typeof globalThis.document === 'undefined') {
    globalThis.document = {
      createElement: () => ({
        appendChild: () => {},
        removeChild: () => {},
        setAttribute: () => {},
        getAttribute: () => null,
        style: {}
      }),
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      removeEventListener: () => {},
      appendChild: () => {},
      removeChild: () => {},
      body: {
        style: {},
        appendChild: () => {},
        removeChild: () => {}
      },
      head: {
        appendChild: () => {},
        removeChild: () => {},
        style: {}
      },
      documentElement: {
        style: {}
      }
    }
  }

  // Definir location para el servidor
  if (typeof globalThis !== 'undefined' && typeof globalThis.location === 'undefined') {
    globalThis.location = {
      protocol: 'https:',
      host: 'localhost:3000',
      hostname: 'localhost',
      port: '3000',
      pathname: '/',
      search: '',
      hash: '',
      href: 'https://localhost:3000/',
      origin: 'https://localhost:3000',
      assign: () => {},
      replace: () => {},
      reload: () => {},
      toString: () => 'https://localhost:3000/'
    }
  }

  // Asegurar que window.location también esté definido
  if (typeof globalThis !== 'undefined' && typeof globalThis.window !== 'undefined') {
    if (typeof globalThis.window.location === 'undefined') {
      globalThis.window.location = globalThis.location
    }
  }

  // Definir navigator para el servidor
  if (typeof globalThis !== 'undefined' && typeof globalThis.navigator === 'undefined') {
    globalThis.navigator = {
      userAgent: 'Node.js Server',
      onLine: true
    }
  }
}

// Exportar para uso en otros archivos
const isClient = !isServer
const isDocument = typeof document !== 'undefined'

export {
  isServer,
  isClient,
  isDocument
}
