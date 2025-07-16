-- Método manual más directo para confirmar tecnicos@tenerifeparadise.com
-- Si los otros métodos fallan, usa este

-- Paso 1: Verificar que el usuario existe
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'YA CONFIRMADO'
        ELSE 'NECESITA CONFIRMACIÓN'
    END as estado
FROM auth.users 
WHERE email = 'tecnicos@tenerifeparadise.com';

-- Paso 2: Confirmar solo si no está confirmado
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'tecnicos@tenerifeparadise.com' 
AND email_confirmed_at IS NULL;

-- Paso 3: Asegurar que tiene perfil de admin
DO $$
DECLARE
    user_id uuid;
BEGIN
    -- Obtener ID del usuario
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = 'tecnicos@tenerifeparadise.com';
    
    IF user_id IS NOT NULL THEN
        -- Insertar o actualizar perfil
        INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
        VALUES (
            user_id,
            'tecnicos@tenerifeparadise.com',
            'Técnicos Tenerife Paradise',
            'admin',
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'admin',
            email = 'tecnicos@tenerifeparadise.com',
            updated_at = NOW();
            
        RAISE NOTICE 'Perfil de admin creado/actualizado para tecnicos@tenerifeparadise.com';
    ELSE
        RAISE NOTICE 'ERROR: Usuario tecnicos@tenerifeparadise.com no encontrado';
        RAISE NOTICE 'Debes registrar este usuario primero en la aplicación';
    END IF;
END;
$$;

-- Paso 4: Verificación final
SELECT 
    'VERIFICACIÓN FINAL' as resultado,
    au.email,
    CASE 
        WHEN au.email_confirmed_at IS NOT NULL THEN '✅ CONFIRMADO'
        ELSE '❌ NO CONFIRMADO'
    END as estado_email,
    COALESCE(p.role, 'SIN PERFIL') as rol,
    CASE 
        WHEN p.role = 'admin' THEN '✅ ES ADMIN'
        WHEN p.role IS NOT NULL THEN '⚠️ NO ES ADMIN'
        ELSE '❌ SIN PERFIL'
    END as estado_admin
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE au.email = 'tecnicos@tenerifeparadise.com';
