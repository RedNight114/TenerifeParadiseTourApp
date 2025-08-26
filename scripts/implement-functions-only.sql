-- IMPLEMENTACIÓN DE FUNCIONES PARA EL SISTEMA DE RANGOS DE EDAD
-- Ejecuta este script en Supabase SQL Editor

-- =====================================================
-- 1. FUNCIÓN PARA INSERTAR/ACTUALIZAR RANGOS DE EDAD
-- =====================================================

CREATE OR REPLACE FUNCTION upsert_service_age_ranges(
    service_id BIGINT,
    age_ranges JSONB
)
RETURNS VOID AS $$
DECLARE
    range_item JSONB;
    min_age_val INTEGER;
    max_age_val INTEGER;
    price_val DECIMAL(10,2);
    price_type_val VARCHAR(50);
    is_active_val BOOLEAN;
BEGIN
    -- Validar que el servicio existe
    IF NOT EXISTS (SELECT 1 FROM services WHERE id = service_id) THEN
        RAISE EXCEPTION 'El servicio con ID % no existe', service_id;
    END IF;

    -- Eliminar rangos existentes para este servicio
    DELETE FROM age_price_ranges WHERE service_id = upsert_service_age_ranges.service_id;

    -- Si no hay rangos para insertar, terminar
    IF age_ranges IS NULL OR jsonb_array_length(age_ranges) = 0 THEN
        RETURN;
    END IF;

    -- Insertar nuevos rangos
    FOR range_item IN SELECT * FROM jsonb_array_elements(age_ranges)
    LOOP
        -- Extraer valores del JSON con validación
        min_age_val := COALESCE((range_item->>'min_age')::INTEGER, 0);
        max_age_val := COALESCE((range_item->>'max_age')::INTEGER, 100);
        price_val := COALESCE((range_item->>'price')::DECIMAL(10,2), 0);
        price_type_val := COALESCE(range_item->>'price_type', 'custom');
        is_active_val := COALESCE((range_item->>'is_active')::BOOLEAN, true);

        -- Validar rangos de edad
        IF min_age_val < 0 OR max_age_val <= min_age_val THEN
            RAISE EXCEPTION 'Rango de edad inválido: %-% años', min_age_val, max_age_val;
        END IF;

        -- Validar precio
        IF price_val < 0 THEN
            RAISE EXCEPTION 'Precio inválido: %', price_val;
        END IF;

        -- Insertar rango
        INSERT INTO age_price_ranges (
            service_id, min_age, max_age, price, price_type, is_active
        ) VALUES (
            service_id, min_age_val, max_age_val, price_val, price_type_val, is_active_val
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. FUNCIÓN PARA OBTENER RANGOS DE EDAD
-- =====================================================

CREATE OR REPLACE FUNCTION get_service_age_ranges(service_id BIGINT)
RETURNS TABLE (
    id BIGINT,
    min_age INTEGER,
    max_age INTEGER,
    price DECIMAL(10,2),
    price_type VARCHAR(50),
    age_label TEXT,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        apr.id,
        apr.min_age,
        apr.max_age,
        apr.price,
        apr.price_type,
        CASE 
            WHEN apr.price_type = 'baby' THEN 'Bebé (0-2 años)'
            WHEN apr.price_type = 'child' THEN 'Niño (3-12 años)'
            WHEN apr.price_type = 'teen' THEN 'Adolescente (13-17 años)'
            WHEN apr.price_type = 'adult' THEN 'Adulto (18-65 años)'
            WHEN apr.price_type = 'senior' THEN 'Senior (65+ años)'
            ELSE apr.min_age::TEXT || '-' || apr.max_age::TEXT || ' años'
        END as age_label,
        apr.is_active
    FROM age_price_ranges apr
    WHERE apr.service_id = get_service_age_ranges.service_id
    AND apr.is_active = true
    ORDER BY apr.min_age;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. FUNCIÓN PARA ACTUALIZAR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. TRIGGER PARA ACTUALIZAR updated_at EN age_price_ranges
-- =====================================================

DROP TRIGGER IF EXISTS set_age_price_ranges_updated_at ON age_price_ranges;

CREATE TRIGGER set_age_price_ranges_updated_at
    BEFORE UPDATE ON age_price_ranges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. TRIGGER PARA ACTUALIZAR RANGOS AUTOMÁTICAMENTE
-- =====================================================

-- Función del trigger
CREATE OR REPLACE FUNCTION handle_service_age_ranges_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Si age_ranges existe en service data, llamar a la función upsert
    IF NEW.age_ranges IS NOT NULL AND jsonb_array_length(NEW.age_ranges) > 0 THEN
        PERFORM upsert_service_age_ranges(NEW.id, NEW.age_ranges);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger en la tabla services
DROP TRIGGER IF EXISTS update_service_age_ranges_trigger ON services;

CREATE TRIGGER update_service_age_ranges_trigger
    AFTER INSERT OR UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION handle_service_age_ranges_update();

-- =====================================================
-- 6. VERIFICACIÓN Y MENSAJES
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Sistema de rangos de edad implementado correctamente';
    RAISE NOTICE '✅ Función upsert_service_age_ranges creada';
    RAISE NOTICE '✅ Función get_service_age_ranges creada';
    RAISE NOTICE '✅ Trigger update_service_age_ranges_trigger configurado';
    RAISE NOTICE '✅ Sistema listo para usar';
END $$;
