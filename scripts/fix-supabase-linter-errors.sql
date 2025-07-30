-- Script para corregir errores de Supabase Linter
-- Ejecutar en el SQL Editor de Supabase

-- =====================================================
-- 1. CORREGIR TABLAS CON RLS DESHABILITADO
-- =====================================================

-- Habilitar RLS en public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en public.payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en public.audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. CREAR POLÍTICAS RLS PARA public.profiles
-- =====================================================

-- Política para que los usuarios puedan ver su propio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Política para que los usuarios puedan actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Política para que los usuarios puedan insertar su propio perfil
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Política para que los admins puedan ver todos los perfiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- 3. CREAR POLÍTICAS RLS PARA public.payments
-- =====================================================

-- Política para que los usuarios puedan ver sus propios pagos
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

-- Política para que los usuarios puedan insertar sus propios pagos
CREATE POLICY "Users can insert own payments" ON public.payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para que los admins puedan ver todos los pagos
CREATE POLICY "Admins can view all payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política para que los admins puedan actualizar pagos
CREATE POLICY "Admins can update payments" ON public.payments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- 4. CREAR POLÍTICAS RLS PARA public.audit_logs
-- =====================================================

-- Política para que los admins puedan ver todos los logs de auditoría
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política para que los admins puedan insertar logs de auditoría
CREATE POLICY "Admins can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política para que el sistema pueda insertar logs (para funciones)
CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- 5. CORREGIR VISTAS CON SECURITY DEFINER
-- =====================================================

-- Eliminar las vistas problemáticas y recrearlas sin SECURITY DEFINER
-- Primero, eliminar las vistas existentes
DROP VIEW IF EXISTS public.recent_audit_logs;
DROP VIEW IF EXISTS public.daily_audit_stats;
DROP VIEW IF EXISTS public.user_permissions;

-- Recrear vista recent_audit_logs sin SECURITY DEFINER
-- Usando solo las columnas que existen en audit_logs
CREATE VIEW public.recent_audit_logs AS
SELECT 
    al.id,
    al.user_id,
    al.action,
    al.record_id,
    al.old_values,
    al.new_values,
    al.ip_address,
    al.user_agent,
    al.created_at,
    p.email as user_email,
    p.full_name as user_name
FROM public.audit_logs al
LEFT JOIN public.profiles p ON al.user_id = p.id
WHERE al.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY al.created_at DESC;

-- Recrear vista daily_audit_stats sin SECURITY DEFINER
CREATE VIEW public.daily_audit_stats AS
SELECT 
    DATE(created_at) as date,
    action,
    COUNT(*) as count,
    COUNT(DISTINCT user_id) as unique_users
FROM public.audit_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), action
ORDER BY date DESC, count DESC;

-- Recrear vista user_permissions sin SECURITY DEFINER
CREATE VIEW public.user_permissions AS
SELECT 
    p.id as user_id,
    p.email,
    p.full_name,
    p.role,
    p.created_at,
    CASE 
        WHEN p.role = 'admin' THEN true
        ELSE false
    END as is_admin,
    CASE 
        WHEN p.role IN ('admin', 'moderator') THEN true
        ELSE false
    END as can_moderate,
    CASE 
        WHEN p.role IN ('admin', 'moderator', 'user') THEN true
        ELSE false
    END as can_access
FROM public.profiles p
WHERE p.id = auth.uid();

-- =====================================================
-- 6. VERIFICAR QUE TODO ESTÉ CORRECTO
-- =====================================================

-- Verificar que RLS esté habilitado en todas las tablas
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'payments', 'audit_logs');

-- Verificar que las políticas existan
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'payments', 'audit_logs');

-- Verificar que las vistas no tengan SECURITY DEFINER
SELECT 
    schemaname,
    viewname,
    security_invoker
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname IN ('recent_audit_logs', 'daily_audit_stats', 'user_permissions');

-- =====================================================
-- 7. COMENTARIOS IMPORTANTES
-- =====================================================

/*
IMPORTANTE:
1. Este script debe ejecutarse en el SQL Editor de Supabase
2. Las políticas RLS pueden necesitar ajustes según tus necesidades específicas
3. Las vistas recreadas sin SECURITY DEFINER respetarán RLS automáticamente
4. Verifica que las consultas funcionen correctamente después de aplicar estos cambios
5. Si tienes funciones que dependen de las vistas, puede que necesites actualizarlas
*/ 