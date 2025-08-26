-- =====================================================
-- DIAGNÓSTICO EXACTO DEL PROBLEMA
-- =====================================================
-- Este script identifica exactamente qué está mal
-- =====================================================

-- 1. VERIFICAR QUÉ FUNCIONES EXISTEN REALMENTE
SELECT 
    'Funciones existentes' as info,
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND (routine_name LIKE '%age%' OR routine_name LIKE '%range%')
ORDER BY routine_name;

-- 2. VERIFICAR ESTRUCTURA EXACTA DE LA TABLA
SELECT 
    'Estructura de age_price_ranges' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'age_price_ranges'
ORDER BY ordinal_position;

-- 3. VERIFICAR DATOS REALES EN LA TABLA
SELECT 
    'Datos en age_price_ranges' as info,
    COUNT(*) as total_records,
    COUNT(DISTINCT service_id) as unique_services
FROM age_price_ranges;

-- 4. VERIFICAR UN REGISTRO ESPECÍFICO
SELECT 
    'Ejemplo de registro' as info,
    *
FROM age_price_ranges 
LIMIT 1;

-- 5. VERIFICAR SERVICIOS DISPONIBLES
SELECT 
    'Servicios disponibles' as info,
    COUNT(*) as total_services,
    MIN(title) as ejemplo_titulo
FROM services;

-- 6. INTENTAR CREAR FUNCIONES DESDE CERO (SIN CONFLICTOS)
DROP FUNCTION IF EXISTS upsert_service_age_ranges(UUID, JSONB);
DROP FUNCTION IF EXISTS get_service_age_ranges(UUID);

-- 7. CREAR FUNCIÓN SIMPLE DE PRUEBA
CREATE OR REPLACE FUNCTION test_simple_function()
RETURNS TEXT AS $$
BEGIN
    RETURN 'Función de prueba funcionando';
END;
$$ LANGUAGE plpgsql;

-- 8. PROBAR FUNCIÓN SIMPLE
SELECT 'Probando función simple...' as test;
SELECT test_simple_function();

-- 9. VERIFICAR QUE PODEMOS ACCEDER A LA TABLA
SELECT 'Acceso a tabla...' as test;
SELECT COUNT(*) FROM age_price_ranges;

-- 10. VERIFICAR QUE PODEMOS ACCEDER A SERVICIOS
SELECT 'Acceso a servicios...' as test;
SELECT COUNT(*) FROM services;
