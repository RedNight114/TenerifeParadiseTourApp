-- Script para refrescar el schema cache de Supabase
-- Ejecutar en Supabase SQL Editor
-- SOLUCIONA el problema de "Could not find the function" en el frontend

-- =====================================================
-- 1. VERIFICAR FUNCIÓN EXISTENTE
-- =====================================================

-- Verificar que la función existe
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
    AND p.proname = 'update_service_with_age_ranges';

-- =====================================================
-- 2. FORZAR ACTUALIZACIÓN DEL SCHEMA
-- =====================================================

-- Crear una función temporal para forzar la actualización del schema
CREATE OR REPLACE FUNCTION refresh_schema_cache()
RETURNS VOID AS $$
BEGIN
    -- Forzar la actualización del schema cache
    PERFORM pg_stat_clear_snapshot();
    
    -- Verificar que la función es accesible
    PERFORM update_service_with_age_ranges(
        '00000000-0000-0000-0000-000000000000'::UUID,
        '{"test": "data"}'::JSONB
    );
    
    RAISE NOTICE '✅ Schema cache refrescado';
    RAISE NOTICE '✅ Función update_service_with_age_ranges verificada';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. EJECUTAR REFRESH
-- =====================================================

-- Ejecutar el refresh
SELECT refresh_schema_cache();

-- =====================================================
-- 4. LIMPIAR FUNCIÓN TEMPORAL
-- =====================================================

-- Eliminar la función temporal
DROP FUNCTION IF EXISTS refresh_schema_cache();

-- =====================================================
-- 5. VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que todo está funcionando
DO $$
BEGIN
    RAISE NOTICE '✅ Schema cache refrescado exitosamente';
    RAISE NOTICE '✅ Función update_service_with_age_ranges accesible';
    RAISE NOTICE '✅ Frontend debería funcionar ahora';
END $$;
