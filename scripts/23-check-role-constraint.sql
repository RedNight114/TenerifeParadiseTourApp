-- Script para verificar la restricción de la columna role
-- y corregir el problema de inserción

-- 1. Verificar la restricción actual de la columna role
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
  AND contype = 'c';

-- 2. Verificar qué valores están permitidos actualmente
SELECT DISTINCT role FROM public.profiles ORDER BY role;

-- 3. Verificar la estructura completa de la tabla profiles
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Mostrar algunos perfiles existentes como referencia
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 5;
