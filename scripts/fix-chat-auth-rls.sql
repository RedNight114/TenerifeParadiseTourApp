-- Script para corregir las políticas RLS del chat
-- Ejecutar en Supabase SQL Editor

-- 1. Eliminar políticas existentes problemáticas
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON messages;
DROP POLICY IF EXISTS "Users can view participants from their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can insert participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "conversations_select_policy" ON conversations;
DROP POLICY IF EXISTS "messages_select_policy" ON messages;
DROP POLICY IF EXISTS "participants_select_policy" ON conversation_participants;
DROP POLICY IF EXISTS "participants_insert_policy" ON conversation_participants;
DROP POLICY IF EXISTS "conversations_insert_policy" ON conversations;
DROP POLICY IF EXISTS "conversations_update_policy" ON conversations;
DROP POLICY IF EXISTS "messages_insert_policy" ON messages;
DROP POLICY IF EXISTS "messages_update_policy" ON messages;
DROP POLICY IF EXISTS "participants_update_policy" ON conversation_participants;
DROP POLICY IF EXISTS "chat_notifications_policy" ON chat_notifications;
DROP POLICY IF EXISTS "chat_notifications_all_policy" ON chat_notifications;
DROP POLICY IF EXISTS "admins_view_all_conversations" ON conversations;
DROP POLICY IF EXISTS "admins_view_all_messages" ON messages;
DROP POLICY IF EXISTS "admins_view_all_participants" ON conversation_participants;
DROP POLICY IF EXISTS "admins_delete_conversations" ON conversations;

-- 2. Habilitar RLS en las tablas
ALTER TABLE chat_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- 3. Política simple para chat_notifications (permite todo para usuarios autenticados)
CREATE POLICY "chat_notifications_all_policy" ON chat_notifications
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 4. Políticas para conversations (SIN RECURSIÓN)
-- Los usuarios pueden ver conversaciones donde son participantes
CREATE POLICY "conversations_select_policy" ON conversations
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = conversations.id
        AND cp.user_id = auth.uid()
      )
    )
  );

-- Los usuarios pueden crear conversaciones
CREATE POLICY "conversations_insert_policy" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propias conversaciones
CREATE POLICY "conversations_update_policy" ON conversations
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = conversations.id
        AND cp.user_id = auth.uid()
        AND cp.role = 'admin'
      )
    )
  );

-- 5. Políticas para messages (SIN RECURSIÓN)
-- Los usuarios pueden ver mensajes de conversaciones donde participan
CREATE POLICY "messages_select_policy" ON messages
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      sender_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = messages.conversation_id
        AND cp.user_id = auth.uid()
      )
    )
  );

-- Los usuarios pueden insertar mensajes en conversaciones donde participan
CREATE POLICY "messages_insert_policy" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

-- Los usuarios pueden actualizar sus propios mensajes
CREATE POLICY "messages_update_policy" ON messages
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND sender_id = auth.uid()
  );

-- 6. Políticas para conversation_participants (SIN RECURSIÓN)
-- Los usuarios pueden ver participantes de conversaciones donde participan
CREATE POLICY "participants_select_policy" ON conversation_participants
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM conversation_participants cp2
        WHERE cp2.conversation_id = conversation_participants.conversation_id
        AND cp2.user_id = auth.uid()
      )
    )
  );

-- Los usuarios pueden insertar participantes en conversaciones donde participan
CREATE POLICY "participants_insert_policy" ON conversation_participants
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = conversation_participants.conversation_id
        AND cp.user_id = auth.uid()
        AND cp.role IN ('admin', 'moderator')
      )
    )
  );

-- Los usuarios pueden actualizar su propia participación
CREATE POLICY "participants_update_policy" ON conversation_participants
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- 7. Políticas especiales para administradores
-- Los administradores pueden ver todas las conversaciones
CREATE POLICY "admins_view_all_conversations" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Los administradores pueden ver todos los mensajes
CREATE POLICY "admins_view_all_messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Los administradores pueden ver todos los participantes
CREATE POLICY "admins_view_all_participants" ON conversation_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Los administradores pueden eliminar conversaciones
CREATE POLICY "admins_delete_conversations" ON conversations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 8. Verificar que las políticas están activas
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
WHERE tablename IN ('messages', 'conversations', 'conversation_participants', 'chat_notifications')
ORDER BY tablename, policyname;
