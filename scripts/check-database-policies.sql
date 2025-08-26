-- =====================================================
-- SCRIPT DE VERIFICACIÓN: POLÍTICAS DE BASE DE DATOS
-- Verifica las políticas RLS que pueden estar causando problemas
-- =====================================================

-- 1. VERIFICAR ESTADO DE RLS EN TABLAS PRINCIPALES
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('services', 'categories', 'subcategories', 'profiles', 'reservations')
ORDER BY tablename;

-- 2. VERIFICAR POLÍTICAS EXISTENTES EN LA TABLA SERVICES
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
WHERE schemaname = 'public' 
    AND tablename = 'services'
ORDER BY policyname;

-- 3. VERIFICAR POLÍTICAS EXISTENTES EN LA TABLA CATEGORIES
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
WHERE schemaname = 'public' 
    AND tablename = 'categories'
ORDER BY policyname;

-- 4. VERIFICAR POLÍTICAS EXISTENTES EN LA TABLA SUBCATEGORIES
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
WHERE schemaname = 'public' 
    AND tablename = 'subcategories'
ORDER BY policyname;

-- 5. VERIFICAR PERMISOS DE USUARIOS ANÓNIMOS
SELECT 
    grantee,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE grantee = 'anon' 
    AND table_schema = 'public'
    AND table_name IN ('services', 'categories', 'subcategories')
ORDER BY table_name, privilege_type;

-- 6. VERIFICAR PERMISOS DE USUARIOS AUTENTICADOS
SELECT 
    grantee,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE grantee = 'authenticated' 
    AND table_schema = 'public'
    AND table_name IN ('services', 'categories', 'subcategories')
ORDER BY table_name, privilege_type;

-- 7. VERIFICAR FUNCIONES Y SUS PERMISOS
SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    p.prosecdef as security_definer,
    p.proconfig as search_path_config,
    CASE 
        WHEN p.proconfig IS NOT NULL AND array_position(p.proconfig, 'search_path=public') IS NOT NULL 
        THEN '✅ Configurado' 
        ELSE '❌ NO configurado' 
    END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN (
        'get_services_simple',
        'get_categories_simple', 
        'get_subcategories_simple',
        'get_service_by_id',
        'get_user_role',
        'log_audit_event'
    )
ORDER BY p.proname, pg_get_function_identity_arguments(p.oid);

-- 8. VERIFICAR PERMISOS DE EJECUCIÓN EN FUNCIONES
SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    r.rolname as role_name,
    has_function_privilege(r.oid, p.oid, 'EXECUTE') as can_execute
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
CROSS JOIN pg_roles r
WHERE n.nspname = 'public'
    AND r.rolname IN ('anon', 'authenticated', 'authenticator')
    AND p.proname IN (
        'get_services_simple',
        'get_categories_simple',
        'get_subcategories_simple',
        'get_service_by_id',
        'get_user_role',
        'log_audit_event'
    )
ORDER BY p.proname, r.rolname;

-- 9. VERIFICAR CONFIGURACIÓN DE BÚSQUEDA GLOBAL
SHOW search_path;

-- 10. VERIFICAR CONFIGURACIÓN DE ROLES
SELECT 
    rolname,
    rolsuper,
    rolinherit,
    rolcreaterole,
    rolcreatedb,
    rolcanlogin,
    rolreplication
FROM pg_roles 
WHERE rolname IN ('anon', 'authenticated', 'authenticator', 'service_role')
ORDER BY rolname;

-- 11. VERIFICAR CONEXIONES ACTIVAS
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    state_change
FROM pg_stat_activity 
WHERE datname = current_database()
    AND state = 'active'
ORDER BY query_start;

-- 12. RESUMEN DE VERIFICACIÓN
DO $$
DECLARE
    rls_count INTEGER;
    policy_count INTEGER;
    function_count INTEGER;
    permission_count INTEGER;
BEGIN
    -- Contar RLS habilitado
    SELECT COUNT(*) INTO rls_count
    FROM pg_tables 
    WHERE schemaname = 'public' 
        AND tablename IN ('services', 'categories', 'subcategories')
        AND rowsecurity = true;
    
    -- Contar políticas
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
        AND tablename IN ('services', 'categories', 'subcategories');
    
    -- Contar funciones
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
        AND p.proname IN (
            'get_services_simple',
            'get_categories_simple',
            'get_subcategories_simple',
            'get_service_by_id',
            'get_user_role',
            'log_audit_event'
        );
    
    -- Contar permisos
    SELECT COUNT(*) INTO permission_count
    FROM information_schema.role_table_grants 
    WHERE grantee IN ('anon', 'authenticated')
        AND table_schema = 'public'
        AND table_name IN ('services', 'categories', 'subcategories')
        AND privilege_type = 'SELECT';
    
    RAISE NOTICE '📊 RESUMEN DE VERIFICACIÓN DE POLÍTICAS:';
    RAISE NOTICE '   Tablas con RLS habilitado: %', rls_count;
    RAISE NOTICE '   Políticas configuradas: %', policy_count;
    RAISE NOTICE '   Funciones disponibles: %', function_count;
    RAISE NOTICE '   Permisos SELECT otorgados: %', permission_count;
    
    -- Análisis de problemas
    IF rls_count = 0 THEN
        RAISE NOTICE '⚠️ PROBLEMA: RLS no está habilitado en las tablas principales';
    END IF;
    
    IF policy_count = 0 THEN
        RAISE NOTICE '⚠️ PROBLEMA: No hay políticas configuradas';
    END IF;
    
    IF function_count = 0 THEN
        RAISE NOTICE '⚠️ PROBLEMA: Las funciones no están disponibles';
    END IF;
    
    IF permission_count = 0 THEN
        RAISE NOTICE '⚠️ PROBLEMA: No hay permisos SELECT otorgados';
    END IF;
    
    IF rls_count > 0 AND policy_count = 0 THEN
        RAISE NOTICE '🚨 PROBLEMA CRÍTICO: RLS habilitado pero sin políticas = acceso bloqueado';
    END IF;
    
    RAISE NOTICE '✅ Verificación completada. Revisa los resultados arriba.';
END $$;




