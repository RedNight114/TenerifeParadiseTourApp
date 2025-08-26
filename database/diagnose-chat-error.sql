-- Script de diagnóstico para el error de columna 'status' en conversation_participants
-- Ejecutar en Supabase SQL Editor para identificar el problema exacto

-- =====================================================
-- DIAGNÓSTICO COMPLETO DEL ERROR
-- =====================================================

-- 1. Verificar si la tabla existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name = 'conversation_participants'
) as table_exists;

-- 2. Verificar estructura completa de la tabla
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_name = 'conversation_participants' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar si hay alguna vista que incluya la columna 'status'
SELECT 
  table_name,
  column_name
FROM information_schema.columns 
WHERE column_name = 'status' 
  AND table_schema = 'public'
  AND table_name LIKE '%participant%';

-- 4. Verificar si hay algún trigger o función que modifique la tabla
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'conversation_participants'
  AND trigger_schema = 'public';

-- 5. Verificar si hay alguna función que acceda a la columna 'status'
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_definition LIKE '%conversation_participants%status%';

-- 6. Verificar si hay alguna política RLS que mencione 'status'
SELECT 
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'conversation_participants'
  AND cmd LIKE '%status%';

-- 7. Verificar si hay algún índice que incluya 'status'
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'conversation_participants'
  AND indexdef LIKE '%status%';

-- 8. Verificar si hay alguna restricción que mencione 'status'
SELECT 
  constraint_name,
  constraint_type,
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public'
  AND check_clause LIKE '%conversation_participants%status%';

-- 9. Verificar si hay alguna referencia externa a la columna 'status'
SELECT 
  table_name,
  column_name,
  referenced_table_name,
  referenced_column_name
FROM information_schema.key_column_usage 
WHERE referenced_table_name = 'conversation_participants'
  AND referenced_column_name = 'status';

-- 10. Verificar el esquema de caché de Supabase
-- Esta consulta puede ayudar a identificar problemas de caché
SELECT 
  schemaname,
  tablename,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'conversation_participants';

-- =====================================================
-- SOLUCIÓN INMEDIATA (si se encuentra el problema)
-- =====================================================

-- Si se encuentra una columna 'status' incorrecta, eliminarla:
-- ALTER TABLE conversation_participants DROP COLUMN IF EXISTS status;

-- Si se encuentra una vista problemática, eliminarla:
-- DROP VIEW IF EXISTS nombre_vista_problematica;

-- Si se encuentra un trigger problemático, eliminarlo:
-- DROP TRIGGER IF EXISTS nombre_trigger_problematico ON conversation_participants;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Después de aplicar las correcciones, verificar que la tabla esté correcta
SELECT 
  'ESTRUCTURA FINAL' as verificacion,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'conversation_participants' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

