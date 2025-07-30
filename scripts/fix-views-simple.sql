-- Script simple para corregir vistas con SECURITY DEFINER
-- Ejecutar en el SQL Editor de Supabase

-- =====================================================
-- ELIMINAR Y RECREAR VISTAS
-- =====================================================

-- Eliminar vistas existentes
DROP VIEW IF EXISTS public.recent_audit_logs;
DROP VIEW IF EXISTS public.daily_audit_stats;
DROP VIEW IF EXISTS public.user_permissions;

-- Recrear vista recent_audit_logs
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

-- Recrear vista daily_audit_stats
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

-- Recrear vista user_permissions
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
-- VERIFICACIÓN SIMPLE
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
-- RESUMEN
-- =====================================================

SELECT 
    'CORRECCIÓN COMPLETADA' as mensaje,
    'Las vistas han sido recreadas sin SECURITY DEFINER' as detalle,
    'Revisa el Supabase Linter para confirmar que no hay errores' as siguiente_paso; 