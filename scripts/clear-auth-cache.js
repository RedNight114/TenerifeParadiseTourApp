// Script para limpiar cookies y cache de autenticación
// Ejecutar en la consola del navegador

console.log('🧹 Limpiando cookies y cache de autenticación...')

// Limpiar cookies de Supabase
const cookiesToDelete = [
  'sb-access-token',
  'sb-refresh-token', 
  'sb-session-active',
  'supabase.auth.token'
]

cookiesToDelete.forEach(cookieName => {
  // Eliminar cookie para el dominio actual
  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  
  // Eliminar cookie para subdominios
  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
  
  // Eliminar cookie para localhost
  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`
})

// Limpiar localStorage
try {
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key.includes('supabase') || key.includes('sb-'))) {
      keysToRemove.push(key)
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key)
    console.log(`🗑️ Eliminado de localStorage: ${key}`)
  })
} catch (e) {
  console.log('⚠️ No se pudo acceder a localStorage:', e.message)
}

// Limpiar sessionStorage
try {
  const keysToRemove = []
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i)
    if (key && (key.includes('supabase') || key.includes('sb-'))) {
      keysToRemove.push(key)
    }
  }
  
  keysToRemove.forEach(key => {
    sessionStorage.removeItem(key)
    console.log(`🗑️ Eliminado de sessionStorage: ${key}`)
  })
} catch (e) {
  console.log('⚠️ No se pudo acceder a sessionStorage:', e.message)
}

console.log('✅ Limpieza completada. Recarga la página para continuar.')
console.log('🔄 Ejecuta: window.location.reload()')
