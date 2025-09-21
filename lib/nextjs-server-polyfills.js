/**
 * Polyfills para el servidor de Next.js
 * Se ejecuta antes de que Next.js inicie para interceptar window.location
 */

// Interceptar el acceso a window.location en el servidor
const originalWindow = global.window

// Crear un proxy para window.location que maneje la destructuración
const locationProxy = new Proxy({
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
}, {
  get(target, prop) {
    return target[prop]
  },
  has(target, prop) {
    return prop in target
  },
  ownKeys(target) {
    return Object.keys(target)
  },
  getOwnPropertyDescriptor(target, prop) {
    return Object.getOwnPropertyDescriptor(target, prop)
  }
})

// Crear window con location como proxy
const windowProxy = new Proxy({
  location: locationProxy,
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
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  requestAnimationFrame: (callback) => setTimeout(callback, 16),
  cancelAnimationFrame: (id) => clearTimeout(id),
}, {
  get(target, prop) {
    if (prop === 'location') {
      return locationProxy
    }
    return target[prop]
  },
  has(target, prop) {
    return prop in target || prop === 'location'
  }
})

// Aplicar polyfills globalmente
if (typeof global.window === 'undefined') {
  global.window = windowProxy
}

if (typeof globalThis.window === 'undefined') {
  globalThis.window = windowProxy
}

// Interceptar el acceso directo a window.location
Object.defineProperty(global, 'window', {
  value: windowProxy,
  writable: false,
  configurable: false
})

Object.defineProperty(globalThis, 'window', {
  value: windowProxy,
  writable: false,
  configurable: false
})

// Interceptar también el acceso a window.location directamente
Object.defineProperty(global, 'location', {
  value: locationProxy,
  writable: false,
  configurable: false
})

module.exports = {}
