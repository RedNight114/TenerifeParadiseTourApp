-- Script para corregir la vista user_permissions y evitar errores 400
-- ================================================================

-- 1. Eliminar la vista existente si existe
DROP VIEW IF EXISTS user_permissions;

-- 2. Verificar que las tablas necesarias existen
DO $$
BEGIN
    -- Verificar que la tabla profiles existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE EXCEPTION 'La tabla profiles no existe';
    END IF;
    
    -- Verificar que la tabla permissions existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permissions') THEN
        RAISE EXCEPTION 'La tabla permissions no existe';
    END IF;
    
    -- Verificar que la tabla role_permissions existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'role_permissions') THEN
        RAISE EXCEPTION 'La tabla role_permissions no existe';
    END IF;
END $$;

-- 3. Crear la vista user_permissions con manejo de errores
CREATE OR REPLACE VIEW user_permissions AS
SELECT 
  p.id as user_id,
  p.role,
  COALESCE(perm.name, '') as permission_name,
  COALESCE(perm.resource, '') as resource,
  COALESCE(perm.action, '') as action,
  COALESCE(perm.description, '') as description
FROM profiles p
LEFT JOIN role_permissions rp ON p.role = rp.role
LEFT JOIN permissions perm ON rp.permission_id = perm.id;

-- 4. Comentar la vista
COMMENT ON VIEW user_permissions IS 'Vista que muestra todos los permisos de cada usuario con manejo de errores';

-- 5. Crear función para obtener permisos de usuario de forma segura
CREATE OR REPLACE FUNCTION get_user_permissions(user_id_param UUID)
RETURNS TABLE (
  permission_name TEXT,
  resource TEXT,
  action TEXT,
  description TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que el usuario existe
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = user_id_param) THEN
    RAISE EXCEPTION 'Usuario no encontrado';
  END IF;
  
  -- Retornar permisos del usuario
  RETURN QUERY
  SELECT 
    COALESCE(perm.name, '') as permission_name,
    COALESCE(perm.resource, '') as resource,
    COALESCE(perm.action, '') as action,
    COALESCE(perm.description, '') as description
  FROM profiles p
  LEFT JOIN role_permissions rp ON p.role = rp.role
  LEFT JOIN permissions perm ON rp.permission_id = perm.id
  WHERE p.id = user_id_param;
END;
$$;

-- 6. Crear función para verificar si un usuario tiene un permiso específico
CREATE OR REPLACE FUNCTION user_has_permission(
  user_id_param UUID,
  permission_name_param TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_permission BOOLEAN := FALSE;
BEGIN
  -- Verificar que el usuario existe
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = user_id_param) THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar si el usuario tiene el permiso
  SELECT EXISTS(
    SELECT 1 
    FROM profiles p
    JOIN role_permissions rp ON p.role = rp.role
    JOIN permissions perm ON rp.permission_id = perm.id
    WHERE p.id = user_id_param 
    AND perm.name = permission_name_param
  ) INTO has_permission;
  
  RETURN has_permission;
END;
$$;

-- 7. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_permissions_id ON permissions(id);
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);

-- 8. Verificar que la vista funciona correctamente
DO $$
DECLARE
  test_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO test_count FROM user_permissions LIMIT 1;
  RAISE NOTICE 'Vista user_permissions creada correctamente. Registros encontrados: %', test_count;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creando la vista user_permissions: %', SQLERRM;
END;
$$;
