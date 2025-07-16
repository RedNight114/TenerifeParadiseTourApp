-- Script para verificar y corregir precios de servicios
-- Este script identifica servicios con precios inválidos que causan el error SIS0042

-- 1. Verificar servicios con precios problemáticos
SELECT 
    id,
    title,
    price,
    CASE 
        WHEN price IS NULL THEN 'NULL'
        WHEN price = 0 THEN 'CERO'
        WHEN price < 0 THEN 'NEGATIVO'
        ELSE 'VÁLIDO'
    END as estado_precio,
    created_at
FROM services 
WHERE price IS NULL OR price <= 0
ORDER BY created_at DESC;

-- 2. Contar servicios por estado de precio
SELECT 
    CASE 
        WHEN price IS NULL THEN 'NULL'
        WHEN price = 0 THEN 'CERO'
        WHEN price < 0 THEN 'NEGATIVO'
        ELSE 'VÁLIDO'
    END as estado_precio,
    COUNT(*) as cantidad
FROM services 
GROUP BY 
    CASE 
        WHEN price IS NULL THEN 'NULL'
        WHEN price = 0 THEN 'CERO'
        WHEN price < 0 THEN 'NEGATIVO'
        ELSE 'VÁLIDO'
    END
ORDER BY cantidad DESC;

-- 3. Mostrar todos los servicios con sus precios para revisión
SELECT 
    id,
    title,
    price,
    price_type,
    category_id,
    available,
    created_at
FROM services 
ORDER BY price ASC, created_at DESC;

-- 4. Script para corregir precios (EJECUTAR SOLO SI ES NECESARIO)
-- ⚠️ DESCOMENTAR Y MODIFICAR SEGÚN NECESIDAD

/*
-- Establecer precio por defecto para servicios con precio NULL
UPDATE services 
SET price = 50.00 
WHERE price IS NULL;

-- Establecer precio por defecto para servicios con precio 0
UPDATE services 
SET price = 50.00 
WHERE price = 0;

-- Establecer precio por defecto para servicios con precio negativo
UPDATE services 
SET price = 50.00 
WHERE price < 0;

-- Verificar que todos los servicios tengan precio válido después de la corrección
SELECT 
    COUNT(*) as total_servicios,
    COUNT(CASE WHEN price > 0 THEN 1 END) as servicios_con_precio_valido,
    COUNT(CASE WHEN price <= 0 OR price IS NULL THEN 1 END) as servicios_con_precio_invalido
FROM services;
*/ 