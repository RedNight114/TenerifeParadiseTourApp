-- Script para verificar el estado actual de las políticas RLS
-- Ejecutar en el SQL Editor de Supabase para diagnosticar

-- =====================================================
-- VERIFICAR POLÍTICAS EXISTENTES
-- =====================================================

-- Verificar políticas en audit_logs
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'audit_logs'
ORDER BY policyname;

-- Verificar políticas en payments
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'payments'
ORDER BY policyname;

-- Verificar políticas en profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- =====================================================
-- RESUMEN DE POLÍTICAS POR TABLA
-- =====================================================

SELECT 
    tablename,
    COUNT(*) as total_policies,
    STRING_AGG(policyname, ', ') as policy_names
FROM pg_policies 
WHERE tablename IN ('audit_logs', 'payments', 'profiles')
GROUP BY tablename
ORDER BY tablename; 