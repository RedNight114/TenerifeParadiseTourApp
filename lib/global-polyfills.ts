/**
 * Polyfills globales para compatibilidad con SSR
 * Este archivo se ejecuta antes que cualquier otro código
 */

// Definir self como globalThis para compatibilidad con SSR
if (typeof globalThis !== 'undefined' && typeof globalThis.self === 'undefined') {
  (globalThis as any).self = globalThis
}

// Definir window como globalThis si no existe
if (typeof globalThis !== 'undefined' && typeof globalThis.window === 'undefined') {
  (globalThis as any).window = globalThis
}

// Exportar para uso en otros archivos
export const isServer = typeof window === 'undefined'
export const isClient = typeof window !== 'undefined'
export const isDocument = typeof document !== 'undefined'

// Función helper para verificar si estamos en el navegador
export const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined'

// Función helper para verificar si estamos en el servidor
export const isServerSide = () => typeof window === 'undefined'
