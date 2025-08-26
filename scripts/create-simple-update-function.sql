-- FUNCIÓN UPDATE_SERVICE_SIMPLE ULTRA-SIMPLIFICADA
-- Esta versión evita completamente los problemas de tipos CASE

-- PASO 1: ELIMINAR FUNCIONES EXISTENTES
DROP FUNCTION IF EXISTS update_service_simple(UUID, JSONB);
DROP FUNCTION IF EXISTS update_service_simple(UUID, JSONB, UUID);
DROP FUNCTION IF EXISTS update_service_simple(UUID, JSONB, UUID, UUID);

-- PASO 2: CREAR FUNCIÓN SIMPLIFICADA
CREATE OR REPLACE FUNCTION update_service_simple(service_id UUID, service_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    update_fields TEXT := '';
    field_value TEXT;
    field_name TEXT;
    result JSONB;
BEGIN
    -- Verificar que el servicio existe
    IF NOT EXISTS (SELECT 1 FROM public.services WHERE id = service_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Servicio no encontrado'
        );
    END IF;
    
    -- Construir query dinámico solo para campos que existen
    FOR field_name IN 
        SELECT unnest(ARRAY[
            'title', 'description', 'price', 'price_children', 'price_type',
            'duration', 'location', 'min_group_size', 'max_group_size',
            'difficulty_level', 'vehicle_type', 'characteristics',
            'insurance_included', 'fuel_included', 'menu', 'schedule',
            'capacity', 'dietary_options', 'min_age', 'license_required',
            'permit_required', 'what_to_bring', 'included_services',
            'not_included_services', 'meeting_point_details', 'transmission',
            'seats', 'doors', 'fuel_policy', 'pickup_locations',
            'deposit_required', 'deposit_amount', 'experience_type',
            'chef_name', 'drink_options', 'ambience', 'activity_type',
            'available', 'featured', 'images'
        ])
    LOOP
        -- Solo procesar campos que están en service_data
        IF service_data ? field_name THEN
            field_value := service_data->>field_name;
            
            -- Construir SET dinámicamente
            IF update_fields != '' THEN
                update_fields := update_fields || ', ';
            END IF;
            
            -- Manejar tipos específicos
            CASE field_name
                WHEN 'price', 'price_children', 'deposit_amount' THEN
                    update_fields := update_fields || field_name || ' = ' || 
                        CASE WHEN field_value = 'null' OR field_value IS NULL THEN 'NULL' 
                             ELSE field_value || '::DECIMAL' END;
                WHEN 'min_group_size', 'max_group_size', 'capacity', 'seats', 'doors', 'min_age' THEN
                    update_fields := update_fields || field_name || ' = ' || 
                        CASE WHEN field_value = 'null' OR field_value IS NULL THEN 'NULL' 
                             ELSE field_value || '::INTEGER' END;
                WHEN 'insurance_included', 'fuel_included', 'license_required', 'permit_required', 'deposit_required', 'available', 'featured' THEN
                    update_fields := update_fields || field_name || ' = ' || 
                        CASE WHEN field_value = 'null' OR field_value IS NULL THEN 'NULL' 
                             ELSE field_value || '::BOOLEAN' END;
                WHEN 'category_id', 'subcategory_id' THEN
                    update_fields := update_fields || field_name || ' = ' || 
                        CASE WHEN field_value = 'null' OR field_value IS NULL THEN 'NULL' 
                             ELSE field_value || '::UUID' END;
                WHEN 'images' THEN
                    update_fields := update_fields || field_name || ' = ' || 
                        CASE WHEN field_value = 'null' OR field_value IS NULL THEN 'NULL' 
                             ELSE field_value || '::TEXT[]' END;
                ELSE
                    -- Para campos de texto, usar directamente
                    update_fields := update_fields || field_name || ' = ' || 
                        CASE WHEN field_value = 'null' OR field_value IS NULL THEN 'NULL' 
                             ELSE quote_literal(field_value) END;
            END CASE;
        END IF;
    END LOOP;
    
    -- Agregar updated_at
    IF update_fields != '' THEN
        update_fields := update_fields || ', updated_at = NOW()';
    END IF;
    
    -- Si no hay campos para actualizar, retornar error
    IF update_fields = '' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'No hay campos válidos para actualizar'
        );
    END IF;
    
    -- Ejecutar UPDATE dinámico
    EXECUTE 'UPDATE public.services SET ' || update_fields || ' WHERE id = $1' USING service_id;
    
    -- Verificar si se actualizó algo
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'No se pudo actualizar el servicio'
        );
    END IF;
    
    -- Retornar éxito
    RETURN jsonb_build_object(
        'success', true,
        'service_id', service_id,
        'message', 'Servicio actualizado exitosamente',
        'fields_updated', update_fields
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'detail', SQLSTATE
        );
END;
$$;

-- PASO 3: OTORGAR PERMISOS
GRANT EXECUTE ON FUNCTION update_service_simple(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION update_service_simple(UUID, JSONB) TO dashboard_user;

-- PASO 4: VERIFICAR QUE SE CREÓ CORRECTAMENTE
SELECT 
    proname as function_name,
    proargtypes::regtype[] as argument_types,
    prorettype::regtype as return_type
FROM pg_proc 
WHERE proname = 'update_service_simple';


