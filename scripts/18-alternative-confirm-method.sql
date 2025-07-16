-- Método alternativo: Crear función específica para confirmar usuarios
-- Este método evita problemas con campos restringidos

CREATE OR REPLACE FUNCTION confirm_user_email(user_email TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    result json;
BEGIN
    -- Buscar el usuario
    SELECT id, email, email_confirmed_at, raw_user_meta_data
    INTO user_record
    FROM auth.users 
    WHERE email = user_email;
    
    -- Verificar que existe
    IF user_record.id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Usuario no encontrado: ' || user_email,
            'action', 'Registra primero el usuario en la aplicación'
        );
    END IF;
    
    -- Verificar si ya está confirmado
    IF user_record.email_confirmed_at IS NOT NULL THEN
        RETURN json_build_object(
            'success', true,
            'message', 'Usuario ya estaba confirmado',
            'email', user_email,
            'confirmed_at', user_record.email_confirmed_at
        );
    END IF;
    
    -- Confirmar el email (solo el campo permitido)
    UPDATE auth.users 
    SET 
        email_confirmed_at = NOW(),
        updated_at = NOW()
    WHERE id = user_record.id;
    
    -- Crear/actualizar perfil
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
        'message', 'Usuario confirmado exitosamente',
        'email', user_email,
        'role', CASE 
            WHEN user_email IN (
                'admin@tenerifeparadise.com',
                'samuel@tenerifeparadise.com', 
                'tecnicos@tenerifeparadise.com'
            ) THEN 'admin'
            ELSE 'client'
        END
    );
END;
$$;

-- Dar permisos
GRANT EXECUTE ON FUNCTION confirm_user_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION confirm_user_email(TEXT) TO anon;

-- Confirmar el usuario tecnicos@tenerifeparadise.com
SELECT confirm_user_email('tecnicos@tenerifeparadise.com');

-- Verificar resultado
SELECT 
    email,
    email_confirmed_at IS NOT NULL as confirmado,
    created_at
FROM auth.users 
WHERE email = 'tecnicos@tenerifeparadise.com';

SELECT 
    email,
    role,
    full_name
FROM profiles 
WHERE email = 'tecnicos@tenerifeparadise.com';
