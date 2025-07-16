-- Script para corregir precios de servicios inválidos
-- Este script establece precios por defecto para servicios con precios problemáticos

-- 1. Verificar servicios con precios problemáticos ANTES de la corrección
SELECT 
    'ANTES DE CORRECCIÓN' as estado,
    COUNT(*) as total_servicios,
    COUNT(CASE WHEN price > 0 THEN 1 END) as servicios_con_precio_valido,
    COUNT(CASE WHEN price <= 0 OR price IS NULL THEN 1 END) as servicios_con_precio_invalido
FROM services;

-- Mostrar servicios problemáticos
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

-- 2. CORREGIR PRECIOS PROBLEMÁTICOS
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

-- 3. Verificar servicios con precios problemáticos DESPUÉS de la corrección
SELECT 
    'DESPUÉS DE CORRECCIÓN' as estado,
    COUNT(*) as total_servicios,
    COUNT(CASE WHEN price > 0 THEN 1 END) as servicios_con_precio_valido,
    COUNT(CASE WHEN price <= 0 OR price IS NULL THEN 1 END) as servicios_con_precio_invalido
FROM services;

-- Mostrar todos los servicios con sus precios corregidos
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

-- 4. Resumen final
SELECT 
    'RESUMEN FINAL' as titulo,
    COUNT(*) as total_servicios,
    ROUND(AVG(price), 2) as precio_promedio,
    MIN(price) as precio_minimo,
    MAX(price) as precio_maximo
FROM services; 