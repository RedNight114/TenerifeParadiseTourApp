import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { UnifiedCacheSystem } from '@/lib/unified-cache-system'

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock de Worker
global.Worker = vi.fn().mockImplementation(() => ({
  postMessage: vi.fn(),
  terminate: vi.fn(),
  onmessage: null,
}))

describe('UnifiedCacheSystem', () => {
  let cache: UnifiedCacheSystem

  beforeEach(() => {
    // Limpiar mocks
    vi.clearAllMocks()
    
    // Crear nueva instancia del caché
    cache = new UnifiedCacheSystem({
      defaultTTL: 1000, // 1 segundo para tests
      maxMemorySize: 1, // 1 MB para tests
      maxEntries: 10,
      enableCompression: false, // Deshabilitar para tests simples
      enablePersistence: false, // Deshabilitar para tests
      cleanupInterval: 100, // 100ms para tests
    })
  })

  afterEach(() => {
    cache.destroy()
  })

  describe('Configuración inicial', () => {
    it('debería inicializarse correctamente', () => {
      expect(cache).toBeDefined()
      expect(cache.getStats().totalEntries).toBe(0)
    })

    it('debería tener estadísticas iniciales correctas', () => {
      const stats = cache.getStats()
      expect(stats.totalEntries).toBe(0)
      expect(stats.memoryUsage).toBe(0)
      expect(stats.hitRate).toBe(0)
      expect(stats.totalHits).toBe(0)
      expect(stats.totalMisses).toBe(0)
    })
  })

  describe('Operaciones básicas', () => {
    it('debería almacenar y recuperar datos correctamente', async () => {
      const testData = { id: 1, name: 'Test Service' }
      
      await cache.set('test-key', testData)
      const result = await cache.get('test-key')
      
      expect(result).toEqual(testData)
    })

    it('debería devolver null para claves inexistentes', async () => {
      const result = await cache.get('non-existent-key')
      expect(result).toBeNull()
    })

    it('debería manejar datos de diferentes tipos', async () => {
      const testCases = [
        { key: 'string', data: 'test string' },
        { key: 'number', data: 42 },
        { key: 'boolean', data: true },
        { key: 'array', data: [1, 2, 3] },
        { key: 'object', data: { nested: { value: 'test' } } },
      ]

      for (const testCase of testCases) {
        await cache.set(testCase.key, testCase.data)
        const result = await cache.get(testCase.key)
        expect(result).toEqual(testCase.data)
      }
    })
  })

  describe('Expiración de datos', () => {
    it('debería expirar datos después del TTL', async () => {
      const testData = { id: 1, name: 'Test Service' }
      
      await cache.set('expiring-key', testData, 100) // 100ms TTL
      
      // Verificar que está disponible inmediatamente
      let result = await cache.get('expiring-key')
      expect(result).toEqual(testData)
      
      // Esperar a que expire
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // Limpiar manualmente para simular expiración
      cache.cleanupExpired()
      
      // Verificar que ha expirado
      result = await cache.get('expiring-key')
      expect(result).toBeNull()
    })

    it('debería usar TTL por defecto cuando no se especifica', async () => {
      const testData = { id: 1, name: 'Test Service' }
      
      await cache.set('default-ttl-key', testData)
      
      // Verificar que está disponible inmediatamente
      let result = await cache.get('default-ttl-key')
      expect(result).toEqual(testData)
      
      // Esperar a que expire (TTL por defecto es 1000ms)
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      // Verificar que ha expirado
      result = await cache.get('default-ttl-key')
      expect(result).toBeNull()
    })
  })

  describe('Invalidación por tags', () => {
    it('debería invalidar entradas por tags', async () => {
      await cache.set('service-1', { id: 1 }, { tags: ['services'] })
      await cache.set('service-2', { id: 2 }, { tags: ['services'] })
      await cache.set('category-1', { id: 1 }, { tags: ['categories'] })
      
      // Verificar que todas están disponibles
      expect(await cache.get('service-1')).toBeDefined()
      expect(await cache.get('service-2')).toBeDefined()
      expect(await cache.get('category-1')).toBeDefined()
      
      // Invalidar por tag 'services'
      const invalidated = cache.invalidateByTags(['services'])
      expect(invalidated).toBe(2)
      
      // Verificar que los servicios fueron invalidados
      expect(await cache.get('service-1')).toBeNull()
      expect(await cache.get('service-2')).toBeNull()
      
      // Verificar que la categoría sigue disponible
      expect(await cache.get('category-1')).toBeDefined()
    })
  })

  describe('Invalidación por patrón', () => {
    it('debería invalidar entradas por patrón regex', async () => {
      await cache.set('service-1', { id: 1 })
      await cache.set('service-2', { id: 2 })
      await cache.set('category-1', { id: 1 })
      
      // Invalidar todas las entradas que empiecen con 'service-'
      const invalidated = cache.invalidateByPattern(/^service-/)
      expect(invalidated).toBe(2)
      
      // Verificar que los servicios fueron invalidados
      expect(await cache.get('service-1')).toBeNull()
      expect(await cache.get('service-2')).toBeNull()
      
      // Verificar que la categoría sigue disponible
      expect(await cache.get('category-1')).toBeDefined()
    })
  })

  describe('Patrón getOrSet', () => {
    it('debería usar caché si está disponible', async () => {
      const testData = { id: 1, name: 'Cached Data' }
      await cache.set('get-or-set-key', testData)
      
      const fetchFn = vi.fn().mockResolvedValue({ id: 2, name: 'Fresh Data' })
      
      const result = await cache.getOrSet('get-or-set-key', fetchFn)
      
      expect(result).toEqual(testData)
      expect(fetchFn).not.toHaveBeenCalled()
    })

    it('debería ejecutar función si no está en caché', async () => {
      const freshData = { id: 2, name: 'Fresh Data' }
      const fetchFn = vi.fn().mockResolvedValue(freshData)
      
      const result = await cache.getOrSet('get-or-set-key', fetchFn)
      
      expect(result).toEqual(freshData)
      expect(fetchFn).toHaveBeenCalledOnce()
      
      // Verificar que se guardó en caché
      const cached = await cache.get('get-or-set-key')
      expect(cached).toEqual(freshData)
    })
  })

  describe('Precarga de datos', () => {
    it('debería precargar múltiples claves', async () => {
      const fetchFn = vi.fn()
        .mockImplementation((key: string) => Promise.resolve({ id: key, data: `Data for ${key}` }))
      
      await cache.preload(['key1', 'key2', 'key3'], fetchFn)
      
      expect(fetchFn).toHaveBeenCalledTimes(3)
      expect(fetchFn).toHaveBeenCalledWith('key1')
      expect(fetchFn).toHaveBeenCalledWith('key2')
      expect(fetchFn).toHaveBeenCalledWith('key3')
      
      // Verificar que los datos están en caché
      expect(await cache.get('key1')).toEqual({ id: 'key1', data: 'Data for key1' })
      expect(await cache.get('key2')).toEqual({ id: 'key2', data: 'Data for key2' })
      expect(await cache.get('key3')).toEqual({ id: 'key3', data: 'Data for key3' })
    })

    it('no debería precargar claves que ya existen', async () => {
      await cache.set('existing-key', { id: 1 })
      
      const fetchFn = vi.fn().mockResolvedValue({ id: 2 })
      
      await cache.preload(['existing-key', 'new-key'], fetchFn)
      
      expect(fetchFn).toHaveBeenCalledTimes(1)
      expect(fetchFn).toHaveBeenCalledWith('new-key')
    })
  })

  describe('Límites de memoria', () => {
    it('debería evadir entradas cuando se excede el límite', async () => {
      // Crear caché con límite muy pequeño
      const smallCache = new UnifiedCacheSystem({
        maxEntries: 2,
        maxMemorySize: 0.001, // 1 KB
        defaultTTL: 10000, // 10 segundos
      })

      // Agregar más entradas que el límite
      await smallCache.set('key1', { data: 'Large data 1' })
      await smallCache.set('key2', { data: 'Large data 2' })
      await smallCache.set('key3', { data: 'Large data 3' })
      
      // Forzar evicción manualmente
      await (smallCache as any).enforceLimits()
      
      // Verificar que algunas entradas fueron evadidas
      const stats = smallCache.getStats()
      expect(stats.totalEntries).toBeLessThanOrEqual(2)
      
      smallCache.destroy()
    })
  })

  describe('Estadísticas', () => {
    it('debería actualizar estadísticas correctamente', async () => {
      // Operaciones que incrementan hits
      await cache.set('test-key', { data: 'test' })
      await cache.get('test-key') // Hit
      await cache.get('test-key') // Hit
      await cache.get('non-existent') // Miss
      
      const stats = cache.getStats()
      expect(stats.totalHits).toBe(2)
      expect(stats.totalMisses).toBe(1)
      expect(stats.hitRate).toBeCloseTo(0.67, 2) // 2/3
      expect(stats.totalEntries).toBe(1)
    })

    it('debería calcular uso de memoria correctamente', async () => {
      const largeData = { data: 'x'.repeat(1000) } // ~1KB
      await cache.set('large-key', largeData)
      
      const stats = cache.getStats()
      expect(stats.memoryUsage).toBeGreaterThan(0)
    })
  })

  describe('Limpieza', () => {
    it('debería limpiar todo el caché', async () => {
      await cache.set('key1', { data: 'test1' })
      await cache.set('key2', { data: 'test2' })
      
      expect(cache.getStats().totalEntries).toBe(2)
      
      cache.clear()
      
      expect(cache.getStats().totalEntries).toBe(0)
      expect(await cache.get('key1')).toBeNull()
      expect(await cache.get('key2')).toBeNull()
    })
  })

  describe('Manejo de errores', () => {
    it('debería manejar errores de serialización', async () => {
      const circularData: any = { name: 'test' }
      circularData.self = circularData // Crear referencia circular
      
      // No debería lanzar error
      await expect(cache.set('circular-key', circularData)).resolves.not.toThrow()
    })

    it('debería manejar errores de deserialización', async () => {
      // Simular datos corruptos en memoria
      const corruptedEntry = {
        data: 'corrupted-data',
        timestamp: Date.now(),
        ttl: 10000,
        hits: 0,
        size: 100,
        compressed: false,
        tags: [],
        version: '1.0'
      }
      
      // Insertar directamente en el Map interno (simulando corrupción)
      ;(cache as any).memoryCache.set('corrupted-key', corruptedEntry)
      
      // Debería devolver null sin lanzar error
      const result = await cache.get('corrupted-key')
      expect(result).toBeNull()
    })
  })

  describe('Compresión', () => {
    it('debería comprimir datos grandes cuando está habilitada', async () => {
      const cacheWithCompression = new UnifiedCacheSystem({
        enableCompression: true,
        compressionThreshold: 100, // Comprimir datos > 100 bytes
        defaultTTL: 10000,
      })

      const largeData = { data: 'x'.repeat(1000) } // > 100 bytes
      await cacheWithCompression.set('large-data', largeData)
      
      // Esperar un momento para que se procese la compresión
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const result = await cacheWithCompression.get('large-data')
      expect(result).toEqual(largeData)
      
      cacheWithCompression.destroy()
    })
  })
})

describe('Funciones de conveniencia', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería funcionar cacheServices correctamente', async () => {
    const { cacheServices } = await import('@/lib/unified-cache-system')
    
    const testService = { id: 1, title: 'Test Service' }
    
    await cacheServices.set('test', testService)
    const result = await cacheServices.get('test')
    
    expect(result).toEqual(testService)
  })

  it('debería funcionar cacheCategories correctamente', async () => {
    const { cacheCategories } = await import('@/lib/unified-cache-system')
    
    const testCategory = { id: 1, name: 'Test Category' }
    
    await cacheCategories.set('test', testCategory)
    const result = await cacheCategories.get('test')
    
    expect(result).toEqual(testCategory)
  })

  it('debería funcionar invalidación por tags', async () => {
    const { cacheServices, invalidateCacheByTags } = await import('@/lib/unified-cache-system')
    
    await cacheServices.set('service1', { id: 1 }, 10000)
    await cacheServices.set('service2', { id: 2 }, 10000)
    
    const invalidated = invalidateCacheByTags(['services'])
    expect(invalidated).toBeGreaterThanOrEqual(2)
  })
})
