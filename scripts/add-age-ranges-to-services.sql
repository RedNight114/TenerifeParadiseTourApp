-- Script para agregar la columna age_ranges a la tabla services
-- Ejecuta esto en Supabase SQL Editor DESPUÉS de ejecutar complete-age-pricing-implementation.sql

-- Verificar si la columna age_ranges ya existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' 
        AND column_name = 'age_ranges'
        AND table_schema = 'public'
    ) THEN
        -- Agregar la columna age_ranges si no existe
        ALTER TABLE services ADD COLUMN age_ranges JSONB;
        
        -- Agregar comentario a la columna
        COMMENT ON COLUMN services.age_ranges IS 'Rangos de edad y precios para este servicio';
        
        RAISE NOTICE '✅ Columna age_ranges agregada a la tabla services';
    ELSE
        RAISE NOTICE 'ℹ️ La columna age_ranges ya existe en la tabla services';
    END IF;
END $$;

-- Verificar la estructura final de la tabla services
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'services'
AND table_schema = 'public'
ORDER BY ordinal_position;
