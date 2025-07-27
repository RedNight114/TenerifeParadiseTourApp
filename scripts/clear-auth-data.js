// Script para limpiar localStorage y sessionStorage
// Ejecutar en la consola del navegador

console.log('🧹 Limpiando datos de autenticación...');

// Limpiar localStorage
localStorage.clear();
console.log('✅ localStorage limpiado');

// Limpiar sessionStorage
sessionStorage.clear();
console.log('✅ sessionStorage limpiado');

// Limpiar cookies específicas de Supabase
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log('✅ Cookies limpiadas');

// Limpiar datos específicos de Supabase
if (localStorage.getItem('supabase.auth.token')) {
  localStorage.removeItem('supabase.auth.token');
  console.log('✅ Token de Supabase eliminado');
}

if (localStorage.getItem('supabase.auth.expires_at')) {
  localStorage.removeItem('supabase.auth.expires_at');
  console.log('✅ Expiración de Supabase eliminada');
}

if (localStorage.getItem('supabase.auth.refresh_token')) {
  localStorage.removeItem('supabase.auth.refresh_token');
  console.log('✅ Refresh token de Supabase eliminado');
}

// Limpiar cualquier dato relacionado con auth
const authKeys = Object.keys(localStorage).filter(key => 
  key.includes('auth') || key.includes('supabase') || key.includes('session')
);

authKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log(`✅ Eliminado: ${key}`);
});

console.log('🎉 Limpieza completada. Recarga la página.');
console.log('💡 Si el problema persiste, intenta:');
console.log('   1. Cerrar todas las pestañas del navegador');
console.log('   2. Abrir una nueva pestaña en modo incógnito');
console.log('   3. Ir a la aplicación');
