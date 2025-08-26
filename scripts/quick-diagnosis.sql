-- DIAGNÓSTICO RÁPIDO - VERIFICAR ESTADO ACTUAL
-- Ejecuta este script primero para ver qué está pasando

-- 1. VERIFICAR SI LA FUNCIÓN EXISTE
SELECT 
    'ESTADO ACTUAL:' as status,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ FUNCIÓN EXISTE'
        ELSE '❌ FUNCIÓN NO EXISTE'
    END as function_status,
    COUNT(*) as function_count
FROM pg_proc 
WHERE proname = 'update_service_simple'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 2. MOSTRAR DETALLES DE LA FUNCIÓN SI EXISTE
SELECT 
    'DETALLES FUNCIÓN:' as status,
    proname as function_name,
    proargtypes::regtype[] as argument_types,
    prorettype::regtype as return_type,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'update_service_simple'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 3. VERIFICAR PERMISOS
SELECT 
    'PERMISOS:' as status,
    p.proname as function_name,
    has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute,
    has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
    has_function_privilege('authenticator', p.oid, 'EXECUTE') as authenticator_can_execute,
    has_function_privilege('dashboard_user', p.oid, 'EXECUTE') as dashboard_user_can_execute
FROM pg_proc p
WHERE p.proname = 'update_service_simple'
AND p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 4. VERIFICAR ESTRUCTURA DE LA TABLA SERVICES
SELECT 
    'ESTRUCTURA TABLA:' as status,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'services' 
AND table_schema = 'public'
AND column_name IN ('id', 'title', 'category_id', 'subcategory_id', 'price')
ORDER BY ordinal_position;

-- 5. VERIFICAR USUARIO ACTUAL Y PERMISOS
SELECT 
    'USUARIO ACTUAL:' as status,
    current_user as current_user,
    current_database() as current_database,
    current_schema as current_schema;

-- 6. VERIFICAR NAMESPACE PUBLIC
SELECT 
    'NAMESPACE PUBLIC:' as status,
    nspname as schema_name,
    nspowner::regrole as owner
FROM pg_namespace 
WHERE nspname = 'public';

-- 7. MENSAJE DE DIAGNÓSTICO
DO $$
BEGIN
    RAISE NOTICE '🔍 DIAGNÓSTICO COMPLETADO';
    RAISE NOTICE '📋 Revisa los resultados arriba para identificar el problema';
    RAISE NOTICE '⚠️  Si la función no existe, ejecuta el script verify-and-create-function.sql';
    RAISE NOTICE '⚠️  Si la función existe pero no funciona, verifica los permisos';
END $$;
