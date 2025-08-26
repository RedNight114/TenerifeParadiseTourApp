-- Script para diagnosticar el error "Función no disponible en versión de debug"
-- Ejecuta esto en Supabase SQL Editor

-- 1. Verificar que la función existe y es accesible
SELECT 
    p.proname as function_name,
    p.proowner::regrole as owner,
    p.proacl as permissions,
    p.prosrc as source_code
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'upsert_service_age_ranges';

-- 2. Verificar permisos de la función
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.routine_privileges 
WHERE routine_name = 'upsert_service_age_ranges'
AND routine_schema = 'public';

-- 3. Verificar que el trigger existe y está activo
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement,
    action_orientation
FROM information_schema.triggers 
WHERE trigger_name = 'update_service_age_ranges_trigger'
AND trigger_schema = 'public';

-- 4. Verificar la estructura de la tabla age_price_ranges
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'age_price_ranges'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Verificar las políticas RLS
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
WHERE tablename = 'age_price_ranges';

-- 6. Verificar que el usuario autenticado puede ejecutar la función
-- (Esto se ejecuta como el usuario autenticado)
SELECT current_user, session_user;

-- 7. Probar una llamada simple a la función para ver el error exacto
-- (Comenta esta línea si causa problemas)
-- SELECT upsert_service_age_ranges(1, '[{"min_age": 0, "max_age": 12, "price": 25.00, "price_type": "child"}]'::jsonb);
