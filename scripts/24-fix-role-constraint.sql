-- Script para corregir la restricción de la columna role
-- y permitir la inserción de perfiles con role = 'user'

-- 1. Eliminar la restricción problemática (si existe)
DO $$
BEGIN
  -- Intentar eliminar la restricción si existe
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.profiles'::regclass 
      AND conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_role_check;
    RAISE NOTICE 'Restricción profiles_role_check eliminada';
  ELSE
    RAISE NOTICE 'No se encontró la restricción profiles_role_check';
  END IF;
END $$;

-- 2. Crear una nueva restricción más flexible
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'user', 'moderator', 'guest'));

-- 3. Verificar que la restricción se creó correctamente
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
  AND contype = 'c';

-- 4. Ahora intentar crear perfiles para usuarios existentes
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

-- 5. Verificar el resultado
SELECT 
  'Estado final:' as info,
  COUNT(DISTINCT au.id) as total_users,
  COUNT(DISTINCT p.id) as total_profiles,
  COUNT(DISTINCT au.id) - COUNT(DISTINCT p.id) as missing_profiles
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = au.id;

-- 6. Mostrar perfiles creados recientemente
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC
LIMIT 10;
