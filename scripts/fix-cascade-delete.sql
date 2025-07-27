-- Script para configurar eliminación en cascada
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar la estructura actual de la tabla reservations
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='reservations'
    AND ccu.table_name = 'services';

-- 2. Eliminar la restricción de clave foránea existente
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Buscar el nombre de la restricción
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name='reservations'
        AND ccu.table_name = 'services'
        AND kcu.column_name = 'service_id';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE reservations DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE '✅ Restricción eliminada: %', constraint_name;
    ELSE
        RAISE NOTICE '⚠️ No se encontró restricción de clave foránea';
    END IF;
END $$;

-- 3. Crear nueva restricción con eliminación en cascada
ALTER TABLE reservations 
ADD CONSTRAINT fk_reservations_service_id 
FOREIGN KEY (service_id) 
REFERENCES services(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- 4. Verificar que se creó correctamente
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='reservations'
    AND ccu.table_name = 'services';

-- 5. Crear función para eliminar servicio con verificación
CREATE OR REPLACE FUNCTION delete_service_with_reservations(service_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    service_title TEXT;
    reservation_count INTEGER;
    cancelled_count INTEGER;
    active_count INTEGER;
BEGIN
    -- Verificar que el servicio existe
    SELECT title INTO service_title
    FROM services
    WHERE id = service_id;
    
    IF service_title IS NULL THEN
        RETURN 'Error: Servicio no encontrado';
    END IF;
    
    -- Contar reservas por estado
    SELECT 
        COUNT(*) INTO reservation_count
    FROM reservations 
    WHERE reservations.service_id = service_id;
    
    SELECT 
        COUNT(*) INTO cancelled_count
    FROM reservations 
    WHERE reservations.service_id = service_id 
        AND status = 'cancelled';
    
    SELECT 
        COUNT(*) INTO active_count
    FROM reservations 
    WHERE reservations.service_id = service_id 
        AND status IN ('confirmed', 'pending');
    
    -- Si hay reservas activas, no permitir eliminación
    IF active_count > 0 THEN
        RETURN 'Error: No se puede eliminar el servicio porque tiene ' || active_count || ' reservas activas';
    END IF;
    
    -- Si solo hay reservas canceladas, permitir eliminación
    IF reservation_count > 0 AND cancelled_count = reservation_count THEN
        -- Eliminar reservas canceladas primero (por si acaso)
        DELETE FROM reservations 
        WHERE service_id = service_id 
            AND status = 'cancelled';
        
        RAISE NOTICE 'Eliminadas % reservas canceladas', cancelled_count;
    END IF;
    
    -- Eliminar el servicio
    DELETE FROM services WHERE id = service_id;
    
    RETURN 'Servicio "' || service_title || '" eliminado exitosamente. ' || 
           COALESCE(cancelled_count, 0) || ' reservas canceladas también eliminadas.';
END;
$$;

-- 6. Crear función para listar servicios con reservas
CREATE OR REPLACE FUNCTION list_services_with_reservations()
RETURNS TABLE (
    service_id UUID,
    service_title TEXT,
    total_reservations INTEGER,
    cancelled_reservations INTEGER,
    active_reservations INTEGER,
    can_delete BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.title,
        COALESCE(r.total_count, 0) as total_reservations,
        COALESCE(r.cancelled_count, 0) as cancelled_reservations,
        COALESCE(r.active_count, 0) as active_reservations,
        CASE 
            WHEN r.total_count IS NULL THEN TRUE
            WHEN r.active_count = 0 THEN TRUE
            ELSE FALSE
        END as can_delete
    FROM services s
    LEFT JOIN (
        SELECT 
            service_id,
            COUNT(*) as total_count,
            COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count,
            COUNT(*) FILTER (WHERE status IN ('confirmed', 'pending')) as active_count
        FROM reservations
        GROUP BY service_id
    ) r ON s.id = r.service_id
    ORDER BY s.title;
END;
$$;

-- 7. Mostrar servicios con reservas
SELECT * FROM list_services_with_reservations();

-- 8. Comentarios para documentación
COMMENT ON FUNCTION delete_service_with_reservations(UUID) IS 'Elimina un servicio y sus reservas canceladas asociadas';
COMMENT ON FUNCTION list_services_with_reservations() IS 'Lista todos los servicios con información de sus reservas'; 