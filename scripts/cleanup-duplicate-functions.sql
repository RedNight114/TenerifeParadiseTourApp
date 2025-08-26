-- =====================================================
-- SCRIPT DE LIMPIEZA COMPLETA DE FUNCIONES DUPLICADAS
-- SOLUCIONA: Funciones con search_path inconsistente
-- =====================================================

-- Ejecutar en Supabase SQL Editor
-- Este script elimina TODAS las funciones y las recrea limpiamente

-- =====================================================
-- 1. ELIMINACIÓN COMPLETA Y AGRESIVA DE TODAS LAS FUNCIONES
-- =====================================================

DO $$
DECLARE
    func_record RECORD;
BEGIN
    RAISE NOTICE '🧹 Iniciando limpieza completa de funciones...';
    
    -- Eliminar TODAS las funciones del esquema public
    FOR func_record IN 
        SELECT p.proname, p.oid, pg_get_function_identity_arguments(p.oid) as args
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
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS public.%I(%s) CASCADE', 
                      func_record.proname, 
                      COALESCE(func_record.args, ''));
        RAISE NOTICE '🗑️ Eliminada función: %(%)', func_record.proname, COALESCE(func_record.args, '');
    END LOOP;
    
    RAISE NOTICE '✅ Todas las funciones eliminadas completamente';
END $$;

-- =====================================================
-- 2. VERIFICAR QUE NO QUEDEN FUNCIONES
-- =====================================================

SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    '❌ FUNCIÓN RESIDUAL - ELIMINAR MANUALMENTE' as status
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
ORDER BY p.proname;

-- =====================================================
-- 3. MENSAJE DE CONFIRMACIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎯 LIMPIEZA COMPLETADA!';
    RAISE NOTICE '✅ Todas las funciones duplicadas han sido eliminadas';
    RAISE NOTICE '🚀 Ahora ejecuta el script fix-all-security-warnings-fixed.sql para recrear las funciones correctamente';
    RAISE NOTICE '💡 Esto asegurará que todas las funciones tengan search_path configurado correctamente';
END $$;
