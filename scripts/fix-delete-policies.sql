-- Script para corregir políticas RLS de eliminación
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- VERIFICAR POLÍTICAS ACTUALES
-- =====================================================

-- Ver todas las políticas en conversations
SELECT 
    'CONVERSATIONS POLICIES' as tipo,
    policyname,
    cmd,
    permissive,
    roles,
    qual
FROM pg_policies 
WHERE tablename = 'conversations'
ORDER BY policyname;

-- Ver todas las políticas en messages
SELECT 
    'MESSAGES POLICIES' as tipo,
    policyname,
    cmd,
    permissive,
    roles,
    qual
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY policyname;

-- =====================================================
-- ELIMINAR POLÍTICAS PROBLEMÁTICAS
-- =====================================================

-- Eliminar todas las políticas de DELETE existentes
DROP POLICY IF EXISTS "Admins can delete any conversation" ON conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;
DROP POLICY IF EXISTS "Admins can delete conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete messages from their conversations" ON messages;
DROP POLICY IF EXISTS "Delete messages with conversations" ON messages;

-- =====================================================
-- CREAR POLÍTICAS RLS SIMPLES Y FUNCIONALES
-- =====================================================

-- Política para que admins puedan eliminar cualquier conversación
CREATE POLICY "admin_delete_conversations" ON conversations
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Política para que usuarios puedan eliminar sus propias conversaciones
CREATE POLICY "user_delete_own_conversations" ON conversations
    FOR DELETE
    TO authenticated
    USING (
        user_id = auth.uid()
    );

-- Política para eliminar mensajes (sin restricciones adicionales)
CREATE POLICY "delete_messages" ON messages
    FOR DELETE
    TO authenticated
    USING (true);

-- Política para eliminar participantes (sin restricciones adicionales)
CREATE POLICY "delete_participants" ON conversation_participants
    FOR DELETE
    TO authenticated
    USING (true);

-- =====================================================
-- VERIFICAR QUE LAS POLÍTICAS SE CREARON
-- =====================================================

-- Verificar políticas creadas
SELECT 
    'NEW POLICIES' as tipo,
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages', 'conversation_participants')
AND policyname LIKE '%delete%'
ORDER BY tablename, policyname;

-- =====================================================
-- VERIFICAR QUE RLS ESTÁ HABILITADO
-- =====================================================

-- Verificar si RLS está habilitado en las tablas
SELECT 
    'RLS STATUS' as tipo,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('conversations', 'messages', 'conversation_participants')
AND schemaname = 'public';

SELECT 'POLÍTICAS RLS DE ELIMINACIÓN CREADAS CORRECTAMENTE' as status;
