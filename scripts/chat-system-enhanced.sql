-- Script mejorado para el sistema de chat con retención de 7 días
-- Incluye políticas de seguridad, índices optimizados y limpieza automática

-- =====================================================
-- TABLAS PRINCIPALES
-- =====================================================

-- Tabla de conversaciones
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT DEFAULT 'Nueva conversación' NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'waiting', 'closed', 'archived')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category_id TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  closed_by UUID REFERENCES auth.users(id),
  closed_reason TEXT,
  -- Campos para retención de datos
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  retention_policy TEXT DEFAULT '7_days' CHECK (retention_policy IN ('7_days', '30_days', 'permanent'))
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system', 'notification')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,
  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Campos para retención de datos
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  retention_policy TEXT DEFAULT '7_days' CHECK (retention_policy IN ('7_days', '30_days', 'permanent'))
);

-- Tabla de participantes de conversación
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'moderator', 'support')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_online BOOLEAN DEFAULT FALSE,
  is_typing BOOLEAN DEFAULT FALSE,
  typing_since TIMESTAMP WITH TIME ZONE,
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
  UNIQUE(conversation_id, user_id)
);

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
  -- Campos para retención de datos
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
  -- Campos para retención de datos
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
-- ÍNDICES OPTIMIZADOS
-- =====================================================

-- Índices para conversaciones
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_admin_id ON conversations(admin_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_priority ON conversations(priority);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at);
CREATE INDEX IF NOT EXISTS idx_conversations_expires_at ON conversations(expires_at);

-- Índices para mensajes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_message_type ON messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_expires_at ON messages(expires_at);

-- Índices para participantes
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_role ON conversation_participants(role);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_is_online ON conversation_participants(is_online);

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
-- FUNCIONES Y TRIGGERS
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
-- VISTAS OPTIMIZADAS
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
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
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
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all conversations" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all conversations" ON conversations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Políticas para messages
CREATE POLICY "Users can view messages from their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

-- Políticas para conversation_participants
CREATE POLICY "Users can view participants of their conversations" ON conversation_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_participants.conversation_id
      AND c.user_id = auth.uid()
    )
  );

-- Políticas para chat_notifications
CREATE POLICY "Users can view own notifications" ON chat_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON chat_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para chat_attachments
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
CREATE POLICY "Users can view typing indicators from their conversations" ON typing_indicators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = typing_indicators.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

-- Políticas para chat_settings
CREATE POLICY "Users can manage own chat settings" ON chat_settings
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- TAREAS PROGRAMADAS
-- =====================================================

-- Programar limpieza automática cada hora
SELECT cron.schedule(
  'cleanup-expired-chat-data',
  '0 * * * *', -- Cada hora
  'SELECT cleanup_expired_chat_data();'
);

-- Programar limpieza de indicadores de escritura cada 30 segundos
SELECT cron.schedule(
  'cleanup-typing-indicators',
  '*/30 * * * * *', -- Cada 30 segundos
  'DELETE FROM typing_indicators WHERE expires_at < NOW();'
);

-- =====================================================
-- CONFIGURACIÓN INICIAL
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
-- COMENTARIOS Y DOCUMENTACIÓN
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
-- DATOS DE PRUEBA (OPCIONAL)
-- =====================================================

-- Insertar datos de prueba solo si hay usuarios
DO $$
DECLARE
    user_count INTEGER;
    admin_count INTEGER;
BEGIN
    -- Contar usuarios totales
    SELECT COUNT(*) INTO user_count FROM auth.users;
    
    -- Contar usuarios admin
    SELECT COUNT(*) INTO admin_count FROM profiles WHERE role = 'admin';
    
    -- Solo insertar datos de prueba si hay usuarios
    IF user_count > 0 AND admin_count > 0 THEN
        -- Insertar conversaciones de prueba
        INSERT INTO conversations (user_id, admin_id, title, description, status, priority, tags)
        SELECT 
            u.id as user_id,
            p.id as admin_id,
            'Consulta sobre tour de senderismo',
            'Necesito información sobre el tour de senderismo en Anaga',
            'active',
            'normal',
            ARRAY['senderismo', 'anaga', 'consulta']
        FROM auth.users u
        CROSS JOIN profiles p
        WHERE p.role = 'admin'
        LIMIT 1;
        
        -- Insertar participantes
        INSERT INTO conversation_participants (conversation_id, user_id, role)
        SELECT 
            c.id,
            c.user_id,
            'user'
        FROM conversations c;
        
        INSERT INTO conversation_participants (conversation_id, user_id, role)
        SELECT 
            c.id,
            c.admin_id,
            'admin'
        FROM conversations c
        WHERE c.admin_id IS NOT NULL;
        
        -- Insertar mensajes de ejemplo
        INSERT INTO messages (conversation_id, sender_id, content, message_type)
        SELECT 
            c.id,
            c.user_id,
            'Hola, tengo una pregunta sobre el tour de senderismo en Anaga. ¿Podrían darme más información?',
            'text'
        FROM conversations c
        WHERE c.title LIKE '%senderismo%';
        
        INSERT INTO messages (conversation_id, sender_id, content, message_type)
        SELECT 
            c.id,
            c.admin_id,
            '¡Hola! Con gusto te ayudo. El tour de senderismo en Anaga es una experiencia increíble. ¿Qué te gustaría saber específicamente?',
            'text'
        FROM conversations c
        WHERE c.title LIKE '%senderismo%';
        
        RAISE NOTICE 'Datos de prueba del chat insertados correctamente';
    ELSE
        RAISE NOTICE 'No se insertaron datos de prueba: se requieren usuarios y al menos un admin';
    END IF;
END $$;
