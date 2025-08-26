-- VERIFICACIÓN COMPLETA DE LA ESTRUCTURA DE LA TABLA SERVICES
-- Ejecuta este script en Supabase SQL Editor para ver exactamente qué tipos tiene cada columna
-- =====================================================

-- 1. VERIFICAR ESTRUCTURA COMPLETA DE LA TABLA SERVICES
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_name = 'services' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR TIPOS DE DATOS ESPECÍFICOS
-- =====================================================
DO $$
DECLARE
    col_record RECORD;
    type_info TEXT;
BEGIN
    RAISE NOTICE '📋 ESTRUCTURA DETALLADA DE LA TABLA SERVICES:';
    RAISE NOTICE '===============================================';
    
    FOR col_record IN 
        SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length,
            numeric_precision,
            numeric_scale
        FROM information_schema.columns 
        WHERE table_name = 'services' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
    LOOP
        type_info := col_record.data_type;
        
        -- Agregar información adicional para tipos específicos
        IF col_record.data_type = 'character varying' THEN
            type_info := type_info || '(' || COALESCE(col_record.character_maximum_length::TEXT, 'max') || ')';
        ELSIF col_record.data_type IN ('numeric', 'decimal') THEN
            type_info := type_info || '(' || col_record.numeric_precision || ',' || col_record.numeric_scale || ')';
        END IF;
        
        RAISE NOTICE '  %: % (nullable: %, default: %)', 
            col_record.column_name, 
            type_info, 
            col_record.is_nullable,
            COALESCE(col_record.column_default, 'NULL');
    END LOOP;
    
    RAISE NOTICE '===============================================';
END $$;

-- 3. VERIFICAR FUNCIONES EXISTENTES
-- =====================================================
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname LIKE '%service%'
ORDER BY p.proname;

-- 4. VERIFICAR DATOS DE EJEMPLO
-- =====================================================
SELECT 
    id,
    title,
    price,
    capacity,
    min_group_size,
    max_group_size,
    min_age,
    available,
    featured
FROM services 
LIMIT 3;


