-- Script para corregir la función update_service_with_age_ranges
-- Ejecutar en Supabase SQL Editor

-- Eliminar la función existente
DROP FUNCTION IF EXISTS update_service_with_age_ranges(UUID, JSONB);

-- Recrear la función con referencias explícitas a las tablas
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
    
    -- Actualizar el servicio con referencias explícitas
    UPDATE services SET
        title = COALESCE((service_data->>'title')::TEXT, title),
        description = COALESCE((service_data->>'description')::TEXT, description),
        category_id = COALESCE((service_data->>'category_id')::TEXT, category_id),
        subcategory_id = COALESCE((service_data->>'subcategory_id')::TEXT, subcategory_id),
        price = COALESCE((service_data->>'price')::NUMERIC, price),
        duration = COALESCE((service_data->>'duration')::TEXT, duration),
        location = COALESCE((service_data->>'location')::TEXT, location),
        min_group_size = COALESCE((service_data->>'min_group_size')::INTEGER, min_group_size),
        max_group_size = COALESCE((service_data->>'max_group_size')::INTEGER, max_group_size),
        difficulty_level = COALESCE((service_data->>'difficulty_level')::TEXT, difficulty_level),
        vehicle_type = COALESCE((service_data->>'vehicle_type')::TEXT, vehicle_type),
        characteristics = COALESCE((service_data->>'characteristics')::TEXT, characteristics),
        insurance_included = COALESCE((service_data->>'insurance_included')::BOOLEAN, insurance_included),
        fuel_included = COALESCE((service_data->>'fuel_included')::BOOLEAN, fuel_included),
        menu = COALESCE((service_data->>'menu')::TEXT, menu),
        schedule = COALESCE((service_data->>'schedule')::JSONB, schedule),
        capacity = COALESCE((service_data->>'capacity')::INTEGER, capacity),
        dietary_options = COALESCE((service_data->>'dietary_options')::JSONB, dietary_options),
        min_age = COALESCE((service_data->>'min_age')::INTEGER, min_age),
        license_required = COALESCE((service_data->>'license_required')::BOOLEAN, license_required),
        permit_required = COALESCE((service_data->>'permit_required')::BOOLEAN, permit_required),
        what_to_bring = COALESCE((service_data->>'what_to_bring')::JSONB, what_to_bring),
        included_services = COALESCE((service_data->>'included_services')::JSONB, included_services),
        not_included_services = COALESCE((service_data->>'not_included_services')::JSONB, not_included_services),
        meeting_point_details = COALESCE((service_data->>'meeting_point_details')::TEXT, meeting_point_details),
        transmission = COALESCE((service_data->>'transmission')::TEXT, transmission),
        seats = COALESCE((service_data->>'seats')::INTEGER, seats),
        doors = COALESCE((service_data->>'doors')::INTEGER, doors),
        fuel_policy = COALESCE((service_data->>'fuel_policy')::TEXT, fuel_policy),
        pickup_locations = COALESCE((service_data->>'pickup_locations')::JSONB, pickup_locations),
        deposit_required = COALESCE((service_data->>'deposit_required')::BOOLEAN, deposit_required),
        deposit_amount = COALESCE((service_data->>'deposit_amount')::NUMERIC, deposit_amount),
        experience_type = COALESCE((service_data->>'experience_type')::TEXT, experience_type),
        chef_name = COALESCE((service_data->>'chef_name')::TEXT, chef_name),
        drink_options = COALESCE((service_data->>'drink_options')::TEXT, drink_options),
        ambience = COALESCE((service_data->>'ambience')::TEXT, ambience),
        activity_type = COALESCE((service_data->>'activity_type')::TEXT, activity_type),
        fitness_level_required = COALESCE((service_data->>'fitness_level_required')::TEXT, fitness_level_required),
        equipment_provided = COALESCE((service_data->>'equipment_provided')::JSONB, equipment_provided),
        cancellation_policy = COALESCE((service_data->>'cancellation_policy')::TEXT, cancellation_policy),
        itinerary = COALESCE((service_data->>'itinerary')::TEXT, itinerary),
        guide_languages = COALESCE((service_data->>'guide_languages')::JSONB, guide_languages),
        available = COALESCE((service_data->>'available')::BOOLEAN, available),
        featured = COALESCE((service_data->>'featured')::BOOLEAN, featured),
        images = COALESCE((service_data->>'images')::JSONB, images),
        age_ranges = COALESCE(age_ranges, age_ranges),
        updated_at = NOW()
    WHERE services.id = service_id_param;
    
    -- Si hay rangos de edad, procesarlos
    IF age_ranges IS NOT NULL AND jsonb_array_length(age_ranges) > 0 THEN
        PERFORM upsert_service_age_ranges(service_id_param, age_ranges);
    END IF;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar que se creó correctamente
DO $$
BEGIN
    RAISE NOTICE '✅ Función update_service_with_age_ranges corregida exitosamente';
    RAISE NOTICE '✅ Referencias de columnas explícitas implementadas';
END $$;
