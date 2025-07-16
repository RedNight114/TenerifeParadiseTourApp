-- ============================================================
-- ENHANCED ROLES AND PERMISSIONS SYSTEM
-- ============================================================

-- 1. ENHANCED ROLES ENUM
-- ============================================================
-- Actualizar la tabla profiles para incluir más roles
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('client', 'admin', 'manager', 'staff', 'guide'));

-- 2. TABLA DE PERMISOS
-- ============================================================
CREATE TABLE IF NOT EXISTS permissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  resource TEXT NOT NULL, -- 'reservations', 'services', 'users', etc.
  action TEXT NOT NULL,   -- 'create', 'read', 'update', 'delete', 'manage'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE ROLES-PERMISOS
-- ============================================================
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  role TEXT NOT NULL,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role, permission_id)
);

-- 4. INSERTAR PERMISOS BÁSICOS
-- ============================================================
INSERT INTO permissions (name, description, resource, action) VALUES
-- Reservas
('reservations.read.own', 'Ver propias reservas', 'reservations', 'read'),
('reservations.create.own', 'Crear propias reservas', 'reservations', 'create'),
('reservations.update.own', 'Actualizar propias reservas', 'reservations', 'update'),
('reservations.read.all', 'Ver todas las reservas', 'reservations', 'read'),
('reservations.update.all', 'Actualizar todas las reservas', 'reservations', 'update'),
('reservations.delete.all', 'Eliminar reservas', 'reservations', 'delete'),

-- Servicios
('services.read.public', 'Ver servicios públicos', 'services', 'read'),
('services.create', 'Crear servicios', 'services', 'create'),
('services.update', 'Actualizar servicios', 'services', 'update'),
('services.delete', 'Eliminar servicios', 'services', 'delete'),
('services.manage', 'Gestionar servicios', 'services', 'manage'),

-- Usuarios
('users.read.own', 'Ver propio perfil', 'users', 'read'),
('users.update.own', 'Actualizar propio perfil', 'users', 'update'),
('users.read.all', 'Ver todos los usuarios', 'users', 'read'),
('users.update.all', 'Actualizar usuarios', 'users', 'update'),
('users.delete', 'Eliminar usuarios', 'users', 'delete'),
('users.manage', 'Gestionar usuarios', 'users', 'manage'),

-- Categorías
('categories.read.public', 'Ver categorías públicas', 'categories', 'read'),
('categories.create', 'Crear categorías', 'categories', 'create'),
('categories.update', 'Actualizar categorías', 'categories', 'update'),
('categories.delete', 'Eliminar categorías', 'categories', 'delete'),

-- Subcategorías
('subcategories.read.public', 'Ver subcategorías públicas', 'subcategories', 'read'),
('subcategories.create', 'Crear subcategorías', 'subcategories', 'create'),
('subcategories.update', 'Actualizar subcategorías', 'subcategories', 'update'),
('subcategories.delete', 'Eliminar subcategorías', 'subcategories', 'delete'),

-- Pagos
('payments.create', 'Crear pagos', 'payments', 'create'),
('payments.confirm', 'Confirmar pagos', 'payments', 'confirm'),
('payments.read.all', 'Ver todos los pagos', 'payments', 'read'),

-- Reportes
('reports.read', 'Ver reportes', 'reports', 'read'),
('reports.generate', 'Generar reportes', 'reports', 'generate'),

-- Configuración
('settings.read', 'Ver configuración', 'settings', 'read'),
('settings.update', 'Actualizar configuración', 'settings', 'update')
ON CONFLICT (name) DO NOTHING;

-- 5. ASIGNAR PERMISOS A ROLES
-- ============================================================
-- CLIENT (cliente)
INSERT INTO role_permissions (role, permission_id)
SELECT 'client', id FROM permissions 
WHERE name IN (
  'reservations.read.own',
  'reservations.create.own',
  'reservations.update.own',
  'services.read.public',
  'categories.read.public',
  'subcategories.read.public',
  'users.read.own',
  'users.update.own',
  'payments.create'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- STAFF (personal)
INSERT INTO role_permissions (role, permission_id)
SELECT 'staff', id FROM permissions 
WHERE name IN (
  'reservations.read.all',
  'reservations.update.all',
  'services.read.public',
  'services.update',
  'categories.read.public',
  'subcategories.read.public',
  'users.read.all',
  'payments.read.all',
  'payments.confirm',
  'reports.read'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- GUIDE (guía)
INSERT INTO role_permissions (role, permission_id)
SELECT 'guide', id FROM permissions 
WHERE name IN (
  'reservations.read.all',
  'reservations.update.all',
  'services.read.public',
  'categories.read.public',
  'subcategories.read.public',
  'reports.read'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- MANAGER (gerente)
INSERT INTO role_permissions (role, permission_id)
SELECT 'manager', id FROM permissions 
WHERE name IN (
  'reservations.read.all',
  'reservations.update.all',
  'reservations.delete.all',
  'services.read.public',
  'services.create',
  'services.update',
  'services.delete',
  'categories.read.public',
  'categories.create',
  'categories.update',
  'categories.delete',
  'subcategories.read.public',
  'subcategories.create',
  'subcategories.update',
  'subcategories.delete',
  'users.read.all',
  'users.update.all',
  'payments.read.all',
  'payments.confirm',
  'reports.read',
  'reports.generate',
  'settings.read',
  'settings.update'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- ADMIN (administrador) - Todos los permisos
INSERT INTO role_permissions (role, permission_id)
SELECT 'admin', id FROM permissions
ON CONFLICT (role, permission_id) DO NOTHING;

-- 6. FUNCIONES DE AUTORIZACIÓN MEJORADAS
-- ============================================================

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role TEXT;
BEGIN
  PERFORM set_config('row_security', 'off', TRUE);
  
  SELECT role INTO v_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(v_role, 'client');
END;
$$;

-- Función para verificar si el usuario tiene un rol específico
CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN public.get_user_role() = required_role;
END;
$$;

-- Función para verificar si el usuario tiene un permiso específico
CREATE OR REPLACE FUNCTION public.has_permission(permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_permission BOOLEAN := FALSE;
BEGIN
  PERFORM set_config('row_security', 'off', TRUE);
  
  SELECT EXISTS(
    SELECT 1
    FROM role_permissions rp
    JOIN permissions p ON rp.permission_id = p.id
    JOIN profiles pr ON pr.role = rp.role
    WHERE pr.id = auth.uid()
    AND p.name = permission_name
  ) INTO v_has_permission;
  
  RETURN v_has_permission;
END;
$$;

-- Función para verificar si el usuario puede acceder a un recurso específico
CREATE OR REPLACE FUNCTION public.can_access_resource(resource_name TEXT, action_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_can_access BOOLEAN := FALSE;
BEGIN
  PERFORM set_config('row_security', 'off', TRUE);
  
  SELECT EXISTS(
    SELECT 1
    FROM role_permissions rp
    JOIN permissions p ON rp.permission_id = p.id
    JOIN profiles pr ON pr.role = rp.role
    WHERE pr.id = auth.uid()
    AND p.resource = resource_name
    AND p.action = action_name
  ) INTO v_can_access;
  
  RETURN v_can_access;
END;
$$;

-- Función para verificar si el usuario puede acceder a sus propios recursos
CREATE OR REPLACE FUNCTION public.can_access_own_resource(resource_name TEXT, action_name TEXT, resource_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Si puede acceder a todos los recursos, permitir
  IF public.can_access_resource(resource_name, action_name) THEN
    RETURN TRUE;
  END IF;
  
  -- Si es su propio recurso y tiene permiso para recursos propios
  IF auth.uid() = resource_user_id AND public.can_access_resource(resource_name, action_name || '.own') THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- 7. FUNCIONES DE CONVENIENCIA PARA ROLES ESPECÍFICOS
-- ============================================================

-- Función mejorada para verificar si es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN public.has_role('admin');
END;
$$;

-- Función para verificar si es manager o superior
CREATE OR REPLACE FUNCTION public.is_manager_or_above()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := public.get_user_role();
  RETURN v_role IN ('admin', 'manager');
END;
$$;

-- Función para verificar si es staff o superior
CREATE OR REPLACE FUNCTION public.is_staff_or_above()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := public.get_user_role();
  RETURN v_role IN ('admin', 'manager', 'staff');
END;
$$;

-- 8. COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================================
COMMENT ON FUNCTION public.get_user_role() IS 'Obtiene el rol del usuario autenticado actual';
COMMENT ON FUNCTION public.has_role(TEXT) IS 'Verifica si el usuario tiene un rol específico';
COMMENT ON FUNCTION public.has_permission(TEXT) IS 'Verifica si el usuario tiene un permiso específico';
COMMENT ON FUNCTION public.can_access_resource(TEXT, TEXT) IS 'Verifica si el usuario puede acceder a un recurso específico';
COMMENT ON FUNCTION public.can_access_own_resource(TEXT, TEXT, UUID) IS 'Verifica si el usuario puede acceder a sus propios recursos';
COMMENT ON FUNCTION public.is_manager_or_above() IS 'Verifica si el usuario es manager o superior';
COMMENT ON FUNCTION public.is_staff_or_above() IS 'Verifica si el usuario es staff o superior';

-- 9. ÍNDICES PARA MEJOR RENDIMIENTO
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_permissions_resource_action ON permissions(resource, action);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 10. VISTA PARA FACILITAR CONSULTAS DE PERMISOS
-- ============================================================
CREATE OR REPLACE VIEW user_permissions AS
SELECT 
  p.id as user_id,
  p.role,
  perm.name as permission_name,
  perm.resource,
  perm.action,
  perm.description
FROM profiles p
JOIN role_permissions rp ON p.role = rp.role
JOIN permissions perm ON rp.permission_id = perm.id;

COMMENT ON VIEW user_permissions IS 'Vista que muestra todos los permisos de cada usuario'; 