-- Script para diagnosticar la función create_service_with_age_ranges
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar la estructura de la tabla services
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'services' 
ORDER BY ordinal_position;

-- 2. Verificar la función RPC
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'create_service_with_age_ranges';

-- 3. Verificar si la función existe y su definición
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'create_service_with_age_ranges';

-- 4. Probar inserción directa en la tabla services (sin RPC)
INSERT INTO services (
  title,
  description,
  category_id,
  price,
  available,
  duration,
  min_group_size,
  max_group_size,
  capacity,
  min_age,
  seats,
  doors,
  deposit_amount,
  age_ranges
) VALUES (
  'Test Direct Insert',
  'Test description',
  '1',
  100,
  true,
  120,
  1,
  10,
  10,
  18,
  4,
  4,
  0,
  '[{"id":"test-1","min_age":0,"max_age":2,"price":0,"price_type":"baby","is_active":true}]'::jsonb
) RETURNING id, title, age_ranges;

-- 5. Limpiar el test
DELETE FROM services WHERE title = 'Test Direct Insert';

