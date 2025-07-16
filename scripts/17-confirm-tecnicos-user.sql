-- Script específico para confirmar el usuario tecnicos@tenerifeparadise.com
-- IMPORTANTE: Solo usar en desarrollo/testing

-- Confirmar específicamente el usuario tecnicos@tenerifeparadise.com
SELECT confirm_test_user('tecnicos@tenerifeparadise.com');

-- Verificar que el usuario fue confirmado correctamente
SELECT 
    email,
    email_confirmed_at,
    confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'CONFIRMADO ✅'
        ELSE 'PENDIENTE ❌'
    END as estado
FROM auth.users 
WHERE email = 'tecnicos@tenerifeparadise.com';

-- Verificar el perfil del usuario
SELECT 
    email,
    full_name,
    role,
    created_at,
    updated_at
FROM profiles 
WHERE email = 'tecnicos@tenerifeparadise.com';

-- Mensaje informativo
DO $$
BEGIN
    RAISE NOTICE '=== CONFIRMACIÓN DE USUARIO TÉCNICOS ===';
    RAISE NOTICE 'Usuario: tecnicos@tenerifeparadise.com';
    RAISE NOTICE 'Estado: Confirmado y listo para usar';
    RAISE NOTICE 'Rol: Admin (asignado automáticamente)';
    RAISE NOTICE '';
    RAISE NOTICE 'Ahora puedes iniciar sesión con este usuario';
END;
$$;
