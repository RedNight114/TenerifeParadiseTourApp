-- CREAR FUNCIÓN DELETE_SERVICE_SIMPLE
-- Ejecutar en Supabase SQL Editor

-- 1. Crear la función delete_service_simple
CREATE OR REPLACE FUNCTION delete_service_simple(service_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Verificar que el servicio existe
    IF NOT EXISTS (SELECT 1 FROM services WHERE id = service_id) THEN
        RAISE EXCEPTION 'Servicio con ID % no encontrado', service_id;
    END IF;
    
    -- Eliminar el servicio
    DELETE FROM services WHERE id = service_id;
    
    -- Obtener el número de filas eliminadas
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Verificar que se eliminó al menos una fila
    IF deleted_count = 0 THEN
        RAISE EXCEPTION 'No se pudo eliminar el servicio con ID %', service_id;
    END IF;
    
    -- Log de auditoría (opcional)
    INSERT INTO audit_logs (
        action,
        table_name,
        record_id,
        user_id,
        details
    ) VALUES (
        'DELETE',
        'services',
        service_id,
        auth.uid(),
        jsonb_build_object('service_id', service_id, 'deleted_at', now())
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        -- Log del error
        INSERT INTO audit_logs (
            action,
            table_name,
            record_id,
            user_id,
            details,
            error_message
        ) VALUES (
            'DELETE_ERROR',
            'services',
            service_id,
            auth.uid(),
            jsonb_build_object('service_id', service_id, 'attempted_at', now()),
            SQLERRM
        );
        
        RAISE;
END;
$$;

-- 2. Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION delete_service_simple(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_service_simple(UUID) TO dashboard_user;

-- 3. Verificar que la función se creó correctamente
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'delete_service_simple';

-- 4. Probar la función (reemplaza UUID_AQUI con un ID real)
-- SELECT delete_service_simple('UUID_AQUI');


