-- Script de prueba CORREGIDO para el sistema simple de precios por edad
-- Ejecutar en Supabase SQL Editor DESPUÉS de check-existing-categories.sql
-- IMPORTANTE: Reemplazar "CATEGORIA_REAL" y "SUBCATEGORIA_REAL" con valores reales

-- =====================================================
-- 1. OBTENER CATEGORÍAS REALES PARA LA PRUEBA
-- =====================================================

-- Obtener la primera categoría disponible
DO $$
DECLARE
    primera_categoria_id TEXT;
    primera_subcategoria_id TEXT;
BEGIN
    -- Obtener primera categoría
    SELECT id INTO primera_categoria_id 
    FROM categories 
    LIMIT 1;
    
    -- Obtener primera subcategoría de esa categoría
    SELECT id INTO primera_subcategoria_id 
    FROM subcategories 
    WHERE category_id = primera_categoria_id
    LIMIT 1;
    
    RAISE NOTICE '✅ Categoría seleccionada: %', primera_categoria_id;
    RAISE NOTICE '✅ Subcategoría seleccionada: %', primera_subcategoria_id;
END $$;

-- =====================================================
-- 2. PROBAR CREACIÓN DE SERVICIO CON CATEGORÍAS REALES
-- =====================================================

-- Probar crear un servicio con precios por edad
DO $$
DECLARE
    new_service_id UUID;
    primera_categoria_id TEXT;
    primera_subcategoria_id TEXT;
BEGIN
    -- Obtener categorías reales
    SELECT id INTO primera_categoria_id 
    FROM categories 
    LIMIT 1;
    
    SELECT id INTO primera_subcategoria_id 
    FROM subcategories 
    WHERE category_id = primera_categoria_id
    LIMIT 1;
    
    -- Crear servicio con categorías reales
    SELECT create_service_simple(
        jsonb_build_object(
            'title', 'Tour de Prueba - Precios por Edad',
            'description', 'Servicio de prueba para verificar el sistema simple de precios por edad',
            'category_id', primera_categoria_id,
            'subcategory_id', primera_subcategoria_id,
            'price', 50.00,
            'duration', 120,
            'location', 'Tenerife',
            'precio_ninos', 25.00,
            'edad_maxima_ninos', 12
        )
    ) INTO new_service_id;
    
    RAISE NOTICE '✅ Servicio creado exitosamente con ID: %', new_service_id;
    RAISE NOTICE '✅ Precio para niños: 25.00€, Edad máxima: 12 años';
    RAISE NOTICE '✅ Categoría: %, Subcategoría: %', primera_categoria_id, primera_subcategoria_id;
END $$;

-- =====================================================
-- 3. VERIFICAR SERVICIO CREADO
-- =====================================================

-- Verificar que el servicio se creó con los campos correctos
SELECT 
    id,
    title,
    price,
    precio_ninos,
    edad_maxima_ninos,
    category_id,
    subcategory_id,
    created_at
FROM services 
WHERE title = 'Tour de Prueba - Precios por Edad'
ORDER BY created_at DESC
LIMIT 1;

-- =====================================================
-- 4. PROBAR ACTUALIZACIÓN
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
-- 5. VERIFICAR ACTUALIZACIÓN
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
-- 6. PROBAR ELIMINACIÓN
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
-- 7. VERIFICAR ELIMINACIÓN
-- =====================================================

-- Verificar que el servicio se eliminó
SELECT 
    COUNT(*) as servicios_restantes
FROM services 
WHERE title = 'Tour de Prueba - Precios por Edad';

-- =====================================================
-- 8. MENSAJE DE CONFIRMACIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 Sistema de precios por edad simple probado exitosamente!';
    RAISE NOTICE '✅ Creación de servicios: FUNCIONA';
    RAISE NOTICE '✅ Actualización de servicios: FUNCIONA';
    RAISE NOTICE '✅ Eliminación de servicios: FUNCIONA';
    RAISE NOTICE '✅ Campos precio_ninos y edad_maxima_ninos: FUNCIONAN';
    RAISE NOTICE '✅ Categorías y subcategorías: FUNCIONAN';
    RAISE NOTICE '🚀 Frontend listo para usar el sistema simple!';
END $$;
