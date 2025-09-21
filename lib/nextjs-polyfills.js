/**
 * Polyfills específicos para Next.js
 * Soluciona errores internos de Next.js con window.location
 */

// Polyfill global para Next.js antes de que se ejecute
if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    location: {
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
      username: '',
      password: '',
      searchParams: new URLSearchParams(),
    },
    navigator: {
      userAgent: 'Next.js Server'
    },
    document: {
      createElement: () => ({}),
      createTextNode: () => ({}),
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
    // Propiedades adicionales que Next.js puede necesitar
    history: {
      back: () => {},
      forward: () => {},
      go: () => {},
      pushState: () => {},
      replaceState: () => {},
      length: 0,
      scrollRestoration: 'auto',
      state: null,
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    },
    sessionStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    },
    // Métodos de timing
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    // RequestAnimationFrame
    requestAnimationFrame: (callback) => setTimeout(callback, 16),
    cancelAnimationFrame: (id) => clearTimeout(id),
  }
}

// También asegurar que window esté disponible en el contexto global
if (typeof global.window === 'undefined') {
  global.window = globalThis.window
}

module.exports = {}
