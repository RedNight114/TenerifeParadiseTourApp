-- ============================================================
-- 1.  Función helper: public.is_admin()
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER                -- se ejecuta con permisos del dueño
AS $$
DECLARE
  v_is_admin BOOLEAN := FALSE;
BEGIN
  -- Desactivar RLS SOLO dentro de la función
  PERFORM set_config('row_security', 'off', TRUE);

  SELECT role = 'admin'
  INTO   v_is_admin
  FROM   public.profiles
  WHERE  id = auth.uid();

  RETURN COALESCE(v_is_admin, FALSE);
END;
$$;

COMMENT ON FUNCTION public.is_admin() IS
'TRUE si el usuario autenticado tiene role = admin.  Se ejecuta con
SECURITY DEFINER y RLS desactivado para evitar recursión.';

-- ============================================================
-- 2.  Reemplazar políticas con la nueva función
-- ============================================================

-- PROFILES ----------------------------------------------------
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  USING (public.is_admin());

-- SERVICES ----------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage services" ON services;
CREATE POLICY "Admins can manage services"
  ON services
  FOR ALL
  USING      (public.is_admin())
  WITH CHECK (public.is_admin());

-- CATEGORIES --------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories"
  ON categories
  FOR ALL
  USING      (public.is_admin())
  WITH CHECK (public.is_admin());

-- SUBCATEGORIES ----------------------------------------------
DROP POLICY IF EXISTS "Admins can manage subcategories" ON subcategories;
CREATE POLICY "Admins can manage subcategories"
  ON subcategories
  FOR ALL
  USING      (public.is_admin())
  WITH CHECK (public.is_admin());

-- RESERVATIONS -----------------------------------------------
DROP POLICY IF EXISTS "Admins can update reservations" ON reservations;
CREATE POLICY "Admins can update reservations"
  ON reservations
  FOR UPDATE
  USING      (public.is_admin())
  WITH CHECK (public.is_admin());

-- ¡Fin!  Ya no habrá recursión infinita en las políticas.
