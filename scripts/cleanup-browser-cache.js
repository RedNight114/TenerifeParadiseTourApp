
// Script de limpieza de caché para el navegador
if (typeof window !== 'undefined') {
  // Limpiar localStorage
  const keys = Object.keys(localStorage).filter(key => 
    key.startsWith('tpt_') || 
    key.startsWith('tenerife-') ||
    key.includes('cache') ||
    key.startsWith('services_cache') ||
    key.startsWith('categories_cache') ||
    key.startsWith('user_cache')
  )
  
  keys.forEach(key => {
    localStorage.removeItem(key)
    console.log('🗑️ Eliminado:', key)
  })
  
  // Limpiar sessionStorage
  const sessionKeys = Object.keys(sessionStorage).filter(key => 
    key.includes('cache') || key.includes('temp')
  )
  
  sessionKeys.forEach(key => {
    sessionStorage.removeItem(key)
    console.log('🗑️ Eliminado de session:', key)
  })
  
  console.log('✅ Limpieza de caché completada')
}
