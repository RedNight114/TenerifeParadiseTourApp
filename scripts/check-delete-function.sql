-- VERIFICAR FUNCIÓN DELETE_SERVICE_SIMPLE
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si la función existe
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'delete_service_simple';

-- 2. Verificar permisos del usuario actual
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'services' 
AND grantee = current_user;

-- 3. Verificar políticas RLS en la tabla services
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'services';

-- 4. Verificar si hay servicios disponibles para eliminar
SELECT 
    id,
    title,
    available,
    created_at
FROM services 
WHERE available = true 
LIMIT 5;

-- 5. Probar eliminación directa (solo para testing)
-- DELETE FROM services WHERE id = 'ID_DEL_SERVICIO_AQUI' RETURNING *;


