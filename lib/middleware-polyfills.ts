/**
 * Polyfills específicos para middleware de Next.js
 */

// Polyfill para window.location en middleware
if (typeof window === 'undefined' && typeof global !== 'undefined') {
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
      toString: () => 'https://localhost:3000/'
    } as any
  }
}

export {}
