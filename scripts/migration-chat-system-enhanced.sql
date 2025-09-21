-- =====================================================
-- MIGRACIÓN INCREMENTAL DEL SISTEMA DE CHAT MEJORADO
-- =====================================================
-- Este script migra el sistema de chat existente al nuevo sistema mejorado
-- SIN perder datos existentes

-- =====================================================
-- PASO 1: VERIFICAR ESTADO ACTUAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== INICIANDO MIGRACIÓN DEL SISTEMA DE CHAT ===';
    RAISE NOTICE '';
    
    -- Verificar tablas existentes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
        RAISE NOTICE '✅ Tabla conversations existe';
    ELSE
        RAISE EXCEPTION '❌ Tabla conversations no existe. Ejecuta primero scripts/20-create-chat-tables.sql';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
        RAISE NOTICE '✅ Tabla messages existe';
    ELSE
        RAISE EXCEPTION '❌ Tabla messages no existe. Ejecuta primero scripts/20-create-chat-tables.sql';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE '✅ Tabla profiles existe';
    ELSE
        RAISE EXCEPTION '❌ Tabla profiles no existe. Ejecuta primero scripts/01-create-tables-updated.sql';
    END IF;
END $$;

-- =====================================================
-- PASO 2: AGREGAR CAMPOS DE RETENCIÓN A TABLAS EXISTENTES
-- =====================================================

-- Agregar campos de retención a conversations
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
ADD COLUMN IF NOT EXISTS retention_policy TEXT DEFAULT '7_days' CHECK (retention_policy IN ('7_days', '30_days', 'permanent'));

-- Agregar campos de retención a messages
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
ADD COLUMN IF NOT EXISTS retention_policy TEXT DEFAULT '7_days' CHECK (retention_policy IN ('7_days', '30_days', 'permanent'));

-- Actualizar mensajes existentes con fecha de expiración
UPDATE messages 
SET expires_at = created_at + INTERVAL '7 days'
WHERE expires_at IS NULL;

-- Actualizar conversaciones existentes con fecha de expiración
UPDATE conversations 
SET expires_at = created_at + INTERVAL '7 days'
WHERE expires_at IS NULL;

-- =====================================================
-- PASO 3: CREAR TABLAS NUEVAS (SI NO EXISTEN)
-- =====================================================

-- Tabla de notificaciones de chat
CREATE TABLE IF NOT EXISTS chat_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'message' CHECK (type IN ('message', 'mention', 'system', 'assignment', 'status_change')),
  title TEXT,
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Tabla de archivos adjuntos
CREATE TABLE IF NOT EXISTS chat_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  mime_type TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Tabla de indicadores de escritura
CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 seconds'),
  UNIQUE(conversation_id, user_id)
);

-- Tabla de configuración del chat
CREATE TABLE IF NOT EXISTS chat_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'es' CHECK (language IN ('es', 'en', 'de', 'fr')),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  auto_reply_enabled BOOLEAN DEFAULT FALSE,
  auto_reply_message TEXT,
  working_hours JSONB DEFAULT '{"enabled": false, "start": "09:00", "end": "18:00", "timezone": "Atlantic/Canary"}',
  offline_message TEXT DEFAULT 'Estamos fuera de horario. Te responderemos pronto.',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- PASO 4: CREAR ÍNDICES OPTIMIZADOS
-- =====================================================

-- Índices para conversaciones
CREATE INDEX IF NOT EXISTS idx_conversations_expires_at ON conversations(expires_at);
CREATE INDEX IF NOT EXISTS idx_conversations_retention_policy ON conversations(retention_policy);

-- Índices para mensajes
CREATE INDEX IF NOT EXISTS idx_messages_expires_at ON messages(expires_at);
CREATE INDEX IF NOT EXISTS idx_messages_retention_policy ON messages(retention_policy);

-- Índices para notificaciones
CREATE INDEX IF NOT EXISTS idx_chat_notifications_user_id ON chat_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_notifications_conversation_id ON chat_notifications(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_notifications_is_read ON chat_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_chat_notifications_type ON chat_notifications(type);
CREATE INDEX IF NOT EXISTS idx_chat_notifications_expires_at ON chat_notifications(expires_at);

-- Índices para archivos adjuntos
CREATE INDEX IF NOT EXISTS idx_chat_attachments_message_id ON chat_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_attachments_file_type ON chat_attachments(file_type);
CREATE INDEX IF NOT EXISTS idx_chat_attachments_expires_at ON chat_attachments(expires_at);

-- Índices para indicadores de escritura
CREATE INDEX IF NOT EXISTS idx_typing_indicators_conversation_id ON typing_indicators(conversation_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_expires_at ON typing_indicators(expires_at);

-- =====================================================
-- PASO 5: CREAR FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = NOW(), last_message_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at cuando se inserta un mensaje
DROP TRIGGER IF EXISTS trigger_update_conversation_updated_at ON messages;
CREATE TRIGGER trigger_update_conversation_updated_at
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_updated_at();

-- Función para crear notificación automática
CREATE OR REPLACE FUNCTION create_chat_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Crear notificación para todos los participantes excepto el remitente
  INSERT INTO chat_notifications (user_id, conversation_id, message_id, type, title, content)
  SELECT 
    cp.user_id,
    NEW.conversation_id,
    NEW.id,
    'message',
    'Nuevo mensaje',
    CASE 
      WHEN LENGTH(NEW.content) > 50 THEN LEFT(NEW.content, 50) || '...'
      ELSE NEW.content
    END
  FROM conversation_participants cp
  WHERE cp.conversation_id = NEW.conversation_id 
    AND cp.user_id != NEW.sender_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear notificaciones automáticamente
DROP TRIGGER IF EXISTS trigger_create_chat_notification ON messages;
CREATE TRIGGER trigger_create_chat_notification
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_chat_notification();

-- Función para limpiar datos expirados
CREATE OR REPLACE FUNCTION cleanup_expired_chat_data()
RETURNS void AS $$
BEGIN
  -- Limpiar indicadores de escritura expirados
  DELETE FROM typing_indicators 
  WHERE expires_at < NOW();
  
  -- Limpiar notificaciones expiradas
  DELETE FROM chat_notifications 
  WHERE expires_at < NOW();
  
  -- Limpiar archivos adjuntos expirados
  DELETE FROM chat_attachments 
  WHERE expires_at < NOW();
  
  -- Limpiar mensajes expirados (solo los que no son permanentes)
  DELETE FROM messages 
  WHERE expires_at < NOW() 
    AND retention_policy != 'permanent';
  
  -- Limpiar conversaciones expiradas (solo las que no son permanentes)
  DELETE FROM conversations 
  WHERE expires_at < NOW() 
    AND retention_policy != 'permanent';
  
  -- Log de limpieza
  RAISE NOTICE 'Chat data cleanup completed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Función para extender retención de conversación
CREATE OR REPLACE FUNCTION extend_conversation_retention(
  conversation_id_param UUID,
  new_retention_days INTEGER DEFAULT 7
)
RETURNS void AS $$
BEGIN
  -- Extender conversación
  UPDATE conversations 
  SET expires_at = NOW() + (new_retention_days || ' days')::INTERVAL
  WHERE id = conversation_id_param;
  
  -- Extender mensajes de la conversación
  UPDATE messages 
  SET expires_at = NOW() + (new_retention_days || ' days')::INTERVAL
  WHERE conversation_id = conversation_id_param;
  
  -- Extender notificaciones de la conversación
  UPDATE chat_notifications 
  SET expires_at = NOW() + (new_retention_days || ' days')::INTERVAL
  WHERE conversation_id = conversation_id_param;
  
  -- Extender archivos adjuntos de la conversación
  UPDATE chat_attachments 
  SET expires_at = NOW() + (new_retention_days || ' days')::INTERVAL
  WHERE message_id IN (
    SELECT id FROM messages WHERE conversation_id = conversation_id_param
  );
  
  RAISE NOTICE 'Extended retention for conversation % to % days', conversation_id_param, new_retention_days;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PASO 6: CREAR VISTAS OPTIMIZADAS
-- =====================================================

-- Vista para conversaciones con información completa
CREATE OR REPLACE VIEW conversation_summary AS
SELECT 
  c.id,
  c.user_id,
  c.admin_id,
  c.title,
  c.description,
  c.status,
  c.priority,
  c.category_id,
  c.tags,
  c.created_at,
  c.updated_at,
  c.last_message_at,
  c.closed_at,
  c.closed_by,
  c.closed_reason,
  c.expires_at,
  c.retention_policy,
  -- Información del último mensaje
  lm.content as last_message_content,
  lm.created_at as last_message_created_at,
  lm.sender_id as last_message_sender_id,
  -- Información del usuario
  up.full_name as user_full_name,
  up.email as user_email,
  up.role as user_role,
  -- Información del admin
  ap.full_name as admin_full_name,
  ap.email as admin_email,
  ap.role as admin_role,
  -- Conteo de mensajes no leídos
  COALESCE(unread.unread_count, 0) as unread_count,
  -- Conteo total de mensajes
  COALESCE(msg_count.total_messages, 0) as total_messages
FROM conversations c
LEFT JOIN LATERAL (
  SELECT m.content, m.created_at, m.sender_id
  FROM messages m
  WHERE m.conversation_id = c.id
  ORDER BY m.created_at DESC
  LIMIT 1
) lm ON true
LEFT JOIN profiles up ON c.user_id = up.id
LEFT JOIN profiles ap ON c.admin_id = ap.id
LEFT JOIN LATERAL (
  SELECT COUNT(*) as unread_count
  FROM messages m
  WHERE m.conversation_id = c.id
  AND m.is_read = false
  AND m.sender_id != c.user_id
) unread ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*) as total_messages
  FROM messages m
  WHERE m.conversation_id = c.id
) msg_count ON true;

-- Vista para mensajes con información completa
CREATE OR REPLACE VIEW message_summary AS
SELECT 
  m.id,
  m.conversation_id,
  m.sender_id,
  m.content,
  m.message_type,
  m.file_url,
  m.file_name,
  m.file_size,
  m.file_type,
  m.is_read,
  m.is_edited,
  m.edited_at,
  m.reply_to_id,
  m.metadata,
  m.created_at,
  m.expires_at,
  m.retention_policy,
  -- Información del remitente
  p.full_name as sender_full_name,
  p.email as sender_email,
  p.role as sender_role,
  p.avatar_url as sender_avatar_url,
  -- Información del mensaje al que responde
  rm.content as reply_to_content,
  rm.sender_id as reply_to_sender_id,
  rp.full_name as reply_to_sender_name
FROM messages m
LEFT JOIN profiles p ON m.sender_id = p.id
LEFT JOIN messages rm ON m.reply_to_id = rm.id
LEFT JOIN profiles rp ON rm.sender_id = rp.id;

-- Vista para participantes con información completa
CREATE OR REPLACE VIEW participant_summary AS
SELECT 
  cp.id,
  cp.conversation_id,
  cp.user_id,
  cp.role,
  cp.joined_at,
  cp.left_at,
  cp.last_read_at,
  cp.is_online,
  cp.is_typing,
  cp.typing_since,
  cp.notification_preferences,
  -- Información del usuario
  p.full_name,
  p.email,
  p.role as user_role,
  p.avatar_url,
  -- Conteo de mensajes no leídos para este usuario
  COALESCE(unread.unread_count, 0) as unread_count
FROM conversation_participants cp
LEFT JOIN profiles p ON cp.user_id = p.id
LEFT JOIN LATERAL (
  SELECT COUNT(*) as unread_count
  FROM messages m
  WHERE m.conversation_id = cp.conversation_id
  AND m.is_read = false
  AND m.sender_id != cp.user_id
) unread ON true;

-- =====================================================
-- PASO 7: CONFIGURAR ROW LEVEL SECURITY
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para conversations
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all conversations" ON conversations;
CREATE POLICY "Admins can view all conversations" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update all conversations" ON conversations;
CREATE POLICY "Admins can update all conversations" ON conversations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Políticas para messages
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON messages;
CREATE POLICY "Users can view messages from their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
CREATE POLICY "Users can send messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

-- Políticas para conversation_participants
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;
CREATE POLICY "Users can view participants of their conversations" ON conversation_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_participants.conversation_id
      AND c.user_id = auth.uid()
    )
  );

-- Políticas para chat_notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON chat_notifications;
CREATE POLICY "Users can view own notifications" ON chat_notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON chat_notifications;
CREATE POLICY "Users can update own notifications" ON chat_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para chat_attachments
DROP POLICY IF EXISTS "Users can view attachments from their conversations" ON chat_attachments;
CREATE POLICY "Users can view attachments from their conversations" ON chat_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE m.id = chat_attachments.message_id
      AND cp.user_id = auth.uid()
    )
  );

-- Políticas para typing_indicators
DROP POLICY IF EXISTS "Users can view typing indicators from their conversations" ON typing_indicators;
CREATE POLICY "Users can view typing indicators from their conversations" ON typing_indicators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = typing_indicators.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

-- Políticas para chat_settings
DROP POLICY IF EXISTS "Users can manage own chat settings" ON chat_settings;
CREATE POLICY "Users can manage own chat settings" ON chat_settings
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- PASO 8: CONFIGURACIÓN INICIAL
-- =====================================================

-- Insertar configuración por defecto para usuarios existentes
INSERT INTO chat_settings (user_id, theme, language, notifications_enabled, sound_enabled)
SELECT 
  id,
  'light',
  'es',
  true,
  true
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM chat_settings)
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- PASO 9: COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE conversations IS 'Tabla principal de conversaciones del chat con retención de 7 días';
COMMENT ON TABLE messages IS 'Mensajes del chat con retención de 7 días';
COMMENT ON TABLE conversation_participants IS 'Participantes de las conversaciones';
COMMENT ON TABLE chat_notifications IS 'Notificaciones del sistema de chat';
COMMENT ON TABLE chat_attachments IS 'Archivos adjuntos a los mensajes';
COMMENT ON TABLE typing_indicators IS 'Indicadores de escritura en tiempo real';
COMMENT ON TABLE chat_settings IS 'Configuraciones personales del chat';

COMMENT ON COLUMN conversations.expires_at IS 'Fecha de expiración para limpieza automática (7 días por defecto)';
COMMENT ON COLUMN messages.expires_at IS 'Fecha de expiración para limpieza automática (7 días por defecto)';
COMMENT ON COLUMN conversations.retention_policy IS 'Política de retención: 7_days, 30_days, o permanent';

-- =====================================================
-- PASO 10: VERIFICACIÓN FINAL
-- =====================================================

DO $$
DECLARE
    conversations_count INTEGER;
    messages_count INTEGER;
    notifications_count INTEGER;
    attachments_count INTEGER;
    typing_count INTEGER;
    settings_count INTEGER;
BEGIN
    -- Contar registros en cada tabla
    SELECT COUNT(*) INTO conversations_count FROM conversations;
    SELECT COUNT(*) INTO messages_count FROM messages;
    SELECT COUNT(*) INTO notifications_count FROM chat_notifications;
    SELECT COUNT(*) INTO attachments_count FROM chat_attachments;
    SELECT COUNT(*) INTO typing_count FROM typing_indicators;
    SELECT COUNT(*) INTO settings_count FROM chat_settings;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== MIGRACIÓN COMPLETADA ===';
    RAISE NOTICE '';
    RAISE NOTICE '📊 ESTADÍSTICAS FINALES:';
    RAISE NOTICE '   - Conversaciones: %', conversations_count;
    RAISE NOTICE '   - Mensajes: %', messages_count;
    RAISE NOTICE '   - Notificaciones: %', notifications_count;
    RAISE NOTICE '   - Archivos adjuntos: %', attachments_count;
    RAISE NOTICE '   - Indicadores de escritura: %', typing_count;
    RAISE NOTICE '   - Configuraciones: %', settings_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Sistema de chat mejorado listo para usar';
    RAISE NOTICE '';
END $$;
