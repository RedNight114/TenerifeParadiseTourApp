-- Políticas RLS ULTRA-SIMPLES para el sistema de chat
-- Ejecutar en Supabase SQL Editor - Sin recursión, sin conflictos

-- 1. Habilitar RLS en las tablas
ALTER TABLE chat_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- 2. Política para chat_notifications (permite todo)
CREATE POLICY "chat_notifications_all" ON chat_notifications
  FOR ALL USING (true);

-- 3. Política para conversations
CREATE POLICY "conversations_all" ON conversations
  FOR ALL USING (true);

-- 4. Política para messages
CREATE POLICY "messages_all" ON messages
  FOR ALL USING (true);

-- 5. Política para conversation_participants
CREATE POLICY "participants_all" ON conversation_participants
  FOR ALL USING (true);

-- 6. Verificación final
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('chat_notifications', 'conversations', 'messages', 'conversation_participants')
ORDER BY tablename, policyname;
