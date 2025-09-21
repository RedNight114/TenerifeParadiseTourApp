-- Script para crear función RPC para eliminar conversaciones
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- CREAR FUNCIÓN RPC PARA ELIMINAR CONVERSACIONES
-- =====================================================

-- Eliminar función existente si existe
DROP FUNCTION IF EXISTS delete_conversation_with_messages(UUID, UUID);

-- Crear función RPC para eliminar conversación con mensajes
CREATE OR REPLACE FUNCTION delete_conversation_with_messages(
    conversation_id UUID,
    user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    conversation_record RECORD;
    user_profile RECORD;
BEGIN
    -- Verificar que la conversación existe
    SELECT id, user_id, admin_id 
    INTO conversation_record
    FROM conversations 
    WHERE id = conversation_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Conversación no encontrada';
    END IF;
    
    -- Verificar permisos del usuario
    SELECT role 
    INTO user_profile
    FROM profiles 
    WHERE id = user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuario no encontrado';
    END IF;
    
    -- Verificar si el usuario tiene permisos para eliminar
    IF conversation_record.user_id != user_id 
       AND conversation_record.admin_id != user_id 
       AND user_profile.role NOT IN ('admin', 'moderator') THEN
        RAISE EXCEPTION 'No tienes permisos para eliminar esta conversación';
    END IF;
    
    -- Eliminar mensajes primero (cascada)
    DELETE FROM messages WHERE conversation_id = conversation_id;
    
    -- Eliminar participantes de la conversación
    DELETE FROM conversation_participants WHERE conversation_id = conversation_id;
    
    -- Eliminar la conversación
    DELETE FROM conversations WHERE id = conversation_id;
    
    RETURN TRUE;
END;
$$;

-- =====================================================
-- CREAR POLÍTICAS RLS MEJORADAS
-- =====================================================

-- Política para que los admins puedan eliminar cualquier conversación
DROP POLICY IF EXISTS "Admins can delete any conversation" ON conversations;
CREATE POLICY "Admins can delete any conversation" ON conversations
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- Política para que los usuarios puedan eliminar sus propias conversaciones
DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;
CREATE POLICY "Users can delete own conversations" ON conversations
    FOR DELETE
    TO authenticated
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- Política para eliminar mensajes (cascada con conversaciones)
DROP POLICY IF EXISTS "Users can delete messages from their conversations" ON messages;
CREATE POLICY "Users can delete messages from their conversations" ON messages
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
                    AND profiles.role IN ('admin', 'moderator')
                )
            )
        )
    );

-- =====================================================
-- VERIFICAR CONFIGURACIÓN
-- =====================================================

-- Verificar que la función existe
SELECT 
    'FUNCTION CREATED' as status,
    proname as function_name,
    proargnames as parameters
FROM pg_proc 
WHERE proname = 'delete_conversation_with_messages';

-- Verificar políticas RLS
SELECT 
    'RLS POLICIES' as tipo,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages')
ORDER BY tablename, policyname;

SELECT 'FUNCIÓN RPC CREADA: delete_conversation_with_messages configurada correctamente' as status;
