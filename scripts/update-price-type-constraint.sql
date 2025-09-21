-- Actualizar la restricción CHECK de price_type para incluir 'age_ranges'
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- 1. ELIMINAR RESTRICCIÓN EXISTENTE
-- =====================================================

-- Primero, eliminar la restricción existente
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_price_type_check;

-- =====================================================
-- 2. AGREGAR NUEVA RESTRICCIÓN
-- =====================================================

-- Agregar nueva restricción que incluya 'age_ranges'
ALTER TABLE services ADD CONSTRAINT services_price_type_check 
CHECK (price_type IN ('per_person', 'total', 'age_ranges'));

-- =====================================================
-- 3. VERIFICAR CAMBIO
-- =====================================================

-- Verificar que la restricción se aplicó correctamente
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'services'::regclass 
AND conname = 'services_price_type_check';

-- =====================================================
-- 4. PROBAR INSERCIÓN
-- =====================================================

-- Probar que se puede insertar con el nuevo valor (esto fallará si no hay datos válidos)
-- SELECT 'age_ranges'::text WHERE 'age_ranges' IN ('per_person', 'total', 'age_ranges');

-- =====================================================
-- 5. ACTUALIZAR COMENTARIOS
-- =====================================================

-- Agregar comentario a la columna para documentar los valores válidos
COMMENT ON COLUMN services.price_type IS 'Tipo de precio: per_person (por persona), total (precio total), age_ranges (por rango de edad)';

-- =====================================================
-- 6. VERIFICACIÓN FINAL
-- =====================================================

-- Mostrar información de la tabla services
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'services' 
AND column_name = 'price_type';

-- Mostrar restricciones de la tabla
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'services'
AND tc.constraint_type = 'CHECK';

