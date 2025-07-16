-- Verificar el estado actual del usuario de prueba
SELECT 
    id, 
    email, 
    email_confirmed_at, 
    confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'testuser@tenerifeparadise.com';

-- Confirmar el email del usuario de prueba
UPDATE auth.users
SET 
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
WHERE email = 'testuser@tenerifeparadise.com';

-- Verificar el estado después de la actualización
SELECT 
    id, 
    email, 
    email_confirmed_at, 
    confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'testuser@tenerifeparadise.com';

-- Verificar que el perfil existe
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM profiles 
WHERE email = 'testuser@tenerifeparadise.com'; 