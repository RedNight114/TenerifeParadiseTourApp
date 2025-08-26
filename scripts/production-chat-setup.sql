-- Script de configuración del sistema de chat para PRODUCCIÓN
-- Este script configura políticas RLS seguras y optimizaciones de rendimiento

-- =====================================================
-- PASO 1: LIMPIEZA Y PREPARACIÓN
-- =====================================================

-- Eliminar políticas existentes problemáticas
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
DROP POLICY IF EXISTS "Admins can view all conversations" ON conversations;
DROP POLICY IF EXISTS "Admins can update all conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;

-- =====================================================
-- PASO 2: POLÍTICAS RLS SEGURAS PARA conversations
-- =====================================================

-- Política para SELECT - usuarios ven sus propias conversaciones, admins ven todas
CREATE POLICY "conversations_select_secure" ON conversations
  FOR SELECT USING (
    user_id = auth.uid() OR
    admin_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Política para INSERT - usuarios solo pueden crear conversaciones para sí mismos
CREATE POLICY "conversations_insert_secure" ON conversations
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    user_id IS NOT NULL
  );

-- Política para UPDATE - usuarios actualizan sus conversaciones, admins actualizan todas
CREATE POLICY "conversations_update_secure" ON conversations
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Política para DELETE - solo admins pueden eliminar conversaciones
CREATE POLICY "conversations_delete_secure" ON conversations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- =====================================================
-- PASO 3: POLÍTICAS RLS SEGURAS PARA conversation_participants
-- =====================================================

-- Política para SELECT - participantes ven otros participantes de sus conversaciones
CREATE POLICY "participants_select_secure" ON conversation_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_participants.conversation_id
      AND (c.user_id = auth.uid() OR c.admin_id = auth.uid())
    ) OR
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Política para INSERT - usuarios se agregan a sus conversaciones, admins agregan a cualquiera
CREATE POLICY "participants_insert_secure" ON conversation_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_participants.conversation_id
      AND c.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Política para UPDATE - usuarios actualizan su participación, admins actualizan cualquiera
CREATE POLICY "participants_update_secure" ON conversation_participants
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Política para DELETE - usuarios eliminan su participación, admins eliminan cualquiera
CREATE POLICY "participants_delete_secure" ON conversation_participants
  FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- =====================================================
-- PASO 4: POLÍTICAS RLS SEGURAS PARA messages
-- =====================================================

-- Política para SELECT - usuarios ven mensajes de sus conversaciones
CREATE POLICY "messages_select_secure" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Política para INSERT - usuarios envían mensajes en sus conversaciones
CREATE POLICY "messages_insert_secure" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Política para UPDATE - usuarios editan sus propios mensajes, admins editan cualquiera
CREATE POLICY "messages_update_secure" ON messages
  FOR UPDATE USING (
    sender_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Política para DELETE - solo admins pueden eliminar mensajes
CREATE POLICY "messages_delete_secure" ON messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- =====================================================
-- PASO 5: POLÍTICAS RLS SEGURAS PARA OTRAS TABLAS
-- =====================================================

-- Políticas para chat_notifications
CREATE POLICY "notifications_select_secure" ON chat_notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update_secure" ON chat_notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Políticas para chat_attachments
CREATE POLICY "attachments_select_secure" ON chat_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE m.id = chat_attachments.message_id
      AND cp.user_id = auth.uid()
    )
  );

-- Políticas para typing_indicators
CREATE POLICY "typing_select_secure" ON typing_indicators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = typing_indicators.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "typing_insert_secure" ON typing_indicators
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = typing_indicators.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

-- Políticas para chat_settings
CREATE POLICY "settings_secure" ON chat_settings
  FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- PASO 6: OPTIMIZACIONES DE RENDIMIENTO
-- =====================================================

-- Crear índices adicionales para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_conversations_user_admin_status ON conversations(user_id, admin_id, status);
CREATE INDEX IF NOT EXISTS idx_conversations_priority_status ON conversations(priority, status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_sender_created ON messages(conversation_id, sender_id, created_at);
CREATE INDEX IF NOT EXISTS idx_participants_conversation_user_role ON conversation_participants(conversation_id, user_id, role);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON chat_notifications(user_id, is_read);

-- Índices para búsquedas de texto
CREATE INDEX IF NOT EXISTS idx_conversations_title_gin ON conversations USING gin(to_tsvector('spanish', title));
CREATE INDEX IF NOT EXISTS idx_messages_content_gin ON messages USING gin(to_tsvector('spanish', content));

-- =====================================================
-- PASO 7: FUNCIONES DE SEGURIDAD
-- =====================================================

-- Eliminar funciones existentes si existen para evitar conflictos
DROP FUNCTION IF EXISTS is_conversation_participant(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS validate_message_sender() CASCADE;

-- Función para validar que un usuario es participante de una conversación
CREATE OR REPLACE FUNCTION is_conversation_participant(conv_id UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conv_id
    AND cp.user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para validar que un usuario es admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = user_uuid
    AND p.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PASO 8: TRIGGERS DE SEGURIDAD
-- =====================================================

-- Trigger para validar que solo participantes pueden enviar mensajes
CREATE OR REPLACE FUNCTION validate_message_sender()
RETURNS TRIGGER AS $$
BEGIN
  -- Los admins pueden enviar mensajes a cualquier conversación
  IF is_admin(NEW.sender_id) THEN
    RETURN NEW;
  END IF;
  
  -- Los usuarios solo pueden enviar mensajes a conversaciones donde son participantes
  IF NOT is_conversation_participant(NEW.conversation_id, NEW.sender_id) THEN
    RAISE EXCEPTION 'Usuario no autorizado para enviar mensajes en esta conversación';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_validate_message_sender
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION validate_message_sender();

-- =====================================================
-- PASO 9: VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que todas las políticas se crearon correctamente
SELECT 
  'conversations' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'conversations'
UNION ALL
SELECT 
  'messages' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'messages'
UNION ALL
SELECT 
  'conversation_participants' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'conversation_participants'
UNION ALL
SELECT 
  'chat_notifications' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'chat_notifications'
UNION ALL
SELECT 
  'chat_attachments' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'chat_attachments'
UNION ALL
SELECT 
  'typing_indicators' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'typing_indicators'
UNION ALL
SELECT 
  'chat_settings' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'chat_settings';

-- Mostrar resumen de políticas por tabla
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'messages', 'conversation_participants', 'chat_notifications', 'chat_attachments', 'typing_indicators', 'chat_settings')
ORDER BY tablename, cmd;

-- =====================================================
-- PASO 10: INSTRUCCIONES DE PRODUCCIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== SISTEMA DE CHAT CONFIGURADO PARA PRODUCCIÓN ===';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Políticas RLS seguras implementadas';
    RAISE NOTICE '✅ Índices de rendimiento creados';
    RAISE NOTICE '✅ Funciones de seguridad implementadas';
    RAISE NOTICE '✅ Triggers de validación activados';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Características de seguridad:';
    RAISE NOTICE '- Usuarios solo acceden a sus conversaciones';
    RAISE NOTICE '- Admins tienen acceso completo';
    RAISE NOTICE '- Validación de participantes en mensajes';
    RAISE NOTICE '- Políticas restrictivas para DELETE';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Estado esperado:';
    RAISE NOTICE '- conversations: 4 políticas';
    RAISE NOTICE '- messages: 4 políticas';
    RAISE NOTICE '- conversation_participants: 4 políticas';
    RAISE NOTICE '- Otras tablas: políticas apropiadas';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 El sistema está listo para producción!';
END $$;
