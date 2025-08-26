-- Políticas RLS MÍNIMAS para el sistema de chat
-- Ejecutar en Supabase SQL Editor - Versión ultra-simple

-- 1. Habilitar RLS en las tablas
ALTER TABLE chat_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- 2. Política simple para chat_notifications (permite todo)
CREATE POLICY "chat_notifications_policy" ON chat_notifications
  FOR ALL USING (true);

-- 3. Política para conversations
CREATE POLICY "conversations_select_policy" ON conversations
  FOR SELECT USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "conversations_insert_policy" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "conversations_update_policy" ON conversations
  FOR UPDATE USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- 4. Política para messages
CREATE POLICY "messages_select_policy" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "messages_insert_policy" ON messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- 5. Política para conversation_participants
CREATE POLICY "participants_select_policy" ON conversation_participants
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "participants_insert_policy" ON conversation_participants
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "participants_update_policy" ON conversation_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. Política para administradores
CREATE POLICY "admin_conversations_policy" ON conversations
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
