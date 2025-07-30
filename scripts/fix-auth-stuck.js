const fs = require('fs');
const path = require('path');

console.log('🔧 DIAGNÓSTICO Y REPARACIÓN DE AUTENTICACIÓN COLGADA');
console.log('====================================================');

// Verificar archivos de autenticación
const authFiles = [
  'hooks/use-auth-final.ts',
  'hooks/use-auth-improved.ts',
  'components/auth-recovery.tsx',
  'components/auth-recovery-improved.tsx',
  'components/auth-provider-fixed.tsx',
  'components/auth-provider-improved.tsx',
  'app/layout.tsx'
];

console.log('\n📋 VERIFICACIÓN DE ARCHIVOS:');
console.log('============================');

authFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - NO ENCONTRADO`);
  }
});

// Verificar localStorage en el navegador
console.log('\n🔍 VERIFICACIÓN DE LOCALSTORAGE:');
console.log('================================');

const localStorageKeys = [
  'sb-auth-token',
  'supabase.auth.token',
  'auth-stuck-detection',
  'auth-recovery-attempts'
];

console.log('Claves a verificar en localStorage:');
localStorageKeys.forEach(key => {
  console.log(`  - ${key}`);
});

// Verificar variables de entorno
console.log('\n🌐 VERIFICACIÓN DE VARIABLES DE ENTORNO:');
console.log('========================================');

const envVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: NO CONFIGURADA`);
  }
});

// Recomendaciones
console.log('\n💡 RECOMENDACIONES PARA ARREGLAR AUTENTICACIÓN COLGADA:');
console.log('========================================================');

console.log(`
1. 🔄 LIMPIAR CACHE DEL NAVEGADOR:
   - Abrir DevTools (F12)
   - Ir a Application > Storage
   - Limpiar localStorage y sessionStorage
   - Recargar página

2. 🧹 LIMPIAR CACHE DE NEXT.JS:
   - Detener servidor (Ctrl+C)
   - Ejecutar: rm -rf .next
   - Ejecutar: npm install
   - Reiniciar servidor: npm run dev

3. 🔐 VERIFICAR SESIÓN DE SUPABASE:
   - Ir a https://supabase.com/dashboard
   - Verificar que el proyecto esté activo
   - Revisar logs de autenticación

4. 🛠️ USAR HERRAMIENTAS DE RECUPERACIÓN:
   - El componente AuthRecoveryImproved detectará automáticamente problemas
   - Usar botones "Reinicializar", "Resetear" o "Recargar"
   - Monitorear logs en la consola del navegador

5. 🔍 DEBUGGING MANUAL:
   - Abrir DevTools > Console
   - Buscar mensajes de error relacionados con auth
   - Verificar que las llamadas a Supabase se completen

6. ⚡ SOLUCIONES RÁPIDAS:
   - Recargar página (F5)
   - Usar modo incógnito
   - Limpiar cookies del sitio
   - Verificar conexión a internet
`);

// Verificar configuración de Supabase
console.log('\n🔧 VERIFICACIÓN DE CONFIGURACIÓN SUPABASE:');
console.log('==========================================');

const supabaseConfigPath = path.join(process.cwd(), 'lib/supabase-optimized.ts');
if (fs.existsSync(supabaseConfigPath)) {
  console.log('✅ Archivo de configuración Supabase encontrado');
  
  const configContent = fs.readFileSync(supabaseConfigPath, 'utf8');
  
  // Verificar que tenga las funciones necesarias
  const requiredFunctions = [
    'getSupabaseClient',
    'createClient',
    'supabase'
  ];
  
  requiredFunctions.forEach(func => {
    if (configContent.includes(func)) {
      console.log(`✅ Función ${func} encontrada`);
    } else {
      console.log(`❌ Función ${func} NO encontrada`);
    }
  });
} else {
  console.log('❌ Archivo de configuración Supabase NO encontrado');
}

console.log('\n🎯 PRÓXIMOS PASOS:');
console.log('==================');
console.log('1. Reiniciar el servidor de desarrollo');
console.log('2. Abrir la aplicación en el navegador');
console.log('3. Verificar que AuthRecoveryImproved aparezca en la esquina superior derecha');
console.log('4. Monitorear los logs en la consola del navegador');
console.log('5. Si persiste el problema, usar las herramientas de recuperación');

console.log('\n✅ DIAGNÓSTICO COMPLETADO'); 