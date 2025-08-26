-- Script de diagnóstico para verificar funciones existentes
-- Ejecutar en Supabase SQL Editor
-- SOLUCIONA: Verificar qué funciones existen realmente

-- =====================================================
-- 1. VERIFICAR FUNCIONES EXISTENTES EN PUBLIC
-- =====================================================

-- Ver todas las funciones en el esquema public
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type,
    p.prosecdef as security_definer,
    r.rolname as owner
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_roles r ON p.proowner = r.oid
WHERE n.nspname = 'public'
    AND p.proname LIKE '%service%'
ORDER BY p.proname;

-- =====================================================
-- 2. VERIFICAR FUNCIONES ESPECÍFICAS
-- =====================================================

-- Verificar si existen las funciones que necesitamos
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc p 
            JOIN pg_namespace n ON p.pronamespace = n.oid 
            WHERE n.nspname = 'public' AND p.proname = 'create_service_simple'
        ) THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as create_service_simple_status;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc p 
            JOIN pg_namespace n ON p.pronamespace = n.oid 
            WHERE n.nspname = 'public' AND p.proname = 'update_service_simple'
        ) THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as update_service_simple_status;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc p 
            JOIN pg_namespace n ON p.pronamespace = n.oid 
            WHERE n.nspname = 'public' AND p.proname = 'delete_service_simple'
        ) THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as delete_service_simple_status;

-- =====================================================
-- 3. VERIFICAR FUNCIONES ANTIGUAS
-- =====================================================

-- Verificar si existen las funciones antiguas
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc p 
            JOIN pg_namespace n ON p.pronamespace = n.oid 
            WHERE n.nspname = 'public' AND p.proname = 'update_service_with_age_ranges'
        ) THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as update_service_with_age_ranges_status;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc p 
            JOIN pg_namespace n ON p.pronamespace = n.oid 
            WHERE n.nspname = 'public' AND p.proname = 'create_service_with_age_ranges'
        ) THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as create_service_with_age_ranges_status;

-- =====================================================
-- 4. VERIFICAR ESTRUCTURA DE LA TABLA SERVICES
-- =====================================================

-- Verificar si existen las columnas de precios por edad
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'services'
    AND column_name IN ('precio_ninos', 'edad_maxima_ninos')
ORDER BY column_name;

-- =====================================================
-- 5. MENSAJE DE DIAGNÓSTICO
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🔍 Diagnóstico completado!';
    RAISE NOTICE '📋 Revisa los resultados para identificar qué funciones existen';
    RAISE NOTICE '💡 Si las funciones no existen, necesitamos recrearlas';
    RAISE NOTICE '🚀 Si existen pero con parámetros diferentes, necesitamos corregir los permisos';
END $$;
