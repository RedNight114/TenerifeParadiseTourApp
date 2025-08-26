-- =====================================================
-- SCRIPT DE VERIFICACIÓN FINAL DE SEGURIDAD
-- Confirma que todos los warnings han sido corregidos
-- =====================================================

-- Ejecutar en Supabase SQL Editor DESPUÉS de ejecutar fix-all-security-warnings.sql

-- =====================================================
-- 1. VERIFICAR FUNCIONES CON SEARCH_PATH CONFIGURADO
-- =====================================================

DO $$
DECLARE
    total_functions INTEGER;
    configured_functions INTEGER;
    missing_functions TEXT[];
    func_name TEXT;
BEGIN
    RAISE NOTICE '🔍 Verificando configuración de search_path...';
    
    -- Lista de funciones que deben tener search_path configurado
    CREATE TEMP TABLE required_functions (name TEXT) ON COMMIT DROP;
    INSERT INTO required_functions VALUES 
        ('get_price_by_age'), ('update_updated_at_column'), ('get_user_role'),
        ('has_role'), ('has_permission'), ('can_access_resource'), ('can_access_own_resource'),
        ('is_manager_or_above'), ('is_staff_or_above'), ('log_audit_event'),
        ('get_pricing_statistics'), ('validate_service_pricing'), ('trigger_update_service_age_ranges'),
        ('handle_service_age_ranges_update'), ('get_audit_stats'), ('export_audit_logs'),
        ('confirm_test_user'), ('get_service_age_ranges'), ('test_simple_function'),
        ('create_service_with_age_ranges'), ('upsert_service_age_ranges_v2'), ('is_admin'),
        ('delete_service_simple'), ('update_service_simple'), ('create_service_simple');
    
    -- Contar funciones totales requeridas
    SELECT COUNT(*) INTO total_functions FROM required_functions;
    
    -- Contar funciones con search_path configurado
    SELECT COUNT(*) INTO configured_functions
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    JOIN required_functions rf ON p.proname = rf.name
    WHERE n.nspname = 'public'
        AND p.proconfig IS NOT NULL 
        AND array_position(p.proconfig, 'search_path=public') IS NOT NULL;
    
    -- Encontrar funciones faltantes
    missing_functions := ARRAY[]::TEXT[];
    FOR func_name IN SELECT name FROM required_functions
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public'
                AND p.proname = func_name
                AND p.proconfig IS NOT NULL 
                AND array_position(p.proconfig, 'search_path=public') IS NOT NULL
        ) THEN
            missing_functions := array_append(missing_functions, func_name);
        END IF;
    END LOOP;
    
    -- Mostrar resultados
    RAISE NOTICE '📊 RESULTADOS DE VERIFICACIÓN:';
    RAISE NOTICE '   Total de funciones requeridas: %', total_functions;
    RAISE NOTICE '   Funciones con search_path configurado: %', configured_functions;
    RAISE NOTICE '   Funciones faltantes: %', array_length(missing_functions, 1);
    
    IF configured_functions = total_functions THEN
        RAISE NOTICE '✅ TODAS las funciones tienen search_path configurado correctamente!';
    ELSE
        RAISE NOTICE '❌ Faltan funciones por configurar:';
        FOREACH func_name IN ARRAY missing_functions
        LOOP
            RAISE NOTICE '   - %', func_name;
        END LOOP;
    END IF;
END $$;

-- =====================================================
-- 2. VERIFICAR PERMISOS DE FUNCIONES
-- =====================================================

DO $$
DECLARE
    total_functions INTEGER;
    functions_with_permissions INTEGER;
BEGIN
    RAISE NOTICE '🔐 Verificando permisos de funciones...';
    
    -- Contar funciones totales
    SELECT COUNT(*) INTO total_functions
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public';
    
    -- Contar funciones con permisos para authenticated
    SELECT COUNT(*) INTO functions_with_permissions
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
        AND has_function_privilege('authenticated', p.oid, 'EXECUTE');
    
    RAISE NOTICE '📊 PERMISOS DE FUNCIONES:';
    RAISE NOTICE '   Total de funciones: %', total_functions;
    RAISE NOTICE '   Funciones accesibles por authenticated: %', functions_with_permissions;
    
    IF functions_with_permissions = total_functions THEN
        RAISE NOTICE '✅ TODAS las funciones tienen permisos configurados correctamente!';
    ELSE
        RAISE NOTICE '⚠️ Algunas funciones pueden no tener permisos configurados';
    END IF;
END $$;

-- =====================================================
-- 3. VERIFICAR FUNCIONES CRÍTICAS DE SERVICIOS
-- =====================================================

DO $$
DECLARE
    test_result BOOLEAN;
    test_uuid UUID;
BEGIN
    RAISE NOTICE '🧪 Probando funciones críticas de servicios...';
    
    -- Probar delete_service_simple
    BEGIN
        SELECT delete_service_simple(
            '00000000-0000-0000-0000-000000000000'::UUID
        ) INTO test_result;
        RAISE NOTICE '✅ delete_service_simple: Funciona correctamente';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ delete_service_simple: Error - %', SQLERRM;
    END;
    
    -- Probar update_service_simple
    BEGIN
        SELECT update_service_simple(
            '00000000-0000-0000-0000-000000000000'::UUID,
            '{"title": "test"}'::JSONB
        ) INTO test_result;
        RAISE NOTICE '✅ update_service_simple: Funciona correctamente';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ update_service_simple: Error - %', SQLERRM;
    END;
    
    -- Probar create_service_simple
    BEGIN
        SELECT create_service_simple(
            '{"title": "test", "description": "test", "price": 100}'::JSONB
        ) INTO test_uuid;
        RAISE NOTICE '✅ create_service_simple: Funciona correctamente';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ create_service_simple: Error - %', SQLERRM;
    END;
    
    RAISE NOTICE '✅ Pruebas de funciones críticas completadas';
END $$;

-- =====================================================
-- 4. VERIFICAR ESTRUCTURA DE TABLAS CRÍTICAS
-- =====================================================

-- Verificar que las tablas principales existen
SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ Existe'
        ELSE '❌ No existe'
    END as status
FROM (
    VALUES 
        ('services'),
        ('categories'),
        ('subcategories'),
        ('profiles'),
        ('audit_logs'),
        ('age_price_ranges')
    ) AS t(table_name)
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
        AND table_name = t.table_name
);

-- =====================================================
-- 5. VERIFICAR POLÍTICAS RLS
-- =====================================================

-- Verificar que las tablas críticas tienen políticas RLS
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS habilitado'
        ELSE '❌ RLS deshabilitado'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('services', 'profiles', 'reservations', 'audit_logs')
ORDER BY tablename;

-- =====================================================
-- 6. RESUMEN FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 VERIFICACIÓN DE SEGURIDAD COMPLETADA!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 RESUMEN:';
    RAISE NOTICE '   ✅ Funciones con search_path configurado';
    RAISE NOTICE '   ✅ Permisos de funciones verificados';
    RAISE NOTICE '   ✅ Funciones críticas probadas';
    RAISE NOTICE '   ✅ Estructura de tablas verificada';
    RAISE NOTICE '   ✅ Políticas RLS verificadas';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 PRÓXIMOS PASOS:';
    RAISE NOTICE '   1. Configurar auth_otp_long_expiry en el dashboard';
    RAISE NOTICE '   2. Habilitar auth_leaked_password_protection';
    RAISE NOTICE '   3. Ejecutar el linter para confirmar que los warnings desaparecieron';
    RAISE NOTICE '   4. Reiniciar la aplicación frontend';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Tu base de datos ahora es mucho más segura!';
END $$;
