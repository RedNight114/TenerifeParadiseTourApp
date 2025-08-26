-- Script para verificar y corregir el formato de los datos en las tablas del chat
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si hay campos JSON en las conversaciones
SELECT 
  id,
  title,
  description,
  CASE 
    WHEN title IS NULL THEN 'NULL'
    WHEN jsonb_typeof(title::jsonb) IS NOT NULL THEN 'JSON: ' || title
    ELSE 'TEXT: ' || title
  END as title_type,
  CASE 
    WHEN description IS NULL THEN 'NULL'
    WHEN jsonb_typeof(description::jsonb) IS NOT NULL THEN 'JSON: ' || description
    ELSE 'TEXT: ' || description
  END as description_type
FROM conversations 
LIMIT 10;

-- 2. Si hay campos JSON, extraer solo el texto
-- Para el título
UPDATE conversations 
SET title = CASE 
  WHEN title IS NULL THEN 'Nueva consulta'
  WHEN jsonb_typeof(title::jsonb) IS NOT NULL THEN 
    COALESCE(
      title::jsonb->>'title', 
      title::jsonb->>'description', 
      'Nueva consulta'
    )
  ELSE title
END
WHERE jsonb_typeof(title::jsonb) IS NOT NULL;

-- Para la descripción
UPDATE conversations 
SET description = CASE 
  WHEN description IS NULL THEN NULL
  WHEN jsonb_typeof(description::jsonb) IS NOT NULL THEN 
    COALESCE(
      description::jsonb->>'description', 
      description::jsonb->>'title', 
      NULL
    )
  ELSE description
END
WHERE jsonb_typeof(description::jsonb) IS NOT NULL;

-- 3. Verificar que los campos ahora son texto
SELECT 
  id,
  title,
  description,
  CASE 
    WHEN title IS NULL THEN 'NULL'
    WHEN jsonb_typeof(title::jsonb) IS NOT NULL THEN 'JSON: ' || title
    ELSE 'TEXT: ' || title
  END as title_type,
  CASE 
    WHEN description IS NULL THEN 'NULL'
    WHEN jsonb_typeof(description::jsonb) IS NOT NULL THEN 'JSON: ' || description
    ELSE 'TEXT: ' || description
  END as description_type
FROM conversations 
LIMIT 10;

-- 4. Verificar que las vistas funcionan correctamente
SELECT 
  id,
  title,
  description,
  user_full_name,
  user_email,
  user_avatar_url,
  created_at
FROM conversation_summary 
LIMIT 5;

-- 5. Si hay problemas con las vistas, recrearlas
-- (Descomentar si es necesario)
/*
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
*/


