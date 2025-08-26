-- Script para diagnosticar el conflicto del trigger "service_id ambiguous"
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar todos los triggers en la tabla services
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'services';

-- 2. Verificar la función específica que está causando el conflicto
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname LIKE '%age%' OR p.proname LIKE '%service%';

-- 3. Verificar si hay triggers en age_price_ranges que se ejecuten automáticamente
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'age_price_ranges';

-- 4. Verificar la definición completa de la función problemática
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_name LIKE '%age%' OR routine_name LIKE '%service%';

-- 5. Probar inserción sin triggers (deshabilitar temporalmente)
-- NOTA: Solo para diagnóstico, NO ejecutar en producción
-- ALTER TABLE services DISABLE TRIGGER ALL;

-- 6. Verificar si hay conflictos de nombres de columnas
SELECT 
  column_name,
  data_type,
  table_name
FROM information_schema.columns
WHERE column_name = 'service_id'
ORDER BY table_name;
