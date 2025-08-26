-- Script de DIAGNÓSTICO para identificar el problema de duplicados
-- Ejecutar paso a paso para entender qué está pasando

-- PASO 1: Verificar la estructura de la tabla profiles
SELECT 
  'ESTRUCTURA TABLA PROFILES:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- PASO 2: Verificar todas las restricciones de la tabla
SELECT 
  'RESTRICCIONES TABLA PROFILES:' as info,
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass
ORDER BY conname;

-- PASO 3: Verificar usuarios en auth.users
SELECT 
  'USUARIOS EN AUTH.USERS:' as info,
  COUNT(*) as total_users
FROM auth.users;

-- PASO 4: Verificar perfiles existentes
SELECT 
  'PERFILES EXISTENTES:' as info,
  COUNT(*) as total_profiles
FROM public.profiles;

-- PASO 5: Verificar usuarios SIN perfil (debería ser 0 si ya están todos creados)
SELECT 
  'USUARIOS SIN PERFIL:' as info,
  COUNT(*) as usuarios_sin_perfil
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- PASO 6: Mostrar usuarios específicos sin perfil (si los hay)
SELECT 
  'DETALLE USUARIOS SIN PERFIL:' as info,
  au.id,
  au.email,
  au.raw_user_meta_data->>'full_name' as full_name,
  au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;

-- PASO 7: Mostrar todos los perfiles existentes con detalles
SELECT 
  'DETALLE PERFILES EXISTENTES:' as info,
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.created_at,
  p.updated_at
FROM public.profiles p
ORDER BY p.created_at DESC;

-- PASO 8: Verificar si hay conflictos de email
SELECT 
  'VERIFICACIÓN EMAILS:' as info,
  p.email,
  COUNT(*) as veces_que_aparece
FROM public.profiles p
GROUP BY p.email
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;
