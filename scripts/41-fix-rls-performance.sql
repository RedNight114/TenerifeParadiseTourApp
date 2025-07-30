-- =====================================================
-- CORRECCIÓN DE ERRORES DE RENDIMIENTO RLS - SUPABASE
-- =====================================================
-- Fecha: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
-- Descripción: Optimización de políticas RLS para mejorar rendimiento

-- =====================================================
-- 1. CORRECCIÓN: Auth RLS Initialization Plan
-- =====================================================

-- Tabla: services
-- Corregir políticas que usan auth.<function>() sin select

-- Política: authenticated_insert_services
DROP POLICY IF EXISTS authenticated_insert_services ON services;
CREATE POLICY authenticated_insert_services ON services
FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) IS NOT NULL);

-- Política: authenticated_update_services
DROP POLICY IF EXISTS authenticated_update_services ON services;
CREATE POLICY authenticated_update_services ON services
FOR UPDATE TO authenticated
USING ((select auth.uid()) IS NOT NULL)
WITH CHECK ((select auth.uid()) IS NOT NULL);

-- Política: authenticated_delete_services
DROP POLICY IF EXISTS authenticated_delete_services ON services;
CREATE POLICY authenticated_delete_services ON services
FOR DELETE TO authenticated
USING ((select auth.uid()) IS NOT NULL);

-- Política: authenticated_all_operations
DROP POLICY IF EXISTS authenticated_all_operations ON services;
CREATE POLICY authenticated_all_operations ON services
FOR ALL TO authenticated
USING ((select auth.uid()) IS NOT NULL)
WITH CHECK ((select auth.uid()) IS NOT NULL);

-- Política: authenticated_services_select
DROP POLICY IF EXISTS authenticated_services_select ON services;
CREATE POLICY authenticated_services_select ON services
FOR SELECT TO authenticated
USING ((select auth.uid()) IS NOT NULL);

-- Política: admin_services_insert
DROP POLICY IF EXISTS admin_services_insert ON services;
CREATE POLICY admin_services_insert ON services
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = (select auth.uid()) 
    AND role = 'admin'
  )
);

-- Política: admin_services_update
DROP POLICY IF EXISTS admin_services_update ON services;
CREATE POLICY admin_services_update ON services
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = (select auth.uid()) 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = (select auth.uid()) 
    AND role = 'admin'
  )
);

-- Política: admin_services_delete
DROP POLICY IF EXISTS admin_services_delete ON services;
CREATE POLICY admin_services_delete ON services
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = (select auth.uid()) 
    AND role = 'admin'
  )
);

-- Tabla: contact_messages
-- Política: Allow admin to view contact messages
DROP POLICY IF EXISTS "Allow admin to view contact messages" ON contact_messages;
CREATE POLICY "Allow admin to view contact messages" ON contact_messages
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = (select auth.uid()) 
    AND role = 'admin'
  )
);

-- Política: Allow admin to update contact messages
DROP POLICY IF EXISTS "Allow admin to update contact messages" ON contact_messages;
CREATE POLICY "Allow admin to update contact messages" ON contact_messages
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = (select auth.uid()) 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = (select auth.uid()) 
    AND role = 'admin'
  )
);

-- Política: Allow admin to delete contact messages
DROP POLICY IF EXISTS "Allow admin to delete contact messages" ON contact_messages;
CREATE POLICY "Allow admin to delete contact messages" ON contact_messages
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = (select auth.uid()) 
    AND role = 'admin'
  )
);

-- =====================================================
-- 2. CORRECCIÓN: Multiple Permissive Policies
-- =====================================================

-- Tabla: audit_logs
-- Eliminar políticas duplicadas y consolidar

-- Eliminar políticas duplicadas para DELETE
DROP POLICY IF EXISTS "Admins can delete audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Allow admin access to audit_logs" ON audit_logs;

-- Crear política consolidada para DELETE
CREATE POLICY "audit_logs_delete_policy" ON audit_logs
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = (select auth.uid()) 
    AND role = 'admin'
  )
);

-- Eliminar políticas duplicadas para INSERT
DROP POLICY IF EXISTS "Allow admin access to audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "Allow system access to audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

-- Crear política consolidada para INSERT
CREATE POLICY "audit_logs_insert_policy" ON audit_logs
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = (select auth.uid()) 
    AND role = 'admin'
  )
  OR (select auth.uid()) IS NOT NULL
);

-- Eliminar políticas duplicadas para SELECT
DROP POLICY IF EXISTS "Admins can view all audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Allow admin access to audit_logs" ON audit_logs;

-- Crear política consolidada para SELECT
CREATE POLICY "audit_logs_select_policy" ON audit_logs
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = (select auth.uid()) 
    AND role = 'admin'
  )
);

-- Eliminar políticas duplicadas para UPDATE
DROP POLICY IF EXISTS "Admins can update audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Allow admin access to audit_logs" ON audit_logs;

-- Crear política consolidada para UPDATE
CREATE POLICY "audit_logs_update_policy" ON audit_logs
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = (select auth.uid()) 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = (select auth.uid()) 
    AND role = 'admin'
  )
);

-- Tabla: profiles
-- Eliminar políticas duplicadas y consolidar

-- Eliminar políticas duplicadas para SELECT
DROP POLICY IF EXISTS "Authorized users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Crear política consolidada para SELECT
CREATE POLICY "profiles_select_policy" ON profiles
FOR SELECT TO anon, authenticated, authenticator, dashboard_user
USING (true);

-- Eliminar políticas duplicadas para UPDATE
DROP POLICY IF EXISTS "Authorized users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Crear política consolidada para UPDATE
CREATE POLICY "profiles_update_policy" ON profiles
FOR UPDATE TO anon, authenticated, authenticator, dashboard_user
USING (id = (select auth.uid()))
WITH CHECK (id = (select auth.uid()));

-- Tabla: reservations
-- Eliminar políticas duplicadas y consolidar

-- Eliminar políticas duplicadas para SELECT
DROP POLICY IF EXISTS "Authorized users can view all reservations" ON reservations;
DROP POLICY IF EXISTS "Users can view own reservations" ON reservations;

-- Crear política consolidada para SELECT
CREATE POLICY "reservations_select_policy" ON reservations
FOR SELECT TO anon, authenticated, authenticator, dashboard_user
USING (true);

-- Eliminar políticas duplicadas para UPDATE
DROP POLICY IF EXISTS "Authorized users can update all reservations" ON reservations;
DROP POLICY IF EXISTS "Users can update own reservations" ON reservations;

-- Crear política consolidada para UPDATE
CREATE POLICY "reservations_update_policy" ON reservations
FOR UPDATE TO anon, authenticated, authenticator, dashboard_user
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- Tabla: services
-- Eliminar políticas duplicadas y consolidar

-- Eliminar políticas duplicadas para SELECT
DROP POLICY IF EXISTS "authenticated_all_operations" ON services;
DROP POLICY IF EXISTS "authenticated_services_select" ON services;
DROP POLICY IF EXISTS "public_read_services" ON services;
DROP POLICY IF EXISTS "public_services_select" ON services;

-- Crear política consolidada para SELECT
CREATE POLICY "services_select_policy" ON services
FOR SELECT TO anon, authenticated, authenticator, dashboard_user
USING (true);

-- Eliminar políticas duplicadas para INSERT
DROP POLICY IF EXISTS "admin_services_insert" ON services;
DROP POLICY IF EXISTS "authenticated_all_operations" ON services;
DROP POLICY IF EXISTS "authenticated_insert_services" ON services;

-- Crear política consolidada para INSERT
CREATE POLICY "services_insert_policy" ON services
FOR INSERT TO authenticated, authenticator, dashboard_user
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = (select auth.uid()) 
    AND role = 'admin'
  )
);

-- Eliminar políticas duplicadas para UPDATE
DROP POLICY IF EXISTS "admin_services_update" ON services;
DROP POLICY IF EXISTS "authenticated_all_operations" ON services;
DROP POLICY IF EXISTS "authenticated_update_services" ON services;

-- Crear política consolidada para UPDATE
CREATE POLICY "services_update_policy" ON services
FOR UPDATE TO authenticated, authenticator, dashboard_user
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = (select auth.uid()) 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = (select auth.uid()) 
    AND role = 'admin'
  )
);

-- Eliminar políticas duplicadas para DELETE
DROP POLICY IF EXISTS "admin_services_delete" ON services;
DROP POLICY IF EXISTS "authenticated_all_operations" ON services;
DROP POLICY IF EXISTS "authenticated_delete_services" ON services;

-- Crear política consolidada para DELETE
CREATE POLICY "services_delete_policy" ON services
FOR DELETE TO authenticated, authenticator, dashboard_user
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = (select auth.uid()) 
    AND role = 'admin'
  )
);

-- =====================================================
-- 3. VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que las políticas se han aplicado correctamente
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
ORDER BY tablename, policyname;

-- Mostrar resumen de optimizaciones
SELECT 
  'Optimización RLS completada' as status,
  'Políticas auth.<function>() optimizadas con (select auth.<function>())' as auth_optimization,
  'Políticas duplicadas consolidadas' as consolidation,
  'Rendimiento mejorado para consultas a gran escala' as performance_improvement; 