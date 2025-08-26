-- Políticas RLS para el sistema de chat
-- Ejecutar en Supabase SQL Editor

-- 1. Habilitar RLS en las tablas
ALTER TABLE chat_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- 2. Política para chat_notifications
-- Los usuarios pueden ver sus propias notificaciones
CREATE POLICY "Users can view their own notifications" ON chat_notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Los usuarios pueden insertar notificaciones para otros usuarios
CREATE POLICY "Users can insert notifications for others" ON chat_notifications
  FOR INSERT WITH CHECK (true);

-- Los usuarios pueden actualizar sus propias notificaciones
CREATE POLICY "Users can update their own notifications" ON chat_notifications
  FOR UPDATE USING (auth.uid() = user_id);

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

-- 6. Política especial para administradores
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

-- 7. Función helper para verificar si es admin (maneja función existente)
-- Eliminar función existente si existe
DROP FUNCTION IF EXISTS is_admin(uuid);
DROP FUNCTION IF EXISTS is_admin(user_uuid uuid);

-- Crear la nueva función
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Comentarios sobre el uso
COMMENT ON TABLE chat_notifications IS 'Notificaciones del sistema de chat';
COMMENT ON TABLE conversations IS 'Conversaciones del chat';
COMMENT ON TABLE messages IS 'Mensajes de las conversaciones';
COMMENT ON TABLE conversation_participants IS 'Participantes de las conversaciones';

-- 9. Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_chat_notifications_user_id ON chat_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_notifications_conversation_id ON chat_notifications(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
