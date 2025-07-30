/**
 * 🚀 SCRIPT PARA FORZAR CARGA DE SERVICIOS
 * 
 * Este script fuerza la carga de servicios y verifica el cache
 */

console.log('🚀 Forzando carga de servicios...')

// Verificar si estamos en el navegador
if (typeof window === 'undefined') {
  console.log('❌ Este script debe ejecutarse en el navegador')
  process.exit(1)
}

// Función para simular la carga de servicios
async function forceLoadServices() {
  try {
    console.log('📡 Simulando carga de servicios...')
    
    // Simular datos de servicios
    const mockServices = [
      { id: 1, title: 'Tour Test 1', price: 50 },
      { id: 2, title: 'Tour Test 2', price: 75 },
      { id: 3, title: 'Tour Test 3', price: 100 }
    ]
    
    const mockCategories = [
      { id: 1, name: 'Categoría Test 1' },
      { id: 2, name: 'Categoría Test 2' }
    ]
    
    const mockSubcategories = [
      { id: 1, name: 'Subcategoría Test 1' },
      { id: 2, name: 'Subcategoría Test 2' }
    ]
    
    console.log('📦 Datos simulados creados:', {
      services: mockServices.length,
      categories: mockCategories.length,
      subcategories: mockSubcategories.length
    })
    
    // Guardar en cache robusto
    if (window.setRobustCachedData) {
      console.log('💾 Guardando en cache robusto...')
      window.setRobustCachedData('robust_services_list', mockServices, 10 * 60 * 1000)
      window.setRobustCachedData('robust_categories_list', mockCategories, 30 * 60 * 1000)
      window.setRobustCachedData('robust_subcategories_list', mockSubcategories, 30 * 60 * 1000)
      console.log('✅ Datos guardados en cache robusto')
    } else {
      console.log('❌ setRobustCachedData no disponible')
    }
    
    // Verificar localStorage directamente
    const robustCacheKey = 'robust_cache_v1'
    const stored = localStorage.getItem(robustCacheKey)
    if (stored) {
      const parsed = JSON.parse(stored)
      console.log('📦 Cache en localStorage:', {
        entries: parsed.cache ? parsed.cache.length : 0,
        timestamp: parsed.timestamp,
        age: Date.now() - parsed.timestamp
      })
    } else {
      console.log('❌ No hay cache en localStorage')
    }
    
  } catch (error) {
    console.error('❌ Error forzando carga:', error)
  }
}

// Ejecutar la función
forceLoadServices()

console.log('✅ Script completado') 