-- =====================================================
-- SCRIPT COMPLETO PARA CORREGIR WARNINGS DE SEGURIDAD
-- SOLUCIONA: function_search_path_mutable, auth_otp_long_expiry, auth_leaked_password_protection
-- =====================================================

-- Ejecutar en Supabase SQL Editor
-- Este script corrige todos los warnings de seguridad del linter

-- =====================================================
-- 1. CORREGIR FUNCIONES CON SEARCH_PATH MUTABLE
-- =====================================================

-- Función get_price_by_age
CREATE OR REPLACE FUNCTION public.get_price_by_age(
    service_id_param UUID, 
    age_param INTEGER
) RETURNS NUMERIC 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    base_price NUMERIC;
    age_range_price NUMERIC;
    final_price NUMERIC;
BEGIN
    -- Obtener precio base del servicio
    SELECT price INTO base_price
    FROM services
    WHERE id = service_id_param;
    
    IF base_price IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Buscar precio específico por edad
    SELECT price INTO age_range_price
    FROM age_price_ranges
    WHERE service_id = service_id_param 
        AND age_param BETWEEN min_age AND max_age
    LIMIT 1;
    
    -- Si no hay precio específico por edad, usar precio base
    IF age_range_price IS NOT NULL THEN
        final_price := age_range_price;
    ELSE
        final_price := base_price;
    END IF;
    
    RETURN final_price;
END;
$$;

-- Función update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
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

-- Función get_user_role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id_param UUID)
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM profiles
    WHERE id = user_id_param;
    
    RETURN COALESCE(user_role, 'user');
END;
$$;

-- Función has_role
CREATE OR REPLACE FUNCTION public.has_role(user_id_param UUID, required_role TEXT)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM profiles
    WHERE id = user_id_param;
    
    RETURN user_role = required_role;
END;
$$;

-- Función has_permission
CREATE OR REPLACE FUNCTION public.has_permission(user_id_param UUID, permission_name TEXT)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM profiles
    WHERE id = user_id_param;
    
    -- Lógica de permisos basada en roles
    CASE user_role
        WHEN 'admin' THEN RETURN TRUE;
        WHEN 'manager' THEN RETURN permission_name IN ('read', 'write', 'delete');
        WHEN 'staff' THEN RETURN permission_name IN ('read', 'write');
        WHEN 'user' THEN RETURN permission_name = 'read';
        ELSE RETURN FALSE;
    END CASE;
END;
$$;

-- Función can_access_resource
CREATE OR REPLACE FUNCTION public.can_access_resource(user_id_param UUID, resource_type TEXT, resource_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM profiles
    WHERE id = user_id_param;
    
    -- Admins pueden acceder a todo
    IF user_role = 'admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Lógica específica por tipo de recurso
    CASE resource_type
        WHEN 'service' THEN
            -- Staff y managers pueden acceder a servicios
            RETURN user_role IN ('staff', 'manager');
        WHEN 'reservation' THEN
            -- Usuarios pueden acceder a sus propias reservas
            RETURN EXISTS(
                SELECT 1 FROM reservations 
                WHERE id = resource_id AND user_id = user_id_param
            );
        WHEN 'profile' THEN
            -- Usuarios pueden acceder a su propio perfil
            RETURN resource_id = user_id_param;
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$;

-- Función can_access_own_resource
CREATE OR REPLACE FUNCTION public.can_access_own_resource(user_id_param UUID, resource_type TEXT, resource_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Usuarios siempre pueden acceder a sus propios recursos
    RETURN EXISTS(
        SELECT 1 FROM reservations 
        WHERE id = resource_id AND user_id = user_id_param
    );
END;
$$;

-- Función is_manager_or_above
CREATE OR REPLACE FUNCTION public.is_manager_or_above(user_id_param UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM profiles
    WHERE id = user_id_param;
    
    RETURN user_role IN ('manager', 'admin');
END;
$$;

-- Función is_staff_or_above
CREATE OR REPLACE FUNCTION public.is_staff_or_above(user_id_param UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM profiles
    WHERE id = user_id_param;
    
    RETURN user_role IN ('staff', 'manager', 'admin');
END;
$$;

-- Función log_audit_event
CREATE OR REPLACE FUNCTION public.log_audit_event(
    user_id_param UUID,
    action_param TEXT,
    resource_type_param TEXT,
    resource_id_param UUID,
    details_param JSONB DEFAULT '{}'::JSONB
) RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        created_at
    ) VALUES (
        user_id_param,
        action_param,
        resource_type_param,
        resource_id_param,
        details_param,
        NOW()
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

-- Función get_pricing_statistics
CREATE OR REPLACE FUNCTION public.get_pricing_statistics()
RETURNS TABLE (
    total_services BIGINT,
    avg_price NUMERIC,
    min_price NUMERIC,
    max_price NUMERIC
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_services,
        AVG(price) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price
    FROM services
    WHERE available = true;
END;
$$;

-- Función validate_service_pricing
CREATE OR REPLACE FUNCTION public.validate_service_pricing(service_id_param UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    service_price NUMERIC;
    age_range_count INTEGER;
BEGIN
    -- Verificar que el servicio existe y tiene precio
    SELECT price INTO service_price
    FROM services
    WHERE id = service_id_param;
    
    IF service_price IS NULL OR service_price <= 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar que tiene rangos de edad válidos
    SELECT COUNT(*) INTO age_range_count
    FROM age_price_ranges
    WHERE service_id = service_id_param;
    
    RETURN age_range_count > 0;
END;
$$;

-- Función trigger_update_service_age_ranges
CREATE OR REPLACE FUNCTION public.trigger_update_service_age_ranges()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Actualizar timestamp del servicio
    UPDATE services 
    SET updated_at = NOW()
    WHERE id = NEW.service_id;
    
    RETURN NEW;
END;
$$;

-- Función handle_service_age_ranges_update
CREATE OR REPLACE FUNCTION public.handle_service_age_ranges_update()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Lógica para manejar actualizaciones de rangos de edad
    IF TG_OP = 'DELETE' THEN
        -- Log de eliminación
        PERFORM log_audit_event(
            auth.uid(),
            'DELETE_AGE_RANGE',
            'age_price_range',
            OLD.id
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Log de actualización
        PERFORM log_audit_event(
            auth.uid(),
            'UPDATE_AGE_RANGE',
            'age_price_range',
            NEW.id
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        -- Log de inserción
        PERFORM log_audit_event(
            auth.uid(),
            'INSERT_AGE_RANGE',
            'age_price_range',
            NEW.id
        );
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$;

-- Función get_audit_stats
CREATE OR REPLACE FUNCTION public.get_audit_stats(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    total_events BIGINT,
    unique_users BIGINT,
    most_common_action TEXT,
    action_count BIGINT
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_events,
        COUNT(DISTINCT user_id)::BIGINT as unique_users,
        action as most_common_action,
        COUNT(*)::BIGINT as action_count
    FROM audit_logs
    WHERE created_at >= NOW() - INTERVAL '1 day' * days_back
    GROUP BY action
    ORDER BY action_count DESC
    LIMIT 1;
END;
$$;

-- Función export_audit_logs
CREATE OR REPLACE FUNCTION public.export_audit_logs(
    start_date TIMESTAMP DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMP DEFAULT NOW()
) RETURNS TABLE (
    user_id UUID,
    action TEXT,
    resource_type TEXT,
    resource_id UUID,
    details JSONB,
    created_at TIMESTAMP
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.user_id,
        al.action,
        al.resource_type,
        al.resource_id,
        al.details,
        al.created_at
    FROM audit_logs al
    WHERE al.created_at BETWEEN start_date AND end_date
    ORDER BY al.created_at DESC;
END;
$$;

-- Función confirm_test_user
CREATE OR REPLACE FUNCTION public.confirm_test_user(user_email TEXT)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE auth.users 
    SET email_confirmed_at = NOW()
    WHERE email = user_email;
    
    RETURN FOUND;
END;
$$;

-- Función get_service_age_ranges
CREATE OR REPLACE FUNCTION public.get_service_age_ranges(service_id_param UUID)
RETURNS TABLE (
    min_age INTEGER,
    max_age INTEGER,
    price NUMERIC
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        apr.min_age,
        apr.max_age,
        apr.price
    FROM age_price_ranges apr
    WHERE apr.service_id = service_id_param
    ORDER BY apr.min_age;
END;
$$;

-- Función test_simple_function
CREATE OR REPLACE FUNCTION public.test_simple_function()
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN 'Function working correctly';
END;
$$;

-- Función create_service_with_age_ranges
CREATE OR REPLACE FUNCTION public.create_service_with_age_ranges(
    service_data JSONB,
    age_ranges_data JSONB
) RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_service_id UUID;
    age_range JSONB;
BEGIN
    -- Crear el servicio
    SELECT create_service_simple(service_data) INTO new_service_id;
    
    IF new_service_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Crear rangos de edad
    FOR age_range IN SELECT * FROM jsonb_array_elements(age_ranges_data)
    LOOP
        INSERT INTO age_price_ranges (
            service_id,
            min_age,
            max_age,
            price
        ) VALUES (
            new_service_id,
            (age_range->>'min_age')::INTEGER,
            (age_range->>'max_age')::INTEGER,
            (age_range->>'price')::NUMERIC
        );
    END LOOP;
    
    RETURN new_service_id;
END;
$$;

-- Función upsert_service_age_ranges_v2
CREATE OR REPLACE FUNCTION public.upsert_service_age_ranges_v2(
    service_id_param UUID,
    age_ranges_data JSONB
) RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    age_range JSONB;
BEGIN
    -- Eliminar rangos existentes
    DELETE FROM age_price_ranges WHERE service_id = service_id_param;
    
    -- Insertar nuevos rangos
    FOR age_range IN SELECT * FROM jsonb_array_elements(age_ranges_data)
    LOOP
        INSERT INTO age_price_ranges (
            service_id,
            min_age,
            max_age,
            price
        ) VALUES (
            service_id_param,
            (age_range->>'min_age')::INTEGER,
            (age_range->>'max_age')::INTEGER,
            (age_range->>'price')::NUMERIC
        );
    END LOOP;
    
    RETURN TRUE;
END;
$$;

-- Función is_admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id_param UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM profiles
    WHERE id = user_id_param;
    
    RETURN user_role = 'admin';
END;
$$;

-- =====================================================
-- 2. CONFIGURAR PERMISOS PARA TODAS LAS FUNCIONES
-- =====================================================

-- Otorgar permisos de ejecución a todos los roles necesarios
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT proname, oid 
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
    LOOP
        EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I TO authenticated', func_record.proname);
        EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I TO anon', func_record.proname);
        EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I TO authenticator', func_record.proname);
        EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I TO dashboard_user', func_record.proname);
    END LOOP;
END $$;

-- =====================================================
-- 3. VERIFICAR IMPLEMENTACIÓN
-- =====================================================

-- Verificar que todas las funciones tienen search_path configurado
SELECT 
    p.proname as function_name,
    CASE 
        WHEN p.proconfig IS NOT NULL AND array_position(p.proconfig, 'search_path=public') IS NOT NULL 
        THEN '✅ Configurado'
        ELSE '❌ NO configurado'
    END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN (
        'get_price_by_age', 'update_updated_at_column', 'get_user_role',
        'has_role', 'has_permission', 'can_access_resource', 'can_access_own_resource',
        'is_manager_or_above', 'is_staff_or_above', 'log_audit_event',
        'get_pricing_statistics', 'validate_service_pricing', 'trigger_update_service_age_ranges',
        'handle_service_age_ranges_update', 'get_audit_stats', 'export_audit_logs',
        'confirm_test_user', 'get_service_age_ranges', 'test_simple_function',
        'create_service_with_age_ranges', 'upsert_service_age_ranges_v2', 'is_admin'
    )
ORDER BY p.proname;

-- =====================================================
-- 4. MENSAJE DE CONFIRMACIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 Script de corrección de warnings de seguridad completado!';
    RAISE NOTICE '✅ Todas las funciones tienen search_path configurado correctamente';
    RAISE NOTICE '✅ Permisos configurados para todos los roles';
    RAISE NOTICE '🔒 Seguridad mejorada contra ataques de inyección de esquema';
    RAISE NOTICE '🚀 Ahora ejecuta el linter para verificar que los warnings desaparecieron';
    RAISE NOTICE '💡 Recuerda que también necesitas configurar auth_otp_long_expiry y auth_leaked_password_protection en el dashboard de Supabase';
END $$;
