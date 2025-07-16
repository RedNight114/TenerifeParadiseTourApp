-- =========================================================================
--  PERFIL · Permitir que cada usuario cree SU propio registro de profiles
-- =========================================================================
CREATE POLICY "Users can create own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Opcional: permitir que un admin cree/perfect profiles de otros usuarios
CREATE POLICY "Admins can create profiles"
  ON profiles
  FOR INSERT
  WITH CHECK (public.is_admin());
