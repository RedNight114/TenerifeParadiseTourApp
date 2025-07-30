-- Script para alterar vistas y cambiar SECURITY DEFINER a SECURITY INVOKER
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
-- 2. ALTERAR VISTAS PARA CAMBIAR SECURITY
-- =====================================================

-- Cambiar recent_audit_logs a SECURITY INVOKER
ALTER VIEW public.recent_audit_logs SET (security_invoker = true);

-- Cambiar daily_audit_stats a SECURITY INVOKER
ALTER VIEW public.daily_audit_stats SET (security_invoker = true);

-- Cambiar user_permissions a SECURITY INVOKER
ALTER VIEW public.user_permissions SET (security_invoker = true);

-- =====================================================
-- 3. VERIFICAR CAMBIOS
-- =====================================================

-- Verificar que las vistas siguen existiendo
SELECT 
    schemaname,
    viewname,
    '✅ Vista alterada' as status
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
    'ALTERACIÓN COMPLETADA' as mensaje,
    'Las vistas han sido alteradas para usar SECURITY INVOKER' as detalle,
    'Revisa el Supabase Linter para confirmar que no hay errores' as siguiente_paso; 