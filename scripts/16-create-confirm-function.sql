-- Crear función RPC para confirmar usuarios desde la aplicación
CREATE OR REPLACE FUNCTION confirm_test_user(user_email TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    result json;
BEGIN
    -- Buscar el usuario en auth.users
    SELECT * INTO user_record
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_record.id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Usuario no encontrado'
        );
    END IF;
    
    -- Confirmar el email del usuario
    UPDATE auth.users 
    SET 
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        confirmed_at = COALESCE(confirmed_at, NOW()),
        updated_at = NOW()
    WHERE email = user_email;
    
    -- Asegurar que el perfil existe
    INSERT INTO profiles (
        id,
        email,
        full_name,
        role,
        created_at,
        updated_at
    ) VALUES (
        user_record.id,
        user_email,
        COALESCE(user_record.raw_user_meta_data->>'full_name', 'Usuario Confirmado'),
        CASE 
            WHEN user_email IN (
                'admin@tenerifeparadise.com',
                'samuel@tenerifeparadise.com', 
                'tecnicos@tenerifeparadise.com'
            ) THEN 'admin'
            ELSE 'client'
        END,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = CASE 
            WHEN user_email IN (
                'admin@tenerifeparadise.com',
                'samuel@tenerifeparadise.com', 
                'tecnicos@tenerifeparadise.com'
            ) THEN 'admin'
            ELSE profiles.role
        END,
        updated_at = NOW();
    
    RETURN json_build_object(
        'success', true,
        'message', 'Usuario confirmado exitosamente'
    );
END;
$$;

-- Dar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION confirm_test_user(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION confirm_test_user(TEXT) TO anon;

-- Crear función para obtener usuarios (solo para admins)
CREATE OR REPLACE FUNCTION get_users_for_admin()
RETURNS TABLE (
    id uuid,
    email text,
    email_confirmed_at timestamptz,
    confirmed_at timestamptz,
    created_at timestamptz,
    role text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar que el usuario actual es admin
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Solo administradores pueden acceder a esta función';
    END IF;
    
    RETURN QUERY
    SELECT 
        au.id,
        au.email,
        au.email_confirmed_at,
        au.confirmed_at,
        au.created_at,
        COALESCE(p.role, 'client') as role
    FROM auth.users au
    LEFT JOIN profiles p ON p.id = au.id
    ORDER BY au.created_at DESC;
END;
$$;

-- Dar permisos para la función de obtener usuarios
GRANT EXECUTE ON FUNCTION get_users_for_admin() TO authenticated;
