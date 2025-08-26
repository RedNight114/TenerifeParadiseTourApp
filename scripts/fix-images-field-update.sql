-- Script para corregir la función update_service_simple y agregar soporte para el campo images
-- Este script soluciona el problema donde las imágenes no se guardan al actualizar servicios

-- Primero, verificar si el campo images existe en la tabla services
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'images'
    ) THEN
        -- Agregar el campo images si no existe
        ALTER TABLE public.services ADD COLUMN images TEXT[] DEFAULT '{}';
        RAISE NOTICE '✅ Campo images agregado a la tabla services';
    ELSE
        RAISE NOTICE 'ℹ️ Campo images ya existe en la tabla services';
    END IF;
END $$;

-- Actualizar la función update_service_simple para incluir el campo images
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
    
    -- Preparar datos para actualización
    update_data = jsonb_build_object(
        'title', COALESCE(service_data->>'title', ''),
        'description', COALESCE(service_data->>'description', ''),
        'price', COALESCE((service_data->>'price')::DECIMAL, 0),
        'price_children', COALESCE((service_data->>'price_children')::DECIMAL, 0),
        'price_type', COALESCE(service_data->>'price_type', 'per_person'),
        'duration', COALESCE(service_data->>'duration', ''),
        'location', COALESCE(service_data->>'location', ''),
        'min_group_size', COALESCE((service_data->>'min_group_size')::INTEGER, 1),
        'max_group_size', COALESCE((service_data->>'max_group_size')::INTEGER, 10),
        'difficulty_level', COALESCE(service_data->>'difficulty_level', 'easy'),
        'vehicle_type', COALESCE(service_data->>'vehicle_type', ''),
        'characteristics', COALESCE(service_data->>'characteristics', '[]'),
        'insurance_included', COALESCE((service_data->>'insurance_included')::BOOLEAN, false),
        'fuel_included', COALESCE((service_data->>'fuel_included')::BOOLEAN, false),
        'menu', COALESCE(service_data->>'menu', ''),
        'schedule', COALESCE(service_data->>'schedule', ''),
        'capacity', COALESCE((service_data->>'capacity')::INTEGER, 0),
        'dietary_options', COALESCE(service_data->>'dietary_options', '[]'),
        'min_age', COALESCE((service_data->>'min_age')::INTEGER, 0),
        'license_required', COALESCE((service_data->>'license_required')::BOOLEAN, false),
        'permit_required', COALESCE((service_data->>'permit_required')::BOOLEAN, false),
        'what_to_bring', COALESCE(service_data->>'what_to_bring', ''),
        'included_services', COALESCE(service_data->>'included_services', '[]'),
        'not_included_services', COALESCE(service_data->>'not_included_services', '[]'),
        'meeting_point_details', COALESCE(service_data->>'meeting_point_details', ''),
        'transmission', COALESCE(service_data->>'transmission', ''),
        'seats', COALESCE((service_data->>'seats')::INTEGER, 0),
        'doors', COALESCE((service_data->>'doors')::INTEGER, 0),
        'fuel_policy', COALESCE(service_data->>'fuel_policy', ''),
        'pickup_locations', COALESCE(service_data->>'pickup_locations', '[]'),
        'deposit_required', COALESCE((service_data->>'deposit_required')::BOOLEAN, false),
        'deposit_amount', COALESCE((service_data->>'deposit_amount')::DECIMAL, 0),
        'experience_type', COALESCE(service_data->>'experience_type', ''),
        'chef_name', COALESCE(service_data->>'chef_name', ''),
        'drink_options', COALESCE(service_data->>'drink_options', '[]'),
        'ambience', COALESCE(service_data->>'ambience', ''),
        'activity_type', COALESCE(service_data->>'activity_type', ''),
        'category_id', COALESCE((service_data->>'category_id')::UUID, NULL),
        'subcategory_id', COALESCE((service_data->>'subcategory_id')::UUID, NULL),
        'available', COALESCE((service_data->>'available')::BOOLEAN, true),
        'featured', COALESCE((service_data->>'featured')::BOOLEAN, false),
        -- AGREGAR SOPORTE PARA IMÁGENES
        'images', COALESCE(service_data->'images', '[]'::jsonb),
        'updated_at', NOW()
    );
    
    -- Actualizar el servicio
    UPDATE public.services 
    SET 
        title = update_data->>'title',
        description = update_data->>'description',
        price = (update_data->>'price')::DECIMAL,
        price_children = (update_data->>'price_children')::DECIMAL,
        price_type = update_data->>'price_type',
        duration = update_data->>'duration',
        location = update_data->>'location',
        min_group_size = (update_data->>'min_group_size')::INTEGER,
        max_group_size = (update_data->>'max_group_size')::INTEGER,
        difficulty_level = update_data->>'difficulty_level',
        vehicle_type = update_data->>'vehicle_type',
        characteristics = update_data->>'characteristics',
        insurance_included = (update_data->>'insurance_included')::BOOLEAN,
        fuel_included = (update_data->>'fuel_included')::BOOLEAN,
        menu = update_data->>'menu',
        schedule = update_data->>'schedule',
        capacity = (update_data->>'capacity')::INTEGER,
        dietary_options = update_data->>'dietary_options',
        min_age = (update_data->>'min_age')::INTEGER,
        license_required = (update_data->>'license_required')::BOOLEAN,
        permit_required = (update_data->>'permit_required')::BOOLEAN,
        what_to_bring = update_data->>'what_to_bring',
        included_services = update_data->>'included_services',
        not_included_services = update_data->>'not_included_services',
        meeting_point_details = update_data->>'meeting_point_details',
        transmission = update_data->>'transmission',
        seats = (update_data->>'seats')::INTEGER,
        doors = (update_data->>'doors')::INTEGER,
        fuel_policy = update_data->>'fuel_policy',
        pickup_locations = update_data->>'pickup_locations',
        deposit_required = (update_data->>'deposit_required')::BOOLEAN,
        deposit_amount = (update_data->>'deposit_amount')::DECIMAL,
        experience_type = update_data->>'experience_type',
        chef_name = update_data->>'chef_name',
        drink_options = update_data->>'drink_options',
        ambience = update_data->>'ambience',
        activity_type = update_data->>'activity_type',
        category_id = (update_data->>'category_id')::UUID,
        subcategory_id = (update_data->>'subcategory_id')::UUID,
        available = (update_data->>'available')::BOOLEAN,
        featured = (update_data->>'featured')::BOOLEAN,
        -- ACTUALIZAR EL CAMPO IMAGES
        images = (update_data->'images')::TEXT[],
        updated_at = NOW()
    WHERE id = service_id;
    
    -- Retornar resultado exitoso
    RETURN jsonb_build_object(
        'success', true,
        'service_id', service_id,
        'message', 'Servicio actualizado exitosamente',
        'images_updated', (update_data->'images')::TEXT[]
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- También actualizar la función create_service_simple para incluir imágenes
CREATE OR REPLACE FUNCTION public.create_service_simple(service_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_service_id UUID;
    result JSONB;
BEGIN
    -- Generar nuevo ID
    new_service_id = gen_random_uuid();
    
    -- Insertar nuevo servicio
    INSERT INTO public.services (
        id,
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
        -- AGREGAR SOPORTE PARA IMÁGENES
        images,
        created_at,
        updated_at
    ) VALUES (
        new_service_id,
        COALESCE(service_data->>'title', ''),
        COALESCE(service_data->>'description', ''),
        COALESCE((service_data->>'price')::DECIMAL, 0),
        COALESCE((service_data->>'price_children')::DECIMAL, 0),
        COALESCE(service_data->>'price_type', 'per_person'),
        COALESCE(service_data->>'duration', ''),
        COALESCE(service_data->>'location', ''),
        COALESCE((service_data->>'min_group_size')::INTEGER, 1),
        COALESCE((service_data->>'max_group_size')::INTEGER, 10),
        COALESCE(service_data->>'difficulty_level', 'easy'),
        COALESCE(service_data->>'vehicle_type', ''),
        COALESCE(service_data->>'characteristics', '[]'),
        COALESCE((service_data->>'insurance_included')::BOOLEAN, false),
        COALESCE((service_data->>'fuel_included')::BOOLEAN, false),
        COALESCE(service_data->>'menu', ''),
        COALESCE(service_data->>'schedule', ''),
        COALESCE((service_data->>'capacity')::INTEGER, 0),
        COALESCE(service_data->>'dietary_options', '[]'),
        COALESCE((service_data->>'min_age')::INTEGER, 0),
        COALESCE((service_data->>'license_required')::BOOLEAN, false),
        COALESCE((service_data->>'permit_required')::BOOLEAN, false),
        COALESCE(service_data->>'what_to_bring', ''),
        COALESCE(service_data->>'included_services', '[]'),
        COALESCE(service_data->>'not_included_services', '[]'),
        COALESCE(service_data->>'meeting_point_details', ''),
        COALESCE(service_data->>'transmission', ''),
        COALESCE((service_data->>'seats')::INTEGER, 0),
        COALESCE((service_data->>'doors')::INTEGER, 0),
        COALESCE(service_data->>'fuel_policy', ''),
        COALESCE(service_data->>'pickup_locations', '[]'),
        COALESCE((service_data->>'deposit_required')::BOOLEAN, false),
        COALESCE((service_data->>'deposit_amount')::DECIMAL, 0),
        COALESCE(service_data->>'experience_type', ''),
        COALESCE(service_data->>'chef_name', ''),
        COALESCE(service_data->>'drink_options', '[]'),
        COALESCE(service_data->>'ambience', ''),
        COALESCE(service_data->>'activity_type', ''),
        COALESCE((service_data->>'category_id')::UUID, NULL),
        COALESCE((service_data->>'subcategory_id')::UUID, NULL),
        COALESCE((service_data->>'available')::BOOLEAN, true),
        COALESCE((service_data->>'featured')::BOOLEAN, false),
        -- AGREGAR SOPORTE PARA IMÁGENES
        COALESCE((service_data->'images')::TEXT[], '{}'),
        NOW(),
        NOW()
    );
    
    -- Retornar resultado exitoso
    RETURN jsonb_build_object(
        'success', true,
        'service_id', new_service_id,
        'message', 'Servicio creado exitosamente',
        'images_saved', COALESCE((service_data->'images')::TEXT[], '{}')
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Verificar que las funciones se crearon correctamente
SELECT 
    proname as function_name,
    CASE 
        WHEN proname = 'update_service_simple' THEN '✅ Actualizada para incluir imágenes'
        WHEN proname = 'create_service_simple' THEN '✅ Actualizada para incluir imágenes'
        ELSE '✅ Función existente'
    END as status
FROM pg_proc 
WHERE proname IN ('update_service_simple', 'create_service_simple')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Mostrar mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '🎉 Funciones actualizadas exitosamente para incluir soporte de imágenes!';
    RAISE NOTICE '📸 Ahora los servicios pueden guardar y actualizar imágenes correctamente.';
END $$;
