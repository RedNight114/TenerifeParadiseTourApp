-- Script para reemplazar vistas sin SECURITY DEFINER
-- Ejecutar en el SQL Editor de Supabase

-- =====================================================
-- 1. VERIFICAR ESTADO ACTUAL
-- =====================================================

SELECT 
    schemaname,
    viewname,
    'Estado actual' as status
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname IN ('recent_audit_logs', 'daily_audit_stats', 'user_permissions')
ORDER BY viewname;

-- =====================================================
-- 2. REEMPLAZAR VISTAS SIN SECURITY DEFINER
-- =====================================================

-- Reemplazar vista recent_audit_logs
CREATE OR REPLACE VIEW public.recent_audit_logs AS
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

-- Reemplazar vista daily_audit_stats
CREATE OR REPLACE VIEW public.daily_audit_stats AS
SELECT 
    DATE(created_at) as date,
    action,
    COUNT(*) as count,
    COUNT(DISTINCT user_id) as unique_users
FROM public.audit_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), action
ORDER BY date DESC, count DESC;

-- Reemplazar vista user_permissions
CREATE OR REPLACE VIEW public.user_permissions AS
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
-- 3. VERIFICAR RECREACIÓN
-- =====================================================

SELECT 
    schemaname,
    viewname,
    '✅ Vista reemplazada' as status
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname IN ('recent_audit_logs', 'daily_audit_stats', 'user_permissions')
ORDER BY viewname;

-- =====================================================
-- 4. PROBAR LAS VISTAS
-- =====================================================

-- Probar que las vistas funcionan
SELECT 'Testing recent_audit_logs view...' as test;
SELECT COUNT(*) as recent_logs_count FROM public.recent_audit_logs;

SELECT 'Testing daily_audit_stats view...' as test;
SELECT COUNT(*) as daily_stats_count FROM public.daily_audit_stats;

SELECT 'Testing user_permissions view...' as test;
SELECT COUNT(*) as user_permissions_count FROM public.user_permissions;

-- =====================================================
-- 5. RESUMEN
-- =====================================================

SELECT 
    'REEMPLAZO COMPLETADO' as mensaje,
    'Las vistas han sido reemplazadas sin SECURITY DEFINER' as detalle,
    'Revisa el Supabase Linter para confirmar que no hay errores' as siguiente_paso; 