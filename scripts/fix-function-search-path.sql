-- Script para arreglar el search_path de las funciones problemáticas
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Verificar las funciones existentes
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND proname IN (
    'get_user_role',
    'has_role',
    'has_permission',
    'can_access_resource',
    'can_access_own_resource',
    'is_manager_or_above',
    'is_staff_or_above',
    'log_audit_event',
    'get_audit_stats',
    'export_audit_logs',
    'confirm_test_user',
    'is_admin'
);

-- 2. Arreglar la función get_user_role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN (SELECT role FROM profiles WHERE id = user_id);
END;
$$;

-- 3. Arreglar la función has_role
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, required_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id AND role = required_role
    );
END;
$$;

-- 4. Arreglar la función has_permission
CREATE OR REPLACE FUNCTION public.has_permission(user_id uuid, permission_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_permissions up
        JOIN profiles p ON up.user_id = p.id
        WHERE p.id = user_id AND up.permission = permission_name
    );
END;
$$;

-- 5. Arreglar la función can_access_resource
CREATE OR REPLACE FUNCTION public.can_access_resource(user_id uuid, resource_type text, resource_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Los administradores pueden acceder a todo
    IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id AND role = 'admin') THEN
        RETURN true;
    END IF;
    
    -- Los usuarios solo pueden acceder a sus propios recursos
    RETURN user_id = resource_id;
END;
$$;

-- 6. Arreglar la función can_access_own_resource
CREATE OR REPLACE FUNCTION public.can_access_own_resource(user_id uuid, resource_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Los administradores pueden acceder a todo
    IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id AND role = 'admin') THEN
        RETURN true;
    END IF;
    
    -- Los usuarios solo pueden acceder a sus propios recursos
    RETURN user_id = resource_user_id;
END;
$$;

-- 7. Arreglar la función is_manager_or_above
CREATE OR REPLACE FUNCTION public.is_manager_or_above(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id AND role IN ('admin', 'manager')
    );
END;
$$;

-- 8. Arreglar la función is_staff_or_above
CREATE OR REPLACE FUNCTION public.is_staff_or_above(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id AND role IN ('admin', 'manager', 'staff')
    );
END;
$$;

-- 9. Arreglar la función log_audit_event
CREATE OR REPLACE FUNCTION public.log_audit_event(
    user_id uuid,
    action_name text,
    details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO audit_logs (user_id, action, details, created_at)
    VALUES (user_id, action_name, details, NOW());
END;
$$;

-- 10. Arreglar la función get_audit_stats
CREATE OR REPLACE FUNCTION public.get_audit_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    stats jsonb;
BEGIN
    SELECT jsonb_build_object(
        'total_events', COUNT(*),
        'today_events', COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE),
        'unique_users', COUNT(DISTINCT user_id)
    ) INTO stats
    FROM audit_logs;
    
    RETURN stats;
END;
$$;

-- 11. Arreglar la función export_audit_logs
CREATE OR REPLACE FUNCTION public.export_audit_logs(start_date date, end_date date)
RETURNS TABLE(
    user_id uuid,
    action text,
    details jsonb,
    created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT al.user_id, al.action, al.details, al.created_at
    FROM audit_logs al
    WHERE DATE(al.created_at) BETWEEN start_date AND end_date
    ORDER BY al.created_at DESC;
END;
$$;

-- 12. Arreglar la función confirm_test_user
CREATE OR REPLACE FUNCTION public.confirm_test_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE profiles 
    SET email_confirmed_at = NOW(), updated_at = NOW()
    WHERE email = 'brian12guargacho@gmail.com';
END;
$$;

-- 13. Arreglar la función is_admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$;

-- 14. Verificar que las funciones se arreglaron
SELECT 
    proname as function_name,
    CASE 
        WHEN prosrc LIKE '%SET search_path = public%' THEN '✅ Arreglada'
        ELSE '❌ Sin search_path'
    END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND proname IN (
    'get_user_role',
    'has_role',
    'has_permission',
    'can_access_resource',
    'can_access_own_resource',
    'is_manager_or_above',
    'is_staff_or_above',
    'log_audit_event',
    'get_audit_stats',
    'export_audit_logs',
    'confirm_test_user',
    'is_admin'
); 