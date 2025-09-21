-- =====================================================
-- MIGRACIÓN COMPLETA DEL SISTEMA DE CHAT MEJORADO
-- =====================================================
-- ⚠️  ADVERTENCIA: Este script ELIMINA todas las tablas de chat existentes
-- Solo usar si NO hay datos importantes que preservar

-- =====================================================
-- PASO 1: BACKUP DE DATOS EXISTENTES (OPCIONAL)
-- =====================================================

-- Crear tablas de backup antes de eliminar
CREATE TABLE IF NOT EXISTS conversations_backup AS SELECT * FROM conversations;
CREATE TABLE IF NOT EXISTS messages_backup AS SELECT * FROM messages;
CREATE TABLE IF NOT EXISTS conversation_participants_backup AS SELECT * FROM conversation_participants;

-- =====================================================
-- PASO 2: ELIMINAR TABLAS EXISTENTES
-- =====================================================

-- Eliminar en orden inverso para evitar problemas de dependencias
DROP TABLE IF EXISTS chat_settings CASCADE;
DROP TABLE IF EXISTS typing_indicators CASCADE;
DROP TABLE IF EXISTS chat_attachments CASCADE;
DROP TABLE IF EXISTS chat_notifications CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Eliminar vistas existentes
DROP VIEW IF EXISTS conversation_summary CASCADE;
DROP VIEW IF EXISTS message_summary CASCADE;
DROP VIEW IF EXISTS participant_summary CASCADE;

-- Eliminar funciones existentes
DROP FUNCTION IF EXISTS update_conversation_updated_at() CASCADE;
DROP FUNCTION IF EXISTS create_chat_notification() CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_chat_data() CASCADE;
DROP FUNCTION IF EXISTS extend_conversation_retention(UUID, INTEGER) CASCADE;

-- =====================================================
-- PASO 3: EJECUTAR SCRIPT COMPLETO MEJORADO
-- =====================================================

-- Ejecutar el script completo del sistema mejorado
\i scripts/chat-system-enhanced.sql

-- =====================================================
-- PASO 4: RESTAURAR DATOS (OPCIONAL)
-- =====================================================

-- Restaurar conversaciones
INSERT INTO conversations (
  id, user_id, admin_id, title, description, status, priority, 
  category_id, tags, created_at, updated_at, last_message_at,
  closed_at, closed_by, closed_reason, expires_at, retention_policy
)
SELECT 
  id, user_id, admin_id, title, description, status, priority,
  category_id, tags, created_at, updated_at, last_message_at,
  closed_at, closed_by, closed_reason, 
  COALESCE(created_at + INTERVAL '7 days', NOW() + INTERVAL '7 days'),
  '7_days'
FROM conversations_backup;

-- Restaurar mensajes
INSERT INTO messages (
  id, conversation_id, sender_id, content, message_type,
  file_url, file_name, file_size, file_type, is_read,
  is_edited, edited_at, reply_to_id, metadata, created_at,
  expires_at, retention_policy
)
SELECT 
  id, conversation_id, sender_id, content, message_type,
  file_url, file_name, file_size, file_type, is_read,
  is_edited, edited_at, reply_to_id, metadata, created_at,
  COALESCE(created_at + INTERVAL '7 days', NOW() + INTERVAL '7 days'),
  '7_days'
FROM messages_backup;

-- Restaurar participantes
INSERT INTO conversation_participants (
  conversation_id, user_id, role, joined_at, left_at,
  last_read_at, is_online, is_typing, typing_since,
  notification_preferences
)
SELECT 
  conversation_id, user_id, role, joined_at, left_at,
  last_read_at, is_online, is_typing, typing_since,
  notification_preferences
FROM conversation_participants_backup;

-- =====================================================
-- PASO 5: LIMPIAR BACKUPS
-- =====================================================

DROP TABLE IF EXISTS conversations_backup;
DROP TABLE IF EXISTS messages_backup;
DROP TABLE IF EXISTS conversation_participants_backup;

-- =====================================================
-- PASO 6: VERIFICACIÓN FINAL
-- =====================================================

DO $$
DECLARE
    conversations_count INTEGER;
    messages_count INTEGER;
    participants_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO conversations_count FROM conversations;
    SELECT COUNT(*) INTO messages_count FROM messages;
    SELECT COUNT(*) INTO participants_count FROM conversation_participants;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== MIGRACIÓN COMPLETA FINALIZADA ===';
    RAISE NOTICE '';
    RAISE NOTICE '📊 DATOS RESTAURADOS:';
    RAISE NOTICE '   - Conversaciones: %', conversations_count;
    RAISE NOTICE '   - Mensajes: %', messages_count;
    RAISE NOTICE '   - Participantes: %', participants_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Sistema de chat mejorado listo para usar';
    RAISE NOTICE '';
END $$;
