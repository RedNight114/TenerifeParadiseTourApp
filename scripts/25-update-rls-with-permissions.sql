-- ============================================================
-- ACTUALIZAR POLÍTICAS RLS CON SISTEMA DE PERMISOS GRANULAR
-- ============================================================

-- 1. ELIMINAR POLÍTICAS EXISTENTES
-- ============================================================

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can create profiles" ON profiles;

-- Services
DROP POLICY IF EXISTS "Anyone can view available services" ON services;
DROP POLICY IF EXISTS "Admins can manage services" ON services;

-- Categories
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

-- Subcategories
DROP POLICY IF EXISTS "Anyone can view subcategories" ON subcategories;
DROP POLICY IF EXISTS "Admins can manage subcategories" ON subcategories;

-- Reservations
DROP POLICY IF EXISTS "Users can view own reservations" ON reservations;
DROP POLICY IF EXISTS "Users can create reservations" ON reservations;
DROP POLICY IF EXISTS "Users can update own reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can update reservations" ON reservations;
DROP POLICY IF EXISTS "Admin can manage all reservations" ON reservations;

-- 2. NUEVAS POLÍTICAS CON SISTEMA DE PERMISOS
-- ============================================================

-- PROFILES ----------------------------------------------------
-- Usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (public.can_access_own_resource('users', 'read', id));

-- Usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (public.can_access_own_resource('users', 'update', id))
  WITH CHECK (public.can_access_own_resource('users', 'update', id));

-- Usuarios autorizados pueden ver todos los perfiles
CREATE POLICY "Authorized users can view all profiles"
  ON profiles
  FOR SELECT
  USING (public.can_access_resource('users', 'read'));

-- Usuarios autorizados pueden actualizar perfiles
CREATE POLICY "Authorized users can update profiles"
  ON profiles
  FOR UPDATE
  USING (public.can_access_resource('users', 'update'))
  WITH CHECK (public.can_access_resource('users', 'update'));

-- Usuarios autorizados pueden crear perfiles
CREATE POLICY "Authorized users can create profiles"
  ON profiles
  FOR INSERT
  WITH CHECK (public.can_access_resource('users', 'create'));

-- Usuarios autorizados pueden eliminar perfiles
CREATE POLICY "Authorized users can delete profiles"
  ON profiles
  FOR DELETE
  USING (public.can_access_resource('users', 'delete'));

-- SERVICES ----------------------------------------------------
-- Cualquiera puede ver servicios públicos
CREATE POLICY "Anyone can view public services"
  ON services
  FOR SELECT
  USING (available = true);

-- Usuarios autorizados pueden ver todos los servicios
CREATE POLICY "Authorized users can view all services"
  ON services
  FOR SELECT
  USING (public.can_access_resource('services', 'read'));

-- Usuarios autorizados pueden crear servicios
CREATE POLICY "Authorized users can create services"
  ON services
  FOR INSERT
  WITH CHECK (public.can_access_resource('services', 'create'));

-- Usuarios autorizados pueden actualizar servicios
CREATE POLICY "Authorized users can update services"
  ON services
  FOR UPDATE
  USING (public.can_access_resource('services', 'update'))
  WITH CHECK (public.can_access_resource('services', 'update'));

-- Usuarios autorizados pueden eliminar servicios
CREATE POLICY "Authorized users can delete services"
  ON services
  FOR DELETE
  USING (public.can_access_resource('services', 'delete'));

-- CATEGORIES --------------------------------------------------
-- Cualquiera puede ver categorías públicas
CREATE POLICY "Anyone can view public categories"
  ON categories
  FOR SELECT
  USING (true);

-- Usuarios autorizados pueden crear categorías
CREATE POLICY "Authorized users can create categories"
  ON categories
  FOR INSERT
  WITH CHECK (public.can_access_resource('categories', 'create'));

-- Usuarios autorizados pueden actualizar categorías
CREATE POLICY "Authorized users can update categories"
  ON categories
  FOR UPDATE
  USING (public.can_access_resource('categories', 'update'))
  WITH CHECK (public.can_access_resource('categories', 'update'));

-- Usuarios autorizados pueden eliminar categorías
CREATE POLICY "Authorized users can delete categories"
  ON categories
  FOR DELETE
  USING (public.can_access_resource('categories', 'delete'));

-- SUBCATEGORIES ----------------------------------------------
-- Cualquiera puede ver subcategorías públicas
CREATE POLICY "Anyone can view public subcategories"
  ON subcategories
  FOR SELECT
  USING (true);

-- Usuarios autorizados pueden crear subcategorías
CREATE POLICY "Authorized users can create subcategories"
  ON subcategories
  FOR INSERT
  WITH CHECK (public.can_access_resource('subcategories', 'create'));

-- Usuarios autorizados pueden actualizar subcategorías
CREATE POLICY "Authorized users can update subcategories"
  ON subcategories
  FOR UPDATE
  USING (public.can_access_resource('subcategories', 'update'))
  WITH CHECK (public.can_access_resource('subcategories', 'update'));

-- Usuarios autorizados pueden eliminar subcategorías
CREATE POLICY "Authorized users can delete subcategories"
  ON subcategories
  FOR DELETE
  USING (public.can_access_resource('subcategories', 'delete'));

-- RESERVATIONS -----------------------------------------------
-- Usuarios pueden ver sus propias reservas
CREATE POLICY "Users can view own reservations"
  ON reservations
  FOR SELECT
  USING (public.can_access_own_resource('reservations', 'read', user_id));

-- Usuarios pueden crear sus propias reservas
CREATE POLICY "Users can create own reservations"
  ON reservations
  FOR INSERT
  WITH CHECK (public.can_access_own_resource('reservations', 'create', user_id));

-- Usuarios pueden actualizar sus propias reservas
CREATE POLICY "Users can update own reservations"
  ON reservations
  FOR UPDATE
  USING (public.can_access_own_resource('reservations', 'update', user_id))
  WITH CHECK (public.can_access_own_resource('reservations', 'update', user_id));

-- Usuarios autorizados pueden ver todas las reservas
CREATE POLICY "Authorized users can view all reservations"
  ON reservations
  FOR SELECT
  USING (public.can_access_resource('reservations', 'read'));

-- Usuarios autorizados pueden actualizar todas las reservas
CREATE POLICY "Authorized users can update all reservations"
  ON reservations
  FOR UPDATE
  USING (public.can_access_resource('reservations', 'update'))
  WITH CHECK (public.can_access_resource('reservations', 'update'));

-- Usuarios autorizados pueden eliminar reservas
CREATE POLICY "Authorized users can delete reservations"
  ON reservations
  FOR DELETE
  USING (public.can_access_resource('reservations', 'delete'));

-- 3. POLÍTICAS PARA TABLAS DE PERMISOS
-- ============================================================

-- Permissions (solo admins pueden ver)
CREATE POLICY "Admins can view permissions"
  ON permissions
  FOR SELECT
  USING (public.is_admin());

-- Role permissions (solo admins pueden ver)
CREATE POLICY "Admins can view role permissions"
  ON role_permissions
  FOR SELECT
  USING (public.is_admin());

-- 4. HABILITAR RLS EN TODAS LAS TABLAS
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- 5. COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================================
COMMENT ON POLICY "Users can view own profile" ON profiles IS 'Permite a los usuarios ver su propio perfil';
COMMENT ON POLICY "Users can update own profile" ON profiles IS 'Permite a los usuarios actualizar su propio perfil';
COMMENT ON POLICY "Authorized users can view all profiles" ON profiles IS 'Permite a usuarios autorizados ver todos los perfiles';
COMMENT ON POLICY "Authorized users can update profiles" ON profiles IS 'Permite a usuarios autorizados actualizar perfiles';
COMMENT ON POLICY "Authorized users can create profiles" ON profiles IS 'Permite a usuarios autorizados crear perfiles';
COMMENT ON POLICY "Authorized users can delete profiles" ON profiles IS 'Permite a usuarios autorizados eliminar perfiles';

COMMENT ON POLICY "Anyone can view public services" ON services IS 'Permite a cualquiera ver servicios públicos';
COMMENT ON POLICY "Authorized users can view all services" ON services IS 'Permite a usuarios autorizados ver todos los servicios';
COMMENT ON POLICY "Authorized users can create services" ON services IS 'Permite a usuarios autorizados crear servicios';
COMMENT ON POLICY "Authorized users can update services" ON services IS 'Permite a usuarios autorizados actualizar servicios';
COMMENT ON POLICY "Authorized users can delete services" ON services IS 'Permite a usuarios autorizados eliminar servicios';

COMMENT ON POLICY "Anyone can view public categories" ON categories IS 'Permite a cualquiera ver categorías públicas';
COMMENT ON POLICY "Authorized users can create categories" ON categories IS 'Permite a usuarios autorizados crear categorías';
COMMENT ON POLICY "Authorized users can update categories" ON categories IS 'Permite a usuarios autorizados actualizar categorías';
COMMENT ON POLICY "Authorized users can delete categories" ON categories IS 'Permite a usuarios autorizados eliminar categorías';

COMMENT ON POLICY "Anyone can view public subcategories" ON subcategories IS 'Permite a cualquiera ver subcategorías públicas';
COMMENT ON POLICY "Authorized users can create subcategories" ON subcategories IS 'Permite a usuarios autorizados crear subcategorías';
COMMENT ON POLICY "Authorized users can update subcategories" ON subcategories IS 'Permite a usuarios autorizados actualizar subcategorías';
COMMENT ON POLICY "Authorized users can delete subcategories" ON subcategories IS 'Permite a usuarios autorizados eliminar subcategorías';

COMMENT ON POLICY "Users can view own reservations" ON reservations IS 'Permite a los usuarios ver sus propias reservas';
COMMENT ON POLICY "Users can create own reservations" ON reservations IS 'Permite a los usuarios crear sus propias reservas';
COMMENT ON POLICY "Users can update own reservations" ON reservations IS 'Permite a los usuarios actualizar sus propias reservas';
COMMENT ON POLICY "Authorized users can view all reservations" ON reservations IS 'Permite a usuarios autorizados ver todas las reservas';
COMMENT ON POLICY "Authorized users can update all reservations" ON reservations IS 'Permite a usuarios autorizados actualizar todas las reservas';
COMMENT ON POLICY "Authorized users can delete reservations" ON reservations IS 'Permite a usuarios autorizados eliminar reservas';

COMMENT ON POLICY "Admins can view permissions" ON permissions IS 'Solo admins pueden ver permisos';
COMMENT ON POLICY "Admins can view role permissions" ON role_permissions IS 'Solo admins pueden ver asignaciones de roles'; 