-- =====================================================
-- DEPURAR FUNCIONES DE RANGOS DE EDAD
-- =====================================================
-- Este script identifica exactamente qué está mal
-- =====================================================

-- 1. VERIFICAR QUÉ FUNCIONES EXISTEN
SELECT 
    routine_name,
    routine_type,
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%age%' 
   OR routine_name LIKE '%range%'
   OR routine_schema = 'public';

-- 2. VERIFICAR LA ESTRUCTURA DE LA TABLA
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'age_price_ranges'
ORDER BY ordinal_position;

-- 3. VERIFICAR DATOS EN LA TABLA
SELECT 
    service_id,
    min_age,
    max_age,
    price,
    price_type,
    is_active,
    created_at,
    updated_at
FROM age_price_ranges 
LIMIT 10;

-- 4. VERIFICAR SERVICIOS DISPONIBLES
SELECT 
    id,
    title,
    price
FROM services 
LIMIT 5;

-- 5. INTENTAR LLAMAR LAS FUNCIONES MANUALMENTE
-- (Esto nos dirá exactamente cuál es el error)

-- Probar get_service_age_ranges
SELECT 'Probando get_service_age_ranges...' as test;
SELECT * FROM get_service_age_ranges(
    (SELECT id FROM services LIMIT 1)
);

-- Probar upsert_service_age_ranges
SELECT 'Probando upsert_service_age_ranges...' as test;
SELECT upsert_service_age_ranges(
    (SELECT id FROM services LIMIT 1),
    '[
        {"min_age": 0, "max_age": 2, "price": 0, "price_type": "baby", "is_active": true},
        {"min_age": 3, "max_age": 11, "price": 15.50, "price_type": "child", "is_active": true}
    ]'::JSONB
);

-- 6. VERIFICAR ERRORES EN EL LOG
SELECT 'Revisando logs de errores...' as note;
