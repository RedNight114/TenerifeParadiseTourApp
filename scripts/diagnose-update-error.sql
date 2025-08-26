-- DIAGNÓSTICO COMPLETO DEL ERROR DE ACTUALIZACIÓN
-- Ejecuta este script en Supabase SQL Editor para identificar el problema exacto
-- =====================================================

-- 1. VERIFICAR LA FUNCIÓN ACTUAL
-- =====================================================
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'update_service_with_age_ranges';

-- 2. VERIFICAR ESTRUCTURA DE LA TABLA SERVICES
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'services' 
AND table_schema = 'public'
AND column_name IN (
    'title', 'description', 'category_id', 'subcategory_id', 'price',
    'duration', 'location', 'available', 'featured', 'images',
    'min_group_size', 'max_group_size', 'capacity', 'min_age'
)
ORDER BY column_name;

-- 3. VERIFICAR DATOS DE EJEMPLO
-- =====================================================
SELECT 
    id,
    title,
    price,
    available,
    featured,
    min_group_size,
    max_group_size,
    capacity,
    min_age
FROM services 
LIMIT 3;

-- 4. PROBAR ACTUALIZACIÓN SIMPLE
-- =====================================================
-- Comentar esta sección si no quieres que se ejecute
/*
DO $$
DECLARE
    test_service_id UUID;
    test_result BOOLEAN;
BEGIN
    -- Obtener un ID de servicio de ejemplo
    SELECT id INTO test_service_id FROM services LIMIT 1;
    
    IF test_service_id IS NOT NULL THEN
        RAISE NOTICE '🔍 Probando actualización simple para servicio: %', test_service_id;
        
        -- Probar actualización básica
        UPDATE services SET 
            title = title,
            updated_at = NOW()
        WHERE id = test_service_id;
        
        IF FOUND THEN
            RAISE NOTICE '✅ Actualización básica exitosa';
        ELSE
            RAISE NOTICE '❌ Actualización básica falló';
        END IF;
        
        -- Probar la función
        test_result := update_service_with_age_ranges(
            test_service_id, 
            '{"title": "Test Update"}'::JSONB
        );
        
        IF test_result THEN
            RAISE NOTICE '✅ Función de actualización exitosa';
        ELSE
            RAISE NOTICE '❌ Función de actualización falló';
        END IF;
        
    ELSE
        RAISE NOTICE '⚠️ No hay servicios para probar';
    END IF;
END $$;
*/

-- 5. VERIFICAR LOGS DE ERROR
-- =====================================================
-- Esto mostrará los últimos errores de la base de datos
SELECT 
    log_time,
    user_name,
    database_name,
    process_id,
    session_id,
    command_tag,
    message
FROM pg_stat_activity 
WHERE state = 'active' 
AND query LIKE '%update_service_with_age_ranges%';
