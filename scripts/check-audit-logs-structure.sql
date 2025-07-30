-- Script para verificar la estructura exacta de audit_logs
-- Ejecutar en el SQL Editor de Supabase

-- =====================================================
-- VERIFICAR ESTRUCTURA DE public.audit_logs
-- =====================================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'audit_logs'
ORDER BY ordinal_position;

-- =====================================================
-- VERIFICAR SI LA TABLA TIENE DATOS
-- =====================================================

SELECT 
    COUNT(*) as total_records
FROM public.audit_logs;

-- =====================================================
-- VERIFICAR UNA MUESTRA DE DATOS (si existen)
-- =====================================================

SELECT 
    *
FROM public.audit_logs
LIMIT 5;

-- =====================================================
-- VERIFICAR RESTRICCIONES DE LA TABLA
-- =====================================================

SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
    AND table_name = 'audit_logs';

-- =====================================================
-- VERIFICAR ÍNDICES
-- =====================================================

SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename = 'audit_logs'; 