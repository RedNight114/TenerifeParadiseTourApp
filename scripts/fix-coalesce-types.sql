-- Script para corregir los tipos de COALESCE en update_service_with_age_ranges
-- Ejecutar en Supabase SQL Editor
-- SOLUCIONA el error "COALESCE types text and integer cannot be matched"

-- =====================================================
-- 1. ELIMINAR FUNCIÓN EXISTENTE
-- =====================================================

DROP FUNCTION IF EXISTS update_service_with_age_ranges(uuid, jsonb);

-- =====================================================
-- 2. RECREAR FUNCIÓN CON TIPOS CORRECTOS
-- =====================================================

CREATE OR REPLACE FUNCTION update_service_with_age_ranges(
    service_id_param UUID,
    service_data JSONB
) RETURNS BOOLEAN AS $$
DECLARE
    age_ranges JSONB;
BEGIN
    -- Extraer rangos de edad del JSON
    age_ranges := service_data->'age_ranges';
    
    -- Remover rangos de edad del JSON para actualizar solo en services
    service_data := service_data - 'age_ranges';
    
    -- Actualizar el servicio con tipos explícitos y seguros
    UPDATE services SET
        title = CASE 
            WHEN service_data->>'title' IS NOT NULL THEN (service_data->>'title')::TEXT 
            ELSE title 
        END,
        description = CASE 
            WHEN service_data->>'description' IS NOT NULL THEN (service_data->>'description')::TEXT 
            ELSE description 
        END,
        category_id = CASE 
            WHEN service_data->>'category_id' IS NOT NULL THEN (service_data->>'category_id')::TEXT 
            ELSE category_id 
        END,
        subcategory_id = CASE 
            WHEN service_data->>'subcategory_id' IS NOT NULL THEN (service_data->>'subcategory_id')::TEXT 
            ELSE subcategory_id 
        END,
        price = CASE 
            WHEN service_data->>'price' IS NOT NULL THEN (service_data->>'price')::NUMERIC 
            ELSE price 
        END,
        duration = CASE 
            WHEN service_data->>'duration' IS NOT NULL THEN (service_data->>'duration')::TEXT 
            ELSE duration 
        END,
        location = CASE 
            WHEN service_data->>'location' IS NOT NULL THEN (service_data->>'location')::TEXT 
            ELSE location 
        END,
        min_group_size = CASE 
            WHEN service_data->>'min_group_size' IS NOT NULL THEN (service_data->>'min_group_size')::INTEGER 
            ELSE min_group_size 
        END,
        max_group_size = CASE 
            WHEN service_data->>'max_group_size' IS NOT NULL THEN (service_data->>'max_group_size')::INTEGER 
            ELSE max_group_size 
        END,
        difficulty_level = CASE 
            WHEN service_data->>'difficulty_level' IS NOT NULL THEN (service_data->>'difficulty_level')::TEXT 
            ELSE difficulty_level 
        END,
        vehicle_type = CASE 
            WHEN service_data->>'vehicle_type' IS NOT NULL THEN (service_data->>'vehicle_type')::TEXT 
            ELSE vehicle_type 
        END,
        characteristics = CASE 
            WHEN service_data->>'characteristics' IS NOT NULL THEN (service_data->>'characteristics')::TEXT 
            ELSE characteristics 
        END,
        insurance_included = CASE 
            WHEN service_data->>'insurance_included' IS NOT NULL THEN (service_data->>'insurance_included')::BOOLEAN 
            ELSE insurance_included 
        END,
        fuel_included = CASE 
            WHEN service_data->>'fuel_included' IS NOT NULL THEN (service_data->>'fuel_included')::BOOLEAN 
            ELSE fuel_included 
        END,
        menu = CASE 
            WHEN service_data->>'menu' IS NOT NULL THEN (service_data->>'menu')::TEXT 
            ELSE menu 
        END,
        schedule = CASE 
            WHEN service_data->>'schedule' IS NOT NULL THEN (service_data->>'schedule')::JSONB 
            ELSE schedule 
        END,
        capacity = CASE 
            WHEN service_data->>'capacity' IS NOT NULL THEN (service_data->>'capacity')::INTEGER 
            ELSE capacity 
        END,
        dietary_options = CASE 
            WHEN service_data->>'dietary_options' IS NOT NULL THEN (service_data->>'dietary_options')::JSONB 
            ELSE dietary_options 
        END,
        min_age = CASE 
            WHEN service_data->>'min_age' IS NOT NULL THEN (service_data->>'min_age')::INTEGER 
            ELSE min_age 
        END,
        license_required = CASE 
            WHEN service_data->>'license_required' IS NOT NULL THEN (service_data->>'license_required')::BOOLEAN 
            ELSE license_required 
        END,
        permit_required = CASE 
            WHEN service_data->>'permit_required' IS NOT NULL THEN (service_data->>'permit_required')::BOOLEAN 
            ELSE permit_required 
        END,
        what_to_bring = CASE 
            WHEN service_data->>'what_to_bring' IS NOT NULL THEN (service_data->>'what_to_bring')::JSONB 
            ELSE what_to_bring 
        END,
        included_services = CASE 
            WHEN service_data->>'included_services' IS NOT NULL THEN (service_data->>'included_services')::JSONB 
            ELSE included_services 
        END,
        not_included_services = CASE 
            WHEN service_data->>'not_included_services' IS NOT NULL THEN (service_data->>'not_included_services')::JSONB 
            ELSE not_included_services 
        END,
        meeting_point_details = CASE 
            WHEN service_data->>'meeting_point_details' IS NOT NULL THEN (service_data->>'meeting_point_details')::TEXT 
            ELSE meeting_point_details 
        END,
        transmission = CASE 
            WHEN service_data->>'transmission' IS NOT NULL THEN (service_data->>'transmission')::TEXT 
            ELSE transmission 
        END,
        seats = CASE 
            WHEN service_data->>'seats' IS NOT NULL THEN (service_data->>'seats')::INTEGER 
            ELSE seats 
        END,
        doors = CASE 
            WHEN service_data->>'doors' IS NOT NULL THEN (service_data->>'doors')::INTEGER 
            ELSE doors 
        END,
        fuel_policy = CASE 
            WHEN service_data->>'fuel_policy' IS NOT NULL THEN (service_data->>'fuel_policy')::TEXT 
            ELSE fuel_policy 
        END,
        pickup_locations = CASE 
            WHEN service_data->>'pickup_locations' IS NOT NULL THEN (service_data->>'pickup_locations')::JSONB 
            ELSE pickup_locations 
        END,
        deposit_required = CASE 
            WHEN service_data->>'deposit_required' IS NOT NULL THEN (service_data->>'deposit_required')::BOOLEAN 
            ELSE deposit_required 
        END,
        deposit_amount = CASE 
            WHEN service_data->>'deposit_amount' IS NOT NULL THEN (service_data->>'deposit_amount')::NUMERIC 
            ELSE deposit_amount 
        END,
        experience_type = CASE 
            WHEN service_data->>'experience_type' IS NOT NULL THEN (service_data->>'experience_type')::TEXT 
            ELSE experience_type 
        END,
        chef_name = CASE 
            WHEN service_data->>'chef_name' IS NOT NULL THEN (service_data->>'chef_name')::TEXT 
            ELSE chef_name 
        END,
        drink_options = CASE 
            WHEN service_data->>'drink_options' IS NOT NULL THEN (service_data->>'drink_options')::TEXT 
            ELSE drink_options 
        END,
        ambience = CASE 
            WHEN service_data->>'ambience' IS NOT NULL THEN (service_data->>'ambience')::TEXT 
            ELSE ambience 
        END,
        activity_type = CASE 
            WHEN service_data->>'activity_type' IS NOT NULL THEN (service_data->>'activity_type')::TEXT 
            ELSE activity_type 
        END,
        fitness_level_required = CASE 
            WHEN service_data->>'fitness_level_required' IS NOT NULL THEN (service_data->>'fitness_level_required')::TEXT 
            ELSE fitness_level_required 
        END,
        equipment_provided = CASE 
            WHEN service_data->>'equipment_provided' IS NOT NULL THEN (service_data->>'equipment_provided')::JSONB 
            ELSE equipment_provided 
        END,
        cancellation_policy = CASE 
            WHEN service_data->>'cancellation_policy' IS NOT NULL THEN (service_data->>'cancellation_policy')::TEXT 
            ELSE cancellation_policy 
        END,
        itinerary = CASE 
            WHEN service_data->>'itinerary' IS NOT NULL THEN (service_data->>'itinerary')::TEXT 
            ELSE itinerary 
        END,
        guide_languages = CASE 
            WHEN service_data->>'guide_languages' IS NOT NULL THEN (service_data->>'guide_languages')::JSONB 
            ELSE guide_languages 
        END,
        available = CASE 
            WHEN service_data->>'available' IS NOT NULL THEN (service_data->>'available')::BOOLEAN 
            ELSE available 
        END,
        featured = CASE 
            WHEN service_data->>'featured' IS NOT NULL THEN (service_data->>'featured')::BOOLEAN 
            ELSE featured 
        END,
        images = CASE 
            WHEN service_data->>'images' IS NOT NULL THEN (service_data->>'images')::JSONB 
            ELSE images 
        END,
        age_ranges = CASE 
            WHEN age_ranges IS NOT NULL THEN age_ranges 
            ELSE age_ranges 
        END,
        updated_at = NOW()
    WHERE services.id = service_id_param;
    
    -- Si hay rangos de edad, procesarlos
    IF age_ranges IS NOT NULL AND jsonb_array_length(age_ranges) > 0 THEN
        PERFORM upsert_service_age_ranges(service_id_param, age_ranges);
    END IF;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. VERIFICAR IMPLEMENTACIÓN
-- =====================================================

-- Verificar que la función se creó correctamente
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
    AND p.proname = 'update_service_with_age_ranges';

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Función update_service_with_age_ranges corregida exitosamente';
    RAISE NOTICE '✅ Tipos de COALESCE corregidos con CASE WHEN';
    RAISE NOTICE '✅ Sistema listo para actualizar servicios';
END $$;
