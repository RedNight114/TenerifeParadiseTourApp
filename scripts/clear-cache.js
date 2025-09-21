// Script para limpiar el caché del navegador
console.log('Limpiando caché del navegador...')

// Limpiar localStorage
if (typeof localStorage !== 'undefined') {
  localStorage.clear()
  console.log('✅ localStorage limpiado')
} else {
  console.log('❌ localStorage no disponible')
}

// Limpiar sessionStorage
if (typeof sessionStorage !== 'undefined') {
  sessionStorage.clear()
  console.log('✅ sessionStorage limpiado')
} else {
  console.log('❌ sessionStorage no disponible')
}

// Limpiar IndexedDB si está disponible
if (typeof indexedDB !== 'undefined') {
  try {
    indexedDB.deleteDatabase('unified-cache')
    console.log('✅ IndexedDB limpiado')
  } catch (error) {
    console.log('❌ Error limpiando IndexedDB:', error.message)
  }
} else {
  console.log('❌ IndexedDB no disponible')
}

console.log('🧹 Limpieza de caché completada')