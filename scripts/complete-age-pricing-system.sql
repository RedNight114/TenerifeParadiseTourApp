-- =====================================================
-- COMPLETAR SISTEMA DE PRECIOS POR EDAD
-- =====================================================
-- Este script completa las funciones y vistas que faltan
-- =====================================================

-- 1. CREAR FUNCIÓN PARA OBTENER TODOS LOS PRECIOS DE UN SERVICIO
CREATE OR REPLACE FUNCTION get_service_pricing(service_id_param UUID)
RETURNS TABLE (
    min_age INTEGER,
    max_age INTEGER,
    price DECIMAL(10,2),
    price_type VARCHAR(20),
    age_label VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        apr.min_age,
        apr.max_age,
        apr.price,
        apr.price_type,
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

-- 2. CREAR VISTA PARA MOSTRAR PRECIOS POR EDAD
CREATE OR REPLACE VIEW service_age_pricing AS
SELECT 
    s.id as service_id,
    s.title as service_name,
    s.price as adult_price,
    apr.min_age,
    apr.max_age,
    apr.price as age_price,
    apr.price_type,
    CASE 
        WHEN apr.min_age = 0 AND apr.max_age = 2 THEN 'Bebés (0-2 años)'
        WHEN apr.min_age = 3 AND apr.max_age = 11 THEN 'Niños (3-11 años)'
        WHEN apr.min_age = 12 AND apr.max_age = 17 THEN 'Adolescentes (12-17 años)'
        WHEN apr.min_age = 18 AND apr.max_age = 64 THEN 'Adultos (18-64 años)'
        WHEN apr.min_age = 65 AND apr.max_age = 120 THEN 'Seniors (65+ años)'
        ELSE CONCAT(apr.min_age, '-', apr.max_age, ' años')
    END as age_label
FROM services s
JOIN age_price_ranges apr ON s.id = apr.service_id
WHERE s.available = true AND apr.is_active = true
ORDER BY s.id, apr.min_age;

-- 3. VERIFICAR IMPLEMENTACIÓN
SELECT '✅ Sistema completado correctamente' as status;
SELECT COUNT(*) as total_rangos FROM age_price_ranges;
SELECT COUNT(DISTINCT service_id) as servicios_con_precios FROM age_price_ranges;

-- 4. PROBAR FUNCIONES
SELECT 'Probando función get_service_pricing...' as test;
SELECT * FROM get_service_pricing((SELECT id FROM services LIMIT 1));

SELECT 'Probando vista service_age_pricing...' as test;
SELECT * FROM service_age_pricing LIMIT 10;
