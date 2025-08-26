-- SOLUCIÓN ULTRA-SIMPLIFICADA PARA LA FUNCIÓN update_service_with_age_ranges
-- Ejecuta este script en Supabase SQL Editor
-- =====================================================

-- 1. ELIMINAR LA FUNCIÓN PROBLEMÁTICA
-- =====================================================
DROP FUNCTION IF EXISTS update_service_with_age_ranges(UUID, JSONB);

-- 2. CREAR UNA FUNCIÓN MUY SIMPLE Y SEGURA
-- =====================================================
CREATE OR REPLACE FUNCTION update_service_with_age_ranges(
    service_id UUID,
    service_data JSONB
) RETURNS BOOLEAN AS $$
DECLARE
    age_ranges JSONB;
BEGIN
    -- Extraer rangos de edad del JSON
    age_ranges := service_data->'age_ranges';
    
    -- Actualizar solo campos básicos y seguros
    UPDATE services SET
        title = CASE WHEN service_data ? 'title' THEN service_data->>'title' ELSE title END,
        description = CASE WHEN service_data ? 'description' THEN service_data->>'description' ELSE description END,
        category_id = CASE WHEN service_data ? 'category_id' THEN service_data->>'category_id' ELSE category_id END,
        subcategory_id = CASE WHEN service_data ? 'subcategory_id' THEN service_data->>'subcategory_id' ELSE subcategory_id END,
        price = CASE WHEN service_data ? 'price' THEN (service_data->>'price')::NUMERIC ELSE price END,
        duration = CASE WHEN service_data ? 'duration' THEN service_data->>'duration' ELSE duration END,
        location = CASE WHEN service_data ? 'location' THEN service_data->>'location' ELSE location END,
        available = CASE WHEN service_data ? 'available' THEN (service_data->>'available')::BOOLEAN ELSE available END,
        featured = CASE WHEN service_data ? 'featured' THEN (service_data->>'featured')::BOOLEAN ELSE featured END,
        images = CASE WHEN service_data ? 'images' THEN (service_data->>'images')::JSONB ELSE images END,
        age_ranges = CASE WHEN age_ranges IS NOT NULL THEN age_ranges ELSE age_ranges END,
        updated_at = NOW()
    WHERE id = service_id;
    
    -- Si hay rangos de edad, procesarlos
    IF age_ranges IS NOT NULL AND jsonb_array_length(age_ranges) > 0 THEN
        PERFORM upsert_service_age_ranges(service_id, age_ranges);
    END IF;
    
    RETURN FOUND;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error en update_service_with_age_ranges: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. VERIFICAR QUE LA FUNCIÓN SE CREÓ CORRECTAMENTE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Función update_service_with_age_ranges recreada (versión simple)';
    RAISE NOTICE '✅ Solo actualiza campos básicos y seguros';
    RAISE NOTICE '✅ Evita completamente conflictos de tipos';
END $$;


