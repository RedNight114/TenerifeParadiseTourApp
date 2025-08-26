-- Script para corregir las políticas RLS de audit_logs
-- Ejecutar en Supabase SQL Editor
-- SOLUCIONA el error "new row violates row-level security policy for table audit_logs"

-- =====================================================
-- 1. VERIFICAR TABLA audit_logs
-- =====================================================

-- Verificar si la tabla existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'audit_logs';

-- =====================================================
-- 2. VERIFICAR POLÍTICAS RLS EXISTENTES
-- =====================================================

-- Verificar políticas RLS actuales
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
WHERE tablename = 'audit_logs';

-- =====================================================
-- 3. ELIMINAR POLÍTICAS RLS PROBLEMÁTICAS
-- =====================================================

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON audit_logs;
DROP POLICY IF EXISTS "Enable select for authenticated users only" ON audit_logs;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON audit_logs;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON audit_logs;

-- =====================================================
-- 4. CREAR POLÍTICAS RLS CORRECTAS
-- =====================================================

-- Política para INSERT - permitir a usuarios autenticados insertar logs
CREATE POLICY "Enable insert for authenticated users only" ON audit_logs
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- Política para SELECT - permitir a usuarios autenticados ver logs
CREATE POLICY "Enable select for authenticated users only" ON audit_logs
    FOR SELECT 
    TO authenticated
    USING (true);

-- Política para UPDATE - permitir a usuarios autenticados actualizar logs
CREATE POLICY "Enable update for authenticated users only" ON audit_logs
    FOR UPDATE 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para DELETE - permitir a usuarios autenticados eliminar logs
CREATE POLICY "Enable delete for authenticated users only" ON audit_logs
    FOR DELETE 
    TO authenticated
    USING (true);

-- =====================================================
-- 5. VERIFICAR IMPLEMENTACIÓN
-- =====================================================

-- Verificar que las políticas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'audit_logs'
ORDER BY policyname;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Políticas RLS de audit_logs corregidas exitosamente';
    RAISE NOTICE '✅ Usuarios autenticados pueden insertar logs';
    RAISE NOTICE '✅ Sistema de auditoría funcionando';
END $$; 