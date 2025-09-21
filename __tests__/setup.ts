/**
 * Configuración global para las pruebas
 */

import { vi } from 'vitest'

// Mock de Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn()
  }),
  useSearchParams: () => ({
    get: vi.fn()
  }),
  usePathname: () => '/'
}))

// Mock de Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    const React = require('react')
    return React.createElement('img', { src, alt, ...props })
  }
}))

// Mock de date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => 'hace 2 minutos'),
  format: vi.fn(() => '2024-01-01'),
  es: {}
}))

// Mock de console para evitar ruido en las pruebas
const originalConsole = console
global.console = {
  ...originalConsole,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock de IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock de ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock de fetch
global.fetch = vi.fn()

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
} as Storage
global.localStorage = localStorageMock

// Mock de sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
} as Storage
global.sessionStorage = sessionStorageMock

// Configurar timezone para pruebas
process.env.TZ = 'UTC'
