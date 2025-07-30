-- Script simple para verificar correcciones de Supabase Linter
-- Ejecutar en el SQL Editor de Supabase después de aplicar las correcciones

-- =====================================================
-- 1. VERIFICAR RLS HABILITADO
-- =====================================================

SELECT 
    schemaname,
    tablename,
    rowsecurity,
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
-- 3. VERIFICAR VISTAS CREADAS
-- =====================================================

SELECT 
    schemaname,
    viewname,
    '✅ Vista creada' as status
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname IN ('recent_audit_logs', 'daily_audit_stats', 'user_permissions')
ORDER BY viewname;

-- =====================================================
-- 4. VERIFICAR ESTRUCTURA DE TABLAS
-- =====================================================

-- Verificar que las tablas existen
SELECT 
    table_schema,
    table_name,
    '✅ Tabla existe' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'payments', 'audit_logs')
ORDER BY table_name;

-- =====================================================
-- 5. VERIFICAR DATOS (SI EXISTEN)
-- =====================================================

-- Contar registros en cada tabla
SELECT 
    'profiles' as table_name,
    COUNT(*) as record_count
FROM public.profiles
UNION ALL
SELECT 
    'payments' as table_name,
    COUNT(*) as record_count
FROM public.payments
UNION ALL
SELECT 
    'audit_logs' as table_name,
    COUNT(*) as record_count
FROM public.audit_logs;

-- =====================================================
-- 6. RESUMEN DE VERIFICACIÓN
-- =====================================================

SELECT 
    'VERIFICACIÓN COMPLETADA' as mensaje,
    'Revisa los resultados anteriores para confirmar que:' as detalle,
    '1. RLS está habilitado en todas las tablas' as punto1,
    '2. Las políticas RLS están creadas' as punto2,
    '3. Las vistas están recreadas' as punto3,
    '4. No hay errores en la consola' as punto4; 