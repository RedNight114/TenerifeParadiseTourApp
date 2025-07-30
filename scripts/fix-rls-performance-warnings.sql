-- Script para corregir warnings de performance de RLS
-- Optimiza las políticas RLS y elimina duplicadas
-- Ejecutar en el SQL Editor de Supabase

-- =====================================================
-- 1. ELIMINAR POLÍTICAS DUPLICADAS Y ANTIGUAS
-- =====================================================

-- Eliminar políticas duplicadas en audit_logs
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS audit_logs_insert_policy ON public.audit_logs;
DROP POLICY IF EXISTS audit_logs_select_policy ON public.audit_logs;

-- Eliminar políticas duplicadas en payments
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can update payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;

-- Eliminar políticas duplicadas en profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authorized users can create profiles" ON public.profiles;
DROP POLICY IF EXISTS profiles_select_policy ON public.profiles;
DROP POLICY IF EXISTS profiles_update_policy ON public.profiles;

-- =====================================================
-- 2. CREAR POLÍTICAS OPTIMIZADAS PARA AUDIT_LOGS
-- =====================================================

-- Política optimizada para INSERT en audit_logs
CREATE POLICY "audit_logs_insert_optimized" ON public.audit_logs
    FOR INSERT
    WITH CHECK (
        (SELECT auth.role()) = 'authenticated' OR
        (SELECT auth.role()) = 'service_role'
    );

-- Política optimizada para SELECT en audit_logs
CREATE POLICY "audit_logs_select_optimized" ON public.audit_logs
    FOR SELECT
    USING (
        (SELECT auth.role()) = 'authenticated' OR
        (SELECT auth.role()) = 'service_role'
    );

-- =====================================================
-- 3. CREAR POLÍTICAS OPTIMIZADAS PARA PAYMENTS
-- =====================================================

-- Política optimizada para SELECT en payments
CREATE POLICY "payments_select_optimized" ON public.payments
    FOR SELECT
    USING (
        (SELECT auth.uid()) = user_id OR
        (SELECT auth.role()) = 'authenticated'
    );

-- Política optimizada para INSERT en payments
CREATE POLICY "payments_insert_optimized" ON public.payments
    FOR INSERT
    WITH CHECK (
        (SELECT auth.uid()) = user_id
    );

-- Política optimizada para UPDATE en payments
CREATE POLICY "payments_update_optimized" ON public.payments
    FOR UPDATE
    USING (
        (SELECT auth.uid()) = user_id OR
        (SELECT auth.role()) = 'authenticated'
    )
    WITH CHECK (
        (SELECT auth.uid()) = user_id OR
        (SELECT auth.role()) = 'authenticated'
    );

-- =====================================================
-- 4. CREAR POLÍTICAS OPTIMIZADAS PARA PROFILES
-- =====================================================

-- Política optimizada para SELECT en profiles
CREATE POLICY "profiles_select_optimized" ON public.profiles
    FOR SELECT
    USING (
        (SELECT auth.uid()) = id OR
        (SELECT auth.role()) = 'authenticated'
    );

-- Política optimizada para INSERT en profiles
CREATE POLICY "profiles_insert_optimized" ON public.profiles
    FOR INSERT
    WITH CHECK (
        (SELECT auth.uid()) = id
    );

-- Política optimizada para UPDATE en profiles
CREATE POLICY "profiles_update_optimized" ON public.profiles
    FOR UPDATE
    USING (
        (SELECT auth.uid()) = id
    )
    WITH CHECK (
        (SELECT auth.uid()) = id
    );

-- =====================================================
-- 5. VERIFICAR CORRECCIÓN
-- =====================================================

SELECT 
    'CORRECCIÓN DE PERFORMANCE RLS COMPLETA' as mensaje,
    'Políticas duplicadas eliminadas y optimizadas' as detalle,
    'Revisa el Supabase Linter para confirmar que no hay warnings de performance' as siguiente_paso; 