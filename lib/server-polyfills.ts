/**
 * Polyfills para el servidor de Next.js
 * Soluciona problemas de window.location en el servidor
 */

// Polyfill para window.location en el servidor
if (typeof window === 'undefined') {
  // @ts-ignore
  global.window = {
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
      // Propiedades adicionales que Next.js puede necesitar
      username: '',
      password: '',
      searchParams: new URLSearchParams(),
      // Métodos adicionales
      replace: () => {},
      assign: () => {},
      reload: () => {}
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
    dispatchEvent: () => false
  }
}

// Polyfill para document en el servidor
if (typeof document === 'undefined') {
  // @ts-ignore
  global.document = {
    createElement: () => ({}),
    createTextNode: () => ({}),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  }
}

export {}
