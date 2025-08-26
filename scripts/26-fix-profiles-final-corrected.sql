-- Script FINAL CORREGIDO para crear perfiles para usuarios existentes
-- Evitando duplicados y usando JOIN correcto

-- 1. Verificar usuarios sin perfil
SELECT 
  'Usuarios sin perfil:' as info,
  COUNT(*) as total
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 2. Mostrar usuarios que NO tienen perfil
SELECT 
  'Usuarios sin perfil:' as info,
  au.id,
  au.email,
  au.raw_user_meta_data->>'full_name' as full_name,
  au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;

-- 3. Crear perfiles SOLO para usuarios que NO tienen perfil
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
  'client',
  au.created_at,
  NOW()
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- 4. Verificar estado final
SELECT 
  'Estado final:' as info,
  COUNT(DISTINCT au.id) as total_users,
  COUNT(DISTINCT p.id) as total_profiles,
  COUNT(DISTINCT au.id) - COUNT(DISTINCT p.id) as missing_profiles
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id;

-- 5. Verificar que todos los usuarios tienen perfil
SELECT 
  'Verificación final:' as info,
  au.email,
  CASE 
    WHEN p.id IS NOT NULL THEN '✅ CON PERFIL'
    ELSE '❌ SIN PERFIL'
  END as status,
  p.role as profile_role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- 6. Mostrar todos los perfiles existentes
SELECT 
  'Perfiles existentes:' as info,
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC;
