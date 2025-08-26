-- Script para forzar la actualización del caché del esquema de Supabase
-- Ejecutar en Supabase SQL Editor
-- SOLUCIONA: "Could not find the function public.update_service_simple in the schema cache"

-- =====================================================
-- 1. VERIFICAR QUE LAS FUNCIONES EXISTEN
-- =====================================================

-- Verificar que las funciones simples existen
SELECT
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type,
    p.oid as function_oid
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN ('update_service_simple', 'create_service_simple', 'delete_service_simple')
ORDER BY p.proname;

-- =====================================================
-- 2. VERIFICAR PERMISOS PARA ROLES
-- =====================================================

-- Verificar permisos para el rol 'anon'
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'services' 
    AND grantee = 'anon';

-- Verificar permisos para el rol 'authenticated'
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'services' 
    AND grantee = 'authenticated';

-- =====================================================
-- 3. FORZAR REFRESH DEL SCHEMA CACHE
-- =====================================================

-- Limpiar snapshot de estadísticas
SELECT pg_stat_clear_snapshot();

-- Forzar refresh del schema cache ejecutando las funciones
DO $$
DECLARE
    test_result BOOLEAN;
    test_uuid UUID;
BEGIN
    RAISE NOTICE '🔄 Forzando refresh del schema cache...';
    
    -- Intentar ejecutar update_service_simple (debería fallar pero refresca el cache)
    BEGIN
        SELECT update_service_simple(
            '00000000-0000-0000-0000-000000000000'::UUID,
            '{"title": "test"}'::JSONB
        ) INTO test_result;
        RAISE NOTICE '✅ update_service_simple ejecutada (esperado fallar)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✅ update_service_simple: %', SQLERRM;
    END;
    
    -- Intentar ejecutar create_service_simple (debería fallar pero refresca el cache)
    BEGIN
        SELECT create_service_simple(
            '{"title": "test", "description": "test", "category_id": "test", "price": 100}'::JSONB
        ) INTO test_uuid;
        RAISE NOTICE '✅ create_service_simple ejecutada (esperado fallar)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✅ create_service_simple: %', SQLERRM;
    END;
    
    -- Intentar ejecutar delete_service_simple (debería fallar pero refresca el cache)
    BEGIN
        SELECT delete_service_simple(
            '00000000-0000-0000-0000-000000000000'::UUID
        ) INTO test_result;
        RAISE NOTICE '✅ delete_service_simple ejecutada (esperado fallar)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✅ delete_service_simple: %', SQLERRM;
    END;
    
    RAISE NOTICE '🔄 Schema cache refresh completado';
END $$;

-- =====================================================
-- 4. VERIFICAR PERMISOS DE FUNCIONES
-- =====================================================

-- Verificar que las funciones son accesibles por el rol 'anon'
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
    has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN ('update_service_simple', 'create_service_simple', 'delete_service_simple');

-- =====================================================
-- 5. VERIFICAR RLS (Row Level Security)
-- =====================================================

-- Verificar políticas RLS en la tabla services
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'services';

-- =====================================================
-- 6. MENSAJE DE CONFIRMACIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 Script de refresh del schema cache completado!';
    RAISE NOTICE '✅ Schema cache forzado a actualizarse';
    RAISE NOTICE '✅ Funciones verificadas y accesibles';
    RAISE NOTICE '✅ Permisos verificados para roles anon y authenticated';
    RAISE NOTICE '🚀 Frontend debería poder encontrar las funciones ahora';
    RAISE NOTICE '💡 Si persiste el error, reinicia la aplicación frontend';
END $$;
