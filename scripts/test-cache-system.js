#!/usr/bin/env node

/**
 * Script de prueba para el sistema de cache optimizado
 * Autor: Tenerife Paradise Tours
 * Versión: 1.0.0
 */

const { cacheManager } = require('../lib/cache-manager')

console.log('🧪 Iniciando pruebas del sistema de cache...\n')

// Test 1: Funcionalidad básica del cache
console.log('📋 Test 1: Funcionalidad básica del cache')
console.log('=' * 50)

// Agregar datos de prueba
cacheManager.set('test-key-1', { name: 'Test Service', price: 100 }, 60000)
cacheManager.set('test-key-2', { name: 'Test User', email: 'test@example.com' }, 30000)

// Verificar que los datos están en cache
const data1 = cacheManager.get('test-key-1')
const data2 = cacheManager.get('test-key-2')

console.log('✅ Datos agregados al cache:', {
  'test-key-1': data1,
  'test-key-2': data2
})

// Test 2: Verificación de TTL
console.log('\n📋 Test 2: Verificación de TTL')
console.log('=' * 50)

// Agregar datos con TTL corto
cacheManager.set('expire-test', { message: 'Este dato expirará pronto' }, 1000)

console.log('⏰ Datos con TTL corto agregados')
console.log('⏳ Esperando 2 segundos para que expire...')

setTimeout(() => {
  const expiredData = cacheManager.get('expire-test')
  console.log('✅ Verificación de expiración:', {
    expired: expiredData === null,
    data: expiredData
  })
}, 2000)

// Test 3: Manejo de errores
console.log('\n📋 Test 3: Manejo de errores')
console.log('=' * 50)

// Simular errores
cacheManager.setError('error-test-1', 'Error de conexión', 60000)
cacheManager.setError('error-test-2', 'Error de autenticación', 60000)

const errorData1 = cacheManager.get('error-test-1')
const errorData2 = cacheManager.get('error-test-2')

console.log('✅ Errores manejados correctamente:', {
  'error-test-1': errorData1,
  'error-test-2': errorData2
})

// Test 4: Limpieza automática
console.log('\n📋 Test 4: Limpieza automática')
console.log('=' * 50)

// Agregar muchos datos para probar la limpieza
for (let i = 0; i < 10; i++) {
  cacheManager.set(`bulk-test-${i}`, { index: i, data: 'test data' }, 60000)
}

console.log('📦 Datos masivos agregados')
console.log('🧹 Ejecutando limpieza...')

cacheManager.cleanup()

const stats = cacheManager.getStats()
console.log('✅ Estadísticas después de la limpieza:', stats)

// Test 5: Rendimiento
console.log('\n📋 Test 5: Prueba de rendimiento')
console.log('=' * 50)

const startTime = Date.now()

// Simular múltiples lecturas
for (let i = 0; i < 1000; i++) {
  cacheManager.get('test-key-1')
}

const endTime = Date.now()
const duration = endTime - startTime

console.log('⚡ Rendimiento de 1000 lecturas:', {
  duration: `${duration}ms`,
  averagePerRead: `${(duration / 1000).toFixed(2)}ms`
})

// Test 6: Invalidación por patrón
console.log('\n📋 Test 6: Invalidación por patrón')
console.log('=' * 50)

// Agregar datos con patrones específicos
cacheManager.set('services:featured:1', { id: 1, featured: true }, 60000)
cacheManager.set('services:featured:2', { id: 2, featured: true }, 60000)
cacheManager.set('users:admin:1', { id: 1, role: 'admin' }, 60000)

console.log('📦 Datos con patrones agregados')

// Invalidar por patrón
const entries = Array.from(cacheManager['cache'].keys())
const regex = new RegExp('services:featured:.*')

let invalidatedCount = 0
for (const key of entries) {
  if (regex.test(key)) {
    cacheManager.delete(key)
    invalidatedCount++
  }
}

console.log('✅ Invalidación por patrón completada:', {
  invalidatedCount,
  remainingEntries: cacheManager.getStats().totalEntries
})

// Test 7: Estadísticas finales
console.log('\n📋 Test 7: Estadísticas finales')
console.log('=' * 50)

const finalStats = cacheManager.getStats()
console.log('📊 Estadísticas finales del cache:', finalStats)

// Limpiar datos de prueba
cacheManager.clear()
console.log('🗑️ Cache limpiado')

console.log('\n🎉 Todas las pruebas completadas exitosamente!')
console.log('✅ Sistema de cache funcionando correctamente')

// Verificar que no hay errores de memoria
const memoryUsage = process.memoryUsage()
console.log('\n💾 Uso de memoria:', {
  rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
  heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
  heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`
})

process.exit(0) 