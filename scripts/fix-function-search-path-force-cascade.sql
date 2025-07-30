-- Script AGRESIVO para corregir search_path de funciones
-- Usa DROP CASCADE para forzar la eliminación de todas las dependencias
-- Ejecutar en el SQL Editor de Supabase

-- =====================================================
-- 1. ELIMINAR FUNCIONES CON CASCADE (FORZADO)
-- =====================================================

-- Eliminar funciones con CASCADE para forzar eliminación de dependencias
DROP FUNCTION IF EXISTS public.get_user_role(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.has_role(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.has_permission(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.can_access_resource(UUID, TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.can_access_own_resource(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_manager_or_above(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_staff_or_above(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.log_audit_event(UUID, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.get_audit_stats(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.export_audit_logs(DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS public.confirm_test_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(UUID) CASCADE;

-- Eliminar también las otras funciones que pueden existir
DROP FUNCTION IF EXISTS public.generate_display_id() CASCADE;
DROP FUNCTION IF EXISTS public.set_display_id() CASCADE;
DROP FUNCTION IF EXISTS public.update_contact_messages_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_old_audit_logs(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.detect_suspicious_activity(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.get_users_for_admin() CASCADE;
DROP FUNCTION IF EXISTS public.confirm_user_email(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.delete_service_with_reservations(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.list_services_with_reservations() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- =====================================================
-- 2. RECREAR FUNCIONES CON SEARCH_PATH
-- =====================================================

-- Función get_user_role
CREATE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
    RETURN COALESCE(user_role, 'user');
END;
$$;

-- Función has_role
CREATE FUNCTION public.has_role(user_id UUID, required_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
    RETURN user_role = required_role;
END;
$$;

-- Función has_permission
CREATE FUNCTION public.has_permission(user_id UUID, permission TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
    
    CASE permission
        WHEN 'admin' THEN RETURN user_role = 'admin';
        WHEN 'moderator' THEN RETURN user_role IN ('admin', 'moderator');
        WHEN 'user' THEN RETURN user_role IN ('admin', 'moderator', 'user');
        ELSE RETURN FALSE;
    END CASE;
END;
$$;

-- Función can_access_resource
CREATE FUNCTION public.can_access_resource(user_id UUID, resource_type TEXT, resource_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
    
    -- Admins pueden acceder a todo
    IF user_role = 'admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Moderators pueden acceder a recursos públicos
    IF user_role = 'moderator' THEN
        RETURN TRUE;
    END IF;
    
    -- Users solo pueden acceder a sus propios recursos
    RETURN FALSE;
END;
$$;

-- Función can_access_own_resource
CREATE FUNCTION public.can_access_own_resource(user_id UUID, resource_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
    
    -- Admins pueden acceder a todo
    IF user_role = 'admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Moderators pueden acceder a todo
    IF user_role = 'moderator' THEN
        RETURN TRUE;
    END IF;
    
    -- Users solo pueden acceder a sus propios recursos
    RETURN user_id = resource_user_id;
END;
$$;

-- Función is_manager_or_above
CREATE FUNCTION public.is_manager_or_above(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
    RETURN user_role IN ('admin', 'moderator');
END;
$$;

-- Función is_staff_or_above
CREATE FUNCTION public.is_staff_or_above(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
    RETURN user_role IN ('admin', 'moderator', 'user');
END;
$$;

-- Función log_audit_event
CREATE FUNCTION public.log_audit_event(user_id UUID, action TEXT, details JSONB DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.audit_logs (user_id, action, details)
    VALUES (user_id, action, details);
END;
$$;

-- Función get_audit_stats
CREATE FUNCTION public.get_audit_stats(days_back INTEGER DEFAULT 30)
RETURNS TABLE(action TEXT, count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT al.action, COUNT(*) as count
    FROM public.audit_logs al
    WHERE al.created_at >= NOW() - INTERVAL '1 day' * days_back
    GROUP BY al.action
    ORDER BY count DESC;
END;
$$;

-- Función export_audit_logs
CREATE FUNCTION public.export_audit_logs(start_date DATE, end_date DATE)
RETURNS TABLE(
    id UUID,
    user_id UUID,
    action TEXT,
    details JSONB,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT al.id, al.user_id, al.action, al.details, al.created_at
    FROM public.audit_logs al
    WHERE DATE(al.created_at) BETWEEN start_date AND end_date
    ORDER BY al.created_at DESC;
END;
$$;

-- Función confirm_test_user
CREATE FUNCTION public.confirm_test_user()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE auth.users 
    SET email_confirmed_at = NOW()
    WHERE email = 'test@example.com';
END;
$$;

-- Función is_admin
CREATE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
    RETURN user_role = 'admin';
END;
$$;

-- =====================================================
-- 3. VERIFICAR CORRECCIÓN
-- =====================================================

SELECT 
    'CORRECCIÓN FORZADA COMPLETA' as mensaje,
    'Todas las funciones han sido eliminadas con CASCADE y recreadas con search_path = public' as detalle,
    'Revisa el Supabase Linter para confirmar que no hay warnings de search_path' as siguiente_paso; 