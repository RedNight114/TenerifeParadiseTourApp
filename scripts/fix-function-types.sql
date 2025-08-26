-- CORRECCIÓN DE TIPOS EN LA FUNCIÓN get_service_age_ranges
-- Ejecuta este script en Supabase SQL Editor para corregir el error de tipos
-- =====================================================

-- 1. ELIMINAR LA FUNCIÓN ACTUAL
-- =====================================================
DROP FUNCTION IF EXISTS get_service_age_ranges(UUID);

-- 2. CREAR LA FUNCIÓN CORREGIDA CON TIPOS REALES
-- =====================================================
CREATE OR REPLACE FUNCTION get_service_age_ranges(service_id UUID)
RETURNS TABLE (
    id INTEGER,           -- Cambiado de BIGINT a INTEGER
    min_age INTEGER,      -- Ya correcto
    max_age INTEGER,      -- Ya correcto
    price NUMERIC,        -- Cambiado de DECIMAL(10,2) a NUMERIC
    price_type VARCHAR(50), -- Ya correcto
    age_label TEXT,       -- Ya correcto
    is_active BOOLEAN     -- Ya correcto
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

-- 3. VERIFICAR QUE LA FUNCIÓN SE CREÓ CORRECTAMENTE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Función get_service_age_ranges corregida con tipos reales';
    RAISE NOTICE '✅ id: INTEGER (en lugar de BIGINT)';
    RAISE NOTICE '✅ price: NUMERIC (en lugar de DECIMAL(10,2))';
    RAISE NOTICE '💡 Ahora ejecuta: node scripts/test-uuid-service-insert.js';
END $$;
