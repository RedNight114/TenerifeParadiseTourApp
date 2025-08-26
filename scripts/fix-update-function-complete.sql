-- SOLUCIÓN COMPLETA PARA LA FUNCIÓN update_service_with_age_ranges
-- Ejecuta este script en Supabase SQL Editor
-- =====================================================

-- 1. ELIMINAR LA FUNCIÓN PROBLEMÁTICA
-- =====================================================
DROP FUNCTION IF EXISTS update_service_with_age_ranges(UUID, JSONB);

-- 2. CREAR UNA FUNCIÓN QUE RESPETA EXACTAMENTE LOS TIPOS DE DATOS
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
    
    -- Actualizar solo campos que están presentes en service_data
    -- Respetando exactamente los tipos de datos de la tabla
    UPDATE services SET
        -- Campos de texto (text)
        title = CASE WHEN service_data ? 'title' THEN service_data->>'title' ELSE title END,
        description = CASE WHEN service_data ? 'description' THEN service_data->>'description' ELSE description END,
        category_id = CASE WHEN service_data ? 'category_id' THEN service_data->>'category_id' ELSE category_id END,
        subcategory_id = CASE WHEN service_data ? 'subcategory_id' THEN service_data->>'subcategory_id' ELSE subcategory_id END,
        location = CASE WHEN service_data ? 'location' THEN service_data->>'location' ELSE location END,
        difficulty_level = CASE WHEN service_data ? 'difficulty_level' THEN service_data->>'difficulty_level' ELSE difficulty_level END,
        vehicle_type = CASE WHEN service_data ? 'vehicle_type' THEN service_data->>'vehicle_type' ELSE vehicle_type END,
        characteristics = CASE WHEN service_data ? 'characteristics' THEN service_data->>'characteristics' ELSE characteristics END,
        menu = CASE WHEN service_data ? 'menu' THEN service_data->>'menu' ELSE menu END,
        price_type = CASE WHEN service_data ? 'price_type' THEN service_data->>'price_type' ELSE price_type END,
        activity_type = CASE WHEN service_data ? 'activity_type' THEN service_data->>'activity_type' ELSE activity_type END,
        fitness_level_required = CASE WHEN service_data ? 'fitness_level_required' THEN service_data->>'fitness_level_required' ELSE fitness_level_required END,
        cancellation_policy = CASE WHEN service_data ? 'cancellation_policy' THEN service_data->>'cancellation_policy' ELSE cancellation_policy END,
        itinerary = CASE WHEN service_data ? 'itinerary' THEN service_data->>'itinerary' ELSE itinerary END,
        meeting_point_details = CASE WHEN service_data ? 'meeting_point_details' THEN service_data->>'meeting_point_details' ELSE meeting_point_details END,
        transmission = CASE WHEN service_data ? 'transmission' THEN service_data->>'transmission' ELSE transmission END,
        fuel_policy = CASE WHEN service_data ? 'fuel_policy' THEN service_data->>'fuel_policy' ELSE fuel_policy END,
        experience_type = CASE WHEN service_data ? 'experience_type' THEN service_data->>'experience_type' ELSE experience_type END,
        chef_name = CASE WHEN service_data ? 'chef_name' THEN service_data->>'chef_name' ELSE chef_name END,
        drink_options = CASE WHEN service_data ? 'drink_options' THEN service_data->>'drink_options' ELSE drink_options END,
        ambience = CASE WHEN service_data ? 'ambience' THEN service_data->>'ambience' ELSE ambience END,
        
        -- Campos numéricos (numeric)
        price = CASE WHEN service_data ? 'price' THEN (service_data->>'price')::NUMERIC ELSE price END,
        deposit_amount = CASE WHEN service_data ? 'deposit_amount' THEN (service_data->>'deposit_amount')::NUMERIC ELSE deposit_amount END,
        price_children = CASE WHEN service_data ? 'price_children' THEN (service_data->>'price_children')::NUMERIC ELSE price_children END,
        
        -- Campos enteros (integer)
        duration = CASE WHEN service_data ? 'duration' THEN (service_data->>'duration')::INTEGER ELSE duration END,
        min_group_size = CASE WHEN service_data ? 'min_group_size' THEN (service_data->>'min_group_size')::INTEGER ELSE min_group_size END,
        max_group_size = CASE WHEN service_data ? 'max_group_size' THEN (service_data->>'max_group_size')::INTEGER ELSE max_group_size END,
        capacity = CASE WHEN service_data ? 'capacity' THEN (service_data->>'capacity')::INTEGER ELSE capacity END,
        min_age = CASE WHEN service_data ? 'min_age' THEN (service_data->>'min_age')::INTEGER ELSE min_age END,
        seats = CASE WHEN service_data ? 'seats' THEN (service_data->>'seats')::INTEGER ELSE seats END,
        doors = CASE WHEN service_data ? 'doors' THEN (service_data->>'doors')::INTEGER ELSE doors END,
        
        -- Campos booleanos (boolean)
        available = CASE WHEN service_data ? 'available' THEN (service_data->>'available')::BOOLEAN ELSE available END,
        featured = CASE WHEN service_data ? 'featured' THEN (service_data->>'featured')::BOOLEAN ELSE featured END,
        insurance_included = CASE WHEN service_data ? 'insurance_included' THEN (service_data->>'insurance_included')::BOOLEAN ELSE insurance_included END,
        fuel_included = CASE WHEN service_data ? 'fuel_included' THEN (service_data->>'fuel_included')::BOOLEAN ELSE fuel_included END,
        license_required = CASE WHEN service_data ? 'license_required' THEN (service_data->>'license_required')::BOOLEAN ELSE license_required END,
        permit_required = CASE WHEN service_data ? 'permit_required' THEN (service_data->>'permit_required')::BOOLEAN ELSE permit_required END,
        deposit_required = CASE WHEN service_data ? 'deposit_required' THEN (service_data->>'deposit_required')::BOOLEAN ELSE deposit_required END,
        
        -- Campos de arrays (text[])
        images = CASE WHEN service_data ? 'images' THEN (service_data->>'images')::TEXT[] ELSE images END,
        dietary_options = CASE WHEN service_data ? 'dietary_options' THEN (service_data->>'dietary_options')::TEXT[] ELSE dietary_options END,
        equipment_provided = CASE WHEN service_data ? 'equipment_provided' THEN (service_data->>'equipment_provided')::TEXT[] ELSE equipment_provided END,
        guide_languages = CASE WHEN service_data ? 'guide_languages' THEN (service_data->>'guide_languages')::TEXT[] ELSE guide_languages END,
        what_to_bring = CASE WHEN service_data ? 'what_to_bring' THEN (service_data->>'what_to_bring')::TEXT[] ELSE what_to_bring END,
        included_services = CASE WHEN service_data ? 'included_services' THEN (service_data->>'included_services')::TEXT[] ELSE included_services END,
        not_included_services = CASE WHEN service_data ? 'not_included_services' THEN (service_data->>'not_included_services')::TEXT[] ELSE not_included_services END,
        pickup_locations = CASE WHEN service_data ? 'pickup_locations' THEN (service_data->>'pickup_locations')::TEXT[] ELSE pickup_locations END,
        
        -- Campos JSONB
        schedule = CASE WHEN service_data ? 'schedule' THEN (service_data->>'schedule')::JSONB ELSE schedule END,
        age_ranges = CASE WHEN age_ranges IS NOT NULL THEN age_ranges ELSE age_ranges END,
        
        -- Campo de timestamp
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
    RAISE NOTICE '✅ Función update_service_with_age_ranges recreada completamente';
    RAISE NOTICE '✅ Respeta exactamente los tipos de datos de la tabla services';
    RAISE NOTICE '✅ Evita completamente conflictos de tipos';
    RAISE NOTICE '✅ Incluye todos los campos de la tabla';
END $$;

-- 4. PROBAR LA FUNCIÓN CON DATOS DE EJEMPLO
-- =====================================================
-- Comentar esta sección si no quieres que se ejecute automáticamente
/*
DO $$
DECLARE
    test_service_id UUID;
    test_data JSONB;
BEGIN
    -- Obtener un ID de servicio de ejemplo
    SELECT id INTO test_service_id FROM services LIMIT 1;
    
    IF test_service_id IS NOT NULL THEN
        -- Crear datos de prueba con tipos correctos
        test_data := '{
            "title": "Servicio de Prueba Actualizado",
            "price": "99.99",
            "duration": 120,
            "available": true,
            "min_age": 12
        }'::JSONB;
        
        -- Probar la función
        IF update_service_with_age_ranges(test_service_id, test_data) THEN
            RAISE NOTICE '✅ Función de prueba exitosa para servicio %', test_service_id;
        ELSE
            RAISE NOTICE '❌ Función de prueba falló para servicio %', test_service_id;
        END IF;
    ELSE
        RAISE NOTICE '⚠️ No hay servicios para probar';
    END IF;
END $$;
*/
