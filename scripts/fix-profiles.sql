
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
  