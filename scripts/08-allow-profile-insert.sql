-- ============================================================================
-- 08  ·  RLS  ·  Permitir crear el propio perfil en "profiles"
-- ============================================================================

-- 1) Habilitar RLS por si se ejecuta en bases donde aún no lo esté
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2) Política: cada usuario puede insertar UNA fila cuyo id = auth.uid()
CREATE POLICY "Users can create own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3) Política opcional: los administradores (public.is_admin()) pueden crear
--    perfiles para otros usuarios (por ejemplo desde un panel de back-office).
CREATE POLICY "Admins can create profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (public.is_admin());
