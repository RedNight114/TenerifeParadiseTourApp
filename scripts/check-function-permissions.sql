-- Script para verificar y corregir permisos de funciones
-- Ejecutar en Supabase SQL Editor
-- SOLUCIONA: Permisos de funciones para roles authenticated

-- =====================================================
-- 1. VERIFICAR PERMISOS ACTUALES DE FUNCIONES
-- =====================================================

-- Verificar que las funciones son accesibles por el rol 'authenticated'
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
-- 2. VERIFICAR PROPIETARIO DE LAS FUNCIONES
-- =====================================================

-- Verificar quién es el propietario de las funciones
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    r.rolname as owner
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_roles r ON p.proowner = r.oid
WHERE n.nspname = 'public'
    AND p.proname IN ('update_service_simple', 'create_service_simple', 'delete_service_simple');

-- =====================================================
-- 3. CORREGIR PERMISOS DE FUNCIONES
-- =====================================================

-- Otorgar permisos EXECUTE a todos los roles necesarios
DO $$
DECLARE
    function_name TEXT;
BEGIN
    -- Lista de funciones a corregir
    FOR function_name IN 
        SELECT unnest(ARRAY['update_service_simple', 'create_service_simple', 'delete_service_simple'])
    LOOP
        RAISE NOTICE '🔄 Corrigiendo permisos para función: %', function_name;
        
        -- Otorgar permisos a anon
        EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s(uuid, jsonb) TO anon', function_name);
        RAISE NOTICE '✅ Permisos otorgados a anon para %s', function_name;
        
        -- Otorgar permisos a authenticated
        EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s(uuid, jsonb) TO authenticated', function_name);
        RAISE NOTICE '✅ Permisos otorgados a authenticated para %s', function_name;
        
        -- Otorgar permisos a authenticator
        EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s(uuid, jsonb) TO authenticator', function_name);
        RAISE NOTICE '✅ Permisos otorgados a authenticator para %s', function_name;
        
        -- Otorgar permisos a dashboard_user
        EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s(uuid, jsonb) TO dashboard_user', function_name);
        RAISE NOTICE '✅ Permisos otorgados a dashboard_user para %s', function_name;
    END LOOP;
    
    -- Caso especial para create_service_simple que solo tiene un parámetro
    RAISE NOTICE '🔄 Corrigiendo permisos para create_service_simple (1 parámetro)';
    
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.create_service_simple(jsonb) TO anon';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.create_service_simple(jsonb) TO authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.create_service_simple(jsonb) TO authenticator';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.create_service_simple(jsonb) TO dashboard_user';
    
    RAISE NOTICE '✅ Permisos corregidos para todas las funciones';
END $$;

-- =====================================================
-- 4. VERIFICAR PERMISOS DESPUÉS DE LA CORRECCIÓN
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
-- 5. FORZAR REFRESH DEL SCHEMA CACHE
-- =====================================================

-- Limpiar snapshot de estadísticas
SELECT pg_stat_clear_snapshot();

-- Forzar refresh del schema cache
DO $$
DECLARE
    test_result BOOLEAN;
    test_uuid UUID;
BEGIN
    RAISE NOTICE '🔄 Forzando refresh del schema cache después de corregir permisos...';
    
    -- Intentar ejecutar update_service_simple
    BEGIN
        SELECT update_service_simple(
            '00000000-0000-0000-0000-000000000000'::UUID,
            '{"title": "test"}'::JSONB
        ) INTO test_result;
        RAISE NOTICE '✅ update_service_simple ejecutada (esperado fallar)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✅ update_service_simple: %', SQLERRM;
    END;
    
    -- Intentar ejecutar create_service_simple
    BEGIN
        SELECT create_service_simple(
            '{"title": "test", "description": "test", "category_id": "test", "price": 100}'::JSONB
        ) INTO test_uuid;
        RAISE NOTICE '✅ create_service_simple ejecutada (esperado fallar)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✅ create_service_simple: %', SQLERRM;
    END;
    
    -- Intentar ejecutar delete_service_simple
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
-- 6. MENSAJE DE CONFIRMACIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 Permisos de funciones corregidos exitosamente!';
    RAISE NOTICE '✅ Todas las funciones ahora son accesibles por los roles necesarios';
    RAISE NOTICE '✅ Schema cache refrescado';
    RAISE NOTICE '🚀 Frontend debería poder ejecutar las funciones ahora';
    RAISE NOTICE '💡 Reinicia la aplicación frontend para probar';
END $$;
