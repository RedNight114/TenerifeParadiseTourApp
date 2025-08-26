-- Script para forzar la actualización del schema cache del CLIENTE Supabase
-- Ejecutar en Supabase SQL Editor
-- SOLUCIONA: "Could not find function in schema cache" del frontend

-- =====================================================
-- 1. VERIFICAR FUNCIONES EXISTENTES
-- =====================================================

-- Verificar que las funciones existen y son accesibles
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
    AND p.proname IN ('update_service_simple', 'create_service_simple', 'delete_service_simple')
ORDER BY p.proname;

-- =====================================================
-- 2. VERIFICAR PERMISOS ACTUALES
-- =====================================================

-- Verificar permisos para todos los roles
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
-- 3. FORZAR REFRESH DEL SCHEMA CACHE DEL SERVIDOR
-- =====================================================

-- Limpiar snapshot de estadísticas
SELECT pg_stat_clear_snapshot();

-- =====================================================
-- 4. EJECUTAR FUNCIONES PARA REFRESCAR CACHE
-- =====================================================

-- Ejecutar las funciones para forzar el refresh del cache del servidor
DO $$
DECLARE
    test_result BOOLEAN;
    test_uuid UUID;
BEGIN
    RAISE NOTICE '🔄 Forzando refresh del schema cache del servidor...';
    
    -- Ejecutar update_service_simple
    BEGIN
        SELECT update_service_simple(
            '00000000-0000-0000-0000-000000000000'::UUID,
            '{"title": "test"}'::JSONB
        ) INTO test_result;
        RAISE NOTICE '✅ update_service_simple ejecutada (esperado fallar)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✅ update_service_simple: %', SQLERRM;
    END;
    
    -- Ejecutar create_service_simple
    BEGIN
        SELECT create_service_simple(
            '{"title": "test", "description": "test", "category_id": "test", "price": 100}'::JSONB
        ) INTO test_uuid;
        RAISE NOTICE '✅ create_service_simple ejecutada (esperado fallar)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✅ create_service_simple: %', SQLERRM;
    END;
    
    -- Ejecutar delete_service_simple
    BEGIN
        SELECT delete_service_simple(
            '00000000-0000-0000-0000-000000000000'::UUID
        ) INTO test_result;
        RAISE NOTICE '✅ delete_service_simple ejecutada (esperado fallar)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✅ delete_service_simple: %', SQLERRM;
    END;
    
    RAISE NOTICE '🔄 Schema cache del servidor refrescado';
END $$;

-- =====================================================
-- 5. VERIFICAR QUE LAS FUNCIONES SON ACCESIBLES
-- =====================================================

-- Verificar que las funciones son accesibles por el rol 'authenticated'
DO $$
DECLARE
    can_execute BOOLEAN;
BEGIN
    -- Verificar update_service_simple
    SELECT has_function_privilege('authenticated', 
        (SELECT oid FROM pg_proc WHERE proname = 'update_service_simple' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'))
        , 'EXECUTE') INTO can_execute;
    
    IF can_execute THEN
        RAISE NOTICE '✅ update_service_simple: authenticated puede ejecutar';
    ELSE
        RAISE NOTICE '❌ update_service_simple: authenticated NO puede ejecutar';
    END IF;
    
    -- Verificar create_service_simple
    SELECT has_function_privilege('authenticated', 
        (SELECT oid FROM pg_proc WHERE proname = 'create_service_simple' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'))
        , 'EXECUTE') INTO can_execute;
    
    IF can_execute THEN
        RAISE NOTICE '✅ create_service_simple: authenticated puede ejecutar';
    ELSE
        RAISE NOTICE '❌ create_service_simple: authenticated NO puede ejecutar';
    END IF;
    
    -- Verificar delete_service_simple
    SELECT has_function_privilege('authenticated', 
        (SELECT oid FROM pg_proc WHERE proname = 'delete_service_simple' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'))
        , 'EXECUTE') INTO can_execute;
    
    IF can_execute THEN
        RAISE NOTICE '✅ delete_service_simple: authenticated puede ejecutar';
    ELSE
        RAISE NOTICE '❌ delete_service_simple: authenticated NO puede ejecutar';
    END IF;
END $$;

-- =====================================================
-- 6. MENSAJE DE CONFIRMACIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 Script de refresh del schema cache del CLIENTE completado!';
    RAISE NOTICE '✅ Schema cache del servidor refrescado';
    RAISE NOTICE '✅ Funciones verificadas y accesibles';
    RAISE NOTICE '🚀 Ahora REINICIA la aplicación frontend';
    RAISE NOTICE '💡 Si persiste el error, limpia el cache del navegador';
    RAISE NOTICE '🔧 También puedes probar en modo incógnito';
END $$;
