-- Script CORREGIDO para crear perfiles para usuarios existentes
-- Usando 'client' en lugar de 'user' para la columna role

-- 1. Verificar usuarios sin perfil
SELECT 
  'Usuarios sin perfil:' as info,
  COUNT(*) as total
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 2. Crear perfiles para usuarios existentes usando 'client' como role
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
  'client',  -- ✅ CORREGIDO: usar 'client' en lugar de 'user'
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 3. Verificar estado final
SELECT 
  'Estado final:' as info,
  COUNT(DISTINCT au.id) as total_users,
  COUNT(DISTINCT p.id) as total_profiles,
  COUNT(DISTINCT au.id) - COUNT(DISTINCT p.id) as missing_profiles
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id;

-- 4. Mostrar perfiles creados recientemente
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC
LIMIT 10;

-- 5. Verificar que todos los usuarios tienen perfil
SELECT 
  'Verificación final:' as info,
  au.email,
  CASE 
    WHEN p.id IS NOT NULL THEN '✅ CON PERFIL'
    ELSE '❌ SIN PERFIL'
  END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC;
