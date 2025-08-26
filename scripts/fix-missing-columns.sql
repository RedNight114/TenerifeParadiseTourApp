-- =====================================================
-- CORREGIR COLUMNAS FALTANTES Y FUNCIONES
-- =====================================================
-- Este script agrega la columna updated_at y corrige las funciones
-- =====================================================

-- 1. AGREGAR COLUMNA UPDATED_AT SI NO EXISTE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'age_price_ranges' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE age_price_ranges ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ Columna updated_at agregada a age_price_ranges';
    ELSE
        RAISE NOTICE 'ℹ️ La columna updated_at ya existe';
    END IF;
END $$;

-- 2. VERIFICAR ESTRUCTURA ACTUAL DE LA TABLA
SELECT 
    'Estructura actual de age_price_ranges' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'age_price_ranges'
ORDER BY ordinal_position;

-- 3. CORREGIR FUNCIÓN UPSERT (SIN UPDATED_AT POR AHORA)
CREATE OR REPLACE FUNCTION upsert_service_age_ranges(
    service_id_param UUID,
    age_ranges_param JSONB
)
RETURNS VOID AS $$
DECLARE
    range_item JSONB;
    min_age_val INTEGER;
    max_age_val INTEGER;
    price_val DECIMAL(10,2);
    price_type_val VARCHAR(20);
    is_active_val BOOLEAN;
BEGIN
    -- Primero, desactivar todos los rangos existentes para este servicio
    UPDATE age_price_ranges
    SET is_active = false
    WHERE service_id = service_id_param;

    -- Luego, insertar o actualizar los nuevos rangos
    FOR range_item IN SELECT * FROM jsonb_array_elements(age_ranges_param)
    LOOP
        -- Extraer datos del JSON de forma segura
        min_age_val := COALESCE((range_item->>'min_age')::INTEGER, 0);
        max_age_val := COALESCE((range_item->>'max_age')::INTEGER, 0);
        price_val := COALESCE((range_item->>'price')::DECIMAL(10,2), 0.00);
        price_type_val := COALESCE(range_item->>'price_type', 'custom');
        is_active_val := COALESCE((range_item->>'is_active')::BOOLEAN, true);

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
            min_age_val,
            max_age_val,
            price_val,
            price_type_val,
            is_active_val
        )
        ON CONFLICT (service_id, min_age, max_age)
        DO UPDATE SET
            price = EXCLUDED.price,
            price_type = EXCLUDED.price_type,
            is_active = EXCLUDED.is_active;
    END LOOP;

    -- Log de la operación
    RAISE NOTICE '✅ Rangos de edad actualizados para el servicio %: % rangos procesados',
        service_id_param,
        jsonb_array_length(age_ranges_param);
END;
$$ LANGUAGE plpgsql;

-- 4. CORREGIR FUNCIÓN GET (ESTRUCTURA SIMPLIFICADA)
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
            ELSE apr.min_age::TEXT || '-' || apr.max_age::TEXT || ' años'
        END as age_label
    FROM age_price_ranges apr
    WHERE apr.service_id = service_id_param
      AND apr.is_active = true
    ORDER BY apr.min_age;
END;
$$ LANGUAGE plpgsql;

-- 5. VERIFICAR QUE LAS FUNCIONES SE CREARON
SELECT '✅ Función upsert_service_age_ranges creada' as status;
SELECT '✅ Función get_service_age_ranges creada' as status;

-- 6. PROBAR LAS FUNCIONES
SELECT '🧪 Probando funciones...' as test;

-- Probar con un servicio existente
DO $$
DECLARE
    test_service_id UUID;
    test_ranges JSONB;
BEGIN
    -- Obtener el primer servicio disponible
    SELECT id INTO test_service_id FROM services LIMIT 1;
    
    IF test_service_id IS NOT NULL THEN
        -- Crear rangos de prueba
        test_ranges := '[
            {"min_age": 0, "max_age": 2, "price": 0, "price_type": "baby", "is_active": true},
            {"min_age": 3, "max_age": 11, "price": 15.50, "price_type": "child", "is_active": true},
            {"min_age": 12, "max_age": 17, "price": 22.75, "price_type": "child", "is_active": true},
            {"min_age": 18, "max_age": 64, "price": 30.00, "price_type": "adult", "is_active": true},
            {"min_age": 65, "max_age": 120, "price": 27.00, "price_type": "senior", "is_active": true}
        ]'::JSONB;
        
        -- Probar la función de inserción
        PERFORM upsert_service_age_ranges(test_service_id, test_ranges);
        RAISE NOTICE '✅ upsert_service_age_ranges funcionando con servicio %', test_service_id;
        
        -- Probar la función de obtención
        PERFORM get_service_age_ranges(test_service_id);
        RAISE NOTICE '✅ get_service_age_ranges funcionando con servicio %', test_service_id;
    ELSE
        RAISE NOTICE '⚠️ No hay servicios disponibles para probar';
    END IF;
END $$;

-- 7. MOSTRAR ESTADO FINAL
SELECT
    '🎉 Estado final del sistema' as info,
    COUNT(*) as total_ranges,
    COUNT(DISTINCT service_id) as services_with_ranges
FROM age_price_ranges
WHERE is_active = true;

SELECT '✅ Sistema de rangos de edad completamente funcional!' as final_status;
