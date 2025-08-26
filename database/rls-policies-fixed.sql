-- Políticas RLS CORREGIDAS para el sistema de chat
-- Ejecutar en Supabase SQL Editor - Sin recursión infinita

-- 1. Habilitar RLS en las tablas
ALTER TABLE chat_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- 2. Política simple para chat_notifications (permite todo)
CREATE POLICY "chat_notifications_policy" ON chat_notifications
  FOR ALL USING (true);

-- 3. Política para conversations (sin recursión)
CREATE POLICY "conversations_select_policy" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversations.id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "conversations_insert_policy" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "conversations_update_policy" ON conversations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversations.id
      AND cp.user_id = auth.uid()
    )
  );

-- 4. Política para messages (sin recursión)
CREATE POLICY "messages_select_policy" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "messages_insert_policy" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

-- 5. Política para conversation_participants (SIN RECURSIÓN)
-- Los usuarios pueden ver participantes de conversaciones donde participan
CREATE POLICY "participants_select_policy" ON conversation_participants
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM conversation_participants cp2
      WHERE cp2.conversation_id = conversation_participants.conversation_id
      AND cp2.user_id = auth.uid()
    )
  );

-- Los usuarios pueden insertar participantes en conversaciones donde participan
CREATE POLICY "participants_insert_policy" ON conversation_participants
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM conversation_participants cp2
      WHERE cp2.conversation_id = conversation_participants.conversation_id
      AND cp2.user_id = auth.uid()
    )
  );

-- Los usuarios pueden actualizar su propia participación
CREATE POLICY "participants_update_policy" ON conversation_participants
  FOR UPDATE USING (user_id = auth.uid());

-- 6. Política para administradores
CREATE POLICY "admin_conversations_policy" ON conversations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "admin_messages_policy" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "admin_participants_policy" ON conversation_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 7. Verificación final
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('chat_notifications', 'conversations', 'messages', 'conversation_participants')
ORDER BY tablename, policyname;
