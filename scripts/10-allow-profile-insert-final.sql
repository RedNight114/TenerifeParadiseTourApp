-- ============================================================================
-- 10 · RLS · Política INSERT para profiles (versión final)
-- ============================================================================

-- Asegurar que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes de INSERT si existen
DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can create profiles" ON public.profiles;

-- Crear política para que usuarios puedan crear su propio perfil
CREATE POLICY "Users can create own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Crear política para que administradores puedan crear perfiles
CREATE POLICY "Admins can create profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Verificar que las políticas están activas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND cmd = 'INSERT';
