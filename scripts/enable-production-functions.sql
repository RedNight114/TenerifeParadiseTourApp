-- HABILITAR FUNCIONES DE PRODUCCIÓN PARA SERVICIOS
-- Ejecuta este script en Supabase SQL Editor
-- =====================================================

-- 1. VERIFICAR QUE LAS FUNCIONES SQL ESTÉN DISPONIBLES
-- =====================================================
DO $$
BEGIN
    -- Verificar función upsert_service_age_ranges
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' AND p.proname = 'upsert_service_age_ranges'
    ) THEN
        RAISE EXCEPTION '❌ Función upsert_service_age_ranges no encontrada. Ejecuta primero fix-function-types.sql';
    END IF;
    
    -- Verificar función get_service_age_ranges
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' AND p.proname = 'get_service_age_ranges'
    ) THEN
        RAISE EXCEPTION '❌ Función get_service_age_ranges no encontrada. Ejecuta primero fix-function-types.sql';
    END IF;
    
    RAISE NOTICE '✅ Funciones SQL verificadas correctamente';
END $$;

-- 2. CREAR FUNCIÓN PARA INSERTAR SERVICIOS CON RANGOS DE EDAD
-- =====================================================
CREATE OR REPLACE FUNCTION create_service_with_age_ranges(
    service_data JSONB
) RETURNS UUID AS $$
DECLARE
    new_service_id UUID;
    age_ranges JSONB;
BEGIN
    -- Extraer rangos de edad del JSON
    age_ranges := service_data->'age_ranges';
    
    -- Remover rangos de edad del JSON para insertar solo en services
    service_data := service_data - 'age_ranges';
    
    -- Insertar el servicio
    INSERT INTO services (title, description, category_id, subcategory_id, price, 
                         duration, location, min_group_size, max_group_size, 
                         difficulty_level, vehicle_type, characteristics, 
                         insurance_included, fuel_included, menu, schedule, 
                         capacity, dietary_options, min_age, license_required, 
                         permit_required, what_to_bring, included_services, 
                         not_included_services, meeting_point_details, 
                         transmission, seats, doors, fuel_policy, 
                         pickup_locations, deposit_required, deposit_amount, 
                         experience_type, chef_name, drink_options, ambience, 
                         activity_type, fitness_level_required, equipment_provided, 
                         cancellation_policy, itinerary, guide_languages, 
                         available, featured, images, age_ranges)
    VALUES (
        (service_data->>'title')::TEXT,
        (service_data->>'description')::TEXT,
        (service_data->>'category_id')::TEXT,
        (service_data->>'subcategory_id')::TEXT,
        (service_data->>'price')::NUMERIC,
        (service_data->>'duration')::TEXT,
        (service_data->>'location')::TEXT,
        (service_data->>'min_group_size')::INTEGER,
        (service_data->>'max_group_size')::INTEGER,
        (service_data->>'difficulty_level')::TEXT,
        (service_data->>'vehicle_type')::TEXT,
        (service_data->>'characteristics')::TEXT,
        (service_data->>'insurance_included')::BOOLEAN,
        (service_data->>'fuel_included')::BOOLEAN,
        (service_data->>'menu')::TEXT,
        (service_data->>'schedule')::JSONB,
        (service_data->>'capacity')::INTEGER,
        (service_data->>'dietary_options')::JSONB,
        (service_data->>'min_age')::INTEGER,
        (service_data->>'license_required')::BOOLEAN,
        (service_data->>'permit_required')::BOOLEAN,
        (service_data->>'what_to_bring')::JSONB,
        (service_data->>'included_services')::JSONB,
        (service_data->>'not_included_services')::JSONB,
        (service_data->>'meeting_point_details')::TEXT,
        (service_data->>'transmission')::TEXT,
        (service_data->>'seats')::INTEGER,
        (service_data->>'doors')::INTEGER,
        (service_data->>'fuel_policy')::TEXT,
        (service_data->>'pickup_locations')::JSONB,
        (service_data->>'deposit_required')::BOOLEAN,
        (service_data->>'deposit_amount')::NUMERIC,
        (service_data->>'experience_type')::TEXT,
        (service_data->>'chef_name')::TEXT,
        (service_data->>'drink_options')::TEXT,
        (service_data->>'ambience')::TEXT,
        (service_data->>'activity_type')::TEXT,
        (service_data->>'fitness_level_required')::TEXT,
        (service_data->>'equipment_provided')::JSONB,
        (service_data->>'cancellation_policy')::TEXT,
        (service_data->>'itinerary')::TEXT,
        (service_data->>'guide_languages')::JSONB,
        (service_data->>'available')::BOOLEAN,
        (service_data->>'featured')::BOOLEAN,
        (service_data->>'images')::JSONB,
        age_ranges
    ) RETURNING id INTO new_service_id;
    
    -- Si hay rangos de edad, procesarlos
    IF age_ranges IS NOT NULL AND jsonb_array_length(age_ranges) > 0 THEN
        PERFORM upsert_service_age_ranges(new_service_id, age_ranges);
    END IF;
    
    RETURN new_service_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CREAR FUNCIÓN PARA ACTUALIZAR SERVICIOS CON RANGOS DE EDAD
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
    
    -- Remover rangos de edad del JSON para actualizar solo en services
    service_data := service_data - 'age_ranges';
    
    -- Actualizar el servicio
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
    WHERE id = service_id;
    
    -- Si hay rangos de edad, procesarlos
    IF age_ranges IS NOT NULL AND jsonb_array_length(age_ranges) > 0 THEN
        PERFORM upsert_service_age_ranges(service_id, age_ranges);
    END IF;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CREAR FUNCIÓN PARA ELIMINAR SERVICIOS
-- =====================================================
CREATE OR REPLACE FUNCTION delete_service_complete(
    service_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    -- Primero eliminar rangos de edad asociados
    DELETE FROM age_price_ranges WHERE service_id = delete_service_complete.service_id;
    
    -- Luego eliminar el servicio
    DELETE FROM services WHERE id = delete_service_complete.service_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. VERIFICAR IMPLEMENTACIÓN
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Sistema de producción habilitado correctamente';
    RAISE NOTICE '✅ Función create_service_with_age_ranges creada';
    RAISE NOTICE '✅ Función update_service_with_age_ranges creada';
    RAISE NOTICE '✅ Función delete_service_complete creada';
    RAISE NOTICE '✅ Sistema listo para producción';
END $$;
