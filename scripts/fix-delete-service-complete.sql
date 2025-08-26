-- Script para corregir la función delete_service_complete
-- Ejecutar en Supabase SQL Editor

-- Eliminar la función existente
DROP FUNCTION IF EXISTS delete_service_complete(UUID);

-- Recrear la función con referencias explícitas a las tablas
CREATE OR REPLACE FUNCTION delete_service_complete(
    service_id_param UUID
) RETURNS BOOLEAN AS $$
BEGIN
    -- Primero eliminar rangos de edad asociados
    -- Usar referencias explícitas a las tablas para evitar ambigüedad
    DELETE FROM age_price_ranges 
    WHERE age_price_ranges.service_id = service_id_param;
    
    -- Luego eliminar el servicio
    DELETE FROM services 
    WHERE services.id = service_id_param;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar que se creó correctamente
DO $$
BEGIN
    RAISE NOTICE '✅ Función delete_service_complete corregida exitosamente';
    RAISE NOTICE '✅ Referencias de columnas explícitas implementadas';
END $$;
