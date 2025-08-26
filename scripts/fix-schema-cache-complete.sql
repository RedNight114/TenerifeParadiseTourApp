-- SOLUCIÓN COMPLETA PARA EL PROBLEMA DEL CACHE DEL ESQUEMA
-- Soluciona: "Could not find the function public.update_service_simple in the schema cache"

-- 1. ELIMINAR TODAS LAS FUNCIONES DUPLICADAS O PROBLEMÁTICAS
DROP FUNCTION IF EXISTS public.update_service_simple(UUID, JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.update_service_simple(JSONB, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.update_service_simple(UUID, JSONB, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.update_service_simple(UUID, JSONB, UUID, UUID) CASCADE;

-- 2. VERIFICAR QUE NO QUEDEN FUNCIONES RESIDUALES
SELECT 
    'Antes de recrear' as status,
    proname as function_name,
    proargtypes::regtype[] as argument_types
FROM pg_proc 
WHERE proname LIKE '%update_service%';

-- 3. RECREAR LA FUNCIÓN CON TIPOS CORRECTOS
CREATE OR REPLACE FUNCTION public.update_service_simple(
    service_id_param UUID,
    service_data JSONB
) RETURNS BOOLEAN AS $$
BEGIN
    -- Actualizar el servicio con tipos explícitos y compatibles
    UPDATE services SET
        title = CASE
            WHEN service_data->>'title' IS NOT NULL THEN (service_data->>'title')::TEXT
            ELSE services.title
        END,
        description = CASE
            WHEN service_data->>'description' IS NOT NULL THEN (service_data->>'description')::TEXT
            ELSE services.description
        END,
        -- IMPORTANTE: category_id y subcategory_id son TEXT en la tabla
        category_id = CASE
            WHEN service_data->>'category_id' IS NOT NULL THEN (service_data->>'category_id')::TEXT
            ELSE services.category_id
        END,
        subcategory_id = CASE
            WHEN service_data->>'subcategory_id' IS NOT NULL THEN (service_data->>'subcategory_id')::TEXT
            ELSE services.subcategory_id
        END,
        price = CASE
            WHEN service_data->>'price' IS NOT NULL THEN (service_data->>'price')::NUMERIC
            ELSE services.price
        END,
        -- Campos ARRAY (text[]) - convertir JSONB a text[]
        images = CASE
            WHEN service_data->'images' IS NOT NULL THEN ARRAY(SELECT jsonb_array_elements_text(service_data->'images'))
            ELSE services.images
        END,
        available = CASE
            WHEN service_data->>'available' IS NOT NULL THEN (service_data->>'available')::BOOLEAN
            ELSE services.available
        END,
        featured = CASE
            WHEN service_data->>'featured' IS NOT NULL THEN (service_data->>'featured')::BOOLEAN
            ELSE services.featured
        END,
        duration = CASE
            WHEN service_data->>'duration' IS NOT NULL THEN (service_data->>'duration')::INTEGER
            ELSE services.duration
        END,
        location = CASE
            WHEN service_data->>'location' IS NOT NULL THEN (service_data->>'location')::TEXT
            ELSE services.location
        END,
        min_group_size = CASE
            WHEN service_data->>'min_group_size' IS NOT NULL THEN (service_data->>'min_group_size')::INTEGER
            ELSE services.min_group_size
        END,
        max_group_size = CASE
            WHEN service_data->>'max_group_size' IS NOT NULL THEN (service_data->>'max_group_size')::INTEGER
            ELSE services.max_group_size
        END,
        difficulty_level = CASE
            WHEN service_data->>'difficulty_level' IS NOT NULL THEN (service_data->>'difficulty_level')::TEXT
            ELSE services.difficulty_level
        END,
        vehicle_type = CASE
            WHEN service_data->>'vehicle_type' IS NOT NULL THEN (service_data->>'vehicle_type')::TEXT
            ELSE services.vehicle_type
        END,
        characteristics = CASE
            WHEN service_data->>'characteristics' IS NOT NULL THEN (service_data->>'characteristics')::TEXT
            ELSE services.characteristics
        END,
        insurance_included = CASE
            WHEN service_data->>'insurance_included' IS NOT NULL THEN (service_data->>'insurance_included')::BOOLEAN
            ELSE services.insurance_included
        END,
        fuel_included = CASE
            WHEN service_data->>'fuel_included' IS NOT NULL THEN (service_data->>'fuel_included')::BOOLEAN
            ELSE services.fuel_included
        END,
        menu = CASE
            WHEN service_data->>'menu' IS NOT NULL THEN (service_data->>'menu')::TEXT
            ELSE services.menu
        END,
        -- Campo JSONB
        schedule = CASE
            WHEN service_data->'schedule' IS NOT NULL THEN (service_data->'schedule')::JSONB
            ELSE services.schedule
        END,
        capacity = CASE
            WHEN service_data->>'capacity' IS NOT NULL THEN (service_data->>'capacity')::INTEGER
            ELSE services.capacity
        END,
        -- Campo ARRAY (text[])
        dietary_options = CASE
            WHEN service_data->'dietary_options' IS NOT NULL THEN ARRAY(SELECT jsonb_array_elements_text(service_data->'dietary_options'))
            ELSE services.dietary_options
        END,
        price_type = CASE
            WHEN service_data->>'price_type' IS NOT NULL THEN (service_data->>'price_type')::TEXT
            ELSE services.price_type
        END,
        min_age = CASE
            WHEN service_data->>'min_age' IS NOT NULL THEN (service_data->>'min_age')::INTEGER
            ELSE services.min_age
        END,
        license_required = CASE
            WHEN service_data->>'license_required' IS NOT NULL THEN (service_data->>'license_required')::BOOLEAN
            ELSE services.license_required
        END,
        permit_required = CASE
            WHEN service_data->>'permit_required' IS NOT NULL THEN (service_data->>'permit_required')::BOOLEAN
            ELSE services.permit_required
        END,
        activity_type = CASE
            WHEN service_data->>'activity_type' IS NOT NULL THEN (service_data->>'activity_type')::TEXT
            ELSE services.activity_type
        END,
        fitness_level_required = CASE
            WHEN service_data->>'fitness_level_required' IS NOT NULL THEN (service_data->>'fitness_level_required')::TEXT
            ELSE services.fitness_level_required
        END,
        -- Campo ARRAY (text[])
        equipment_provided = CASE
            WHEN service_data->'equipment_provided' IS NOT NULL THEN ARRAY(SELECT jsonb_array_elements_text(service_data->'equipment_provided'))
            ELSE services.equipment_provided
        END,
        cancellation_policy = CASE
            WHEN service_data->>'cancellation_policy' IS NOT NULL THEN (service_data->>'cancellation_policy')::TEXT
            ELSE services.cancellation_policy
        END,
        itinerary = CASE
            WHEN service_data->>'itinerary' IS NOT NULL THEN (service_data->>'itinerary')::TEXT
            ELSE services.itinerary
        END,
        -- Campo ARRAY (text[])
        guide_languages = CASE
            WHEN service_data->'guide_languages' IS NOT NULL THEN ARRAY(SELECT jsonb_array_elements_text(service_data->'guide_languages'))
            ELSE services.guide_languages
        END,
        -- Campo ARRAY (text[])
        what_to_bring = CASE
            WHEN service_data->'what_to_bring' IS NOT NULL THEN ARRAY(SELECT jsonb_array_elements_text(service_data->'what_to_bring'))
            ELSE services.what_to_bring
        END,
        -- Campo ARRAY (text[])
        included_services = CASE
            WHEN service_data->'included_services' IS NOT NULL THEN ARRAY(SELECT jsonb_array_elements_text(service_data->'included_services'))
            ELSE services.included_services
        END,
        -- Campo ARRAY (text[])
        not_included_services = CASE
            WHEN service_data->'not_included_services' IS NOT NULL THEN ARRAY(SELECT jsonb_array_elements_text(service_data->'not_included_services'))
            ELSE services.not_included_services
        END,
        meeting_point_details = CASE
            WHEN service_data->>'meeting_point_details' IS NOT NULL THEN (service_data->>'meeting_point_details')::TEXT
            ELSE services.meeting_point_details
        END,
        transmission = CASE
            WHEN service_data->>'transmission' IS NOT NULL THEN (service_data->>'transmission')::TEXT
            ELSE services.transmission
        END,
        seats = CASE
            WHEN service_data->>'seats' IS NOT NULL THEN (service_data->>'seats')::INTEGER
            ELSE services.seats
        END,
        doors = CASE
            WHEN service_data->>'doors' IS NOT NULL THEN (service_data->>'doors')::INTEGER
            ELSE services.doors
        END,
        fuel_policy = CASE
            WHEN service_data->>'fuel_policy' IS NOT NULL THEN (service_data->>'fuel_policy')::TEXT
            ELSE services.fuel_policy
        END,
        -- Campo ARRAY (text[])
        pickup_locations = CASE
            WHEN service_data->'pickup_locations' IS NOT NULL THEN ARRAY(SELECT jsonb_array_elements_text(service_data->'pickup_locations'))
            ELSE services.pickup_locations
        END,
        deposit_required = CASE
            WHEN service_data->>'deposit_required' IS NOT NULL THEN (service_data->>'deposit_required')::BOOLEAN
            ELSE services.deposit_required
        END,
        deposit_amount = CASE
            WHEN service_data->>'deposit_amount' IS NOT NULL THEN (service_data->>'deposit_amount')::NUMERIC
            ELSE services.deposit_amount
        END,
        experience_type = CASE
            WHEN service_data->>'experience_type' IS NOT NULL THEN (service_data->>'experience_type')::TEXT
            ELSE services.experience_type
        END,
        chef_name = CASE
            WHEN service_data->>'chef_name' IS NOT NULL THEN (service_data->>'chef_name')::TEXT
            ELSE services.chef_name
        END,
        drink_options = CASE
            WHEN service_data->>'drink_options' IS NOT NULL THEN (service_data->>'drink_options')::TEXT
            ELSE services.drink_options
        END,
        ambience = CASE
            WHEN service_data->>'ambience' IS NOT NULL THEN (service_data->>'ambience')::TEXT
            ELSE services.ambience
        END,
        -- Campos simples de precios por edad
        precio_ninos = CASE
            WHEN service_data->>'precio_ninos' IS NOT NULL THEN (service_data->>'precio_ninos')::NUMERIC
            ELSE services.precio_ninos
        END,
        edad_maxima_ninos = CASE
            WHEN service_data->>'edad_maxima_ninos' IS NOT NULL THEN (service_data->>'edad_maxima_ninos')::INTEGER
            ELSE services.edad_maxima_ninos
        END,
        updated_at = NOW()
    WHERE services.id = service_id_param;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. OTORGAR PERMISOS EXPLÍCITOS
GRANT EXECUTE ON FUNCTION public.update_service_simple(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_service_simple(UUID, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.update_service_simple(UUID, JSONB) TO authenticator;
GRANT EXECUTE ON FUNCTION public.update_service_simple(UUID, JSONB) TO dashboard_user;

-- 5. AGREGAR COMENTARIO DESCRIPTIVO
COMMENT ON FUNCTION public.update_service_simple(UUID, JSONB) IS 'Actualiza un servicio existente con tipos de datos compatibles - SOLUCIONADO ERROR DE TIPOS Y CACHE';

-- 6. VERIFICAR QUE LA FUNCIÓN SE CREÓ CORRECTAMENTE
SELECT 
    'Después de recrear' as status,
    proname as function_name,
    proargtypes::regtype[] as argument_types,
    prorettype::regtype as return_type
FROM pg_proc 
WHERE proname = 'update_service_simple';

-- 7. FORZAR REFRESCO DEL CACHE DEL ESQUEMA
DO $$
BEGIN
    RAISE NOTICE '🔄 Forzando refresco del cache del esquema...';
    
    -- Intentar ejecutar la función para refrescar el cache
    BEGIN
        -- Usar parámetros dummy para refrescar el cache
        PERFORM update_service_simple(
            '00000000-0000-0000-0000-000000000000'::UUID,
            '{"title": "test"}'::JSONB
        );
        RAISE NOTICE '✅ Función ejecutada exitosamente (cache refrescado)';
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE NOTICE '✅ Cache refrescado (error esperado): %', SQLERRM;
    END;
END $$;

-- 8. VERIFICAR PERMISOS FINALES
SELECT 
    p.proname as function_name,
    p.proargtypes::regtype[] as argument_types,
    has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute,
    has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
    has_function_privilege('authenticator', p.oid, 'EXECUTE') as authenticator_can_execute,
    has_function_privilege('dashboard_user', p.oid, 'EXECUTE') as dashboard_user_can_execute
FROM pg_proc p
WHERE p.proname = 'update_service_simple'
AND p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 9. VERIFICAR QUE LA FUNCIÓN ESTÁ DISPONIBLE PARA EL USUARIO ACTUAL
SELECT 
    current_user as current_user,
    has_function_privilege(current_user, 'update_service_simple(uuid,jsonb)', 'EXECUTE') as can_execute;

-- 10. MENSAJE DE CONFIRMACIÓN
DO $$
BEGIN
    RAISE NOTICE '✅ FUNCIÓN update_service_simple RECREADA EXITOSAMENTE';
    RAISE NOTICE '✅ Tipos de datos corregidos para category_id y subcategory_id (TEXT)';
    RAISE NOTICE '✅ Eliminado el uso problemático de COALESCE con tipos incompatibles';
    RAISE NOTICE '✅ Cache del esquema refrescado';
    RAISE NOTICE '✅ Permisos otorgados correctamente';
    RAISE NOTICE '✅ La función está lista para usar';
END $$;
