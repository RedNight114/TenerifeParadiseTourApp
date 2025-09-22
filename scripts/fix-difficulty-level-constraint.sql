-- Script para corregir restricción de difficulty_level en servicios
-- Este script soluciona el error: "new row for relation \"services\" violates check constraint \"services_difficulty_level_check\""

-- Verificar la restricción actual
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'services'::regclass 
AND conname = 'services_difficulty_level_check';

-- La restricción permite solo estos valores:
-- 'facil', 'moderado', 'dificil'

-- Función corregida para crear servicios con validación
CREATE OR REPLACE FUNCTION public.create_service_simple(service_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_service_id UUID;
    result JSONB;
BEGIN
    -- Validar datos requeridos
    IF NOT (service_data ? 'title' AND service_data ? 'price') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Título y precio son requeridos'
        );
    END IF;
    
    -- Validar difficulty_level si se proporciona
    IF service_data ? 'difficulty_level' AND service_data->>'difficulty_level' IS NOT NULL THEN
        IF service_data->>'difficulty_level' NOT IN ('facil', 'moderado', 'dificil') THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'difficulty_level debe ser: facil, moderado o dificil'
            );
        END IF;
    END IF;
    
    -- Insertar el servicio con manejo correcto de tipos de datos
    INSERT INTO public.services (
        title,
        description,
        price,
        price_children,
        price_type,
        duration,
        location,
        min_group_size,
        max_group_size,
        difficulty_level,
        vehicle_type,
        characteristics,
        insurance_included,
        fuel_included,
        menu,
        schedule,
        capacity,
        dietary_options,
        min_age,
        license_required,
        permit_required,
        what_to_bring,
        included_services,
        not_included_services,
        meeting_point_details,
        transmission,
        seats,
        doors,
        fuel_policy,
        pickup_locations,
        deposit_required,
        deposit_amount,
        experience_type,
        chef_name,
        drink_options,
        ambience,
        activity_type,
        category_id,
        subcategory_id,
        available,
        featured,
        created_at,
        updated_at
    ) VALUES (
        COALESCE(service_data->>'title', ''),
        COALESCE(service_data->>'description', ''),
        COALESCE((service_data->>'price')::DECIMAL, 0),
        COALESCE((service_data->>'price_children')::DECIMAL, 0),
        COALESCE(service_data->>'price_type', 'per_person'),
        CASE 
            WHEN service_data->>'duration' = '' OR service_data->>'duration' IS NULL THEN NULL
            ELSE (service_data->>'duration')::INTEGER 
        END,
        COALESCE(service_data->>'location', ''),
        CASE 
            WHEN service_data->>'min_group_size' = '' OR service_data->>'min_group_size' IS NULL THEN NULL
            ELSE (service_data->>'min_group_size')::INTEGER 
        END,
        CASE 
            WHEN service_data->>'max_group_size' = '' OR service_data->>'max_group_size' IS NULL THEN NULL
            ELSE (service_data->>'max_group_size')::INTEGER 
        END,
        COALESCE(service_data->>'difficulty_level', 'facil'),
        COALESCE(service_data->>'vehicle_type', ''),
        COALESCE(service_data->>'characteristics', ''),
        COALESCE((service_data->>'insurance_included')::BOOLEAN, false),
        COALESCE((service_data->>'fuel_included')::BOOLEAN, false),
        COALESCE(service_data->>'menu', ''),
        CASE 
            WHEN service_data->>'schedule' = '' OR service_data->>'schedule' IS NULL THEN '{}'::JSONB
            ELSE (service_data->>'schedule')::JSONB 
        END,
        CASE 
            WHEN service_data->>'capacity' = '' OR service_data->>'capacity' IS NULL THEN NULL
            ELSE (service_data->>'capacity')::INTEGER 
        END,
        CASE 
            WHEN service_data->>'dietary_options' = '' OR service_data->>'dietary_options' IS NULL THEN '{}'::TEXT[]
            ELSE (service_data->>'dietary_options')::TEXT[] 
        END,
        CASE 
            WHEN service_data->>'min_age' = '' OR service_data->>'min_age' IS NULL THEN NULL
            ELSE (service_data->>'min_age')::INTEGER 
        END,
        COALESCE((service_data->>'license_required')::BOOLEAN, false),
        COALESCE((service_data->>'permit_required')::BOOLEAN, false),
        CASE 
            WHEN service_data->>'what_to_bring' = '' OR service_data->>'what_to_bring' IS NULL THEN '{}'::TEXT[]
            ELSE (service_data->>'what_to_bring')::TEXT[] 
        END,
        CASE 
            WHEN service_data->>'included_services' = '' OR service_data->>'included_services' IS NULL THEN '{}'::TEXT[]
            ELSE (service_data->>'included_services')::TEXT[] 
        END,
        CASE 
            WHEN service_data->>'not_included_services' = '' OR service_data->>'not_included_services' IS NULL THEN '{}'::TEXT[]
            ELSE (service_data->>'not_included_services')::TEXT[] 
        END,
        COALESCE(service_data->>'meeting_point_details', ''),
        COALESCE(service_data->>'transmission', ''),
        CASE 
            WHEN service_data->>'seats' = '' OR service_data->>'seats' IS NULL THEN NULL
            ELSE (service_data->>'seats')::INTEGER 
        END,
        CASE 
            WHEN service_data->>'doors' = '' OR service_data->>'doors' IS NULL THEN NULL
            ELSE (service_data->>'doors')::INTEGER 
        END,
        COALESCE(service_data->>'fuel_policy', ''),
        CASE 
            WHEN service_data->>'pickup_locations' = '' OR service_data->>'pickup_locations' IS NULL THEN '{}'::TEXT[]
            ELSE (service_data->>'pickup_locations')::TEXT[] 
        END,
        COALESCE((service_data->>'deposit_required')::BOOLEAN, false),
        CASE 
            WHEN service_data->>'deposit_amount' = '' OR service_data->>'deposit_amount' IS NULL THEN NULL
            ELSE (service_data->>'deposit_amount')::DECIMAL 
        END,
        COALESCE(service_data->>'experience_type', ''),
        COALESCE(service_data->>'chef_name', ''),
        COALESCE(service_data->>'drink_options', ''),
        COALESCE(service_data->>'ambience', ''),
        COALESCE(service_data->>'activity_type', ''),
        COALESCE(service_data->>'category_id', ''),
        COALESCE(service_data->>'subcategory_id', ''),
        COALESCE((service_data->>'available')::BOOLEAN, true),
        COALESCE((service_data->>'featured')::BOOLEAN, false),
        NOW(),
        NOW()
    ) RETURNING id INTO new_service_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'service_id', new_service_id,
        'message', 'Servicio creado exitosamente'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Función corregida para actualizar servicios
DROP FUNCTION IF EXISTS public.update_service_simple(UUID, JSONB);

CREATE OR REPLACE FUNCTION public.update_service_simple(service_id UUID, service_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    update_data JSONB;
BEGIN
    -- Verificar que el servicio existe
    IF NOT EXISTS (SELECT 1 FROM public.services WHERE id = service_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Servicio no encontrado'
        );
    END IF;
    
    -- Validar difficulty_level si se proporciona
    IF service_data ? 'difficulty_level' AND service_data->>'difficulty_level' IS NOT NULL THEN
        IF service_data->>'difficulty_level' NOT IN ('facil', 'moderado', 'dificil') THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'difficulty_level debe ser: facil, moderado o dificil'
            );
        END IF;
    END IF;
    
    -- Preparar datos para actualización con manejo correcto de tipos
    update_data = jsonb_build_object(
        'title', COALESCE(service_data->>'title', ''),
        'description', COALESCE(service_data->>'description', ''),
        'price', COALESCE((service_data->>'price')::DECIMAL, 0),
        'price_children', COALESCE((service_data->>'price_children')::DECIMAL, 0),
        'price_type', COALESCE(service_data->>'price_type', 'per_person'),
        'duration', CASE 
            WHEN service_data->>'duration' = '' OR service_data->>'duration' IS NULL THEN NULL
            ELSE (service_data->>'duration')::INTEGER 
        END,
        'location', COALESCE(service_data->>'location', ''),
        'min_group_size', CASE 
            WHEN service_data->>'min_group_size' = '' OR service_data->>'min_group_size' IS NULL THEN NULL
            ELSE (service_data->>'min_group_size')::INTEGER 
        END,
        'max_group_size', CASE 
            WHEN service_data->>'max_group_size' = '' OR service_data->>'max_group_size' IS NULL THEN NULL
            ELSE (service_data->>'max_group_size')::INTEGER 
        END,
        'difficulty_level', COALESCE(service_data->>'difficulty_level', 'facil'),
        'vehicle_type', COALESCE(service_data->>'vehicle_type', ''),
        'characteristics', COALESCE(service_data->>'characteristics', ''),
        'insurance_included', COALESCE((service_data->>'insurance_included')::BOOLEAN, false),
        'fuel_included', COALESCE((service_data->>'fuel_included')::BOOLEAN, false),
        'menu', COALESCE(service_data->>'menu', ''),
        'schedule', CASE 
            WHEN service_data->>'schedule' = '' OR service_data->>'schedule' IS NULL THEN '{}'::JSONB
            ELSE (service_data->>'schedule')::JSONB 
        END,
        'capacity', CASE 
            WHEN service_data->>'capacity' = '' OR service_data->>'capacity' IS NULL THEN NULL
            ELSE (service_data->>'capacity')::INTEGER 
        END,
        'dietary_options', CASE 
            WHEN service_data->>'dietary_options' = '' OR service_data->>'dietary_options' IS NULL THEN '{}'::TEXT[]
            ELSE (service_data->>'dietary_options')::TEXT[] 
        END,
        'min_age', CASE 
            WHEN service_data->>'min_age' = '' OR service_data->>'min_age' IS NULL THEN NULL
            ELSE (service_data->>'min_age')::INTEGER 
        END,
        'license_required', COALESCE((service_data->>'license_required')::BOOLEAN, false),
        'permit_required', COALESCE((service_data->>'permit_required')::BOOLEAN, false),
        'what_to_bring', CASE 
            WHEN service_data->>'what_to_bring' = '' OR service_data->>'what_to_bring' IS NULL THEN '{}'::TEXT[]
            ELSE (service_data->>'what_to_bring')::TEXT[] 
        END,
        'included_services', CASE 
            WHEN service_data->>'included_services' = '' OR service_data->>'included_services' IS NULL THEN '{}'::TEXT[]
            ELSE (service_data->>'included_services')::TEXT[] 
        END,
        'not_included_services', CASE 
            WHEN service_data->>'not_included_services' = '' OR service_data->>'not_included_services' IS NULL THEN '{}'::TEXT[]
            ELSE (service_data->>'not_included_services')::TEXT[] 
        END,
        'meeting_point_details', COALESCE(service_data->>'meeting_point_details', ''),
        'transmission', COALESCE(service_data->>'transmission', ''),
        'seats', CASE 
            WHEN service_data->>'seats' = '' OR service_data->>'seats' IS NULL THEN NULL
            ELSE (service_data->>'seats')::INTEGER 
        END,
        'doors', CASE 
            WHEN service_data->>'doors' = '' OR service_data->>'doors' IS NULL THEN NULL
            ELSE (service_data->>'doors')::INTEGER 
        END,
        'fuel_policy', COALESCE(service_data->>'fuel_policy', ''),
        'pickup_locations', CASE 
            WHEN service_data->>'pickup_locations' = '' OR service_data->>'pickup_locations' IS NULL THEN '{}'::TEXT[]
            ELSE (service_data->>'pickup_locations')::TEXT[] 
        END,
        'deposit_required', COALESCE((service_data->>'deposit_required')::BOOLEAN, false),
        'deposit_amount', CASE 
            WHEN service_data->>'deposit_amount' = '' OR service_data->>'deposit_amount' IS NULL THEN NULL
            ELSE (service_data->>'deposit_amount')::DECIMAL 
        END,
        'experience_type', COALESCE(service_data->>'experience_type', ''),
        'chef_name', COALESCE(service_data->>'chef_name', ''),
        'drink_options', COALESCE(service_data->>'drink_options', ''),
        'ambience', COALESCE(service_data->>'ambience', ''),
        'activity_type', COALESCE(service_data->>'activity_type', ''),
        'category_id', COALESCE(service_data->>'category_id', ''),
        'subcategory_id', COALESCE(service_data->>'subcategory_id', ''),
        'available', COALESCE((service_data->>'available')::BOOLEAN, true),
        'featured', COALESCE((service_data->>'featured')::BOOLEAN, false),
        'updated_at', NOW()
    );
    
    -- Actualizar solo los campos que se proporcionaron
    UPDATE public.services 
    SET 
        title = CASE WHEN service_data ? 'title' THEN update_data->>'title' ELSE title END,
        description = CASE WHEN service_data ? 'description' THEN update_data->>'description' ELSE description END,
        price = CASE WHEN service_data ? 'price' THEN (update_data->>'price')::DECIMAL ELSE price END,
        price_children = CASE WHEN service_data ? 'price_children' THEN (update_data->>'price_children')::DECIMAL ELSE price_children END,
        price_type = CASE WHEN service_data ? 'price_type' THEN update_data->>'price_type' ELSE price_type END,
        duration = CASE WHEN service_data ? 'duration' THEN (update_data->>'duration')::INTEGER ELSE duration END,
        location = CASE WHEN service_data ? 'location' THEN update_data->>'location' ELSE location END,
        min_group_size = CASE WHEN service_data ? 'min_group_size' THEN (update_data->>'min_group_size')::INTEGER ELSE min_group_size END,
        max_group_size = CASE WHEN service_data ? 'max_group_size' THEN (update_data->>'max_group_size')::INTEGER ELSE max_group_size END,
        difficulty_level = CASE WHEN service_data ? 'difficulty_level' THEN update_data->>'difficulty_level' ELSE difficulty_level END,
        vehicle_type = CASE WHEN service_data ? 'vehicle_type' THEN update_data->>'vehicle_type' ELSE vehicle_type END,
        characteristics = CASE WHEN service_data ? 'characteristics' THEN update_data->>'characteristics' ELSE characteristics END,
        insurance_included = CASE WHEN service_data ? 'insurance_included' THEN (update_data->>'insurance_included')::BOOLEAN ELSE insurance_included END,
        fuel_included = CASE WHEN service_data ? 'fuel_included' THEN (update_data->>'fuel_included')::BOOLEAN ELSE fuel_included END,
        menu = CASE WHEN service_data ? 'menu' THEN update_data->>'menu' ELSE menu END,
        schedule = CASE WHEN service_data ? 'schedule' THEN (update_data->>'schedule')::JSONB ELSE schedule END,
        capacity = CASE WHEN service_data ? 'capacity' THEN (update_data->>'capacity')::INTEGER ELSE capacity END,
        dietary_options = CASE WHEN service_data ? 'dietary_options' THEN (update_data->>'dietary_options')::TEXT[] ELSE dietary_options END,
        min_age = CASE WHEN service_data ? 'min_age' THEN (update_data->>'min_age')::INTEGER ELSE min_age END,
        license_required = CASE WHEN service_data ? 'license_required' THEN (update_data->>'license_required')::BOOLEAN ELSE license_required END,
        permit_required = CASE WHEN service_data ? 'permit_required' THEN (update_data->>'permit_required')::BOOLEAN ELSE permit_required END,
        what_to_bring = CASE WHEN service_data ? 'what_to_bring' THEN (update_data->>'what_to_bring')::TEXT[] ELSE what_to_bring END,
        included_services = CASE WHEN service_data ? 'included_services' THEN (update_data->>'included_services')::TEXT[] ELSE included_services END,
        not_included_services = CASE WHEN service_data ? 'not_included_services' THEN (update_data->>'not_included_services')::TEXT[] ELSE not_included_services END,
        meeting_point_details = CASE WHEN service_data ? 'meeting_point_details' THEN update_data->>'meeting_point_details' ELSE meeting_point_details END,
        transmission = CASE WHEN service_data ? 'transmission' THEN update_data->>'transmission' ELSE transmission END,
        seats = CASE WHEN service_data ? 'seats' THEN (update_data->>'seats')::INTEGER ELSE seats END,
        doors = CASE WHEN service_data ? 'doors' THEN (update_data->>'doors')::INTEGER ELSE doors END,
        fuel_policy = CASE WHEN service_data ? 'fuel_policy' THEN update_data->>'fuel_policy' ELSE fuel_policy END,
        pickup_locations = CASE WHEN service_data ? 'pickup_locations' THEN (update_data->>'pickup_locations')::TEXT[] ELSE pickup_locations END,
        deposit_required = CASE WHEN service_data ? 'deposit_required' THEN (update_data->>'deposit_required')::BOOLEAN ELSE deposit_required END,
        deposit_amount = CASE WHEN service_data ? 'deposit_amount' THEN (update_data->>'deposit_amount')::DECIMAL ELSE deposit_amount END,
        experience_type = CASE WHEN service_data ? 'experience_type' THEN update_data->>'experience_type' ELSE experience_type END,
        chef_name = CASE WHEN service_data ? 'chef_name' THEN update_data->>'chef_name' ELSE chef_name END,
        drink_options = CASE WHEN service_data ? 'drink_options' THEN update_data->>'drink_options' ELSE drink_options END,
        ambience = CASE WHEN service_data ? 'ambience' THEN update_data->>'ambience' ELSE ambience END,
        activity_type = CASE WHEN service_data ? 'activity_type' THEN update_data->>'activity_type' ELSE activity_type END,
        category_id = CASE WHEN service_data ? 'category_id' THEN update_data->>'category_id' ELSE category_id END,
        subcategory_id = CASE WHEN service_data ? 'subcategory_id' THEN update_data->>'subcategory_id' ELSE subcategory_id END,
        available = CASE WHEN service_data ? 'available' THEN (update_data->>'available')::BOOLEAN ELSE available END,
        featured = CASE WHEN service_data ? 'featured' THEN (update_data->>'featured')::BOOLEAN ELSE featured END,
        updated_at = NOW()
    WHERE id = service_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Servicio actualizado exitosamente'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Prueba de la función con datos válidos
SELECT 'Prueba con datos válidos:' as test_name;
SELECT public.create_service_simple('{
  "title": "Servicio de Prueba",
  "description": "Descripción del servicio de prueba",
  "price": 50.00,
  "difficulty_level": "facil",
  "category_id": "actividades",
  "subcategory_id": "aventura"
}'::jsonb) as result;

-- Prueba de la función con datos inválidos
SELECT 'Prueba con difficulty_level inválido:' as test_name;
SELECT public.create_service_simple('{
  "title": "Servicio de Prueba Inválido",
  "description": "Descripción del servicio de prueba",
  "price": 50.00,
  "difficulty_level": "easy",
  "category_id": "actividades",
  "subcategory_id": "aventura"
}'::jsonb) as result;

-- Limpiar servicios de prueba
-- DELETE FROM public.services WHERE title LIKE 'Servicio de Prueba%';
