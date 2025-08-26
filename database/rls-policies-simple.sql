-- Políticas RLS SIMPLIFICADAS para el sistema de chat
-- Ejecutar en Supabase SQL Editor - Versión sin conflictos

-- 1. Habilitar RLS en las tablas
ALTER TABLE chat_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- 2. Política para chat_notifications (permite inserción)
CREATE POLICY "Allow chat notifications operations" ON chat_notifications
  FOR ALL USING (true);

-- 3. Política para conversations
-- Los usuarios pueden ver conversaciones donde son participantes
CREATE POLICY "Users can view conversations they participate in" ON conversations
  FOR SELECT USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Los usuarios pueden crear conversaciones
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar conversaciones donde son participantes
CREATE POLICY "Users can update conversations they participate in" ON conversations
  FOR UPDATE USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- 4. Política para messages
-- Los usuarios pueden ver mensajes de conversaciones donde participan
CREATE POLICY "Users can view messages from their conversations" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Los usuarios pueden insertar mensajes en conversaciones donde participan
CREATE POLICY "Users can insert messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- 5. Política para conversation_participants
-- Los usuarios pueden ver participantes de conversaciones donde participan
CREATE POLICY "Users can view participants from their conversations" ON conversation_participants
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Los usuarios pueden insertar participantes en conversaciones donde participan
CREATE POLICY "Users can insert participants in their conversations" ON conversation_participants
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Los usuarios pueden actualizar su participación
CREATE POLICY "Users can update their own participation" ON conversation_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. Política especial para administradores (usando role directo)
-- Los administradores pueden ver todas las conversaciones
CREATE POLICY "Admins can view all conversations" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Los administradores pueden eliminar conversaciones
CREATE POLICY "Admins can delete conversations" ON conversations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 7. Comentarios sobre el uso
COMMENT ON TABLE chat_notifications IS 'Notificaciones del sistema de chat';
COMMENT ON TABLE conversations IS 'Conversaciones del chat';
COMMENT ON TABLE messages IS 'Mensajes de las conversaciones';
COMMENT ON TABLE conversation_participants IS 'Participantes de las conversaciones';

-- 8. Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_chat_notifications_user_id ON chat_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_notifications_conversation_id ON chat_notifications(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);

-- 9. Verificación de políticas creadas
-- Ejecutar después para verificar que todo se creó correctamente
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
WHERE schemaname = 'public' 
  AND tablename IN ('chat_notifications', 'conversations', 'messages', 'conversation_participants')
ORDER BY tablename, policyname;
