
// Limpiar localStorage
localStorage.clear()
sessionStorage.clear()

// Limpiar cookies de autenticación
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
})

console.log('✅ Almacenamiento limpiado')
