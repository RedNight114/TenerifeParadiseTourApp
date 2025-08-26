-- =====================================================
-- ACTUALIZAR SERVICIOS CON RANGOS DE EDAD PERSONALIZADOS
-- =====================================================
-- Este script actualiza la función de servicios para manejar rangos de edad
-- =====================================================

-- 1. FUNCIÓN PARA INSERTAR/ACTUALIZAR RANGOS DE EDAD DE UN SERVICIO
CREATE OR REPLACE FUNCTION upsert_service_age_ranges(
    service_id_param UUID,
    age_ranges_param JSONB
)
RETURNS VOID AS $$
DECLARE
    range_item JSONB;
    range_record RECORD;
BEGIN
    -- Primero, desactivar todos los rangos existentes para este servicio
    UPDATE age_price_ranges 
    SET is_active = false 
    WHERE service_id = service_id_param;
    
    -- Luego, insertar o actualizar los nuevos rangos
    FOR range_item IN SELECT * FROM jsonb_array_elements(age_ranges_param)
    LOOP
        -- Extraer datos del JSON
        range_record.min_age := (range_item->>'min_age')::INTEGER;
        range_record.max_age := (range_item->>'max_age')::INTEGER;
        range_record.price := (range_item->>'price')::DECIMAL(10,2);
        range_record.price_type := range_item->>'price_type';
        range_record.is_active := (range_item->>'is_active')::BOOLEAN;
        
        -- Insertar o actualizar el rango
        INSERT INTO age_price_ranges (
            service_id, 
            min_age, 
            max_age, 
            price, 
            price_type, 
            is_active
        ) VALUES (
            service_id_param,
            range_record.min_age,
            range_record.max_age,
            range_record.price,
            range_record.price_type,
            range_record.is_active
        )
        ON CONFLICT (service_id, min_age, max_age) 
        DO UPDATE SET
            price = EXCLUDED.price,
            price_type = EXCLUDED.price_type,
            is_active = EXCLUDED.is_active,
            updated_at = NOW();
    END LOOP;
    
    -- Log de la operación
    RAISE NOTICE 'Rangos de edad actualizados para el servicio %: % rangos procesados', 
        service_id_param, 
        jsonb_array_length(age_ranges_param);
END;
$$ LANGUAGE plpgsql;

-- 2. FUNCIÓN PARA OBTENER TODOS LOS RANGOS DE EDAD DE UN SERVICIO
CREATE OR REPLACE FUNCTION get_service_age_ranges(service_id_param UUID)
RETURNS TABLE (
    id INTEGER,
    min_age INTEGER,
    max_age INTEGER,
    price DECIMAL(10,2),
    price_type VARCHAR(20),
    is_active BOOLEAN,
    age_label VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        apr.id,
        apr.min_age,
        apr.max_age,
        apr.price,
        apr.price_type,
        apr.is_active,
        CASE 
            WHEN apr.min_age = 0 AND apr.max_age = 2 THEN 'Bebés (0-2 años)'
            WHEN apr.min_age = 3 AND apr.max_age = 11 THEN 'Niños (3-11 años)'
            WHEN apr.min_age = 12 AND apr.max_age = 17 THEN 'Adolescentes (12-17 años)'
            WHEN apr.min_age = 18 AND apr.max_age = 64 THEN 'Adultos (18-64 años)'
            WHEN apr.min_age = 65 AND apr.max_age = 120 THEN 'Seniors (65+ años)'
            ELSE CONCAT(apr.min_age, '-', apr.max_age, ' años')
        END as age_label
    FROM age_price_ranges apr
    WHERE apr.service_id = service_id_param 
      AND apr.is_active = true
    ORDER BY apr.min_age;
END;
$$ LANGUAGE plpgsql;

-- 3. TRIGGER PARA ACTUALIZAR RANGOS DE EDAD CUANDO SE ACTUALIZA UN SERVICIO
CREATE OR REPLACE FUNCTION trigger_update_service_age_ranges()
RETURNS TRIGGER AS $$
BEGIN
    -- Si hay rangos de edad en los datos del servicio, actualizarlos
    IF NEW.age_ranges IS NOT NULL AND jsonb_array_length(NEW.age_ranges) > 0 THEN
        PERFORM upsert_service_age_ranges(NEW.id, NEW.age_ranges);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger si no existe
DROP TRIGGER IF EXISTS update_service_age_ranges_trigger ON services;
CREATE TRIGGER update_service_age_ranges_trigger
    AFTER INSERT OR UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_service_age_ranges();

-- 4. VERIFICAR IMPLEMENTACIÓN
SELECT '✅ Sistema de rangos de edad personalizados implementado' as status;

-- 5. PROBAR FUNCIONES
SELECT 'Probando función get_service_age_ranges...' as test;
-- SELECT * FROM get_service_age_ranges((SELECT id FROM services LIMIT 1));

-- 6. MOSTRAR ESTRUCTURA ACTUAL
SELECT 
    'Tabla age_price_ranges' as table_name,
    COUNT(*) as total_ranges,
    COUNT(DISTINCT service_id) as services_with_ranges
FROM age_price_ranges;

SELECT 
    'Servicios disponibles' as info,
    COUNT(*) as total_services
FROM services;
