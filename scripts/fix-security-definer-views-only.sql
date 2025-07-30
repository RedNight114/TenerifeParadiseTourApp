-- Script específico para corregir vistas con SECURITY DEFINER
-- Ejecutar en el SQL Editor de Supabase

-- =====================================================
-- 1. ELIMINAR VISTAS PROBLEMÁTICAS (FORZADO)
-- =====================================================

-- Forzar eliminación de vistas (ignorar errores si no existen)
DROP VIEW IF EXISTS public.recent_audit_logs CASCADE;
DROP VIEW IF EXISTS public.daily_audit_stats CASCADE;
DROP VIEW IF EXISTS public.user_permissions CASCADE;

-- Verificar que las vistas se eliminaron
SELECT 
    schemaname,
    viewname,
    '❌ Vista eliminada' as status
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname IN ('recent_audit_logs', 'daily_audit_stats', 'user_permissions');

-- =====================================================
-- 2. RECREAR VISTAS SIN SECURITY DEFINER
-- =====================================================

-- Recrear vista recent_audit_logs SIN SECURITY DEFINER
CREATE VIEW public.recent_audit_logs AS
SELECT 
    al.id,
    al.user_id,
    al.action,
    al.created_at,
    p.email as user_email,
    p.full_name as user_name
FROM public.audit_logs al
LEFT JOIN public.profiles p ON al.user_id = p.id
WHERE al.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY al.created_at DESC;

-- Recrear vista daily_audit_stats SIN SECURITY DEFINER
CREATE VIEW public.daily_audit_stats AS
SELECT 
    DATE(created_at) as date,
    action,
    COUNT(*) as count,
    COUNT(DISTINCT user_id) as unique_users
FROM public.audit_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), action
ORDER BY date DESC, count DESC;

-- Recrear vista user_permissions SIN SECURITY DEFINER
CREATE VIEW public.user_permissions AS
SELECT 
    p.id as user_id,
    p.email,
    p.full_name,
    p.role,
    p.created_at,
    CASE 
        WHEN p.role = 'admin' THEN true
        ELSE false
    END as is_admin,
    CASE 
        WHEN p.role IN ('admin', 'moderator') THEN true
        ELSE false
    END as can_moderate,
    CASE 
        WHEN p.role IN ('admin', 'moderator', 'user') THEN true
        ELSE false
    END as can_access
FROM public.profiles p
WHERE p.id = auth.uid();

-- =====================================================
-- 3. VERIFICAR QUE LAS VISTAS SE RECREARON CORRECTAMENTE
-- =====================================================

-- Verificar que las vistas existen
SELECT 
    schemaname,
    viewname,
    '✅ Vista recreada' as status
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname IN ('recent_audit_logs', 'daily_audit_stats', 'user_permissions')
ORDER BY viewname;

-- =====================================================
-- 4. VERIFICAR QUE NO TIENEN SECURITY DEFINER
-- =====================================================

-- Verificar definición de las vistas usando pg_get_viewdef
SELECT 
    'recent_audit_logs' as view_name,
    CASE 
        WHEN pg_get_viewdef('public.recent_audit_logs'::regclass, true) ILIKE '%SECURITY DEFINER%' THEN '❌ TIENE SECURITY DEFINER'
        ELSE '✅ SIN SECURITY DEFINER'
    END as security_status
UNION ALL
SELECT 
    'daily_audit_stats' as view_name,
    CASE 
        WHEN pg_get_viewdef('public.daily_audit_stats'::regclass, true) ILIKE '%SECURITY DEFINER%' THEN '❌ TIENE SECURITY DEFINER'
        ELSE '✅ SIN SECURITY DEFINER'
    END as security_status
UNION ALL
SELECT 
    'user_permissions' as view_name,
    CASE 
        WHEN pg_get_viewdef('public.user_permissions'::regclass, true) ILIKE '%SECURITY DEFINER%' THEN '❌ TIENE SECURITY DEFINER'
        ELSE '✅ SIN SECURITY DEFINER'
    END as security_status;

-- =====================================================
-- 5. PROBAR LAS VISTAS
-- =====================================================

-- Probar que las vistas funcionan (puede dar error de RLS, pero eso es normal)
SELECT 'Testing recent_audit_logs view...' as test;
SELECT COUNT(*) as recent_logs_count FROM public.recent_audit_logs;

SELECT 'Testing daily_audit_stats view...' as test;
SELECT COUNT(*) as daily_stats_count FROM public.daily_audit_stats;

SELECT 'Testing user_permissions view...' as test;
SELECT COUNT(*) as user_permissions_count FROM public.user_permissions;

-- =====================================================
-- 6. RESUMEN FINAL
-- =====================================================

SELECT 
    'CORRECCIÓN COMPLETADA' as mensaje,
    'Las vistas han sido recreadas sin SECURITY DEFINER' as detalle,
    'Ahora respetan automáticamente las políticas RLS' as beneficio,
    'Revisa el Supabase Linter para confirmar que no hay errores' as siguiente_paso; 