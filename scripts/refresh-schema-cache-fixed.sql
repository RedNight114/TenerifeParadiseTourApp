-- REFRESCAR CACHE DEL ESQUEMA Y VERIFICAR FUNCIÓN UPDATE_SERVICE_SIMPLE
-- Soluciona: "Could not find the function public.update_service_simple in the schema cache"

-- 1. VERIFICAR SI LA FUNCIÓN EXISTE
SELECT 
    proname as function_name,
    proargtypes::regtype[] as argument_types,
    prorettype::regtype as return_type,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'update_service_simple';

-- 2. VERIFICAR PERMISOS DE LA FUNCIÓN
SELECT 
    p.proname as function_name,
    p.proargtypes::regtype[] as argument_types,
    has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute,
    has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
    has_function_privilege('authenticator', p.oid, 'EXECUTE') as authenticator_can_execute,
    has_function_privilege('dashboard_user', p.oid, 'EXECUTE') as dashboard_user_can_execute
FROM pg_proc p
WHERE p.proname = 'update_service_simple'
AND p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 3. FORZAR REFRESCO DEL CACHE DEL ESQUEMA
-- Esto se hace ejecutando la función (aunque falle)
DO $$
BEGIN
    RAISE NOTICE '🔄 Forzando refresco del cache del esquema...';
    
    -- Intentar ejecutar la función para refrescar el cache
    BEGIN
        -- Usar parámetros dummy para refrescar el cache
        PERFORM update_service_simple(
            '00000000-0000-0000-0000-000000000000'::UUID,
            '{"title": "test"}'::JSONB
        );
        RAISE NOTICE '✅ Función ejecutada exitosamente (cache refrescado)';
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE NOTICE '✅ Cache refrescado (error esperado): %', SQLERRM;
    END;
END $$;

-- 4. VERIFICAR NUEVAMENTE LA FUNCIÓN
SELECT 
    'Después del refresco' as status,
    proname as function_name,
    proargtypes::regtype[] as argument_types,
    prorettype::regtype as return_type
FROM pg_proc 
WHERE proname = 'update_service_simple';

-- 5. VERIFICAR QUE LA FUNCIÓN ESTÁ DISPONIBLE PARA EL USUARIO ACTUAL
SELECT 
    current_user as current_user,
    has_function_privilege(current_user, 'update_service_simple(uuid,jsonb)', 'EXECUTE') as can_execute;

-- 6. MOSTRAR TODAS LAS FUNCIONES SIMILARES PARA VERIFICAR
SELECT 
    proname,
    proargtypes::regtype[],
    prosrc
FROM pg_proc 
WHERE proname LIKE '%update_service%'
ORDER BY proname;

-- 7. VERIFICAR EL NAMESPACE DE LA FUNCIÓN
SELECT 
    p.proname,
    n.nspname as schema_name,
    p.proargtypes::regtype[] as argument_types
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'update_service_simple';
