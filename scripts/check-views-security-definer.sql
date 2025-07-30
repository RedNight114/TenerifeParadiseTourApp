-- Script para verificar el estado de las vistas y SECURITY DEFINER
-- Ejecutar en el SQL Editor de Supabase

-- =====================================================
-- 1. VERIFICAR SI LAS VISTAS EXISTEN
-- =====================================================

SELECT 
    schemaname,
    viewname,
    '✅ Vista existe' as status
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname IN ('recent_audit_logs', 'daily_audit_stats', 'user_permissions')
ORDER BY viewname;

-- =====================================================
-- 2. VERIFICAR DEFINICIÓN COMPLETA DE LAS VISTAS
-- =====================================================

-- Usar pg_get_viewdef para obtener la definición
SELECT 
    'recent_audit_logs' as view_name,
    pg_get_viewdef('public.recent_audit_logs'::regclass, true) as view_definition
UNION ALL
SELECT 
    'daily_audit_stats' as view_name,
    pg_get_viewdef('public.daily_audit_stats'::regclass, true) as view_definition
UNION ALL
SELECT 
    'user_permissions' as view_name,
    pg_get_viewdef('public.user_permissions'::regclass, true) as view_definition;

-- =====================================================
-- 3. BUSCAR SECURITY DEFINER EN LA DEFINICIÓN
-- =====================================================

SELECT 
    'recent_audit_logs' as view_name,
    CASE 
        WHEN pg_get_viewdef('public.recent_audit_logs'::regclass, true) ILIKE '%SECURITY DEFINER%' THEN '❌ TIENE SECURITY DEFINER'
        WHEN pg_get_viewdef('public.recent_audit_logs'::regclass, true) ILIKE '%SECURITY INVOKER%' THEN '✅ TIENE SECURITY INVOKER'
        ELSE '⚠️ NO ESPECIFICA SECURITY (por defecto es INVOKER)'
    END as security_status,
    CASE 
        WHEN pg_get_viewdef('public.recent_audit_logs'::regclass, true) ILIKE '%SECURITY DEFINER%' THEN 'PROBLEMA: Necesita ser recreada'
        ELSE 'OK: Respeta RLS automáticamente'
    END as recomendacion
UNION ALL
SELECT 
    'daily_audit_stats' as view_name,
    CASE 
        WHEN pg_get_viewdef('public.daily_audit_stats'::regclass, true) ILIKE '%SECURITY DEFINER%' THEN '❌ TIENE SECURITY DEFINER'
        WHEN pg_get_viewdef('public.daily_audit_stats'::regclass, true) ILIKE '%SECURITY INVOKER%' THEN '✅ TIENE SECURITY INVOKER'
        ELSE '⚠️ NO ESPECIFICA SECURITY (por defecto es INVOKER)'
    END as security_status,
    CASE 
        WHEN pg_get_viewdef('public.daily_audit_stats'::regclass, true) ILIKE '%SECURITY DEFINER%' THEN 'PROBLEMA: Necesita ser recreada'
        ELSE 'OK: Respeta RLS automáticamente'
    END as recomendacion
UNION ALL
SELECT 
    'user_permissions' as view_name,
    CASE 
        WHEN pg_get_viewdef('public.user_permissions'::regclass, true) ILIKE '%SECURITY DEFINER%' THEN '❌ TIENE SECURITY DEFINER'
        WHEN pg_get_viewdef('public.user_permissions'::regclass, true) ILIKE '%SECURITY INVOKER%' THEN '✅ TIENE SECURITY INVOKER'
        ELSE '⚠️ NO ESPECIFICA SECURITY (por defecto es INVOKER)'
    END as security_status,
    CASE 
        WHEN pg_get_viewdef('public.user_permissions'::regclass, true) ILIKE '%SECURITY DEFINER%' THEN 'PROBLEMA: Necesita ser recreada'
        ELSE 'OK: Respeta RLS automáticamente'
    END as recomendacion;

-- =====================================================
-- 4. VERIFICAR DEPENDENCIAS DE LAS VISTAS
-- =====================================================

SELECT 
    dependent_ns.nspname as dependent_schema,
    dependent_view.relname as dependent_view,
    source_ns.nspname as source_schema,
    source_table.relname as source_table
FROM pg_depend 
JOIN pg_rewrite ON pg_depend.objid = pg_rewrite.oid 
JOIN pg_class as dependent_view ON pg_rewrite.ev_class = dependent_view.oid 
JOIN pg_class as source_table ON pg_depend.refobjid = source_table.oid 
JOIN pg_namespace dependent_ns ON dependent_view.relnamespace = dependent_ns.oid 
JOIN pg_namespace source_ns ON source_table.relnamespace = source_ns.oid 
WHERE dependent_ns.nspname = 'public' 
    AND dependent_view.relname IN ('recent_audit_logs', 'daily_audit_stats', 'user_permissions')
    AND source_ns.nspname = 'public'
ORDER BY dependent_view.relname, source_table.relname;

-- =====================================================
-- 5. RESUMEN DEL ESTADO ACTUAL
-- =====================================================

SELECT 
    'ESTADO ACTUAL DE LAS VISTAS' as titulo,
    COUNT(*) as total_vistas,
    COUNT(CASE WHEN pg_get_viewdef(viewname::regclass, true) ILIKE '%SECURITY DEFINER%' THEN 1 END) as vistas_con_security_definer,
    COUNT(CASE WHEN pg_get_viewdef(viewname::regclass, true) NOT ILIKE '%SECURITY DEFINER%' THEN 1 END) as vistas_sin_security_definer
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname IN ('recent_audit_logs', 'daily_audit_stats', 'user_permissions');

-- =====================================================
-- 6. RECOMENDACIONES
-- =====================================================

SELECT 
    CASE 
        WHEN COUNT(CASE WHEN pg_get_viewdef(viewname::regclass, true) ILIKE '%SECURITY DEFINER%' THEN 1 END) > 0 
        THEN '❌ PROBLEMA: Algunas vistas tienen SECURITY DEFINER'
        ELSE '✅ OK: Todas las vistas respetan RLS'
    END as estado_general,
    CASE 
        WHEN COUNT(CASE WHEN pg_get_viewdef(viewname::regclass, true) ILIKE '%SECURITY DEFINER%' THEN 1 END) > 0 
        THEN 'Ejecuta el script fix-security-definer-views-only.sql'
        ELSE 'No se requieren acciones adicionales'
    END as accion_recomendada
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname IN ('recent_audit_logs', 'daily_audit_stats', 'user_permissions'); 