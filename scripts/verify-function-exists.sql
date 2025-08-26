-- Script para verificar si la función update_service_with_age_ranges existe
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- 1. VERIFICAR FUNCIÓN EXISTENTE
-- =====================================================

-- Verificar si la función existe y sus parámetros
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type,
    p.oid as function_oid
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
    AND p.proname = 'update_service_with_age_ranges';

-- =====================================================
-- 2. VERIFICAR TODAS LAS FUNCIONES DE SERVICIOS
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

-- =====================================================
-- 3. VERIFICAR SCHEMA CACHE
-- =====================================================

-- Verificar si hay problemas con el schema cache
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename LIKE '%service%';

-- =====================================================
-- 4. VERIFICAR PERMISOS
-- =====================================================

-- Verificar permisos de la función
SELECT 
    p.proname as function_name,
    p.proacl as access_privileges,
    p.prosecdef as security_definer
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
    AND p.proname = 'update_service_with_age_ranges';
