-- Script completo para corregir search_path de funciones
-- Ejecutar en el SQL Editor de Supabase
-- Elimina TODOS los triggers y funciones antes de recrearlas

-- =====================================================
-- 1. ELIMINAR TODOS LOS TRIGGERS EXISTENTES
-- =====================================================

-- Eliminar todos los triggers que dependen de las funciones
DROP TRIGGER IF EXISTS trigger_set_display_id ON public.profiles;
DROP TRIGGER IF EXISTS trigger_update_contact_messages_updated_at ON public.contact_messages;
DROP TRIGGER IF EXISTS trigger_update_updated_at ON public.services;
DROP TRIGGER IF EXISTS trigger_update_updated_at ON public.categories;
DROP TRIGGER IF EXISTS trigger_update_updated_at ON public.reservations;
DROP TRIGGER IF EXISTS trigger_update_updated_at ON public.payments;

-- Eliminar triggers adicionales que pueden existir
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
DROP TRIGGER IF EXISTS update_reservations_updated_at ON public.reservations;
DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON public.contact_messages;

-- Eliminar cualquier otro trigger que pueda existir
DROP TRIGGER IF EXISTS trigger_update_updated_at_services ON public.services;
DROP TRIGGER IF EXISTS trigger_update_updated_at_categories ON public.categories;
DROP TRIGGER IF EXISTS trigger_update_updated_at_reservations ON public.reservations;
DROP TRIGGER IF EXISTS trigger_update_updated_at_payments ON public.payments;

-- =====================================================
-- 2. ELIMINAR FUNCIONES EXISTENTES
-- =====================================================

-- Eliminar funciones una por una
DROP FUNCTION IF EXISTS public.generate_display_id();
DROP FUNCTION IF EXISTS public.set_display_id();
DROP FUNCTION IF EXISTS public.get_user_role(UUID);
DROP FUNCTION IF EXISTS public.has_role(UUID, TEXT);
DROP FUNCTION IF EXISTS public.update_contact_messages_updated_at();
DROP FUNCTION IF EXISTS public.has_permission(UUID, TEXT);
DROP FUNCTION IF EXISTS public.can_access_resource(UUID, TEXT, UUID);
DROP FUNCTION IF EXISTS public.can_access_own_resource(UUID, UUID);
DROP FUNCTION IF EXISTS public.is_manager_or_above(UUID);
DROP FUNCTION IF EXISTS public.is_staff_or_above(UUID);
DROP FUNCTION IF EXISTS public.log_audit_event(UUID, TEXT, JSONB);
DROP FUNCTION IF EXISTS public.cleanup_old_audit_logs(INTEGER);
DROP FUNCTION IF EXISTS public.get_audit_stats(INTEGER);
DROP FUNCTION IF EXISTS public.export_audit_logs(DATE, DATE);
DROP FUNCTION IF EXISTS public.detect_suspicious_activity(INTEGER);
DROP FUNCTION IF EXISTS public.confirm_test_user();
DROP FUNCTION IF EXISTS public.get_users_for_admin();
DROP FUNCTION IF EXISTS public.confirm_user_email(TEXT);
DROP FUNCTION IF EXISTS public.delete_service_with_reservations(UUID);
DROP FUNCTION IF EXISTS public.list_services_with_reservations();
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.is_admin(UUID);

-- =====================================================
-- 3. RECREAR FUNCIONES CON SEARCH_PATH
-- =====================================================

-- Función generate_display_id
CREATE FUNCTION public.generate_display_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN 'ID-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
END;
$$;

-- Función set_display_id
CREATE FUNCTION public.set_display_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.display_id IS NULL THEN
        NEW.display_id := public.generate_display_id();
    END IF;
    RETURN NEW;
END;
$$;

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

-- Función update_contact_messages_updated_at
CREATE FUNCTION public.update_contact_messages_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
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

-- Función cleanup_old_audit_logs
CREATE FUNCTION public.cleanup_old_audit_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.audit_logs 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
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

-- Función detect_suspicious_activity
CREATE FUNCTION public.detect_suspicious_activity(hours_back INTEGER DEFAULT 24)
RETURNS TABLE(user_id UUID, action_count BIGINT, suspicious BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.user_id,
        COUNT(*) as action_count,
        COUNT(*) > 100 as suspicious
    FROM public.audit_logs al
    WHERE al.created_at >= NOW() - INTERVAL '1 hour' * hours_back
    GROUP BY al.user_id
    HAVING COUNT(*) > 50;
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

-- Función get_users_for_admin
CREATE FUNCTION public.get_users_for_admin()
RETURNS TABLE(
    id UUID,
    email TEXT,
    full_name TEXT,
    role TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.email, p.full_name, p.role, p.created_at
    FROM public.profiles p
    ORDER BY p.created_at DESC;
END;
$$;

-- Función confirm_user_email
CREATE FUNCTION public.confirm_user_email(user_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE auth.users 
    SET email_confirmed_at = NOW()
    WHERE email = user_email;
END;
$$;

-- Función delete_service_with_reservations
CREATE FUNCTION public.delete_service_with_reservations(service_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Eliminar reservas primero
    DELETE FROM public.reservations WHERE service_id = delete_service_with_reservations.service_id;
    
    -- Eliminar servicio
    DELETE FROM public.services WHERE id = delete_service_with_reservations.service_id;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

-- Función list_services_with_reservations
CREATE FUNCTION public.list_services_with_reservations()
RETURNS TABLE(
    service_id UUID,
    service_name TEXT,
    reservation_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as service_id,
        s.name as service_name,
        COUNT(r.id) as reservation_count
    FROM public.services s
    LEFT JOIN public.reservations r ON s.id = r.service_id
    GROUP BY s.id, s.name
    ORDER BY reservation_count DESC;
END;
$$;

-- Función update_updated_at_column
CREATE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
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
-- 4. RECREAR TRIGGERS
-- =====================================================

-- Recrear trigger para set_display_id
CREATE TRIGGER trigger_set_display_id
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_display_id();

-- Recrear trigger para update_contact_messages_updated_at
CREATE TRIGGER trigger_update_contact_messages_updated_at
    BEFORE UPDATE ON public.contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_contact_messages_updated_at();

-- Recrear triggers para update_updated_at_column
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 5. VERIFICAR CORRECCIÓN
-- =====================================================

SELECT 
    'CORRECCIÓN COMPLETA FINAL' as mensaje,
    'Todas las funciones y triggers han sido recreados con search_path = public' as detalle,
    'Revisa el Supabase Linter para confirmar que no hay warnings de search_path' as siguiente_paso; 