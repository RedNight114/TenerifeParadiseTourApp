
    -- Verificar si la tabla profiles existe
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles'
    ) as table_exists;
    
    -- Verificar estructura de la tabla
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
    ORDER BY ordinal_position;
    
    -- Verificar RLS policies
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
    FROM pg_policies
    WHERE tablename = 'profiles';
  