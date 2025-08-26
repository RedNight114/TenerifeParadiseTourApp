-- Script para crear perfiles para usuarios existentes que no tienen perfil
-- Este script debe ejecutarse DESPUÉS de crear el trigger

-- 1. Verificar usuarios sin perfil
SELECT 
  'Usuarios sin perfil:' as info,
  COUNT(*) as total
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 2. Mostrar detalles de usuarios sin perfil
SELECT 
  au.id,
  au.email,
  au.created_at as user_created,
  au.raw_user_meta_data
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;

-- 3. Crear perfiles para usuarios existentes
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  avatar_url,
  role,
  created_at,
  updated_at
)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  NULL,
  'user',
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 4. Verificar que se crearon los perfiles
SELECT 
  'Perfiles creados:' as info,
  COUNT(*) as total
FROM public.profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.created_at >= NOW() - INTERVAL '1 hour';

-- 5. Verificar estado final
SELECT 
  'Estado final:' as info,
  COUNT(DISTINCT au.id) as total_users,
  COUNT(DISTINCT p.id) as total_profiles,
  COUNT(DISTINCT au.id) - COUNT(DISTINCT p.id) as missing_profiles
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id;

-- 6. Mostrar algunos perfiles creados como ejemplo
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.created_at,
  p.updated_at
FROM public.profiles p
ORDER BY p.created_at DESC
LIMIT 5;
