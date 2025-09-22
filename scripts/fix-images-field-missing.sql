-- Script para corregir el campo images faltante en las funciones de servicios
-- Este script soluciona el problema de que las imágenes no se guardaban al crear/actualizar servicios

-- Problema identificado:
-- Las funciones create_service_simple y update_service_simple no incluían el campo 'images'
-- Las imágenes se subían correctamente al storage pero no se guardaban en la base de datos

-- Solución: Agregar el campo images a ambas funciones

-- Función create_service_simple actualizada con campo images
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
        images,  -- ✅ Campo agregado
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
            WHEN service_data->'schedule' IS NULL OR service_data->'schedule' = 'null'::jsonb THEN '{}'::JSONB
            ELSE service_data->'schedule'
        END,
        CASE 
            WHEN service_data->>'capacity' = '' OR service_data->>'capacity' IS NULL THEN NULL
            ELSE (service_data->>'capacity')::INTEGER 
        END,
        public.jsonb_to_text_array(service_data->'dietary_options'),
        CASE 
            WHEN service_data->>'min_age' = '' OR service_data->>'min_age' IS NULL THEN NULL
            ELSE (service_data->>'min_age')::INTEGER 
        END,
        COALESCE((service_data->>'license_required')::BOOLEAN, false),
        COALESCE((service_data->>'permit_required')::BOOLEAN, false),
        public.jsonb_to_text_array(service_data->'what_to_bring'),
        public.jsonb_to_text_array(service_data->'included_services'),
        public.jsonb_to_text_array(service_data->'not_included_services'),
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
        public.jsonb_to_text_array(service_data->'pickup_locations'),
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
        public.jsonb_to_text_array(service_data->'images'),  -- ✅ Campo agregado
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

-- Función update_service_simple actualizada con campo images
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
    
    -- Actualizar solo los campos que se proporcionaron con manejo correcto de arrays
    UPDATE public.services 
    SET 
        title = CASE WHEN service_data ? 'title' THEN service_data->>'title' ELSE title END,
        description = CASE WHEN service_data ? 'description' THEN service_data->>'description' ELSE description END,
        price = CASE WHEN service_data ? 'price' THEN (service_data->>'price')::DECIMAL ELSE price END,
        price_children = CASE WHEN service_data ? 'price_children' THEN (service_data->>'price_children')::DECIMAL ELSE price_children END,
        price_type = CASE WHEN service_data ? 'price_type' THEN service_data->>'price_type' ELSE price_type END,
        duration = CASE 
            WHEN service_data ? 'duration' AND service_data->>'duration' != '' AND service_data->>'duration' IS NOT NULL 
            THEN (service_data->>'duration')::INTEGER 
            WHEN service_data ? 'duration' AND (service_data->>'duration' = '' OR service_data->>'duration' IS NULL)
            THEN NULL
            ELSE duration 
        END,
        location = CASE WHEN service_data ? 'location' THEN service_data->>'location' ELSE location END,
        min_group_size = CASE 
            WHEN service_data ? 'min_group_size' AND service_data->>'min_group_size' != '' AND service_data->>'min_group_size' IS NOT NULL 
            THEN (service_data->>'min_group_size')::INTEGER 
            WHEN service_data ? 'min_group_size' AND (service_data->>'min_group_size' = '' OR service_data->>'min_group_size' IS NULL)
            THEN NULL
            ELSE min_group_size 
        END,
        max_group_size = CASE 
            WHEN service_data ? 'max_group_size' AND service_data->>'max_group_size' != '' AND service_data->>'max_group_size' IS NOT NULL 
            THEN (service_data->>'max_group_size')::INTEGER 
            WHEN service_data ? 'max_group_size' AND (service_data->>'max_group_size' = '' OR service_data->>'max_group_size' IS NULL)
            THEN NULL
            ELSE max_group_size 
        END,
        difficulty_level = CASE WHEN service_data ? 'difficulty_level' THEN service_data->>'difficulty_level' ELSE difficulty_level END,
        vehicle_type = CASE WHEN service_data ? 'vehicle_type' THEN service_data->>'vehicle_type' ELSE vehicle_type END,
        characteristics = CASE WHEN service_data ? 'characteristics' THEN service_data->>'characteristics' ELSE characteristics END,
        insurance_included = CASE WHEN service_data ? 'insurance_included' THEN (service_data->>'insurance_included')::BOOLEAN ELSE insurance_included END,
        fuel_included = CASE WHEN service_data ? 'fuel_included' THEN (service_data->>'fuel_included')::BOOLEAN ELSE fuel_included END,
        menu = CASE WHEN service_data ? 'menu' THEN service_data->>'menu' ELSE menu END,
        schedule = CASE 
            WHEN service_data ? 'schedule' AND service_data->'schedule' IS NOT NULL AND service_data->'schedule' != 'null'::jsonb
            THEN service_data->'schedule'
            WHEN service_data ? 'schedule' AND (service_data->'schedule' IS NULL OR service_data->'schedule' = 'null'::jsonb)
            THEN '{}'::JSONB
            ELSE schedule 
        END,
        capacity = CASE 
            WHEN service_data ? 'capacity' AND service_data->>'capacity' != '' AND service_data->>'capacity' IS NOT NULL 
            THEN (service_data->>'capacity')::INTEGER 
            WHEN service_data ? 'capacity' AND (service_data->>'capacity' = '' OR service_data->>'capacity' IS NULL)
            THEN NULL
            ELSE capacity 
        END,
        dietary_options = CASE 
            WHEN service_data ? 'dietary_options' THEN public.jsonb_to_text_array(service_data->'dietary_options')
            ELSE dietary_options 
        END,
        min_age = CASE 
            WHEN service_data ? 'min_age' AND service_data->>'min_age' != '' AND service_data->>'min_age' IS NOT NULL 
            THEN (service_data->>'min_age')::INTEGER 
            WHEN service_data ? 'min_age' AND (service_data->>'min_age' = '' OR service_data->>'min_age' IS NULL)
            THEN NULL
            ELSE min_age 
        END,
        license_required = CASE WHEN service_data ? 'license_required' THEN (service_data->>'license_required')::BOOLEAN ELSE license_required END,
        permit_required = CASE WHEN service_data ? 'permit_required' THEN (service_data->>'permit_required')::BOOLEAN ELSE permit_required END,
        what_to_bring = CASE 
            WHEN service_data ? 'what_to_bring' THEN public.jsonb_to_text_array(service_data->'what_to_bring')
            ELSE what_to_bring 
        END,
        included_services = CASE 
            WHEN service_data ? 'included_services' THEN public.jsonb_to_text_array(service_data->'included_services')
            ELSE included_services 
        END,
        not_included_services = CASE 
            WHEN service_data ? 'not_included_services' THEN public.jsonb_to_text_array(service_data->'not_included_services')
            ELSE not_included_services 
        END,
        meeting_point_details = CASE WHEN service_data ? 'meeting_point_details' THEN service_data->>'meeting_point_details' ELSE meeting_point_details END,
        transmission = CASE WHEN service_data ? 'transmission' THEN service_data->>'transmission' ELSE transmission END,
        seats = CASE 
            WHEN service_data ? 'seats' AND service_data->>'seats' != '' AND service_data->>'seats' IS NOT NULL 
            THEN (service_data->>'seats')::INTEGER 
            WHEN service_data ? 'seats' AND (service_data->>'seats' = '' OR service_data->>'seats' IS NULL)
            THEN NULL
            ELSE seats 
        END,
        doors = CASE 
            WHEN service_data ? 'doors' AND service_data->>'doors' != '' AND service_data->>'doors' IS NOT NULL 
            THEN (service_data->>'doors')::INTEGER 
            WHEN service_data ? 'doors' AND (service_data->>'doors' = '' OR service_data->>'doors' IS NULL)
            THEN NULL
            ELSE doors 
        END,
        fuel_policy = CASE WHEN service_data ? 'fuel_policy' THEN service_data->>'fuel_policy' ELSE fuel_policy END,
        pickup_locations = CASE 
            WHEN service_data ? 'pickup_locations' THEN public.jsonb_to_text_array(service_data->'pickup_locations')
            ELSE pickup_locations 
        END,
        deposit_required = CASE WHEN service_data ? 'deposit_required' THEN (service_data->>'deposit_required')::BOOLEAN ELSE deposit_required END,
        deposit_amount = CASE 
            WHEN service_data ? 'deposit_amount' AND service_data->>'deposit_amount' != '' AND service_data->>'deposit_amount' IS NOT NULL 
            THEN (service_data->>'deposit_amount')::DECIMAL 
            WHEN service_data ? 'deposit_amount' AND (service_data->>'deposit_amount' = '' OR service_data->>'deposit_amount' IS NULL)
            THEN NULL
            ELSE deposit_amount 
        END,
        experience_type = CASE WHEN service_data ? 'experience_type' THEN service_data->>'experience_type' ELSE experience_type END,
        chef_name = CASE WHEN service_data ? 'chef_name' THEN service_data->>'chef_name' ELSE chef_name END,
        drink_options = CASE WHEN service_data ? 'drink_options' THEN service_data->>'drink_options' ELSE drink_options END,
        ambience = CASE WHEN service_data ? 'ambience' THEN service_data->>'ambience' ELSE ambience END,
        activity_type = CASE WHEN service_data ? 'activity_type' THEN service_data->>'activity_type' ELSE activity_type END,
        category_id = CASE WHEN service_data ? 'category_id' THEN service_data->>'category_id' ELSE category_id END,
        subcategory_id = CASE WHEN service_data ? 'subcategory_id' THEN service_data->>'subcategory_id' ELSE subcategory_id END,
        images = CASE 
            WHEN service_data ? 'images' THEN public.jsonb_to_text_array(service_data->'images')  -- ✅ Campo agregado
            ELSE images 
        END,
        available = CASE WHEN service_data ? 'available' THEN (service_data->>'available')::BOOLEAN ELSE available END,
        featured = CASE WHEN service_data ? 'featured' THEN (service_data->>'featured')::BOOLEAN ELSE featured END,
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

-- Prueba de la función con imágenes
SELECT 'Prueba con imágenes:' as test_name;
SELECT public.create_service_simple('{
  "title": "Servicio de Prueba con Imágenes",
  "price": 50.00,
  "category_id": "actividades",
  "subcategory_id": "excursiones",
  "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
}'::jsonb) as result;

-- Verificar que las imágenes se guardaron
SELECT id, title, images FROM services WHERE title = 'Servicio de Prueba con Imágenes';

-- Limpiar servicio de prueba
-- DELETE FROM services WHERE title = 'Servicio de Prueba con Imágenes';
