#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 RESETEANDO ESTADO DE AUTENTICACIÓN');
console.log('=====================================\n');

// Limpiar cache de Next.js
console.log('🧹 Limpiando cache de Next.js...');
try {
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
    console.log('✅ Cache .next eliminado');
  } else {
    console.log('ℹ️ Cache .next no existe');
  }
} catch (error) {
  console.log('⚠️ Error eliminando cache:', error.message);
}

// Limpiar node_modules (opcional)
console.log('\n📦 Reinstalando dependencias...');
try {
  const { execSync } = require('child_process');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('✅ Dependencias reinstaladas');
} catch (error) {
  console.log('⚠️ Error reinstalando dependencias:', error.message);
}

console.log('\n🔧 SCRIPT PARA EL NAVEGADOR:');
console.log('============================');
console.log('Ejecuta esto en la consola del navegador:');
console.log(`
// Limpiar localStorage
localStorage.clear();

// Limpiar sessionStorage
sessionStorage.clear();

// Limpiar cookies específicas de Supabase
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

// Limpiar datos específicos de Supabase
localStorage.removeItem('sb-REPLACE_WITH_YOUR_SUPABASE_URL-auth-token');
localStorage.removeItem('supabase.auth.token');

// Recargar página
window.location.reload();
`);

console.log('\n📋 PASOS MANUALES:');
console.log('==================');
console.log('1. Abre las DevTools (F12)');
console.log('2. Ve a la pestaña Application/Storage');
console.log('3. Limpia localStorage, sessionStorage y cookies');
console.log('4. Recarga la página (Ctrl+F5)');
console.log('5. Ejecuta: npm run dev');

console.log('\n🏁 Reset completado');
console.log('Ejecuta: npm run dev'); 