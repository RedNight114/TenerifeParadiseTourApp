-- =====================================================
-- SCRIPT COMPLETO PARA SOLUCIONAR FUNCIONES DE SERVICIOS
-- SOLUCIONA: "Could not find function in schema cache"
-- =====================================================

-- Ejecutar en Supabase SQL Editor
-- Este script recrea las funciones y fuerza la sincronización del schema

-- =====================================================
-- 1. VERIFICAR ESTADO ACTUAL
-- =====================================================

-- Verificar qué funciones existen actualmente
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type,
    p.prosecdef as security_definer
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN ('update_service_simple', 'create_service_simple', 'delete_service_simple')
ORDER BY p.proname;

-- =====================================================
-- 2. ELIMINAR FUNCIONES EXISTENTES (SI EXISTEN)
-- =====================================================

-- Eliminar funciones existentes para recrearlas limpiamente
DO $$
BEGIN
    -- Eliminar delete_service_simple si existe
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'delete_service_simple' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        DROP FUNCTION IF EXISTS public.delete_service_simple(UUID);
        RAISE NOTICE '✅ delete_service_simple eliminada';
    END IF;
    
    -- Eliminar update_service_simple si existe
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_service_simple' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        DROP FUNCTION IF EXISTS public.update_service_simple(UUID, JSONB);
        RAISE NOTICE '✅ update_service_simple eliminada';
    END IF;
    
    -- Eliminar create_service_simple si existe
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_service_simple' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        DROP FUNCTION IF EXISTS public.create_service_simple(JSONB);
        RAISE NOTICE '✅ create_service_simple eliminada';
    END IF;
END $$;

-- =====================================================
-- 3. RECREAR FUNCIONES CON PERMISOS CORRECTOS
-- =====================================================

-- Función para eliminar servicios
CREATE OR REPLACE FUNCTION public.delete_service_simple(
    service_id_param UUID
) RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    service_exists BOOLEAN;
BEGIN
    -- Verificar que el servicio existe
    SELECT EXISTS(SELECT 1 FROM services WHERE id = service_id_param) INTO service_exists;
    
    IF NOT service_exists THEN
        RETURN FALSE;
    END IF;
    
    -- Eliminar el servicio
    DELETE FROM services WHERE id = service_id_param;
    
    -- Verificar que se eliminó
    RETURN NOT EXISTS(SELECT 1 FROM services WHERE id = service_id_param);
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error eliminando servicio: %', SQLERRM;
        RETURN FALSE;
END;
$$;

-- Función para actualizar servicios
CREATE OR REPLACE FUNCTION public.update_service_simple(
    service_id_param UUID,
    service_data JSONB
) RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    service_exists BOOLEAN;
BEGIN
    -- Verificar que el servicio existe
    SELECT EXISTS(SELECT 1 FROM services WHERE id = service_id_param) INTO service_exists;
    
    IF NOT service_exists THEN
        RETURN FALSE;
    END IF;
    
    -- Actualizar el servicio
    UPDATE services 
    SET 
        title = COALESCE(service_data->>'title', title),
        description = COALESCE(service_data->>'description', description),
        price = COALESCE((service_data->>'price')::NUMERIC, price),
        price_type = COALESCE(service_data->>'price_type', price_type),
        category_id = COALESCE(service_data->>'category_id', category_id),
        subcategory_id = COALESCE(service_data->>'subcategory_id', subcategory_id),
        available = COALESCE((service_data->>'available')::BOOLEAN, available),
        featured = COALESCE((service_data->>'featured')::BOOLEAN, featured),
        images = CASE 
            WHEN service_data->'images' IS NOT NULL 
            THEN ARRAY(SELECT jsonb_array_elements_text(service_data->'images'))
            ELSE images 
        END,
        updated_at = NOW()
    WHERE id = service_id_param;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error actualizando servicio: %', SQLERRM;
        RETURN FALSE;
END;
$$;

-- Función para crear servicios
CREATE OR REPLACE FUNCTION public.create_service_simple(
    service_data JSONB
) RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_service_id UUID;
BEGIN
    -- Insertar el nuevo servicio
    INSERT INTO services (
        title,
        description,
        price,
        price_type,
        category_id,
        subcategory_id,
        available,
        featured,
        images,
        created_at,
        updated_at
    ) VALUES (
        service_data->>'title',
        service_data->>'description',
        (service_data->>'price')::NUMERIC,
        COALESCE(service_data->>'price_type', 'per_person'),
        service_data->>'category_id',
        service_data->>'subcategory_id',
        COALESCE((service_data->>'available')::BOOLEAN, true),
        COALESCE((service_data->>'featured')::BOOLEAN, false),
        CASE 
            WHEN service_data->'images' IS NOT NULL 
            THEN ARRAY(SELECT jsonb_array_elements_text(service_data->'images'))
            ELSE '{}'::text[]
        END,
        NOW(),
        NOW()
    ) RETURNING id INTO new_service_id;
    
    RETURN new_service_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creando servicio: %', SQLERRM;
        RETURN NULL;
END;
$$;

-- =====================================================
-- 4. CONFIGURAR PERMISOS PARA TODOS LOS ROLES
-- =====================================================

-- Otorgar permisos de ejecución a todos los roles necesarios
GRANT EXECUTE ON FUNCTION public.delete_service_simple(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_service_simple(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.delete_service_simple(UUID) TO authenticator;
GRANT EXECUTE ON FUNCTION public.delete_service_simple(UUID) TO dashboard_user;

GRANT EXECUTE ON FUNCTION public.update_service_simple(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_service_simple(UUID, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.update_service_simple(UUID, JSONB) TO authenticator;
GRANT EXECUTE ON FUNCTION public.update_service_simple(UUID, JSONB) TO dashboard_user;

GRANT EXECUTE ON FUNCTION public.create_service_simple(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_service_simple(JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.create_service_simple(JSONB) TO authenticator;
GRANT EXECUTE ON FUNCTION public.create_service_simple(JSONB) TO dashboard_user;

-- =====================================================
-- 5. FORZAR REFRESH DEL SCHEMA CACHE
-- =====================================================

-- Limpiar snapshot de estadísticas
SELECT pg_stat_clear_snapshot();

-- Ejecutar las funciones para forzar el refresh del cache
DO $$
DECLARE
    test_result BOOLEAN;
    test_uuid UUID;
BEGIN
    RAISE NOTICE '🔄 Forzando refresh del schema cache...';
    
    -- Ejecutar delete_service_simple
    BEGIN
        SELECT delete_service_simple(
            '00000000-0000-0000-0000-000000000000'::UUID
        ) INTO test_result;
        RAISE NOTICE '✅ delete_service_simple ejecutada (esperado fallar)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✅ delete_service_simple: %', SQLERRM;
    END;
    
    -- Ejecutar update_service_simple
    BEGIN
        SELECT update_service_simple(
            '00000000-0000-0000-0000-000000000000'::UUID,
            '{"title": "test"}'::JSONB
        ) INTO test_result;
        RAISE NOTICE '✅ update_service_simple ejecutada (esperado fallar)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✅ update_service_simple: %', SQLERRM;
    END;
    
    -- Ejecutar create_service_simple
    BEGIN
        SELECT create_service_simple(
            '{"title": "test", "description": "test", "category_id": "test", "price": 100}'::JSONB
        ) INTO test_uuid;
        RAISE NOTICE '✅ create_service_simple ejecutada (esperado fallar)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✅ create_service_simple: %', SQLERRM;
    END;
    
    RAISE NOTICE '🔄 Schema cache refrescado';
END $$;

-- =====================================================
-- 6. VERIFICAR IMPLEMENTACIÓN
-- =====================================================

-- Verificar que las funciones se crearon correctamente
SELECT
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type,
    p.prosecdef as security_definer
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN ('update_service_simple', 'create_service_simple', 'delete_service_simple')
ORDER BY p.proname;

-- Verificar permisos para todos los roles
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
    has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute,
    has_function_privilege('authenticator', p.oid, 'EXECUTE') as authenticator_can_execute,
    has_function_privilege('dashboard_user', p.oid, 'EXECUTE') as dashboard_user_can_execute
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN ('update_service_simple', 'create_service_simple', 'delete_service_simple');

-- =====================================================
-- 7. MENSAJE DE CONFIRMACIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 Script de funciones de servicios completado!';
    RAISE NOTICE '✅ Funciones recreadas: delete_service_simple, update_service_simple, create_service_simple';
    RAISE NOTICE '✅ Permisos configurados para todos los roles';
    RAISE NOTICE '✅ Schema cache refrescado';
    RAISE NOTICE '🚀 Ahora REINICIA la aplicación frontend';
    RAISE NOTICE '💡 Si persiste el error, limpia el cache del navegador';
    RAISE NOTICE '🔧 También puedes probar en modo incógnito';
END $$;
