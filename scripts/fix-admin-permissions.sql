-- Script para corregir permisos de administrador
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar que existe el usuario admin
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Buscar usuario con rol admin
    SELECT id INTO admin_user_id 
    FROM profiles 
    WHERE role = 'admin' 
    LIMIT 1;
    
    IF admin_user_id IS NULL THEN
        RAISE NOTICE '⚠️ No se encontró usuario con rol admin';
        RAISE NOTICE '📋 Creando usuario admin de prueba...';
        
        -- Crear usuario admin de prueba (ajustar email según necesidad)
        INSERT INTO profiles (id, role, email, full_name)
        VALUES (
            gen_random_uuid(),
            'admin',
            'admin@tenerifeparadise.com',
            'Administrador del Sistema'
        ) ON CONFLICT DO NOTHING;
        
        RAISE NOTICE '✅ Usuario admin creado';
    ELSE
        RAISE NOTICE '✅ Usuario admin encontrado: %', admin_user_id;
    END IF;
END $$;

-- 2. Asegurar que existen todos los permisos necesarios
INSERT INTO permissions (id, name, description, resource, action) VALUES
    ('services.read', 'Leer servicios', 'Ver todos los servicios', 'services', 'read'),
    ('services.create', 'Crear servicios', 'Crear nuevos servicios', 'services', 'create'),
    ('services.update', 'Actualizar servicios', 'Modificar servicios existentes', 'services', 'update'),
    ('services.delete', 'Eliminar servicios', 'Eliminar servicios', 'services', 'delete'),
    ('categories.read', 'Leer categorías', 'Ver todas las categorías', 'categories', 'read'),
    ('categories.create', 'Crear categorías', 'Crear nuevas categorías', 'categories', 'create'),
    ('categories.update', 'Actualizar categorías', 'Modificar categorías existentes', 'categories', 'update'),
    ('categories.delete', 'Eliminar categorías', 'Eliminar categorías', 'categories', 'delete'),
    ('reservations.read', 'Leer reservas', 'Ver todas las reservas', 'reservations', 'read'),
    ('reservations.create', 'Crear reservas', 'Crear nuevas reservas', 'reservations', 'create'),
    ('reservations.update', 'Actualizar reservas', 'Modificar reservas existentes', 'reservations', 'update'),
    ('reservations.delete', 'Eliminar reservas', 'Eliminar reservas', 'reservations', 'delete'),
    ('users.read', 'Leer usuarios', 'Ver todos los usuarios', 'users', 'read'),
    ('users.create', 'Crear usuarios', 'Crear nuevos usuarios', 'users', 'create'),
    ('users.update', 'Actualizar usuarios', 'Modificar usuarios existentes', 'users', 'update'),
    ('users.delete', 'Eliminar usuarios', 'Eliminar usuarios', 'users', 'delete')
ON CONFLICT (id) DO NOTHING;

-- 3. Asegurar que el rol admin tiene todos los permisos
INSERT INTO role_permissions (role, permission_id) 
SELECT 'admin', id 
FROM permissions 
WHERE resource IN ('services', 'categories', 'reservations', 'users')
ON CONFLICT DO NOTHING;

-- 4. Verificar que las políticas RLS están correctamente configuradas
-- Eliminar políticas existentes para services si hay conflictos
DROP POLICY IF EXISTS "Authorized users can delete services" ON services;

-- Recrear la política de eliminación
CREATE POLICY "Authorized users can delete services"
  ON services
  FOR DELETE
  USING (public.can_access_resource('services', 'delete'));

-- 5. Verificar que la función can_access_resource funciona correctamente
-- Crear función de prueba para verificar permisos
CREATE OR REPLACE FUNCTION test_admin_permissions()
RETURNS TABLE (
    test_name TEXT,
    result BOOLEAN,
    details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user_id UUID;
    can_delete_services BOOLEAN;
    can_create_services BOOLEAN;
    can_update_services BOOLEAN;
    can_read_services BOOLEAN;
BEGIN
    -- Obtener usuario admin
    SELECT id INTO admin_user_id 
    FROM profiles 
    WHERE role = 'admin' 
    LIMIT 1;
    
    IF admin_user_id IS NULL THEN
        RETURN QUERY SELECT 
            'Admin user exists'::TEXT,
            FALSE::BOOLEAN,
            'No admin user found'::TEXT;
        RETURN;
    END IF;
    
    -- Simular ser el usuario admin
    PERFORM set_config('request.jwt.claim.sub', admin_user_id::TEXT, TRUE);
    
    -- Probar permisos
    can_delete_services := public.can_access_resource('services', 'delete');
    can_create_services := public.can_access_resource('services', 'create');
    can_update_services := public.can_access_resource('services', 'update');
    can_read_services := public.can_access_resource('services', 'read');
    
    RETURN QUERY SELECT 
        'Admin user exists'::TEXT,
        TRUE::BOOLEAN,
        'Admin user found: ' || admin_user_id::TEXT;
        
    RETURN QUERY SELECT 
        'Can delete services'::TEXT,
        can_delete_services,
        CASE WHEN can_delete_services THEN 'OK' ELSE 'Missing permission' END;
        
    RETURN QUERY SELECT 
        'Can create services'::TEXT,
        can_create_services,
        CASE WHEN can_create_services THEN 'OK' ELSE 'Missing permission' END;
        
    RETURN QUERY SELECT 
        'Can update services'::TEXT,
        can_update_services,
        CASE WHEN can_update_services THEN 'OK' ELSE 'Missing permission' END;
        
    RETURN QUERY SELECT 
        'Can read services'::TEXT,
        can_read_services,
        CASE WHEN can_read_services THEN 'OK' ELSE 'Missing permission' END;
END;
$$;

-- 6. Mostrar resultados de la verificación
SELECT * FROM test_admin_permissions();

-- 7. Mostrar resumen de permisos del admin
SELECT 
    p.name as permission_name,
    p.resource,
    p.action,
    CASE WHEN rp.role IS NOT NULL THEN '✅' ELSE '❌' END as has_permission
FROM permissions p
LEFT JOIN role_permissions rp ON p.id = rp.permission_id AND rp.role = 'admin'
WHERE p.resource IN ('services', 'categories', 'reservations', 'users')
ORDER BY p.resource, p.action; 