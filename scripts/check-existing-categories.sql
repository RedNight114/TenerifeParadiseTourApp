-- Script para verificar las categorías existentes
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- 1. VERIFICAR CATEGORÍAS EXISTENTES
-- =====================================================

SELECT 
    id,
    name,
    description,
    created_at
FROM categories 
ORDER BY name;

-- =====================================================
-- 2. VERIFICAR SUBCATEGORÍAS EXISTENTES
-- =====================================================

SELECT 
    s.id,
    s.name,
    s.description,
    c.name as category_name,
    s.created_at
FROM subcategories s
JOIN categories c ON s.category_id = c.id
ORDER BY c.name, s.name;

-- =====================================================
-- 3. VERIFICAR ESTRUCTURA DE LA TABLA services
-- =====================================================

-- Verificar que los campos se agregaron correctamente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'services' 
    AND table_schema = 'public'
    AND column_name IN ('precio_ninos', 'edad_maxima_ninos')
ORDER BY column_name;

-- =====================================================
-- 4. VERIFICAR FUNCIONES SIMPLES
-- =====================================================

SELECT
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN ('update_service_simple', 'create_service_simple', 'delete_service_simple')
ORDER BY p.proname;
