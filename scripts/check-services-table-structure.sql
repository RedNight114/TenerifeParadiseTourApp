-- Script para verificar la estructura real de la tabla services
-- Ejecutar en Supabase SQL Editor
-- DIAGNOSTICA el problema de tipos en update_service_with_age_ranges

-- =====================================================
-- 1. VERIFICAR ESTRUCTURA DE LA TABLA services
-- =====================================================

-- Ver estructura completa de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'services' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 2. VERIFICAR TIPOS ESPECÍFICOS PROBLEMÁTICOS
-- =====================================================

-- Verificar campos que podrían tener tipos incorrectos
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'services' 
    AND table_schema = 'public'
    AND column_name IN (
        'duration',
        'min_group_size',
        'max_group_size',
        'capacity',
        'min_age',
        'seats',
        'doors'
    );

-- =====================================================
-- 3. VERIFICAR DATOS EXISTENTES
-- =====================================================

-- Ver algunos registros para entender los tipos de datos
SELECT 
    id,
    title,
    duration,
    min_group_size,
    max_group_size,
    capacity,
    min_age,
    seats,
    doors
FROM services 
LIMIT 5;

-- =====================================================
-- 4. VERIFICAR FUNCIÓN ACTUAL
-- =====================================================

-- Ver la definición actual de la función
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
    AND p.proname = 'update_service_with_age_ranges';

-- =====================================================
-- 5. RESUMEN DEL DIAGNÓSTICO
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🔍 Diagnóstico de la tabla services completado';
    RAISE NOTICE '🔍 Verifica los tipos de datos en la salida anterior';
    RAISE NOTICE '🔍 Busca inconsistencias entre INTEGER y TEXT';
    RAISE NOTICE '🔍 El problema está en el campo duration o similar';
END $$;
