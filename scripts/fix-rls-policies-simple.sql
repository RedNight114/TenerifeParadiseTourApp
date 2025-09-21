-- Script simple para verificar y corregir políticas RLS del chat
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- VERIFICAR POLÍTICAS RLS ACTUALES
-- =====================================================

-- Ver políticas en conversations
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

-- Ver políticas en messages
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
-- CREAR POLÍTICAS RLS SIMPLES PARA BORRADO
-- =====================================================

-- Eliminar políticas existentes de DELETE
DROP POLICY IF EXISTS "Admins can delete any conversation" ON conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete messages from their conversations" ON messages;

-- Política simple para que admins puedan eliminar cualquier conversación
CREATE POLICY "Admins can delete conversations" ON conversations
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
CREATE POLICY "Users can delete own conversations" ON conversations
    FOR DELETE
    TO authenticated
    USING (
        user_id = auth.uid()
    );

-- Política para eliminar mensajes (cascada)
CREATE POLICY "Delete messages with conversations" ON messages
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = messages.conversation_id 
            AND (
                conversations.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role = 'admin'
                )
            )
        )
    );

-- =====================================================
-- VERIFICAR RESULTADO
-- =====================================================

-- Verificar políticas creadas
SELECT 
    'NEW POLICIES' as tipo,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages')
AND policyname LIKE '%delete%'
ORDER BY tablename, policyname;

SELECT 'POLÍTICAS RLS SIMPLES CREADAS PARA BORRADO' as status;
