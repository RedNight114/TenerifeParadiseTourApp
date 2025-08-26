-- Script para verificar la estructura de la tabla services
-- Ejecuta esto en Supabase SQL Editor

-- 1. Verificar estructura de la tabla services
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'services'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar si existen las funciones necesarias
SELECT 
    p.proname as function_name,
    p.proowner::regrole as owner,
    n.nspname as schema
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND (p.proname LIKE '%age%' OR p.proname LIKE '%service%')
ORDER BY p.proname;

-- 3. Verificar si existe el trigger
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%age%' OR trigger_name LIKE '%service%'
AND trigger_schema = 'public';

-- 4. Verificar datos de ejemplo en services
SELECT 
    id,
    name,
    price,
    duration,
    max_capacity,
    created_at
FROM services 
LIMIT 3;
