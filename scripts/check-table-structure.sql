-- Script para verificar la estructura real de las tablas
-- Ejecutar en el SQL Editor de Supabase antes de aplicar las correcciones

-- =====================================================
-- 1. VERIFICAR ESTRUCTURA DE public.profiles
-- =====================================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'profiles'
ORDER BY ordinal_position;

-- =====================================================
-- 2. VERIFICAR ESTRUCTURA DE public.payments
-- =====================================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'payments'
ORDER BY ordinal_position;

-- =====================================================
-- 3. VERIFICAR ESTRUCTURA DE public.audit_logs
-- =====================================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'audit_logs'
ORDER BY ordinal_position;

-- =====================================================
-- 4. VERIFICAR ESTADO ACTUAL DE RLS
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
    AND tablename IN ('profiles', 'payments', 'audit_logs');

-- =====================================================
-- 5. VERIFICAR POLÍTICAS EXISTENTES
-- =====================================================

SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'payments', 'audit_logs')
ORDER BY tablename, cmd;

-- =====================================================
-- 6. VERIFICAR VISTAS EXISTENTES
-- =====================================================

SELECT 
    schemaname,
    viewname,
    security_invoker,
    CASE 
        WHEN security_invoker THEN '✅ Respeta RLS'
        ELSE '❌ SECURITY DEFINER'
    END as status
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname IN ('recent_audit_logs', 'daily_audit_stats', 'user_permissions');

-- =====================================================
-- 7. VERIFICAR DATOS EXISTENTES
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
-- 8. VERIFICAR USUARIOS AUTENTICADOS
-- =====================================================

-- Verificar si hay usuarios en auth.users
SELECT 
    COUNT(*) as total_users
FROM auth.users;

-- Verificar si hay perfiles sin usuarios correspondientes
SELECT 
    COUNT(*) as orphaned_profiles
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL; 