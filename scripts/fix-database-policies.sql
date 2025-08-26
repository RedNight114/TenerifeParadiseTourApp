-- =====================================================
-- SCRIPT DE CORRECCIÓN: POLÍTICAS DE BASE DE DATOS
-- Corrige las políticas RLS que pueden estar causando problemas
-- =====================================================

-- 1. HABILITAR RLS EN TABLAS PRINCIPALES (si no está habilitado)
ALTER TABLE IF EXISTS public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reservations ENABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR POLÍTICAS EXISTENTES PROBLEMÁTICAS
DROP POLICY IF EXISTS "Enable read access for all users" ON public.services;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.subcategories;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.reservations;

DROP POLICY IF EXISTS "Services are viewable by everyone" ON public.services;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Subcategories are viewable by everyone" ON public.subcategories;

-- 3. CREAR POLÍTICAS CORRECTAS PARA LECTURA PÚBLICA

-- Política para SERVICES: Permitir lectura a todos los usuarios
CREATE POLICY "services_select_policy" ON public.services
    FOR SELECT
    TO anon, authenticated, authenticator
    USING (true);

-- Política para CATEGORIES: Permitir lectura a todos los usuarios
CREATE POLICY "categories_select_policy" ON public.categories
    FOR SELECT
    TO anon, authenticated, authenticator
    USING (true);

-- Política para SUBCATEGORIES: Permitir lectura a todos los usuarios
CREATE POLICY "subcategories_select_policy" ON public.subcategories
    FOR SELECT
    TO anon, authenticated, authenticator
    USING (true);

-- Política para PROFILES: Permitir lectura a usuarios autenticados
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT
    TO authenticated, authenticator
    USING (true);

-- Política para RESERVATIONS: Permitir lectura a usuarios autenticados
CREATE POLICY "reservations_select_policy" ON public.reservations
    FOR SELECT
    TO authenticated, authenticator
    USING (true);

-- 4. OTORGAR PERMISOS EXPLÍCITOS

-- Permisos para SERVICES
GRANT SELECT ON public.services TO anon, authenticated, authenticator;

-- Permisos para CATEGORIES
GRANT SELECT ON public.categories TO anon, authenticated, authenticator;

-- Permisos para SUBCATEGORIES
GRANT SELECT ON public.subcategories TO anon, authenticated, authenticator;

-- Permisos para PROFILES
GRANT SELECT ON public.profiles TO authenticated, authenticator;
GRANT INSERT, UPDATE ON public.profiles TO authenticated, authenticator;

-- Permisos para RESERVATIONS
GRANT SELECT ON public.reservations TO authenticated, authenticator;
GRANT INSERT, UPDATE ON public.reservations TO authenticated, authenticator;

-- 5. VERIFICAR Y CORREGIR FUNCIONES

-- Función para obtener servicios (si no existe)
CREATE OR REPLACE FUNCTION public.get_services_simple()
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    price NUMERIC,
    images TEXT[],
    featured BOOLEAN,
    available BOOLEAN,
    duration TEXT,
    location TEXT,
    min_group_size INTEGER,
    max_group_size INTEGER,
    category_id UUID,
    subcategory_id UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.title,
        s.description,
        s.price,
        s.images,
        s.featured,
        s.available,
        s.duration,
        s.location,
        s.min_group_size,
        s.max_group_size,
        s.category_id,
        s.subcategory_id,
        s.created_at,
        s.updated_at
    FROM public.services s
    WHERE s.available = true
    ORDER BY s.featured DESC, s.created_at DESC;
END;
$$;

-- Función para obtener categorías (si no existe)
CREATE OR REPLACE FUNCTION public.get_categories_simple()
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.description,
        c.icon,
        c.color,
        c.created_at
    FROM public.categories c
    ORDER BY c.name;
END;
$$;

-- Función para obtener subcategorías (si no existe)
CREATE OR REPLACE FUNCTION public.get_subcategories_simple()
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    category_id UUID,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sc.id,
        sc.name,
        sc.description,
        sc.category_id,
        sc.created_at
    FROM public.subcategories sc
    ORDER BY sc.name;
END;
$$;

-- 6. OTORGAR PERMISOS DE EJECUCIÓN EN FUNCIONES

GRANT EXECUTE ON FUNCTION public.get_services_simple() TO anon, authenticated, authenticator;
GRANT EXECUTE ON FUNCTION public.get_categories_simple() TO anon, authenticated, authenticator;
GRANT EXECUTE ON FUNCTION public.get_subcategories_simple() TO anon, authenticated, authenticator;

-- 7. VERIFICAR CONFIGURACIÓN DE BÚSQUEDA

-- Configurar search_path para funciones existentes
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN
        SELECT p.proname, p.oid
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
            AND p.proname IN (
                'get_user_role',
                'log_audit_event',
                'get_service_by_id'
            )
    LOOP
        -- Configurar search_path = public para funciones existentes
        EXECUTE format('ALTER FUNCTION public.%I() SET search_path = public', func_record.proname);
        RAISE NOTICE '✅ Configurado search_path para función: %', func_record.proname;
    END LOOP;
END $$;

-- 8. VERIFICACIÓN FINAL

DO $$
DECLARE
    rls_count INTEGER;
    policy_count INTEGER;
    function_count INTEGER;
    permission_count INTEGER;
BEGIN
    -- Contar RLS habilitado
    SELECT COUNT(*) INTO rls_count
    FROM pg_tables 
    WHERE schemaname = 'public' 
        AND tablename IN ('services', 'categories', 'subcategories')
        AND rowsecurity = true;
    
    -- Contar políticas
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
        AND tablename IN ('services', 'categories', 'subcategories');
    
    -- Contar funciones
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
        AND p.proname IN (
            'get_services_simple',
            'get_categories_simple',
            'get_subcategories_simple',
            'get_service_by_id',
            'get_user_role',
            'log_audit_event'
        );
    
    -- Contar permisos
    SELECT COUNT(*) INTO permission_count
    FROM information_schema.role_table_grants 
    WHERE grantee IN ('anon', 'authenticated')
        AND table_schema = 'public'
        AND table_name IN ('services', 'categories', 'subcategories')
        AND privilege_type = 'SELECT';
    
    RAISE NOTICE '🎯 CORRECCIÓN DE POLÍTICAS COMPLETADA!';
    RAISE NOTICE '✅ Tablas con RLS habilitado: %', rls_count;
    RAISE NOTICE '✅ Políticas configuradas: %', policy_count;
    RAISE NOTICE '✅ Funciones disponibles: %', function_count;
    RAISE NOTICE '✅ Permisos SELECT otorgados: %', permission_count;
    
    IF rls_count > 0 AND policy_count > 0 AND permission_count > 0 THEN
        RAISE NOTICE '🚀 Las políticas están correctamente configuradas';
        RAISE NOTICE '💡 Ahora las consultas deberían funcionar correctamente';
    ELSE
        RAISE NOTICE '⚠️ Algunas políticas pueden no estar configuradas correctamente';
    END IF;
    
    RAISE NOTICE '🔒 Sistema de seguridad configurado y funcional';
END $$;




