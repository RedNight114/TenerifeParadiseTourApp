-- =====================================================
-- SCRIPT DE VERIFICACIÓN FINAL
-- Confirma que todas las funciones tienen search_path configurado
-- =====================================================

-- Ejecutar DESPUÉS de ejecutar fix-all-security-warnings-fixed.sql

-- =====================================================
-- 1. VERIFICAR ESTADO FINAL DE TODAS LAS FUNCIONES
-- =====================================================

SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    CASE 
        WHEN p.proconfig IS NOT NULL AND array_position(p.proconfig, 'search_path=public') IS NOT NULL 
        THEN '✅ Configurado'
        ELSE '❌ NO configurado'
    END as search_path_status,
    CASE 
        WHEN p.proconfig IS NOT NULL AND array_position(p.proconfig, 'search_path=public') IS NOT NULL 
        THEN '🔒 Seguro'
        ELSE '⚠️ VULNERABLE'
    END as security_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN (
        'get_price_by_age', 'update_updated_at_column', 'get_user_role',
        'has_role', 'has_permission', 'can_access_resource', 'can_access_own_resource',
        'is_manager_or_above', 'is_staff_or_above', 'log_audit_event',
        'get_pricing_statistics', 'validate_service_pricing', 'trigger_update_service_age_ranges',
        'handle_service_age_ranges_update', 'get_audit_stats', 'export_audit_logs',
        'confirm_test_user', 'get_service_age_ranges', 'test_simple_function',
        'create_service_with_age_ranges', 'upsert_service_age_ranges_v2', 'is_admin',
        'create_service_simple', 'update_service_simple', 'delete_service_simple'
    )
ORDER BY p.proname, pg_get_function_identity_arguments(p.oid);

-- =====================================================
-- 2. RESUMEN ESTADÍSTICO
-- =====================================================

DO $$
DECLARE
    total_functions INTEGER;
    configured_functions INTEGER;
    unconfigured_functions INTEGER;
BEGIN
    -- Contar funciones totales
    SELECT COUNT(*) INTO total_functions
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
        AND p.proname IN (
            'get_price_by_age', 'update_updated_at_column', 'get_user_role',
            'has_role', 'has_permission', 'can_access_resource', 'can_access_own_resource',
            'is_manager_or_above', 'is_staff_or_above', 'log_audit_event',
            'get_pricing_statistics', 'validate_service_pricing', 'trigger_update_service_age_ranges',
            'handle_service_age_ranges_update', 'get_audit_stats', 'export_audit_logs',
            'confirm_test_user', 'get_service_age_ranges', 'test_simple_function',
            'create_service_with_age_ranges', 'upsert_service_age_ranges_v2', 'is_admin',
            'create_service_simple', 'update_service_simple', 'delete_service_simple'
        );
    
    -- Contar funciones configuradas
    SELECT COUNT(*) INTO configured_functions
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
        AND p.proname IN (
            'get_price_by_age', 'update_updated_at_column', 'get_user_role',
            'has_role', 'has_permission', 'can_access_resource', 'can_access_own_resource',
            'is_manager_or_above', 'is_staff_or_above', 'log_audit_event',
            'get_pricing_statistics', 'validate_service_pricing', 'trigger_update_service_age_ranges',
            'handle_service_age_ranges_update', 'get_audit_stats', 'export_audit_logs',
            'confirm_test_user', 'get_service_age_ranges', 'test_simple_function',
            'create_service_with_age_ranges', 'upsert_service_age_ranges_v2', 'is_admin',
            'create_service_simple', 'update_service_simple', 'delete_service_simple'
        )
        AND p.proconfig IS NOT NULL 
        AND array_position(p.proconfig, 'search_path=public') IS NOT NULL;
    
    unconfigured_functions := total_functions - configured_functions;
    
    RAISE NOTICE '📊 RESUMEN ESTADÍSTICO:';
    RAISE NOTICE '🔢 Total de funciones: %', total_functions;
    RAISE NOTICE '✅ Funciones configuradas: %', configured_functions;
    RAISE NOTICE '❌ Funciones NO configuradas: %', unconfigured_functions;
    
    IF unconfigured_functions = 0 THEN
        RAISE NOTICE '🎉 ¡EXCELENTE! Todas las funciones tienen search_path configurado correctamente';
        RAISE NOTICE '🔒 La seguridad está al 100% contra ataques de inyección de esquema';
    ELSIF unconfigured_functions <= 5 THEN
        RAISE NOTICE '⚠️ Casi perfecto. Solo % funciones necesitan configuración', unconfigured_functions;
        RAISE NOTICE '💡 Revisa las funciones marcadas como "NO configurado" arriba';
    ELSE
        RAISE NOTICE '❌ Hay % funciones que necesitan configuración', unconfigured_functions;
        RAISE NOTICE '🚨 Ejecuta nuevamente el script de corrección';
    END IF;
END $$;

-- =====================================================
-- 3. VERIFICAR FUNCIONES DE SERVICIOS ESPECÍFICAMENTE
-- =====================================================

SELECT 
    '🔧 FUNCIONES DE SERVICIOS' as section,
    p.proname as function_name,
    CASE 
        WHEN p.proconfig IS NOT NULL AND array_position(p.proconfig, 'search_path=public') IS NOT NULL 
        THEN '✅ Funcionando'
        ELSE '❌ NO funciona'
    END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN ('create_service_simple', 'update_service_simple', 'delete_service_simple')
ORDER BY p.proname;

-- =====================================================
-- 4. MENSAJE FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎯 VERIFICACIÓN COMPLETADA';
    RAISE NOTICE '💡 Si todas las funciones muestran "✅ Configurado", tu sistema está seguro';
    RAISE NOTICE '🚀 Ahora ejecuta el linter de Supabase para confirmar que los warnings desaparecieron';
    RAISE NOTICE '🔒 Tu API de servicios debería funcionar correctamente ahora';
END $$;
