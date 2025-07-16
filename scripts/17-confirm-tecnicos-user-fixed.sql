-- Script específico para confirmar el usuario tecnicos@tenerifeparadise.com
-- IMPORTANTE: Solo usar en desarrollo/testing

-- Primero verificar si el usuario existe
DO $$
DECLARE
    user_exists boolean;
    user_id uuid;
BEGIN
    -- Verificar si el usuario existe
    SELECT EXISTS(
        SELECT 1 FROM auth.users 
        WHERE email = 'tecnicos@tenerifeparadise.com'
    ) INTO user_exists;
    
    IF NOT user_exists THEN
        RAISE NOTICE 'ERROR: El usuario tecnicos@tenerifeparadise.com no existe';
        RAISE NOTICE 'Primero debes registrar este usuario en la aplicación';
        RETURN;
    END IF;
    
    -- Obtener el ID del usuario
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = 'tecnicos@tenerifeparadise.com';
    
    RAISE NOTICE 'Usuario encontrado con ID: %', user_id;
END;
$$;

-- Confirmar el email del usuario (solo email_confirmed_at, no confirmed_at)
UPDATE auth.users 
SET 
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
WHERE email = 'tecnicos@tenerifeparadise.com'
AND email_confirmed_at IS NULL;

-- Crear o actualizar el perfil del usuario
INSERT INTO profiles (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
) 
SELECT 
    au.id,
    'tecnicos@tenerifeparadise.com',
    COALESCE(au.raw_user_meta_data->>'full_name', 'Técnicos Tenerife Paradise'),
    'admin',
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'tecnicos@tenerifeparadise.com'
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = 'admin',
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();

-- Verificar el resultado
SELECT 
    'ESTADO DEL USUARIO' as info,
    email,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'CONFIRMADO ✅'
        ELSE 'PENDIENTE ❌'
    END as estado_email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'tecnicos@tenerifeparadise.com';

-- Verificar el perfil
SELECT 
    'PERFIL DEL USUARIO' as info,
    email,
    full_name,
    role,
    created_at as perfil_creado
FROM profiles 
WHERE email = 'tecnicos@tenerifeparadise.com';

-- Mensaje final
DO $$
DECLARE
    is_confirmed boolean;
    has_profile boolean;
BEGIN
    -- Verificar confirmación
    SELECT email_confirmed_at IS NOT NULL INTO is_confirmed
    FROM auth.users 
    WHERE email = 'tecnicos@tenerifeparadise.com';
    
    -- Verificar perfil
    SELECT EXISTS(
        SELECT 1 FROM profiles 
        WHERE email = 'tecnicos@tenerifeparadise.com' 
        AND role = 'admin'
    ) INTO has_profile;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== RESULTADO DE LA CONFIRMACIÓN ===';
    RAISE NOTICE 'Usuario: tecnicos@tenerifeparadise.com';
    
    IF is_confirmed THEN
        RAISE NOTICE 'Email: ✅ CONFIRMADO';
    ELSE
        RAISE NOTICE 'Email: ❌ NO CONFIRMADO';
    END IF;
    
    IF has_profile THEN
        RAISE NOTICE 'Perfil: ✅ CREADO CON ROL ADMIN';
    ELSE
        RAISE NOTICE 'Perfil: ❌ NO ENCONTRADO';
    END IF;
    
    IF is_confirmed AND has_profile THEN
        RAISE NOTICE '';
        RAISE NOTICE '🎉 ¡ÉXITO! El usuario está listo para usar';
        RAISE NOTICE 'Puedes iniciar sesión en /admin/login';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  Hay problemas. Verifica que el usuario esté registrado';
    END IF;
END;
$$;
