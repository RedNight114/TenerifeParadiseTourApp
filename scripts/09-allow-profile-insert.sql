-- ============================================================================
-- 09 · RLS · Permitir crear registros en la tabla "profiles"
-- ============================================================================

-- Asegurarse de que RLS está activo
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1) Cada usuario puede insertar **SU** propio perfil
CREATE POLICY "Users can create own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2) Los administradores pueden crear perfiles para cualquiera
CREATE POLICY "Admins can create profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (public.is_admin());
