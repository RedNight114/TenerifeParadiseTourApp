/**
 * Polyfills SSR robustos para Next.js
 * Este archivo debe ejecutarse antes que cualquier otro código
 */

// Verificar si estamos en el servidor
const isServer = typeof window === 'undefined'

if (isServer) {
  // Definir globales básicos si no existen
  if (typeof globalThis === 'undefined') {
    global.globalThis = global
  }

  // Polyfill para window
  if (typeof globalThis.window === 'undefined') {
    globalThis.window = globalThis
  }

  // Polyfill para self
  if (typeof globalThis.self === 'undefined') {
    globalThis.self = globalThis
  }

  // Polyfill para location con todas las propiedades necesarias
  if (typeof globalThis.location === 'undefined') {
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
      toString: () => 'https://localhost:3000/',
      ancestorOrigins: [],
      replaceState: () => {},
      pushState: () => {}
    }
  }

  // Asegurar que window.location esté sincronizado
  if (globalThis.window && !globalThis.window.location) {
    globalThis.window.location = globalThis.location
  }

  // Polyfill para document básico
  if (typeof globalThis.document === 'undefined') {
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

  // Polyfill para navigator
  if (typeof globalThis.navigator === 'undefined') {
    globalThis.navigator = {
      userAgent: 'Node.js Server',
      onLine: true,
      language: 'es',
      languages: ['es'],
      platform: 'Node.js',
      cookieEnabled: false
    }
  }

  // Polyfill para history
  if (typeof globalThis.history === 'undefined') {
    globalThis.history = {
      length: 1,
      state: null,
      pushState: () => {},
      replaceState: () => {},
      go: () => {},
      back: () => {},
      forward: () => {}
    }
  }

  // Polyfill para localStorage
  if (typeof globalThis.localStorage === 'undefined') {
    globalThis.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null
    }
  }

  // Polyfill para sessionStorage
  if (typeof globalThis.sessionStorage === 'undefined') {
    globalThis.sessionStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null
    }
  }
}

// Exportar utilidades
export const isClient = !isServer
export const isDocument = typeof document !== 'undefined'
export { isServer }
