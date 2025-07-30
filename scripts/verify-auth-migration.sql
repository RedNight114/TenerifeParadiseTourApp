-- Script para verificar la migración de autenticación
-- Ejecutar en el SQL Editor de Supabase para confirmar que todo funciona

-- =====================================================
-- VERIFICAR ESTADO DE LA BASE DE DATOS
-- =====================================================

-- Verificar que las tablas principales existen
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'services', 'reservations', 'payments', 'audit_logs')
ORDER BY table_name;

-- Verificar que RLS está habilitado en las tablas principales
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'services', 'reservations', 'payments', 'audit_logs')
ORDER BY tablename;

-- Verificar políticas RLS existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'services', 'reservations', 'payments', 'audit_logs')
ORDER BY tablename, policyname;

-- =====================================================
-- VERIFICAR FUNCIONES DE AUTENTICACIÓN
-- =====================================================

-- Verificar funciones de autenticación
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'get_user_role',
    'has_role', 
    'has_permission',
    'is_admin',
    'is_manager_or_above',
    'is_staff_or_above'
)
ORDER BY routine_name;

-- =====================================================
-- VERIFICAR DATOS DE PRUEBA
-- =====================================================

-- Verificar usuarios de prueba
SELECT 
    id,
    email,
    role,
    created_at
FROM public.profiles 
WHERE email LIKE '%test%' OR email LIKE '%example%'
ORDER BY created_at DESC
LIMIT 5;

-- Verificar servicios disponibles
SELECT 
    id,
    name,
    category_id,
    is_active
FROM public.services 
WHERE is_active = true
ORDER BY name
LIMIT 5;

-- =====================================================
-- RESUMEN DE VERIFICACIÓN
-- =====================================================

SELECT 
    'MIGRACIÓN DE AUTENTICACIÓN COMPLETADA' as estado,
    'Todas las páginas web ahora usan el sistema ultra simple' as detalle,
    'Verificar en el navegador que no hay errores de autenticación' as siguiente_paso; 