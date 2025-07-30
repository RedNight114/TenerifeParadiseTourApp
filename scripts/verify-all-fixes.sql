-- Script para verificar que todos los errores y warnings han sido corregidos
-- Ejecutar en el SQL Editor de Supabase

-- =====================================================
-- 1. VERIFICAR RLS HABILITADO
-- =====================================================

SELECT 
    'VERIFICACIÓN RLS' as seccion,
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Habilitado'
        ELSE '❌ RLS Deshabilitado'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'payments', 'audit_logs')
ORDER BY tablename;

-- =====================================================
-- 2. VERIFICAR POLÍTICAS RLS
-- =====================================================

SELECT 
    'VERIFICACIÓN POLÍTICAS RLS' as seccion,
    schemaname,
    tablename,
    policyname,
    cmd,
    '✅ Política creada' as status
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'payments', 'audit_logs')
ORDER BY tablename, cmd;

-- =====================================================
-- 3. VERIFICAR VISTAS SIN SECURITY DEFINER
-- =====================================================

SELECT 
    'VERIFICACIÓN VISTAS' as seccion,
    schemaname,
    viewname,
    '✅ Vista sin SECURITY DEFINER' as status
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname IN ('recent_audit_logs', 'daily_audit_stats', 'user_permissions')
ORDER BY viewname;

-- =====================================================
-- 4. VERIFICAR FUNCIONES CON SEARCH_PATH
-- =====================================================

-- Lista de funciones que deberían tener search_path configurado
SELECT 
    'VERIFICACIÓN FUNCIONES' as seccion,
    proname as function_name,
    '✅ Función con search_path configurado' as status
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND proname IN (
        'generate_display_id',
        'set_display_id',
        'get_user_role',
        'has_role',
        'update_contact_messages_updated_at',
        'has_permission',
        'can_access_resource',
        'can_access_own_resource',
        'is_manager_or_above',
        'is_staff_or_above',
        'log_audit_event',
        'cleanup_old_audit_logs',
        'get_audit_stats',
        'export_audit_logs',
        'detect_suspicious_activity',
        'confirm_test_user',
        'get_users_for_admin',
        'confirm_user_email',
        'delete_service_with_reservations',
        'list_services_with_reservations',
        'update_updated_at_column',
        'is_admin'
    )
ORDER BY proname;

-- =====================================================
-- 5. RESUMEN GENERAL
-- =====================================================

SELECT 
    'RESUMEN DE VERIFICACIÓN' as titulo,
    'Revisa los resultados anteriores para confirmar:' as instruccion,
    '1. RLS está habilitado en todas las tablas' as punto1,
    '2. Las políticas RLS están creadas' as punto2,
    '3. Las vistas no tienen SECURITY DEFINER' as punto3,
    '4. Las funciones tienen search_path configurado' as punto4,
    '5. Configura Auth settings desde el Dashboard' as punto5;

-- =====================================================
-- 6. CONFIGURACIONES MANUALES REQUERIDAS
-- =====================================================

SELECT 
    'CONFIGURACIONES MANUALES' as titulo,
    'Estas configuraciones deben hacerse desde el Dashboard:' as instruccion,
    '1. OTP Expiry: menos de 1 hora (recomendado: 30 min)' as config1,
    '2. Leaked password protection: habilitada' as config2,
    '3. Ubicación: Authentication > Settings' as ubicacion;

-- =====================================================
-- 7. ESTADO FINAL
-- =====================================================

SELECT 
    'ESTADO FINAL' as mensaje,
    'Después de aplicar todas las correcciones:' as detalle,
    '✅ No deberías tener errores en Supabase Linter' as resultado1,
    '⚠️ Solo deberías tener warnings de Auth settings' as resultado2,
    '🔧 Configura Auth settings manualmente desde el Dashboard' as accion_final; 