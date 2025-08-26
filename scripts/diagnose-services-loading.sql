-- =====================================================
-- SCRIPT DE DIAGNÓSTICO: CARGA DE SERVICIOS
-- Verifica por qué no se están mostrando los servicios
-- =====================================================

-- =====================================================
-- 1. VERIFICAR EXISTENCIA DE SERVICIOS
-- =====================================================

SELECT 
    COUNT(*) as total_services,
    COUNT(CASE WHEN available = true THEN 1 END) as available_services,
    COUNT(CASE WHEN featured = true THEN 1 END) as featured_services
FROM services;

-- =====================================================
-- 2. VERIFICAR ESTRUCTURA DE LA TABLA SERVICES
-- =====================================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'services' 
ORDER BY ordinal_position;

-- =====================================================
-- 3. VERIFICAR PERMISOS RLS
-- =====================================================

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
WHERE tablename = 'services';

-- =====================================================
-- 4. VERIFICAR FUNCIONES DE SERVICIOS
-- =====================================================

SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    CASE
        WHEN p.proconfig IS NOT NULL AND array_position(p.proconfig, 'search_path=public') IS NOT NULL
        THEN '✅ Configurado'
        ELSE '❌ NO configurado'
    END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN ('get_services', 'get_services_simple', 'get_featured_services')
ORDER BY p.proname;

-- =====================================================
-- 5. VERIFICAR CONEXIÓN DE CATEGORÍAS
-- =====================================================

SELECT 
    s.id,
    s.title,
    s.available,
    s.featured,
    c.name as category_name,
    sc.name as subcategory_name
FROM services s
LEFT JOIN categories c ON s.category_id = c.id
LEFT JOIN subcategories sc ON s.subcategory_id = sc.id
LIMIT 10;

-- =====================================================
-- 6. VERIFICAR POLÍTICAS DE ACCESO
-- =====================================================

-- Verificar si el usuario anon puede acceder a services
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'services';

-- =====================================================
-- 7. VERIFICAR CONFIGURACIÓN DE AUTENTICACIÓN
-- =====================================================

-- Verificar configuración de auth
SELECT 
    name,
    value
FROM auth.config
WHERE name IN ('enable_signup', 'enable_confirmations', 'enable_manual_linking');

-- =====================================================
-- 8. VERIFICAR LOGS RECIENTES
-- =====================================================

-- Verificar si hay errores recientes en la base de datos
SELECT 
    log_time,
    log_level,
    log_message
FROM pg_stat_statements 
WHERE query LIKE '%services%'
ORDER BY calls DESC
LIMIT 10;

-- =====================================================
-- 9. VERIFICAR ESTADO DE LA CONEXIÓN
-- =====================================================

-- Verificar conexiones activas
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    query
FROM pg_stat_activity 
WHERE state = 'active'
    AND query NOT LIKE '%pg_stat_activity%';

-- =====================================================
-- 10. MENSAJE DE DIAGNÓSTICO
-- =====================================================

DO $$
DECLARE
    service_count INTEGER;
    available_count INTEGER;
    featured_count INTEGER;
BEGIN
    -- Contar servicios
    SELECT COUNT(*) INTO service_count FROM services;
    SELECT COUNT(*) INTO available_count FROM services WHERE available = true;
    SELECT COUNT(*) INTO featured_count FROM services WHERE featured = true;
    
    RAISE NOTICE '🔍 DIAGNÓSTICO DE SERVICIOS:';
    RAISE NOTICE '📊 Total de servicios: %', service_count;
    RAISE NOTICE '✅ Servicios disponibles: %', available_count;
    RAISE NOTICE '⭐ Servicios destacados: %', featured_count;
    
    IF service_count = 0 THEN
        RAISE NOTICE '❌ PROBLEMA: No hay servicios en la base de datos';
        RAISE NOTICE '💡 SOLUCIÓN: Ejecuta el script de seed de servicios';
    ELSIF available_count = 0 THEN
        RAISE NOTICE '❌ PROBLEMA: Todos los servicios están desactivados';
        RAISE NOTICE '💡 SOLUCIÓN: Activa algunos servicios';
    ELSIF featured_count = 0 THEN
        RAISE NOTICE '⚠️ ADVERTENCIA: No hay servicios destacados';
        RAISE NOTICE '💡 SOLUCIÓN: Marca algunos servicios como destacados';
    ELSE
        RAISE NOTICE '✅ Los servicios están disponibles en la base de datos';
        RAISE NOTICE '💡 El problema puede estar en el frontend o la conexión';
    END IF;
END $$;




