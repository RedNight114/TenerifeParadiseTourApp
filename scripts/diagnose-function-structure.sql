-- DIAGNÓSTICO DE LA FUNCIÓN get_service_age_ranges
-- Ejecuta este script en Supabase SQL Editor para identificar el problema
-- =====================================================

-- 1. VERIFICAR LA FUNCIÓN ACTUAL
-- =====================================================
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type,
    p.prosrc as source_code
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'get_service_age_ranges';

-- 2. VERIFICAR LA TABLA age_price_ranges
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'age_price_ranges'
ORDER BY ordinal_position;

-- 3. PROBAR LA FUNCIÓN DIRECTAMENTE
-- =====================================================
-- Crear un UUID de prueba válido
DO $$
DECLARE
    test_uuid UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    RAISE NOTICE 'UUID de prueba: %', test_uuid;
    
    -- Verificar si la función existe
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.proname = 'get_service_age_ranges'
    ) THEN
        RAISE NOTICE '✅ Función get_service_age_ranges existe';
    ELSE
        RAISE NOTICE '❌ Función get_service_age_ranges NO existe';
    END IF;
END $$;

-- 4. VERIFICAR TIPOS DE DATOS
-- =====================================================
SELECT 
    'age_price_ranges.id' as column_info,
    'BIGINT' as expected_type,
    data_type as actual_type
FROM information_schema.columns 
WHERE table_name = 'age_price_ranges' AND column_name = 'id'

UNION ALL

SELECT 
    'age_price_ranges.min_age' as column_info,
    'INTEGER' as expected_type,
    data_type as actual_type
FROM information_schema.columns 
WHERE table_name = 'age_price_ranges' AND column_name = 'min_age'

UNION ALL

SELECT 
    'age_price_ranges.max_age' as column_info,
    'INTEGER' as expected_type,
    data_type as actual_type
FROM information_schema.columns 
WHERE table_name = 'age_price_ranges' AND column_name = 'max_age'

UNION ALL

SELECT 
    'age_price_ranges.price' as column_info,
    'DECIMAL(10,2)' as expected_type,
    data_type as actual_type
FROM information_schema.columns 
WHERE table_name = 'age_price_ranges' AND column_name = 'price';
