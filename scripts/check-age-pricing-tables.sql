-- Script para verificar la estructura de las tablas de precios por edad

-- ========================================
-- PASO 1: VERIFICAR SI EXISTEN LAS TABLAS
-- ========================================

-- Verificar si existe la tabla age_price_ranges
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'age_price_ranges';

-- Verificar si existe la tabla services
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'services';

-- ========================================
-- PASO 2: VERIFICAR ESTRUCTURA DE TABLAS
-- ========================================

-- Ver estructura de age_price_ranges si existe
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'age_price_ranges'
ORDER BY ordinal_position;

-- Ver estructura de services
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'services'
ORDER BY ordinal_position;

-- ========================================
-- PASO 3: VERIFICAR DATOS EXISTENTES
-- ========================================

-- Ver si hay datos en age_price_ranges
SELECT COUNT(*) as total_age_ranges FROM age_price_ranges;

-- Ver si hay datos en services
SELECT COUNT(*) as total_services FROM services;

-- Ver algunos ejemplos de age_price_ranges
SELECT * FROM age_price_ranges LIMIT 5;

-- Ver algunos ejemplos de services
SELECT id, title, price FROM services LIMIT 5;

-- ========================================
-- PASO 4: VERIFICAR RELACIONES
-- ========================================

-- Verificar si hay foreign keys
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('age_price_ranges', 'services');

-- ========================================
-- MENSAJE DE RESUMEN
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '🔍 Verificación de tablas de precios por edad completada';
    RAISE NOTICE '📋 Revisa los resultados arriba para identificar problemas';
END $$;
