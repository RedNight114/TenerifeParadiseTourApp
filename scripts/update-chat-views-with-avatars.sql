-- Script para actualizar las vistas del chat con campos de avatar
-- Ejecutar después de asegurarse de que la tabla profiles tiene el campo avatar_url

-- Actualizar la vista conversation_summary para incluir user_avatar_url
DROP VIEW IF EXISTS conversation_summary CASCADE;

CREATE VIEW conversation_summary AS
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
  -- Información del último mensaje
  lm.content as last_message_content,
  lm.created_at as last_message_created_at,
  lm.sender_id as last_message_sender_id,
  -- Información del usuario
  up.full_name as user_full_name,
  up.email as user_email,
  up.role as user_role,
  up.avatar_url as user_avatar_url,
  -- Información del admin
  ap.full_name as admin_full_name,
  ap.email as admin_email,
  ap.role as admin_role,
  -- Información de la categoría
  cat.name as category_name,
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
LEFT JOIN chat_categories cat ON c.category_id = cat.id
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

-- Actualizar la vista message_summary para incluir sender_avatar_url
DROP VIEW IF EXISTS message_summary CASCADE;

CREATE VIEW message_summary AS
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

-- Verificar que las vistas se crearon correctamente
SELECT 'conversation_summary' as view_name, COUNT(*) as row_count FROM conversation_summary
UNION ALL
SELECT 'message_summary' as view_name, COUNT(*) as row_count FROM message_summary;

-- Verificar que los campos de avatar están disponibles
SELECT 
  'conversation_summary' as view_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'conversation_summary' 
AND column_name LIKE '%avatar%'
UNION ALL
SELECT 
  'message_summary' as view_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'message_summary' 
AND column_name LIKE '%avatar%';
