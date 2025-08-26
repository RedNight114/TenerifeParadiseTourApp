-- Script para crear trigger automático de perfil
-- Este trigger se ejecuta cuando se inserta un nuevo usuario en auth.users
-- y automáticamente crea un perfil correspondiente en public.profiles

-- 1. Crear función para manejar la inserción de usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar nuevo perfil en la tabla profiles
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,                    -- ID del usuario recién creado
    NEW.email,                 -- Email del usuario
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''), -- Nombre completo si está disponible
    NULL,                      -- Avatar URL (inicialmente NULL)
    'user',                    -- Rol por defecto
    NOW(),                     -- Fecha de creación
    NOW()                      -- Fecha de actualización
  );
  
  -- Log de éxito
  RAISE NOTICE '✅ Perfil creado automáticamente para usuario: %', NEW.email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Crear el trigger que se ejecuta después de INSERT en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Verificar que el trigger se creó correctamente
SELECT 
  trigger_name,
  event_manipulation,
  event_object_schema,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 4. Verificar que la función existe
SELECT 
  routine_name,
  routine_type,
  routine_schema,
  data_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 5. Otorgar permisos necesarios
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- 6. Verificar que la tabla profiles tiene las políticas RLS correctas
-- (Esto asume que ya tienes políticas RLS configuradas)
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
WHERE tablename = 'profiles';

-- 7. Comentario explicativo
COMMENT ON FUNCTION public.handle_new_user() IS 
'Función que se ejecuta automáticamente cuando se crea un nuevo usuario en auth.users.
Crea automáticamente un perfil correspondiente en public.profiles con valores por defecto.';

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 
'Trigger que se ejecuta después de INSERT en auth.users para crear automáticamente un perfil.';
