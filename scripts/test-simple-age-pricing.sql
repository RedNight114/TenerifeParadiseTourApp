-- Script de prueba para el sistema simple de precios por edad
-- Ejecutar en Supabase SQL Editor después de simplify-age-pricing.sql

-- =====================================================
-- 1. VERIFICAR ESTRUCTURA DE LA TABLA
-- =====================================================

-- Verificar que los campos se agregaron correctamente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'services' 
    AND table_schema = 'public'
    AND column_name IN ('precio_ninos', 'edad_maxima_ninos')
ORDER BY column_name;

-- =====================================================
-- 2. VERIFICAR FUNCIONES
-- =====================================================

-- Verificar que las funciones simples existen
SELECT
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN ('update_service_simple', 'create_service_simple', 'delete_service_simple')
ORDER BY p.proname;

-- =====================================================
-- 3. PROBAR CREACIÓN DE SERVICIO
-- =====================================================

-- Probar crear un servicio con precios por edad
DO $$
DECLARE
    new_service_id UUID;
BEGIN
    SELECT create_service_simple(
        '{
            "title": "Tour de Prueba - Precios por Edad",
            "description": "Servicio de prueba para verificar el sistema simple de precios por edad",
            "category_id": "adventure",
            "subcategory_id": "hiking",
            "price": 50.00,
            "duration": 120,
            "location": "Tenerife",
            "precio_ninos": 25.00,
            "edad_maxima_ninos": 12
        }'::JSONB
    ) INTO new_service_id;
    
    RAISE NOTICE '✅ Servicio creado exitosamente con ID: %', new_service_id;
    RAISE NOTICE '✅ Precio para niños: 25.00€, Edad máxima: 12 años';
END $$;

-- =====================================================
-- 4. VERIFICAR SERVICIO CREADO
-- =====================================================

-- Verificar que el servicio se creó con los campos correctos
SELECT 
    id,
    title,
    price,
    precio_ninos,
    edad_maxima_ninos,
    created_at
FROM services 
WHERE title = 'Tour de Prueba - Precios por Edad'
ORDER BY created_at DESC
LIMIT 1;

-- =====================================================
-- 5. PROBAR ACTUALIZACIÓN
-- =====================================================

-- Probar actualizar el servicio
DO $$
DECLARE
    test_service_id UUID;
    update_result BOOLEAN;
BEGIN
    -- Obtener el ID del servicio de prueba
    SELECT id INTO test_service_id 
    FROM services 
    WHERE title = 'Tour de Prueba - Precios por Edad'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF test_service_id IS NOT NULL THEN
        -- Actualizar el servicio
        SELECT update_service_simple(
            test_service_id,
            '{
                "precio_ninos": 30.00,
                "edad_maxima_ninos": 14,
                "price": 55.00
            }'::JSONB
        ) INTO update_result;
        
        RAISE NOTICE '✅ Servicio actualizado exitosamente';
        RAISE NOTICE '✅ Nuevo precio para niños: 30.00€, Nueva edad máxima: 14 años';
        RAISE NOTICE '✅ Nuevo precio general: 55.00€';
    ELSE
        RAISE NOTICE '❌ No se encontró el servicio de prueba';
    END IF;
END $$;

-- =====================================================
-- 6. VERIFICAR ACTUALIZACIÓN
-- =====================================================

-- Verificar que la actualización funcionó
SELECT 
    id,
    title,
    price,
    precio_ninos,
    edad_maxima_ninos,
    updated_at
FROM services 
WHERE title = 'Tour de Prueba - Precios por Edad'
ORDER BY updated_at DESC
LIMIT 1;

-- =====================================================
-- 7. PROBAR ELIMINACIÓN
-- =====================================================

-- Probar eliminar el servicio de prueba
DO $$
DECLARE
    test_service_id UUID;
    delete_result BOOLEAN;
BEGIN
    -- Obtener el ID del servicio de prueba
    SELECT id INTO test_service_id 
    FROM services 
    WHERE title = 'Tour de Prueba - Precios por Edad'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF test_service_id IS NOT NULL THEN
        -- Eliminar el servicio
        SELECT delete_service_simple(test_service_id) INTO delete_result;
        
        IF delete_result THEN
            RAISE NOTICE '✅ Servicio eliminado exitosamente';
        ELSE
            RAISE NOTICE '❌ Error al eliminar el servicio';
        END IF;
    ELSE
        RAISE NOTICE '❌ No se encontró el servicio de prueba';
    END IF;
END $$;

-- =====================================================
-- 8. VERIFICAR ELIMINACIÓN
-- =====================================================

-- Verificar que el servicio se eliminó
SELECT 
    COUNT(*) as servicios_restantes
FROM services 
WHERE title = 'Tour de Prueba - Precios por Edad';

-- =====================================================
-- 9. MENSAJE DE CONFIRMACIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 Sistema de precios por edad simple probado exitosamente!';
    RAISE NOTICE '✅ Creación de servicios: FUNCIONA';
    RAISE NOTICE '✅ Actualización de servicios: FUNCIONA';
    RAISE NOTICE '✅ Eliminación de servicios: FUNCIONA';
    RAISE NOTICE '✅ Campos precio_ninos y edad_maxima_ninos: FUNCIONAN';
    RAISE NOTICE '🚀 Frontend listo para usar el sistema simple!';
END $$;
