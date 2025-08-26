-- Script para verificar la función upsert_service_age_ranges
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- 1. VERIFICAR FUNCIÓN upsert_service_age_ranges
-- =====================================================

-- Verificar si la función existe y sus parámetros
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
    AND p.proname = 'upsert_service_age_ranges';

-- =====================================================
-- 2. VERIFICAR TABLA age_price_ranges
-- =====================================================

-- Verificar si la tabla existe
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'age_price_ranges'
ORDER BY ordinal_position;

-- =====================================================
-- 3. VERIFICAR FUNCIONES RELACIONADAS
-- =====================================================

-- Listar todas las funciones relacionadas con servicios
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
    AND p.proname LIKE '%service%'
ORDER BY p.proname;
