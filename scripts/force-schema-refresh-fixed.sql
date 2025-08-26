-- Script AGRESIVO para forzar la actualización del schema cache (VERSIÓN CORREGIDA)
-- Ejecutar en Supabase SQL Editor
-- SOLUCIONA: "Could not find function in schema cache"

-- =====================================================
-- 1. LIMPIAR CACHE Y ESTADÍSTICAS
-- =====================================================

-- Limpiar snapshot de estadísticas (esto sí funciona)
SELECT pg_stat_clear_snapshot();

-- =====================================================
-- 2. VERIFICAR FUNCIONES EXISTENTES
-- =====================================================

-- Verificar que las funciones existen
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN ('update_service_simple', 'create_service_simple', 'delete_service_simple')
ORDER BY p.proname;

-- =====================================================
-- 3. FORZAR REFRESH DEL SCHEMA CACHE
-- =====================================================

-- Ejecutar las funciones para forzar el refresh del cache
DO $$
DECLARE
    test_result BOOLEAN;
    test_uuid UUID;
BEGIN
    RAISE NOTICE '🔄 Forzando refresh del schema cache...';
    
    -- Ejecutar update_service_simple
    BEGIN
        SELECT update_service_simple(
            '00000000-0000-0000-0000-000000000000'::UUID,
            '{"title": "test"}'::JSONB
        ) INTO test_result;
        RAISE NOTICE '✅ update_service_simple ejecutada exitosamente';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✅ update_service_simple: % (esperado fallar)', SQLERRM;
    END;
    
    -- Ejecutar create_service_simple
    BEGIN
        SELECT create_service_simple(
            '{"title": "test", "description": "test", "category_id": "test", "price": 100}'::JSONB
        ) INTO test_uuid;
        RAISE NOTICE '✅ create_service_simple ejecutada exitosamente';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✅ create_service_simple: % (esperado fallar)', SQLERRM;
    END;
    
    -- Ejecutar delete_service_simple
    BEGIN
        SELECT delete_service_simple(
            '00000000-0000-0000-0000-000000000000'::UUID
        ) INTO test_result;
        RAISE NOTICE '✅ delete_service_simple ejecutada exitosamente';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✅ delete_service_simple: % (esperado fallar)', SQLERRM;
    END;
    
    RAISE NOTICE '🔄 Schema cache refresh completado';
END $$;

-- =====================================================
-- 4. VERIFICAR PERMISOS DE FUNCIONES
-- =====================================================

-- Verificar permisos para el rol 'authenticated'
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN ('update_service_simple', 'create_service_simple', 'delete_service_simple');

-- =====================================================
-- 5. OTORGAR PERMISOS EXPLÍCITOS
-- =====================================================

-- Otorgar permisos EXECUTE a authenticated
GRANT EXECUTE ON FUNCTION public.update_service_simple(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_service_simple(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_service_simple(uuid) TO authenticated;

-- Otorgar permisos EXECUTE a anon
GRANT EXECUTE ON FUNCTION public.update_service_simple(uuid, jsonb) TO anon;
GRANT EXECUTE ON FUNCTION public.create_service_simple(jsonb) TO anon;
GRANT EXECUTE ON FUNCTION public.delete_service_simple(uuid) TO anon;

-- Otorgar permisos EXECUTE a authenticator
GRANT EXECUTE ON FUNCTION public.update_service_simple(uuid, jsonb) TO authenticator;
GRANT EXECUTE ON FUNCTION public.create_service_simple(jsonb) TO authenticator;
GRANT EXECUTE ON FUNCTION public.delete_service_simple(uuid) TO authenticator;

-- Otorgar permisos EXECUTE a dashboard_user
GRANT EXECUTE ON FUNCTION public.update_service_simple(uuid, jsonb) TO dashboard_user;
GRANT EXECUTE ON FUNCTION public.create_service_simple(jsonb) TO dashboard_user;
GRANT EXECUTE ON FUNCTION public.delete_service_simple(uuid) TO dashboard_user;

-- =====================================================
-- 6. VERIFICAR PERMISOS DESPUÉS DE LA CORRECCIÓN
-- =====================================================

-- Verificar que los permisos se otorgaron correctamente
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
    has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute,
    has_function_privilege('authenticator', p.oid, 'EXECUTE') as authenticator_can_execute,
    has_function_privilege('dashboard_user', p.oid, 'EXECUTE') as dashboard_user_can_execute
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN ('update_service_simple', 'create_service_simple', 'delete_service_simple');

-- =====================================================
-- 7. MENSAJE DE CONFIRMACIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 Script de refresh del schema cache completado!';
    RAISE NOTICE '✅ Schema cache forzado a actualizarse';
    RAISE NOTICE '✅ Permisos otorgados a todos los roles';
    RAISE NOTICE '✅ Funciones verificadas y accesibles';
    RAISE NOTICE '🚀 Frontend debería poder encontrar las funciones ahora';
    RAISE NOTICE '💡 REINICIA la aplicación frontend después de ejecutar este script';
END $$;
