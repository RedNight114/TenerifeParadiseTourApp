-- DIAGNÓSTICO DE LA FUNCIÓN UPDATE_SERVICE_SIMPLE
-- Este script nos ayudará a identificar exactamente dónde está el problema

-- 1. VERIFICAR SI LA FUNCIÓN EXISTE
SELECT 
    proname as function_name,
    proargtypes::regtype[] as argument_types,
    prorettype::regtype as return_type,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'update_service_simple';

-- 2. VERIFICAR LA ESTRUCTURA DE LA TABLA SERVICES
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'services' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. VERIFICAR SI HAY CONFLICTOS DE TIPOS EN LOS DATOS
SELECT 
    'category_id' as column_name,
    data_type,
    COUNT(*) as count
FROM (
    SELECT 
        CASE 
            WHEN category_id IS NULL THEN 'NULL'
            ELSE pg_typeof(category_id)::text
        END as data_type
    FROM services 
    WHERE category_id IS NOT NULL
) t
GROUP BY data_type

UNION ALL

SELECT 
    'subcategory_id' as column_name,
    data_type,
    COUNT(*) as count
FROM (
    SELECT 
        CASE 
            WHEN subcategory_id IS NULL THEN 'NULL'
            ELSE pg_typeof(subcategory_id)::text
        END as data_type
    FROM services 
    WHERE subcategory_id IS NOT NULL
) t
GROUP BY data_type

UNION ALL

SELECT 
    'price' as column_name,
    data_type,
    COUNT(*) as count
FROM (
    SELECT 
        CASE 
            WHEN price IS NULL THEN 'NULL'
            ELSE pg_typeof(price)::text
        END as data_type
    FROM services 
    WHERE price IS NOT NULL
) t
GROUP BY data_type;

-- 4. VERIFICAR EJEMPLO DE DATOS PROBLEMÁTICOS
SELECT 
    id,
    title,
    category_id,
    subcategory_id,
    price,
    pg_typeof(category_id) as category_type,
    pg_typeof(subcategory_id) as subcategory_type,
    pg_typeof(price) as price_type
FROM services 
LIMIT 5;

-- 5. VERIFICAR SI HAY FUNCIONES DUPLICADAS
SELECT 
    proname,
    proargtypes::regtype[],
    prosrc
FROM pg_proc 
WHERE proname LIKE '%update_service%'
ORDER BY proname;
