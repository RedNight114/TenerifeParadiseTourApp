#!/usr/bin/env node

/**
 * Script para diagnosticar y reparar problemas de perfiles de usuario
 * Uso: node scripts/fix-profile-issues.js
 */

const fs = require('fs')
const path = require('path')

console.log('🔧 Iniciando diagnóstico de problemas de perfiles...')

// Función para verificar la estructura de la tabla profiles
function checkProfilesTable() {
  console.log('📋 Verificando estructura de tabla profiles...')
  
  const sqlCheck = `
    -- Verificar si la tabla profiles existe
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles'
    ) as table_exists;
    
    -- Verificar estructura de la tabla
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
    ORDER BY ordinal_position;
    
    -- Verificar RLS policies
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
    FROM pg_policies
    WHERE tablename = 'profiles';
  `
  
  const sqlPath = path.join(__dirname, 'check-profiles-table.sql')
  fs.writeFileSync(sqlPath, sqlCheck)
  console.log(`📝 SQL de verificación guardado en: ${sqlPath}`)
}

// Función para generar script de reparación de perfiles
function generateProfileFixScript() {
  console.log('🔧 Generando script de reparación de perfiles...')
  
  const fixScript = `
-- Script para reparar problemas de perfiles
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar usuarios sin perfiles
SELECT 
  au.id as user_id,
  au.email,
  au.created_at as user_created_at,
  CASE WHEN p.id IS NULL THEN 'SIN PERFIL' ELSE 'CON PERFIL' END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;

-- 2. Crear perfiles faltantes automáticamente
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)) as full_name,
  'user' as role,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 3. Verificar perfiles duplicados o corruptos
SELECT 
  id,
  COUNT(*) as count
FROM public.profiles
GROUP BY id
HAVING COUNT(*) > 1;

-- 4. Limpiar perfiles duplicados (mantener el más reciente)
DELETE FROM public.profiles
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY id ORDER BY updated_at DESC) as rn
    FROM public.profiles
  ) t
  WHERE t.rn > 1
);

-- 5. Verificar perfiles con datos faltantes
SELECT 
  id,
  email,
  full_name,
  role,
  CASE 
    WHEN email IS NULL THEN 'EMAIL FALTANTE'
    WHEN full_name IS NULL THEN 'NOMBRE FALTANTE'
    WHEN role IS NULL THEN 'ROL FALTANTE'
    ELSE 'OK'
  END as issue
FROM public.profiles
WHERE email IS NULL OR full_name IS NULL OR role IS NULL;

-- 6. Reparar datos faltantes
UPDATE public.profiles
SET 
  email = COALESCE(email, 'usuario@example.com'),
  full_name = COALESCE(full_name, 'Usuario'),
  role = COALESCE(role, 'user'),
  updated_at = NOW()
WHERE email IS NULL OR full_name IS NULL OR role IS NULL;

-- 7. Verificar RLS policies
-- Asegurar que los usuarios pueden leer su propio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Asegurar que los usuarios pueden actualizar su propio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Asegurar que se pueden insertar perfiles nuevos
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 8. Verificar resultado final
SELECT 
  COUNT(*) as total_users,
  COUNT(p.id) as users_with_profiles,
  COUNT(*) - COUNT(p.id) as users_without_profiles
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id;
  `
  
  const scriptPath = path.join(__dirname, 'fix-profiles.sql')
  fs.writeFileSync(scriptPath, fixScript)
  console.log(`📝 Script de reparación guardado en: ${scriptPath}`)
}

// Función para generar script de limpieza de cache
function generateCacheCleanupScript() {
  console.log('🧹 Generando script de limpieza de cache...')
  
  const cacheScript = `
// Script para limpiar cache de autenticación en el navegador
// Ejecutar en la consola del navegador (F12)

console.log('🧹 Iniciando limpieza de cache de autenticación...');

// Limpiar localStorage
try {
  const keysToRemove = [
    'supabase.auth.token',
    'supabase.auth.expires_at',
    'supabase.auth.refresh_token',
    'supabase.auth.provider_token',
    'supabase.auth.provider_refresh_token',
    'supabase.auth.user',
    'supabase.auth.session'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log('✅ Removido:', key);
  });
  
  console.log('✅ localStorage limpiado');
} catch (e) {
  console.error('❌ Error limpiando localStorage:', e);
}

// Limpiar sessionStorage
try {
  sessionStorage.clear();
  console.log('✅ sessionStorage limpiado');
} catch (e) {
  console.error('❌ Error limpiando sessionStorage:', e);
}

// Limpiar cookies relacionadas con Supabase
try {
  const cookies = document.cookie.split(";");
  cookies.forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    
    // Limpiar cookies que contengan 'supabase' o 'auth'
    if (name.toLowerCase().includes('supabase') || name.toLowerCase().includes('auth')) {
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      console.log('✅ Cookie limpiada:', name);
    }
  });
  console.log('✅ Cookies limpiadas');
} catch (e) {
  console.error('❌ Error limpiando cookies:', e);
}

// Limpiar cache de IndexedDB si existe
try {
  if ('indexedDB' in window) {
    indexedDB.databases().then(databases => {
      databases.forEach(db => {
        if (db.name.toLowerCase().includes('supabase')) {
          indexedDB.deleteDatabase(db.name);
          console.log('✅ IndexedDB limpiado:', db.name);
        }
      });
    });
  }
} catch (e) {
  console.error('❌ Error limpiando IndexedDB:', e);
}

console.log('🎉 Limpieza de cache completada');
console.log('🔄 Recargando página...');

// Recargar página después de 1 segundo
setTimeout(() => {
  window.location.reload();
}, 1000);
  `
  
  const scriptPath = path.join(__dirname, 'cleanup-auth-cache.js')
  fs.writeFileSync(scriptPath, cacheScript)
  console.log(`📝 Script de limpieza de cache guardado en: ${scriptPath}`)
}

// Función para generar instrucciones de solución
function generateSolutionInstructions() {
  console.log('\n📋 Instrucciones para resolver problemas de perfiles:')
  console.log('')
  console.log('1. 🔍 DIAGNÓSTICO:')
  console.log('   - Ejecutar el script check-profiles-table.sql en Supabase SQL Editor')
  console.log('   - Verificar si hay usuarios sin perfiles')
  console.log('   - Revisar la consola del navegador para errores específicos')
  console.log('')
  console.log('2. 🔧 REPARACIÓN:')
  console.log('   - Ejecutar el script fix-profiles.sql en Supabase SQL Editor')
  console.log('   - Esto creará perfiles faltantes automáticamente')
  console.log('   - Reparará datos corruptos o faltantes')
  console.log('')
  console.log('3. 🧹 LIMPIEZA DE CACHE:')
  console.log('   - Abrir DevTools (F12) en el navegador')
  console.log('   - Ir a la pestaña Console')
  console.log('   - Copiar y pegar el contenido de cleanup-auth-cache.js')
  console.log('   - El script limpiará automáticamente el cache y recargará')
  console.log('')
  console.log('4. 🔄 VERIFICACIÓN:')
  console.log('   - Recargar la página (Ctrl+F5)')
  console.log('   - Verificar que el perfil se carga correctamente')
  console.log('   - Revisar el componente AuthDiagnostic en la esquina inferior derecha')
  console.log('')
  console.log('5. 🚀 REINICIO:')
  console.log('   - Reiniciar el servidor de desarrollo: npm run dev')
  console.log('   - Probar el login con un usuario existente')
  console.log('')
  console.log('🔍 SÍNTOMAS COMUNES:')
  console.log('- Usuario autenticado pero perfil no carga')
  console.log('- Loading infinito en verificación de autenticación')
  console.log('- Errores 404 al cargar perfil')
  console.log('- Usuario aparece como "null" en el perfil')
  console.log('')
  console.log('💡 PREVENCIÓN:')
  console.log('- Asegurar que RLS policies estén configuradas correctamente')
  console.log('- Verificar que la tabla profiles tenga la estructura correcta')
  console.log('- Implementar creación automática de perfiles en el registro')
  console.log('- Usar timeouts en las operaciones de carga de perfil')
}

// Función principal
function main() {
  console.log('🚀 Iniciando diagnóstico de problemas de perfiles...\n')
  
  checkProfilesTable()
  console.log('')
  
  generateProfileFixScript()
  console.log('')
  
  generateCacheCleanupScript()
  console.log('')
  
  generateSolutionInstructions()
  
  console.log('✅ Diagnóstico completado')
  console.log('')
  console.log('📁 Archivos generados:')
  console.log('- check-profiles-table.sql (verificación de estructura)')
  console.log('- fix-profiles.sql (reparación automática)')
  console.log('- cleanup-auth-cache.js (limpieza de cache)')
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main()
}

module.exports = {
  checkProfilesTable,
  generateProfileFixScript,
  generateCacheCleanupScript,
  generateSolutionInstructions
} 