-- Crear función para asignar rol de admin a usuarios existentes
CREATE OR REPLACE FUNCTION assign_admin_role()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_emails text[] := ARRAY[
        'admin@tenerifeparadise.com',
        'samuel@tenerifeparadise.com', 
        'tecnicos@tenerifeparadise.com'
    ];
    email_item text;
    user_id uuid;
BEGIN
    -- Iterar sobre cada email
    FOREACH email_item IN ARRAY admin_emails
    LOOP
        -- Buscar el usuario en auth.users
        SELECT id INTO user_id 
        FROM auth.users 
        WHERE email = email_item 
        LIMIT 1;
        
        -- Si el usuario existe, actualizar o crear su perfil
        IF user_id IS NOT NULL THEN
            -- Intentar actualizar el perfil existente
            UPDATE profiles 
            SET role = 'admin',
                updated_at = now()
            WHERE id = user_id;
            
            -- Si no se actualizó ninguna fila, crear el perfil
            IF NOT FOUND THEN
                INSERT INTO profiles (
                    id,
                    email,
                    full_name,
                    role,
                    created_at,
                    updated_at
                ) VALUES (
                    user_id,
                    email_item,
                    CASE 
                        WHEN email_item = 'admin@tenerifeparadise.com' THEN 'Administrador Principal'
                        WHEN email_item = 'samuel@tenerifeparadise.com' THEN 'Samuel García'
                        WHEN email_item = 'tecnicos@tenerifeparadise.com' THEN 'Equipo Técnico'
                        ELSE 'Administrador'
                    END,
                    'admin',
                    now(),
                    now()
                );
            END IF;
            
            RAISE NOTICE 'Usuario % configurado como admin', email_item;
        ELSE
            RAISE NOTICE 'Usuario % no encontrado en auth.users. Debe registrarse primero.', email_item;
        END IF;
    END LOOP;
END;
$$;

-- Ejecutar la función
SELECT assign_admin_role();

-- Verificar los usuarios admin creados
SELECT 
    p.email,
    p.full_name,
    p.role,
    p.created_at
FROM profiles p
WHERE p.role = 'admin'
ORDER BY p.created_at;

-- Mensaje informativo
DO $$
BEGIN
    RAISE NOTICE '=== CONFIGURACIÓN DE USUARIOS ADMIN COMPLETADA ===';
    RAISE NOTICE 'Los siguientes emails tendrán rol de admin una vez se registren:';
    RAISE NOTICE '- admin@tenerifeparadise.com';
    RAISE NOTICE '- samuel@tenerifeparadise.com';
    RAISE NOTICE '- tecnicos@tenerifeparadise.com';
    RAISE NOTICE '';
    RAISE NOTICE 'INSTRUCCIONES:';
    RAISE NOTICE '1. Registrar estos usuarios en la aplicación';
    RAISE NOTICE '2. Ejecutar este script nuevamente para asignar roles';
    RAISE NOTICE '3. Acceder al panel admin en /admin/login';
END;
$$;
