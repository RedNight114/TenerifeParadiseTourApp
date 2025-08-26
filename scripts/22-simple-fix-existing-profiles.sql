-- Script SIMPLE para crear perfiles para usuarios existentes
-- Este script NO usa triggers, solo INSERT directo

-- 1. Verificar usuarios sin perfil
SELECT 
  'Usuarios sin perfil:' as info,
  COUNT(*) as total
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 2. Crear perfiles para usuarios existentes (solo si no existen)
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

-- 3. Verificar estado final
SELECT 
  'Estado final:' as info,
  COUNT(DISTINCT au.id) as total_users,
  COUNT(DISTINCT p.id) as total_profiles,
  COUNT(DISTINCT au.id) - COUNT(DISTINCT p.id) as missing_profiles
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id;

-- 4. Mostrar algunos perfiles como ejemplo
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC
LIMIT 5;
