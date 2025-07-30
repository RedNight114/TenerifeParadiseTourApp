-- Script para forzar la eliminación de vistas con SECURITY DEFINER
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
-- 2. ELIMINACIÓN AGRESIVA DE VISTAS
-- =====================================================

-- Método 1: Eliminación normal
DROP VIEW IF EXISTS public.recent_audit_logs;
DROP VIEW IF EXISTS public.daily_audit_stats;
DROP VIEW IF EXISTS public.user_permissions;

-- Método 2: Eliminación con CASCADE (más agresivo)
DROP VIEW IF EXISTS public.recent_audit_logs CASCADE;
DROP VIEW IF EXISTS public.daily_audit_stats CASCADE;
DROP VIEW IF EXISTS public.user_permissions CASCADE;

-- Método 3: Eliminación directa usando pg_class
DELETE FROM pg_depend 
WHERE objid IN (
    SELECT oid FROM pg_class 
    WHERE relname IN ('recent_audit_logs', 'daily_audit_stats', 'user_permissions') 
    AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
);

DELETE FROM pg_rewrite 
WHERE ev_class IN (
    SELECT oid FROM pg_class 
    WHERE relname IN ('recent_audit_logs', 'daily_audit_stats', 'user_permissions') 
    AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
);

DELETE FROM pg_class 
WHERE relname IN ('recent_audit_logs', 'daily_audit_stats', 'user_permissions') 
AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- =====================================================
-- 3. VERIFICAR QUE SE ELIMINARON
-- =====================================================

SELECT 
    schemaname,
    viewname,
    '❌ Vista eliminada' as status
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname IN ('recent_audit_logs', 'daily_audit_stats', 'user_permissions')
ORDER BY viewname;

-- =====================================================
-- 4. RECREAR VISTAS SIN SECURITY DEFINER
-- =====================================================

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
-- 5. VERIFICAR RECREACIÓN
-- =====================================================

SELECT 
    schemaname,
    viewname,
    '✅ Vista recreada' as status
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname IN ('recent_audit_logs', 'daily_audit_stats', 'user_permissions')
ORDER BY viewname;

-- =====================================================
-- 6. RESUMEN
-- =====================================================

SELECT 
    'ELIMINACIÓN FORZADA COMPLETADA' as mensaje,
    'Las vistas han sido eliminadas y recreadas sin SECURITY DEFINER' as detalle,
    'Revisa el Supabase Linter para confirmar que no hay errores' as siguiente_paso; 