-- Script para habilitar RLS con políticas muy permisivas
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- HABILITAR RLS CON POLÍTICAS PERMISIVAS
-- =====================================================

-- Habilitar RLS en las tablas
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
-- =====================================================

-- Eliminar todas las políticas de conversations
DROP POLICY IF EXISTS "admin_delete_conversations" ON conversations;
DROP POLICY IF EXISTS "user_delete_own_conversations" ON conversations;
DROP POLICY IF EXISTS "Admins can delete any conversation" ON conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;
DROP POLICY IF EXISTS "Admins can delete conversations" ON conversations;

-- Eliminar todas las políticas de messages
DROP POLICY IF EXISTS "delete_messages" ON messages;
DROP POLICY IF EXISTS "Users can delete messages from their conversations" ON messages;
DROP POLICY IF EXISTS "Delete messages with conversations" ON messages;

-- Eliminar todas las políticas de conversation_participants
DROP POLICY IF EXISTS "delete_participants" ON conversation_participants;

-- =====================================================
-- CREAR POLÍTICAS MUY PERMISIVAS
-- =====================================================

-- Política muy permisiva para conversations (solo usuarios autenticados)
CREATE POLICY "authenticated_users_all_access_conversations" ON conversations
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política muy permisiva para messages (solo usuarios autenticados)
CREATE POLICY "authenticated_users_all_access_messages" ON messages
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política muy permisiva para conversation_participants (solo usuarios autenticados)
CREATE POLICY "authenticated_users_all_access_participants" ON conversation_participants
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- VERIFICAR CONFIGURACIÓN
-- =====================================================

-- Verificar que RLS está habilitado
SELECT 
    'RLS STATUS' as tipo,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('conversations', 'messages', 'conversation_participants')
AND schemaname = 'public';

-- Verificar políticas creadas
SELECT 
    'POLICIES' as tipo,
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages', 'conversation_participants')
ORDER BY tablename, policyname;

SELECT 'RLS HABILITADO CON POLÍTICAS PERMISIVAS' as status;
