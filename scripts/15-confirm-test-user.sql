-- Script para confirmar usuarios de prueba manualmente
-- IMPORTANTE: Solo usar en desarrollo/testing

-- Función para confirmar un usuario por email
CREATE OR REPLACE FUNCTION confirm_test_user(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Buscar el usuario en auth.users
    SELECT * INTO user_record
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_record.id IS NULL THEN
        RAISE EXCEPTION 'Usuario con email % no encontrado', user_email;
    END IF;
    
    -- Confirmar el email del usuario
    UPDATE auth.users 
    SET 
        email_confirmed_at = NOW(),
        confirmed_at = NOW(),
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
        COALESCE(user_record.raw_user_meta_data->>'full_name', 'Usuario de Prueba'),
        'client',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();
    
    RAISE NOTICE 'Usuario % confirmado exitosamente', user_email;
END;
$$;

-- Confirmar usuarios de prueba específicos
-- Reemplaza estos emails por los que necesites confirmar
SELECT confirm_test_user('tecnico@tenerifeparadise.com');
SELECT confirm_test_user('admin@tenerifeparadise.com');
SELECT confirm_test_user('samuel@tenerifeparadise.com');

-- Verificar usuarios confirmados
SELECT 
    email,
    email_confirmed_at,
    confirmed_at,
    created_at
FROM auth.users 
WHERE email_confirmed_at IS NOT NULL
ORDER BY created_at DESC;

-- Mensaje informativo
DO $$
BEGIN
    RAISE NOTICE '=== CONFIRMACIÓN DE USUARIOS COMPLETADA ===';
    RAISE NOTICE 'Los usuarios han sido confirmados manualmente';
    RAISE NOTICE 'Ahora pueden iniciar sesión sin verificar email';
    RAISE NOTICE '';
    RAISE NOTICE 'NOTA: Solo usar en desarrollo/testing';
END;
$$;
