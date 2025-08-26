-- =====================================================
-- SCRIPT DE PRUEBA PARA FUNCIONES DE SERVICIOS
-- Verifica que las funciones funcionen correctamente
-- =====================================================

-- Ejecutar en Supabase SQL Editor DESPUÉS de ejecutar fix-service-functions-complete.sql

-- =====================================================
-- 1. VERIFICAR QUE LAS FUNCIONES EXISTEN
-- =====================================================

DO $$
DECLARE
    function_count INTEGER;
BEGIN
    -- Contar funciones existentes
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
        AND p.proname IN ('update_service_simple', 'create_service_simple', 'delete_service_simple');
    
    IF function_count = 3 THEN
        RAISE NOTICE '✅ Todas las funciones existen (%/3)', function_count;
    ELSE
        RAISE NOTICE '❌ Faltan funciones: %/3', function_count;
    END IF;
END $$;

-- =====================================================
-- 2. CREAR SERVICIO DE PRUEBA
-- =====================================================

DO $$
DECLARE
    test_service_id UUID;
    test_category_id UUID;
    test_subcategory_id UUID;
BEGIN
    RAISE NOTICE '🧪 Creando servicio de prueba...';
    
    -- Obtener una categoría existente
    SELECT id INTO test_category_id FROM categories LIMIT 1;
    IF test_category_id IS NULL THEN
        RAISE NOTICE '⚠️ No hay categorías disponibles, creando una de prueba';
        INSERT INTO categories (name, description) VALUES ('Prueba', 'Categoría de prueba') RETURNING id INTO test_category_id;
    END IF;
    
    -- Obtener una subcategoría existente
    SELECT id INTO test_subcategory_id FROM subcategories LIMIT 1;
    IF test_subcategory_id IS NULL THEN
        RAISE NOTICE '⚠️ No hay subcategorías disponibles, creando una de prueba';
        INSERT INTO subcategories (name, description, category_id) VALUES ('Subprueba', 'Subcategoría de prueba', test_category_id) RETURNING id INTO test_subcategory_id;
    END IF;
    
    -- Crear servicio de prueba
    SELECT create_service_simple(
        '{"title": "Servicio de Prueba", "description": "Este es un servicio de prueba", "price": 99.99, "category_id": "' || test_category_id || '", "subcategory_id": "' || test_subcategory_id || '", "available": true, "featured": false}'::JSONB
    ) INTO test_service_id;
    
    IF test_service_id IS NOT NULL THEN
        RAISE NOTICE '✅ Servicio de prueba creado con ID: %', test_service_id;
        
        -- Verificar que se creó correctamente
        IF EXISTS(SELECT 1 FROM services WHERE id = test_service_id) THEN
            RAISE NOTICE '✅ Servicio verificado en la base de datos';
        ELSE
            RAISE NOTICE '❌ Error: Servicio no encontrado en la base de datos';
        END IF;
        
        -- Actualizar el servicio
        IF update_service_simple(test_service_id, '{"title": "Servicio de Prueba Actualizado", "price": 149.99}'::JSONB) THEN
            RAISE NOTICE '✅ Servicio actualizado correctamente';
        ELSE
            RAISE NOTICE '❌ Error al actualizar servicio';
        END IF;
        
        -- Eliminar el servicio
        IF delete_service_simple(test_service_id) THEN
            RAISE NOTICE '✅ Servicio eliminado correctamente';
        ELSE
            RAISE NOTICE '❌ Error al eliminar servicio';
        END IF;
        
        -- Verificar que se eliminó
        IF NOT EXISTS(SELECT 1 FROM services WHERE id = test_service_id) THEN
            RAISE NOTICE '✅ Servicio eliminado verificado en la base de datos';
        ELSE
            RAISE NOTICE '❌ Error: Servicio aún existe en la base de datos';
        END IF;
        
    ELSE
        RAISE NOTICE '❌ Error al crear servicio de prueba';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error durante las pruebas: %', SQLERRM;
END $$;

-- =====================================================
-- 3. VERIFICAR PERMISOS DE USUARIOS
-- =====================================================

DO $$
DECLARE
    can_execute BOOLEAN;
BEGIN
    RAISE NOTICE '🔐 Verificando permisos de usuarios...';
    
    -- Verificar delete_service_simple
    SELECT has_function_privilege('authenticated', 
        (SELECT oid FROM pg_proc WHERE proname = 'delete_service_simple' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'))
        , 'EXECUTE') INTO can_execute;
    
    IF can_execute THEN
        RAISE NOTICE '✅ authenticated puede ejecutar delete_service_simple';
    ELSE
        RAISE NOTICE '❌ authenticated NO puede ejecutar delete_service_simple';
    END IF;
    
    -- Verificar update_service_simple
    SELECT has_function_privilege('authenticated', 
        (SELECT oid FROM pg_proc WHERE proname = 'update_service_simple' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'))
        , 'EXECUTE') INTO can_execute;
    
    IF can_execute THEN
        RAISE NOTICE '✅ authenticated puede ejecutar update_service_simple';
    ELSE
        RAISE NOTICE '❌ authenticated NO puede ejecutar update_service_simple';
    END IF;
    
    -- Verificar create_service_simple
    SELECT has_function_privilege('authenticated', 
        (SELECT oid FROM pg_proc WHERE proname = 'create_service_simple' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'))
        , 'EXECUTE') INTO can_execute;
    
    IF can_execute THEN
        RAISE NOTICE '✅ authenticated puede ejecutar create_service_simple';
    ELSE
        RAISE NOTICE '❌ authenticated NO puede ejecutar create_service_simple';
    END IF;
END $$;

-- =====================================================
-- 4. VERIFICAR ESTRUCTURA DE LA TABLA SERVICES
-- =====================================================

-- Mostrar estructura de la tabla services
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'services' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 5. MENSAJE FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 Pruebas de funciones de servicios completadas!';
    RAISE NOTICE '✅ Si todas las pruebas pasaron, las funciones están funcionando correctamente';
    RAISE NOTICE '🚀 Ahora puedes usar la aplicación frontend sin problemas';
    RAISE NOTICE '💡 Recuerda reiniciar la aplicación después de ejecutar este script';
END $$;
